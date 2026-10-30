import { useState } from 'react';
import { Navbar, type ActiveTab } from './components/Navbar';
import { SetupView } from './components/SetupView';
import { ArenaChamber } from './components/ArenaChamber';
import { ScorecardView } from './components/ScorecardView';
import { DocumentsView } from './components/DocumentsView';
import { ArchiveView } from './components/ArchiveView';
import { api } from './services/api';
import type { CouncilPersona, DebateSession, Scorecard } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('setup');
  const [selectedPersona, setSelectedPersona] = useState<CouncilPersona>('academic_reviewer');
  const [activeSession, setActiveSession] = useState<DebateSession | null>(null);
  const [scorecardData, setScorecardData] = useState<Scorecard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCouncilThinking, setIsCouncilThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Step 1: Start Debate Session
  const handleStartDebate = async (params: {
    title: string;
    topic_summary?: string;
    document_id?: string;
    document_name?: string;
    max_turns: number;
    mode: 'voice' | 'text';
  }) => {
    setIsLoading(true);
    try {
      const session = await api.createSession({
        title: params.title,
        persona: selectedPersona,
        document_id: params.document_id,
        topic_summary: params.topic_summary,
        max_turns: params.max_turns,
      });
      setActiveSession(session);
      setActiveTab('arena');
    } catch (err) {
      console.error('Lỗi khởi tạo phiên:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit Turn Response
  const handleSubmitTurn = async (response: string, mode: 'voice' | 'text', duration: number) => {
    if (!activeSession) return;
    setIsCouncilThinking(true);

    try {
      const rebuttal = await api.submitTurn(activeSession.id, response, mode, duration);

      const updatedTurns = activeSession.turns.map((t) => {
        if (t.turn_number === activeSession.current_turn) {
          return {
            ...t,
            student_response: response,
            response_mode: mode,
            ground_truth_accuracy: rebuttal.ground_truth_accuracy,
            logic_flaws: rebuttal.detected_flaws,
            critique_comment: rebuttal.critique_previous_answer,
            ai_thought_process: rebuttal.cot_reasoning,
          };
        }
        return t;
      });

      if (rebuttal.is_completed || activeSession.current_turn >= activeSession.max_turns) {
        setActiveSession({
          ...activeSession,
          turns: updatedTurns,
          status: 'completed',
        });
        const card = await api.getScorecard(activeSession.id);
        setScorecardData(card);
        setActiveTab('scorecard');
      } else {
        const nextTurnObj = {
          id: 'turn-' + (activeSession.current_turn + 1),
          turn_number: activeSession.current_turn + 1,
          council_speaker: rebuttal.council_speaker,
          ai_question: rebuttal.next_question || 'Mời thí sinh tiếp tục giải trình?',
          timestamp: new Date().toISOString(),
          ai_thought_process: rebuttal.cot_reasoning,
        };

        setActiveSession({
          ...activeSession,
          current_turn: activeSession.current_turn + 1,
          turns: [...updatedTurns, nextTurnObj],
        });
      }
    } catch (err) {
      console.error('Lỗi gửi phản hồi:', err);
    } finally {
      setIsCouncilThinking(false);
    }
  };

  const handleRestart = () => {
    setActiveSession(null);
    setScorecardData(null);
    setActiveTab('setup');
  };

  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-x-hidden selection:bg-primary-fixed selection:text-primary flex flex-col justify-between">
      {/* ==================== AMBIENT LIGHTING BACKGROUND ==================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background"></div>
        <div className="absolute top-16 left-1/4 w-[540px] h-[540px] rounded-full bg-primary-fixed/30 blur-3xl anim-float-1"></div>
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full bg-secondary-fixed/25 blur-3xl anim-float-2"></div>
        <div className="absolute bottom-16 left-8 w-[440px] h-[440px] rounded-full bg-tertiary-fixed/20 blur-3xl anim-pulse-glow"></div>
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          // If selecting arena but no active session, prompt or start default
          if (tab === 'arena' && !activeSession) {
            handleStartDebate({
              title: 'Ứng dụng Heterogeneous GNN kết hợp ViBERT trong phân tích văn bản học thuật',
              max_turns: 5,
              mode: 'voice',
            });
            return;
          }
          setActiveTab(tab);
        }}
        sessionCode={activeSession ? `#VV-${activeSession.id.slice(-4).toUpperCase()}` : '#VV-9042'}
        hasActiveSession={!!activeSession}
      />

      {/* Main View Router */}
      <div className="relative z-10 flex-1 flex flex-col">
        {(activeTab === 'setup' || activeTab === 'home') && (
          <SetupView
            selectedPersona={selectedPersona}
            onSelectPersona={(p) => setSelectedPersona(p)}
            onStartDebate={handleStartDebate}
            isLoading={isLoading}
            onFileUpload={api.uploadDocument}
          />
        )}

        {activeTab === 'arena' && activeSession && (
          <ArenaChamber
            session={activeSession}
            persona={selectedPersona}
            onSubmitTurn={handleSubmitTurn}
            isCouncilThinking={isCouncilThinking}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          />
        )}

        {activeTab === 'scorecard' && (
          <ScorecardView
            scorecard={
              scorecardData || {
                id: 'default-scorecard',
                session_id: activeSession?.id || 'session-demo',
                overall_score: 83.5,
                logic_accuracy_score: 86.0,
                argumentation_score: 80.0,
                composure_score: 82.0,
                clarity_score: 88.0,
                strengths: [
                  'Cơ sở toán học vững vàng: Chứng minh chặt chẽ cơ chế hội tụ của mô hình lan truyền (Diffusion Probabilistic Models) tại không gian đồ thị đa tầng.',
                  'Chứng minh ma trận thưa thuyết phục: Giải trình thành công thuật toán nén CSR giúp bảo toàn đặc trưng mà không tổn thất thông tin phân loại.',
                  'Phản xạ định lý Bayes nhanh nhạy: Ứng biến xuất sắc trước câu hỏi mở rộng về phân phối tiền nghiệm không suy biến của Hội đồng.',
                ],
                weaknesses: [
                  'Né tránh con số thực tế: Còn lúng túng khi giám khảo truy vấn dung lượng VRAM GPU tiêu hao thực tế với dữ liệu quy mô 10 triệu node.',
                  'Thiếu bảng so sánh phần cứng: Chưa trình bày bảng đối sánh chi phí tính toán (FLOPs/chi phí GPU) so với phương pháp baseline phổ biến.',
                  'Chiến thuật phản hồi: Cần chủ động thừa nhận giới hạn tài nguyên trước khi trình bày thuật toán thưa để tránh bị hội đồng dồn ép.',
                ],
                fallacies_summary: ['Né tránh số liệu thực nghiệm', 'Lập luận theo hướng phỏng đoán'],
                optimal_answers: [],
                overall_verdict:
                  'Ứng viên hoàn thành tốt các lượt phản biện. Đề tài đạt chuẩn phương pháp luận quốc tế; cần bổ sung bảng định lượng tiêu hao tài nguyên phần cứng GPU khi triển khai thực tế.',
                created_at: new Date().toISOString(),
              }
            }
            persona={selectedPersona}
            topicTitle={
              activeSession?.title ||
              'Ứng dụng Heterogeneous GNN kết hợp ViBERT trong phân tích văn bản học thuật'
            }
            onRestart={handleRestart}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsView
            onStartSessionWithDoc={(docName) => {
              handleStartDebate({
                title: docName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                document_name: docName,
                max_turns: 5,
                mode: 'voice',
              });
            }}
            onFileUpload={api.uploadDocument}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            onNewSession={() => setActiveTab('setup')}
            onViewScorecard={() => setActiveTab('scorecard')}
          />
        )}
      </div>

      {/* Footer minimal info matching Academic Chamber */}
      <footer className="relative z-10 border-t border-surface-container-high/60 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs font-label text-on-surface-variant bg-surface-container-lowest/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            VivaArena © 2025 • Phòng Phản Biện & Tranh Biện Học Thuật AI Chuẩn Hội Đồng Quốc Gia
          </span>
          <span className="font-mono text-[11px] text-primary">
            Powered by Gemini 3.8 CoT & RAG Knowledge Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
export default App;
