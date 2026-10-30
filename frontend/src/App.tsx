import { useState } from 'react';
import { Navbar, type ActiveTab, type UserProfile } from './components/Navbar';
import { SetupView } from './components/SetupView';
import { ArenaChamber } from './components/ArenaChamber';
import { ScorecardView } from './components/ScorecardView';
import { DocumentsView } from './components/DocumentsView';
import { ArchiveView } from './components/ArchiveView';
import { NotificationsPopover, type NotificationItem } from './components/NotificationsPopover';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './components/HomeView';
import { api } from './services/api';
import type { CouncilPersona, DebateSession, Scorecard } from './types';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Hội đồng phản biện đã sẵn sàng',
    description: 'Tài liệu "Do_An_Tot_Nghiep_AI_Khang_2025.pdf" đã hoàn tất bóc tách 18 phân đoạn RAG.',
    time: '5 phút trước',
    unread: true,
    type: 'success',
    actionLabel: 'Vào phòng tranh biện',
    actionTab: 'arena',
  },
  {
    id: 'notif-2',
    title: 'Báo cáo đánh giá phiên gần nhất',
    description: 'Kết quả phiên thử nghiệm đạt 83.5/100 (Hạng A-). Cần lưu ý bổ sung thông số định lượng VRAM GPU.',
    time: '2 giờ trước',
    unread: true,
    type: 'academic',
    actionLabel: 'Xem bảng điểm chi tiết',
    actionTab: 'scorecard',
  },
  {
    id: 'notif-3',
    title: 'Khuyến nghị ôn tập PREP',
    description: 'Giám khảo phát hiện lỗi né tránh số liệu thực nghiệm. Hãy rèn luyện trả lời theo cấu trúc Point-Reason-Example-Point.',
    time: 'Hôm qua',
    unread: false,
    type: 'warning',
    actionLabel: 'Xem kịch bản mẫu',
    actionTab: 'scorecard',
  },
  {
    id: 'notif-4',
    title: 'Đã thêm giám khảo Stress-Test mới',
    description: 'GS. Viện sĩ Hoàng Vĩnh đã sẵn sàng cho kịch bản truy vấn biên cực đoan và đối kháng cao.',
    time: '2 ngày trước',
    unread: false,
    type: 'info',
    actionLabel: 'Đổi cấp độ hội đồng',
    actionTab: 'setup',
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('setup');
  const [selectedPersona, setSelectedPersona] = useState<CouncilPersona>('academic_reviewer');
  const [activeSession, setActiveSession] = useState<DebateSession | null>(null);
  const [scorecardData, setScorecardData] = useState<Scorecard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCouncilThinking, setIsCouncilThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Auth & User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    name: 'Nguyễn Văn Khang',
    email: 'khang.nguyen@hcmut.edu.vn',
    role: 'Học viên Khóa 2025',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjGexftNC_DNLJj7IX4Z7rHQ_XTgpKbqOiwpp0s5LxgeGmdFtlRXRPKEmkGo1gI8yBzrul2zPhizefq5gsyRzi49YA88bhhRMiBTpSaeaZVdF3HnMhqLNRo1CAhxy9PZPyOd8z7uq2pcseL7JSsrXAP5Jn_5IbfFCZy6q-Eb9a098cU2FmFpSREXLX7BmU2Pv2opto9iHC8gYrfMSBczNO__akHUIM84VMgfGyw9Ms',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Step 1: Start Debate Session
  const handleStartDebate = async (params: {
    title: string;
    topic_summary?: string;
    document_id?: string;
    document_name?: string;
    max_turns: number;
    mode: 'voice' | 'text';
  }) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
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

  const handleLoginSuccess = (user: { name: string; email: string; role: string }) => {
    setCurrentUser({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjGexftNC_DNLJj7IX4Z7rHQ_XTgpKbqOiwpp0s5LxgeGmdFtlRXRPKEmkGo1gI8yBzrul2zPhizefq5gsyRzi49YA88bhhRMiBTpSaeaZVdF3HnMhqLNRo1CAhxy9PZPyOd8z7uq2pcseL7JSsrXAP5Jn_5IbfFCZy6q-Eb9a098cU2FmFpSREXLX7BmU2Pv2opto9iHC8gYrfMSBczNO__akHUIM84VMgfGyw9Ms',
    });
    if (activeTab === 'home') {
      setActiveTab('setup');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSession(null);
    setActiveTab('home');
    setIsNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = currentUser ? notifications.filter((n) => n.unread).length : 0;

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
          if (tab === 'arena' && !activeSession) {
            if (!currentUser) {
              setIsAuthModalOpen(true);
              return;
            }
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
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        unreadNotificationCount={unreadCount}
      />

      {/* Notifications Popover (Chỉ mở khi đã đăng nhập) */}
      {currentUser && (
        <NotificationsPopover
          notifications={notifications}
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllAsRead={handleMarkAllAsRead}
          onSelectAction={(tab) => {
            setActiveTab(tab);
            setIsNotificationsOpen(false);
          }}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Main View Router */}
      <div className="relative z-10 flex-1 flex flex-col">
        {activeTab === 'home' && (
          <HomeView
            onStartSetup={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setActiveTab('setup');
              }
            }}
            onExploreArchive={() => setActiveTab('archive')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            user={currentUser}
          />
        )}

        {activeTab === 'setup' && (
          <SetupView
            selectedPersona={selectedPersona}
            onSelectPersona={(p) => setSelectedPersona(p)}
            onStartDebate={handleStartDebate}
            isLoading={isLoading}
            onFileUpload={api.uploadDocument}
          />
        )}

        {activeTab === 'arena' && !activeSession && (
          <div className="pt-28 pb-16 flex-1 max-w-xl w-full mx-auto px-4 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">Chưa có phiên tranh biện hoạt động</h2>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-md">
              Vui lòng thiết lập đề tài và chọn Hội đồng phản biện để bắt đầu phiên tranh biện AI.
            </p>
            <button
              onClick={() => setActiveTab('setup')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs sm:text-sm font-bold hover:bg-primary-container transition-all cursor-pointer border-none"
            >
              Đến Thiết lập đề tài
            </button>
          </div>
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

      {/* Footer */}
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
