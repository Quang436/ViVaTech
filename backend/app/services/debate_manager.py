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
        user_id: str,
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
            doc_data = rag_engine.get_document(doc_id=document_id, user_id=user_id)
            if not doc_data:
                raise ValueError("Không tìm thấy tài liệu hoặc tài liệu không thuộc tài khoản của bạn.")
            doc_name = doc_data.get("filename") or doc_name
            ground_truth = rag_engine.retrieve_ground_truth(doc_id=document_id, query=title, top_k=3)
            if not ground_truth:
                ground_truth = doc_data.get("summary", "")

        session = DebateSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
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
        db.flush()

        try:
            opening = gemini_council.generate_opening_question(
                topic_title=title,
                topic_summary=session.topic_summary or "",
                persona_key=persona,
                ground_truth=ground_truth,
            )

            opening_question = (opening.get("question") or "").strip()
            if not opening_question:
                raise ValueError("Gemini API không trả về câu hỏi khai mạc hợp lệ.")

            opening_cot = opening.get("cot_reasoning") or {}
            turn1 = DebateTurn(
                id=str(uuid.uuid4()),
                session_id=session.id,
                turn_number=1,
                council_speaker=opening.get("speaker") or "Hội đồng Phản biện",
                ai_question=opening_question,
                ai_thought_process=opening_cot,
            )
            db.add(turn1)
            db.commit()
            db.refresh(session)
            return session
        except Exception:
            db.rollback()
            raise

    def process_student_response(
        self,
        db: Session,
        session_id: str,
        student_response: str,
        response_mode: str = "text",
        duration_seconds: int = 0,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        clean_response = student_response.strip()
        if not clean_response:
            raise ValueError("Nội dung câu trả lời không được để trống.")

        session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
        if not session or (user_id is not None and session.user_id != user_id):
            raise ValueError("Không tìm thấy phiên tranh biện hoặc bạn không có quyền truy cập.")

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
            raise ValueError(f"Không tìm thấy lượt chất vấn số {session.current_turn} cho phiên này.")

        ground_truth = rag_engine.retrieve_ground_truth(
            doc_id=session.document_id,
            query=clean_response,
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
                        else clean_response
                    ),
                }
            )

        rebuttal = gemini_council.generate_rebuttal(
            topic_title=session.title,
            persona_key=session.persona,
            current_turn=session.current_turn,
            max_turns=session.max_turns,
            dialogue_history=history,
            student_response=clean_response,
            ground_truth=ground_truth,
        )

        raw_accuracy = rebuttal.get("ground_truth_accuracy")
        if raw_accuracy is None:
            raise ValueError("Phản hồi phân tích CoT từ Gemini thiếu điểm chính xác Ground Truth.")
        accuracy_int = max(0, min(100, int(round(float(raw_accuracy)))))

        current_turn_obj.student_response = clean_response
        current_turn_obj.response_mode = response_mode
        current_turn_obj.duration_seconds = max(0, int(duration_seconds))
        current_turn_obj.ground_truth_accuracy = accuracy_int
        current_turn_obj.logic_flaws = rebuttal.get("detected_flaws") or []
        current_turn_obj.critique_comment = rebuttal.get("critique_previous_answer") or ""
        current_turn_obj.ai_thought_process = rebuttal.get("cot_reasoning") or {}
        db.commit()

        is_completed = session.current_turn >= session.max_turns
        if is_completed:
            session.status = SessionStatus.COMPLETED.value
            db.commit()

            self.finalize_scorecard(db, session_id, user_id=session.user_id)
            return {
                "session_id": session_id,
                "turn_number": session.current_turn,
                "is_completed": True,
                "critique_previous_answer": current_turn_obj.critique_comment,
                "detected_flaws": current_turn_obj.logic_flaws,
                "ground_truth_accuracy": current_turn_obj.ground_truth_accuracy,
                "next_question": rebuttal.get("next_question"),
                "council_speaker": rebuttal.get("speaker") or current_turn_obj.council_speaker,
                "cot_reasoning": current_turn_obj.ai_thought_process,
            }
        else:
            next_question = (rebuttal.get("next_question") or "").strip()
            if not next_question:
                raise ValueError("Gemini API không trả về câu hỏi chất vấn tiếp theo.")

            session.current_turn += 1
            next_turn_obj = DebateTurn(
                id=str(uuid.uuid4()),
                session_id=session_id,
                turn_number=session.current_turn,
                council_speaker=rebuttal.get("speaker") or current_turn_obj.council_speaker,
                ai_question=next_question,
                ai_thought_process=rebuttal.get("cot_reasoning") or {},
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
                "cot_reasoning": next_turn_obj.ai_thought_process,
            }

    def finalize_scorecard(
        self,
        db: Session,
        session_id: str,
        user_id: Optional[str] = None,
    ) -> Scorecard:
        session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
        if not session or (user_id is not None and session.user_id != user_id):
            raise ValueError("Không tìm thấy phiên tranh biện hoặc bạn không có quyền truy cập.")

        existing = db.query(Scorecard).filter(Scorecard.session_id == session_id).first()
        if existing:
            return existing

        turns = (
            db.query(DebateTurn)
            .filter(DebateTurn.session_id == session_id)
            .order_by(DebateTurn.turn_number.asc())
            .all()
        )

        answered_turns = [t for t in turns if t.student_response and t.student_response.strip()]
        if not answered_turns:
            raise ValueError("Phiên tranh biện chưa có câu trả lời nào của thí sinh để chấm bảng điểm.")

        turns_data = []
        for t in answered_turns:
            turns_data.append(
                {
                    "turn_number": t.turn_number,
                    "council_speaker": t.council_speaker,
                    "ai_question": t.ai_question,
                    "student_response": t.student_response,
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

        required_scores = [
            "overall_score",
            "logic_accuracy_score",
            "argumentation_score",
            "composure_score",
            "clarity_score",
        ]
        for key in required_scores:
            if scorecard_data.get(key) is None:
                raise ValueError(f"Dữ liệu chấm điểm từ Gemini bị thiếu trường '{key}'.")

        scorecard = Scorecard(
            id=str(uuid.uuid4()),
            session_id=session_id,
            overall_score=float(scorecard_data["overall_score"]),
            logic_accuracy_score=float(scorecard_data["logic_accuracy_score"]),
            argumentation_score=float(scorecard_data["argumentation_score"]),
            composure_score=float(scorecard_data["composure_score"]),
            clarity_score=float(scorecard_data["clarity_score"]),
            strengths=scorecard_data.get("strengths") or [],
            weaknesses=scorecard_data.get("weaknesses") or [],
            fallacies_summary=scorecard_data.get("fallacies_summary") or [],
            optimal_answers=scorecard_data.get("optimal_answers") or [],
            overall_verdict=scorecard_data.get("overall_verdict") or "",
        )
        session.status = SessionStatus.COMPLETED.value
        db.add(scorecard)
        db.commit()
        db.refresh(scorecard)
        return scorecard


debate_manager = DebateManager()
