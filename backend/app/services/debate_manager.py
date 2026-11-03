from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import uuid
from app.models.session import DebateSession, SessionStatus
from app.models.debate_turn import DebateTurn
from app.models.scorecard import Scorecard
from app.services.gemini_council import gemini_council
from app.services.rag_engine import rag_engine


class DebateManager:
    def create_session(
        self,
        db: Session,
        title: str,
        persona: str,
        document_id: Optional[str] = None,
        document_name: Optional[str] = None,
        topic_summary: Optional[str] = None,
        max_turns: int = 5,
    ) -> DebateSession:
        ground_truth = ""
        doc_name = document_name
        if document_id:
            doc_data = rag_engine._docs_store.get(document_id)
            if doc_data:
                doc_name = doc_data.get("filename") or doc_name
                ground_truth = rag_engine.retrieve_ground_truth(doc_id=document_id, query=title, top_k=3)
                if not ground_truth:
                    ground_truth = doc_data.get("summary", "")

        session = DebateSession(
            id=str(uuid.uuid4()),
            title=title,
            persona=persona,
            document_id=document_id,
            document_name=doc_name,
            topic_summary=topic_summary or (ground_truth[:350] if ground_truth else None),
            max_turns=max_turns,
            current_turn=1,
            status=SessionStatus.IN_PROGRESS.value,
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # Generate Opening Turn (Turn 1) via Real Gemini AI
        opening = gemini_council.generate_opening_question(
            topic_title=title,
            topic_summary=session.topic_summary or "",
            persona_key=persona,
            ground_truth=ground_truth,
        )

        opening_cot = opening.get("cot_reasoning") or {
            "step1_fact_check": f"Đã đối chiếu đề tài '{title}' với cơ sở dữ liệu tri thức.",
            "step2_logic_flaws": [opening.get("intended_focus", "Kiểm chứng tính hợp lệ của phương pháp luận mở màn")],
            "step3_rebuttal_strategy": f"Mở đầu chất vấn trực diện theo phong cách {opening.get('speaker', 'Hội đồng')}.",
        }

        turn1 = DebateTurn(
            id=str(uuid.uuid4()),
            session_id=session.id,
            turn_number=1,
            council_speaker=opening.get("speaker", "Hội đồng Phản biện"),
            ai_question=opening.get("question", f"Mời bạn trình bày luận điểm cốt lõi của đề tài '{title}'?"),
            ai_thought_process=opening_cot,
        )
        db.add(turn1)
        db.commit()
        db.refresh(session)
        return session

    def process_student_response(
        self,
        db: Session,
        session_id: str,
        student_response: str,
        response_mode: str = "text",
        duration_seconds: int = 0,
    ) -> Dict[str, Any]:
        session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")

        if session.status == SessionStatus.COMPLETED.value:
            raise ValueError("Phiên phản biện này đã kết thúc.")

        current_turn_obj = (
            db.query(DebateTurn)
            .filter(
                DebateTurn.session_id == session_id,
                DebateTurn.turn_number == session.current_turn,
            )
            .first()
        )

        if not current_turn_obj:
            raise ValueError(f"Turn {session.current_turn} not found for session {session_id}")

        current_turn_obj.student_response = student_response
        current_turn_obj.response_mode = response_mode
        current_turn_obj.duration_seconds = duration_seconds

        ground_truth = rag_engine.retrieve_ground_truth(
            doc_id=session.document_id,
            query=student_response,
        )
        if not ground_truth and session.topic_summary:
            ground_truth = session.topic_summary

        all_turns = (
            db.query(DebateTurn)
            .filter(DebateTurn.session_id == session_id)
            .order_by(DebateTurn.turn_number.asc())
            .all()
        )

        history = []
        for t in all_turns:
            history.append(
                {
                    "turn": t.turn_number,
                    "speaker": t.council_speaker,
                    "ai_question": t.ai_question,
                    "student_response": (
                        t.student_response
                        if t.turn_number != session.current_turn
                        else student_response
                    ),
                }
            )

        rebuttal = gemini_council.generate_rebuttal(
            topic_title=session.title,
            persona_key=session.persona,
            current_turn=session.current_turn,
            max_turns=session.max_turns,
            dialogue_history=history,
            student_response=student_response,
            ground_truth=ground_truth,
        )

        current_turn_obj.ground_truth_accuracy = rebuttal.get("ground_truth_accuracy", 80)
        current_turn_obj.logic_flaws = rebuttal.get("detected_flaws", [])
        current_turn_obj.critique_comment = rebuttal.get("critique_previous_answer", "")
        current_turn_obj.ai_thought_process = rebuttal.get("cot_reasoning", {})
        db.commit()

        is_completed = session.current_turn >= session.max_turns
        if is_completed:
            session.status = SessionStatus.COMPLETED.value
            db.commit()

            self.finalize_scorecard(db, session_id)
            return {
                "session_id": session_id,
                "turn_number": session.current_turn,
                "is_completed": True,
                "critique_previous_answer": current_turn_obj.critique_comment,
                "detected_flaws": current_turn_obj.logic_flaws,
                "ground_truth_accuracy": current_turn_obj.ground_truth_accuracy,
                "next_question": rebuttal.get("next_question"),
                "council_speaker": rebuttal.get("speaker", "Hội đồng"),
                "cot_reasoning": rebuttal.get("cot_reasoning"),
            }
        else:
            session.current_turn += 1
            next_turn_obj = DebateTurn(
                id=str(uuid.uuid4()),
                session_id=session_id,
                turn_number=session.current_turn,
                council_speaker=rebuttal.get("speaker", "Hội đồng"),
                ai_question=rebuttal.get("next_question", "Mời bạn trả lời tiếp?"),
                ai_thought_process=rebuttal.get("cot_reasoning"),
            )
            db.add(next_turn_obj)
            db.commit()

            return {
                "session_id": session_id,
                "turn_number": current_turn_obj.turn_number,
                "is_completed": False,
                "critique_previous_answer": current_turn_obj.critique_comment,
                "detected_flaws": current_turn_obj.logic_flaws,
                "ground_truth_accuracy": current_turn_obj.ground_truth_accuracy,
                "next_question": next_turn_obj.ai_question,
                "council_speaker": next_turn_obj.council_speaker,
                "cot_reasoning": rebuttal.get("cot_reasoning"),
            }

    def finalize_scorecard(self, db: Session, session_id: str) -> Scorecard:
        existing = db.query(Scorecard).filter(Scorecard.session_id == session_id).first()
        if existing:
            return existing

        session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")

        turns = (
            db.query(DebateTurn)
            .filter(DebateTurn.session_id == session_id)
            .order_by(DebateTurn.turn_number.asc())
            .all()
        )

        turns_data = []
        for t in turns:
            turns_data.append(
                {
                    "turn_number": t.turn_number,
                    "council_speaker": t.council_speaker,
                    "ai_question": t.ai_question,
                    "student_response": t.student_response or "Chưa trả lời",
                    "accuracy": t.ground_truth_accuracy,
                    "flaws": t.logic_flaws or [],
                }
            )

        ground_truth = ""
        if session.document_id:
            ground_truth = rag_engine.retrieve_ground_truth(
                doc_id=session.document_id,
                query=session.title,
                top_k=3,
            )
        if not ground_truth and session.topic_summary:
            ground_truth = session.topic_summary

        scorecard_data = gemini_council.generate_scorecard(
            topic_title=session.title,
            persona_key=session.persona,
            turns=turns_data,
            ground_truth=ground_truth,
        )

        scorecard = Scorecard(
            id=str(uuid.uuid4()),
            session_id=session_id,
            overall_score=float(scorecard_data.get("overall_score", 80.0)),
            logic_accuracy_score=float(scorecard_data.get("logic_accuracy_score", 80.0)),
            argumentation_score=float(scorecard_data.get("argumentation_score", 78.0)),
            composure_score=float(scorecard_data.get("composure_score", 80.0)),
            clarity_score=float(scorecard_data.get("clarity_score", 82.0)),
            strengths=scorecard_data.get("strengths", []),
            weaknesses=scorecard_data.get("weaknesses", []),
            fallacies_summary=scorecard_data.get("fallacies_summary", []),
            optimal_answers=scorecard_data.get("optimal_answers", []),
            overall_verdict=scorecard_data.get("overall_verdict", "Hoàn thành phiên phản biện."),
        )
        db.add(scorecard)
        db.commit()
        db.refresh(scorecard)
        return scorecard


debate_manager = DebateManager()
