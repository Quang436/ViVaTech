import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, ArrowRight, BrainCircuit, FolderOpen, ShieldCheck, Sparkles, Mic } from 'lucide-react';
import { Navbar, BrandMark, type ActiveTab, type UserProfile } from './components/Navbar';
import { SetupView } from './components/SetupView';
import { ArenaChamber } from './components/ArenaChamber';
import { ScorecardView } from './components/ScorecardView';
import { DocumentsView } from './components/DocumentsView';
import { ArchiveView } from './components/ArchiveView';
import { NotificationsPopover, type NotificationItem } from './components/NotificationsPopover';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './components/HomeView';
import { api } from './services/api';
import type {
  AuthUser,
  CouncilPersona,
  DebateSession,
  PlatformStats,
  Scorecard,
  UploadedDocument,
} from './types';

const DEFAULT_AVATAR = '/avatars/user-default.jpg';
const PROTECTED_TABS: ActiveTab[] = ['documents', 'setup', 'arena', 'scorecard', 'archive'];

const TAB_TITLES: Record<ActiveTab, string> = {
  home: 'VivaArena — Nền Tảng Giả Lập Phản Biện Luận Án AI',
  documents: 'VivaArena — Quản Lý & Tải Tài Liệu Đề Án',
  setup: 'VivaArena — Khởi Tạo & Thiết Lập Hội Đồng Phản Biện AI',
  arena: 'VivaArena — Phòng Tranh Biện AI CoT Thời Gian Thực',
  scorecard: 'VivaArena — Bảng Điểm & Báo Cáo Hậu Bảo Vệ Luận Án',
  archive: 'VivaArena — Kho Đề Án & Tiến Độ Luyện Tập',
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedPersona, setSelectedPersona] = useState<CouncilPersona>('academic_reviewer');
  const [activeSession, setActiveSession] = useState<DebateSession | null>(null);
  const [scorecardData, setScorecardData] = useState<Scorecard | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCouncilThinking, setIsCouncilThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Real Auth, Bootstrapping, Redirect & Platform Metrics State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState<boolean>(() =>
    Boolean(api.getToken())
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<ActiveTab | null>(null);
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Dynamic page <title> per active view & scroll top on route change
  useEffect(() => {
    document.title = TAB_TITLES[activeTab] || TAB_TITLES.home;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await api.getPlatformStats();
      setPlatformStats(stats);
    } catch {
      // ignore stats transient error
    }
  }, []);

  // Tải toàn bộ dữ liệu thật thuộc tài khoản đang đăng nhập (Documents, Sessions, Scorecards)
  const refreshRealData = useCallback(async () => {
    if (!api.getToken()) return;
    try {
      const [docsList, sessList, cardsList] = await Promise.all([
        api.listDocuments(),
        api.listSessions(),
        api.listScorecards(),
      ]);
      setDocuments(docsList);
      setSessions(sessList);
      setScorecards(cardsList);

      const realNotifs: NotificationItem[] = [];
      if (docsList.length > 0) {
        realNotifs.push({
          id: `doc-${docsList[0].document_id}`,
          title: 'Tài liệu RAG đã sẵn sàng',
          description: `Tệp "${docsList[0].filename}" (${docsList[0].total_chunks} phân đoạn) đã được lập chỉ mục trong Vector DB.`,
          time: 'Mới nhất',
          unread: true,
          type: 'success',
          actionLabel: 'Quản lý tài liệu',
          actionTab: 'documents',
        });
      }
      if (cardsList.length > 0) {
        realNotifs.push({
          id: `card-${cardsList[0].id}`,
          title: 'Báo cáo chấm điểm gần nhất',
          description: `Phiên #${cardsList[0].session_id.slice(0, 6).toUpperCase()} đạt ${cardsList[0].overall_score.toFixed(1)}/100 điểm.`,
          time: 'Đã lưu DB',
          unread: false,
          type: 'academic',
          actionLabel: 'Xem bảng điểm',
          actionTab: 'scorecard',
        });
      }
      if (sessList.length > 0) {
        realNotifs.push({
          id: `sess-${sessList[0].id}`,
          title: `Phiên gần nhất: ${sessList[0].title.slice(0, 45)}`,
          description: `Trạng thái: ${
            sessList[0].status === 'completed'
              ? 'Đã hoàn thành'
              : `Đang ở lượt ${sessList[0].current_turn}/${sessList[0].max_turns}`
          }.`,
          time: 'Lịch sử hệ thống',
          unread: false,
          type: 'info',
          actionLabel: 'Xem lịch sử',
          actionTab: 'archive',
        });
      }
      setNotifications(realNotifs);

      setScorecardData((prev) => {
        if (prev && cardsList.some((c) => c.id === prev.id)) {
          return prev;
        }
        return cardsList[0] ?? null;
      });
      setActiveSession((prev) => {
        if (!prev) return null;
        return sessList.find((s) => s.id === prev.id) ?? prev;
      });
    } catch (err) {
      console.error('Lỗi đồng bộ dữ liệu thật từ Backend:', err);
    }
  }, []);

  // Đăng ký handler tự động xử lý 401 (hết hạn / thu hồi token)
  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      setCurrentUser(null);
      setActiveSession(null);
      setScorecardData(null);
      setDocuments([]);
      setSessions([]);
      setScorecards([]);
      setNotifications([]);
      setIsNotificationsOpen(false);
      setActiveTab((prev) => {
        if (PROTECTED_TABS.includes(prev)) {
          setPendingTab(prev);
        }
        return 'home';
      });
      setAuthPrompt('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      setIsAuthModalOpen(true);
    });
    return () => api.setUnauthorizedHandler(null);
  }, []);

  // Khởi tạo phiên thật: kiểm tra Bearer Token qua /auth/me và tải thống kê hệ thống
  useEffect(() => {
    try {
      localStorage.removeItem('viva_arena_user');
    } catch {
      // ignore
    }

    let cancelled = false;

    const bootstrap = async () => {
      await refreshStats();

      const token = api.getToken();
      if (!token) {
        if (!cancelled) setIsAuthBootstrapping(false);
        return;
      }

      try {
        const me = await api.getMe();
        if (cancelled) return;
        setCurrentUser({
          name: me.name,
          email: me.email,
          role: me.role,
          avatar: DEFAULT_AVATAR,
        });
        await refreshRealData();
      } catch {
        api.clearToken();
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) setIsAuthBootstrapping(false);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refreshRealData, refreshStats]);

  // Upload Document thật & cập nhật danh sách
  const handleUploadDocument = async (file: File): Promise<UploadedDocument> => {
    const uploaded = await api.uploadDocument(file);
    setDocuments((prev) => [
      uploaded,
      ...prev.filter((d) => d.document_id !== uploaded.document_id),
    ]);
    setNotifications((prev) => [
      {
        id: `upload-${uploaded.document_id}`,
        title: 'Đã nạp tài liệu vào Vector DB',
        description: `"${uploaded.filename}" đã được bóc tách ${uploaded.total_chunks} phân đoạn RAG.`,
        time: 'Vừa xong',
        unread: true,
        type: 'success',
        actionLabel: 'Tạo phiên chất vấn',
        actionTab: 'setup',
      },
      ...prev,
    ]);
    void refreshStats();
    return uploaded;
  };

  const handleDeleteDocument = async (docId: string) => {
    await api.deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    void refreshStats();
  };

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
      setPendingTab('setup');
      setAuthPrompt('Vui lòng đăng nhập để bắt đầu phiên chất vấn với Hội đồng AI.');
      setIsAuthModalOpen(true);
      return;
    }
    setIsLoading(true);
    setActionError(null);
    try {
      const session = await api.createSession({
        title: params.title,
        persona: selectedPersona,
        document_id: params.document_id,
        document_name: params.document_name,
        topic_summary: params.topic_summary,
        max_turns: params.max_turns,
      });
      setActiveSession(session);
      setSessions((prev) => [session, ...prev]);
      setActiveTab('arena');
      void refreshStats();
    } catch (err) {
      console.error('Lỗi khởi tạo phiên:', err);
      setActionError(err instanceof Error ? err.message : 'Không thể khởi tạo phiên tranh biện.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit Turn Response
  const handleSubmitTurn = async (response: string, mode: 'voice' | 'text', duration: number) => {
    if (!activeSession) return;
    setIsCouncilThinking(true);
    setActionError(null);

    try {
      const rebuttal = await api.submitTurn(activeSession.id, response, mode, duration);

      const updatedTurns = activeSession.turns.map((t) => {
        if (t.turn_number === activeSession.current_turn) {
          return {
            ...t,
            student_response: response,
            response_mode: mode,
            duration_seconds: duration,
            ground_truth_accuracy: rebuttal.ground_truth_accuracy,
            logic_flaws: rebuttal.detected_flaws,
            critique_comment: rebuttal.critique_previous_answer,
            ai_thought_process: rebuttal.cot_reasoning,
          };
        }
        return t;
      });

      if (rebuttal.is_completed || activeSession.current_turn >= activeSession.max_turns) {
        const completedSession: DebateSession = {
          ...activeSession,
          turns: updatedTurns,
          status: 'completed',
        };
        setActiveSession(completedSession);
        const card = await api.getScorecard(activeSession.id);
        setScorecardData(card);
        await Promise.all([refreshRealData(), refreshStats()]);
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

        const nextSession: DebateSession = {
          ...activeSession,
          current_turn: activeSession.current_turn + 1,
          turns: [...updatedTurns, nextTurnObj],
        };
        setActiveSession(nextSession);
        setSessions((prev) => prev.map((s) => (s.id === nextSession.id ? nextSession : s)));
        void refreshStats();
      }
    } catch (err) {
      console.error('Lỗi gửi phản hồi:', err);
      setActionError(err instanceof Error ? err.message : 'Lỗi khi xử lý câu trả lời.');
    } finally {
      setIsCouncilThinking(false);
    }
  };

  // Finish & grade session once >= 1 turn is answered
  const handleFinishAndScore = async () => {
    if (!activeSession) return;
    setIsCouncilThinking(true);
    setActionError(null);
    try {
      const card = await api.getScorecard(activeSession.id);
      setActiveSession((prev) => (prev ? { ...prev, status: 'completed' } : null));
      setScorecardData(card);
      await Promise.all([refreshRealData(), refreshStats()]);
      setActiveTab('scorecard');
    } catch (err) {
      console.error('Lỗi chấm điểm phiên:', err);
      setActionError(
        err instanceof Error ? err.message : 'Không thể chấm điểm phiên tranh biện này.'
      );
    } finally {
      setIsCouncilThinking(false);
    }
  };

  const handleViewSessionScorecard = async (sess: DebateSession) => {
    setIsLoading(true);
    setActionError(null);
    try {
      const card = await api.getScorecard(sess.id);
      setActiveSession(sess);
      setScorecardData(card);
      await Promise.all([refreshRealData(), refreshStats()]);
      setActiveTab('scorecard');
    } catch (err) {
      console.error('Lỗi lấy bảng điểm:', err);
      setActionError(
        err instanceof Error ? err.message : 'Không thể tạo bảng điểm cho phiên này.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setScorecards((prev) => prev.filter((c) => c.session_id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
      if (scorecardData?.session_id === sessionId) {
        setScorecardData(null);
      }
      void refreshStats();
    } catch (err) {
      console.error('Lỗi xóa phiên:', err);
      setActionError(err instanceof Error ? err.message : 'Không thể xóa phiên này.');
    }
  };

  const handleRestart = () => {
    setActiveSession(null);
    navigateToTab('setup');
  };

  const handleLoginSuccess = async (user: AuthUser) => {
    setActiveSession(null);
    setScorecardData(null);
    setDocuments([]);
    setSessions([]);
    setScorecards([]);
    setNotifications([]);
    setActionError(null);
    setAuthPrompt(null);

    setCurrentUser({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: DEFAULT_AVATAR,
    });

    const destination = pendingTab ?? (activeTab === 'home' ? 'setup' : activeTab);
    setPendingTab(null);
    setActiveTab(destination);

    await Promise.all([refreshRealData(), refreshStats()]);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveSession(null);
    setScorecardData(null);
    setDocuments([]);
    setSessions([]);
    setScorecards([]);
    setNotifications([]);
    setPendingTab(null);
    setAuthPrompt(null);
    setActionError(null);
    setIsNotificationsOpen(false);
    setActiveTab('home');
    await refreshStats();
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const navigateToTab = (tab: ActiveTab) => {
    setActionError(null);
    if (PROTECTED_TABS.includes(tab) && !currentUser) {
      if (isAuthBootstrapping) return;
      setPendingTab(tab);
      setAuthPrompt(
        'Vui lòng đăng nhập hoặc đăng ký tài khoản để truy cập khu vực làm việc riêng của bạn.'
      );
      setIsAuthModalOpen(true);
      return;
    }
    if (tab === 'home') {
      void refreshStats();
    } else if (tab === 'archive' || tab === 'documents' || tab === 'scorecard') {
      void refreshRealData();
    }
    setActiveTab(tab);
  };

  const unreadCount = currentUser ? notifications.filter((n) => n.unread).length : 0;

  return (
    <div className="bg-[#f7faf9] text-[#0a1413] min-h-screen relative overflow-x-hidden selection:bg-[rgba(110,231,200,0.35)] selection:text-[#062822] flex flex-col justify-between">
      {/* Subtle Light Mode Mint Paper Ambient Halo (single accent, never purple) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1080px] h-[520px] rounded-full blur-3xl opacity-75"
          style={{
            background:
              'radial-gradient(closest-side, rgba(110, 231, 200, 0.24), rgba(110, 231, 200, 0))',
          }}
        />
      </div>

      {/* Top Sticky Mint Paper Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        sessionCode={
          currentUser && activeSession ? `#VV-${activeSession.id.slice(0, 4).toUpperCase()}` : ''
        }
        hasActiveSession={
          Boolean(currentUser && activeSession && activeSession.status !== 'completed')
        }
        user={currentUser}
        onOpenAuth={() => {
          setPendingTab(null);
          setAuthPrompt(null);
          setIsAuthModalOpen(true);
        }}
        onLogout={() => void handleLogout()}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        isNotificationsOpen={isNotificationsOpen}
        unreadNotificationCount={unreadCount}
      />

      {/* Non-blocking System Error Banner */}
      {actionError && (
        <div
          role="alert"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,40rem)] p-4 rounded-2xl bg-[#ffe4e6] border border-[#be123c]/25 text-[#881337] shadow-[0_18px_40px_-14px_rgba(190,18,60,0.2)] flex items-center justify-between gap-3 text-xs font-sans"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#be123c] shrink-0" strokeWidth={2} aria-hidden="true" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Đóng thông báo lỗi"
            className="text-[#881337] hover:underline font-semibold bg-transparent border-none cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Notifications Popover */}
      {currentUser && (
        <NotificationsPopover
          notifications={notifications}
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllAsRead={handleMarkAllAsRead}
          onSelectAction={navigateToTab}
        />
      )}

      {/* Native <dialog> Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPrompt(null);
          setPendingTab(null);
        }}
        onLoginSuccess={(u) => void handleLoginSuccess(u)}
        promptMessage={authPrompt}
      />

      {/* Main View Router */}
      <div key={activeTab} className="relative z-10 flex-1 flex flex-col mint-page-in">
        {isAuthBootstrapping && activeTab !== 'home' ? (
          <main
            id="main-content"
            tabIndex={-1}
            className="pt-20 pb-20 flex-1 max-w-xl w-full mx-auto px-4 text-center flex flex-col items-center justify-center gap-3 outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-[rgba(110,231,200,0.22)] border border-[rgba(11,110,94,0.22)] text-[#085448] flex items-center justify-center animate-pulse">
              <BrainCircuit className="w-6 h-6" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="font-sans text-sm text-[#465754]">Đang xác thực phiên làm việc...</p>
          </main>
        ) : (
          <>
            {(activeTab === 'home' || !currentUser) && (
              <HomeView
                onStartSetup={() => navigateToTab('setup')}
                onSelectPersona={(p) => {
                  setSelectedPersona(p);
                  navigateToTab('setup');
                }}
                onExploreArchive={() => navigateToTab('archive')}
                onOpenAuth={() => {
                  setPendingTab(null);
                  setAuthPrompt(null);
                  setIsAuthModalOpen(true);
                }}
                user={currentUser}
                stats={platformStats}
                documents={documents}
                sessions={sessions}
                scorecards={scorecards}
              />
            )}

            {currentUser && activeTab === 'setup' && (
              <SetupView
                selectedPersona={selectedPersona}
                onSelectPersona={(p) => setSelectedPersona(p)}
                documents={documents}
                onStartDebate={handleStartDebate}
                isLoading={isLoading}
                onFileUpload={handleUploadDocument}
              />
            )}

            {currentUser && activeTab === 'arena' && !activeSession && (
              <main
                id="main-content"
                tabIndex={-1}
                className="pt-20 pb-20 flex-1 max-w-xl w-full mx-auto px-4 text-center flex flex-col items-center justify-center gap-4 outline-none"
              >
                <div className="w-16 h-16 rounded-2xl bg-[rgba(110,231,200,0.2)] border border-[rgba(11,110,94,0.22)] text-[#085448] flex items-center justify-center">
                  <BrainCircuit className="w-8 h-8" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#0a1413]">
                  Chưa có phiên tranh biện đang mở
                </h1>
                <p className="font-sans text-xs sm:text-sm text-[#465754] max-w-md leading-relaxed">
                  Vui lòng chọn tài liệu hoặc nhập đề tài thực tế tại mục Thiết lập để khởi tạo phiên chất vấn với Hội đồng AI, hoặc tiếp tục một phiên từ Kho đề án.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateToTab('setup')}
                    className="btn-mint-primary h-10 px-5 text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Đến Thiết lập đề tài</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToTab('archive')}
                    className="btn-mint-ghost h-10 px-5 text-xs sm:text-sm cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-[#0b6e5e]" strokeWidth={1.9} aria-hidden="true" />
                    <span>Mở phiên từ Lịch sử ({sessions.length})</span>
                  </button>
                </div>
              </main>
            )}

            {currentUser && activeTab === 'arena' && activeSession && (
              <ArenaChamber
                session={activeSession}
                persona={selectedPersona}
                onSubmitTurn={handleSubmitTurn}
                onFinishEarly={handleFinishAndScore}
                isCouncilThinking={isCouncilThinking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              />
            )}

            {currentUser && activeTab === 'scorecard' && (
              <ScorecardView
                scorecard={scorecardData}
                persona={selectedPersona}
                topicTitle={activeSession?.title || 'Phiên bảo vệ học thuật'}
                onRestart={handleRestart}
                onGoToArchive={() => navigateToTab('archive')}
              />
            )}

            {currentUser && activeTab === 'documents' && (
              <DocumentsView
                documents={documents}
                onStartSessionWithDoc={(doc) => {
                  void handleStartDebate({
                    title: doc.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                    topic_summary: doc.summary,
                    document_id: doc.document_id,
                    document_name: doc.filename,
                    max_turns: 5,
                    mode: 'voice',
                  });
                }}
                onFileUpload={handleUploadDocument}
                onDeleteDocument={handleDeleteDocument}
              />
            )}

            {currentUser && activeTab === 'archive' && (
              <ArchiveView
                sessions={sessions}
                scorecards={scorecards}
                onNewSession={() => navigateToTab('setup')}
                onViewScorecard={handleViewSessionScorecard}
                onResumeSession={(sess) => {
                  setActiveSession(sess);
                  setSelectedPersona(sess.persona);
                  navigateToTab('arena');
                }}
                onDeleteSession={handleDeleteSession}
                onOpenDocuments={() => navigateToTab('documents')}
              />
            )}
          </>
        )}
      </div>

      {/* Editorial Light Mint Paper Footer */}
      <footer className="relative z-10 border-t border-[rgba(10,20,19,0.08)] bg-[#f7faf9] pt-14 pb-8 overflow-hidden no-print">
        <div className="mint-wrap">
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            {/* Brand Column */}
            <div className="flex flex-col gap-4 max-w-xs">
              <button
                type="button"
                onClick={() => navigateToTab('home')}
                className="flex items-center gap-2.5 text-left bg-transparent border-none p-0 cursor-pointer w-fit"
              >
                <span className="w-7 h-7 rounded-lg bg-[#eff5f3] border border-[rgba(10,20,19,0.1)] flex items-center justify-center">
                  <BrandMark className="w-4 h-4" />
                </span>
                <span className="font-sans font-semibold text-base tracking-[-0.02em] text-[#0a1413]">
                  VivaArena
                </span>
              </button>
              <p className="font-sans text-xs sm:text-sm text-[#465754] leading-relaxed">
                Hệ thống giả lập phản biện luận án AI ứng dụng suy luận chuỗi CoT 3 bước và đối soát tài liệu RAG.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigateToTab('setup')}
                  aria-label="Phòng thiết lập phản biện"
                  className="w-8 h-8 rounded-lg bg-[#eff5f3] border border-[rgba(10,20,19,0.1)] flex items-center justify-center text-[#465754] hover:text-[#0b6e5e] hover:border-[rgba(11,110,94,0.3)] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('documents')}
                  aria-label="Kho tài liệu RAG"
                  className="w-8 h-8 rounded-lg bg-[#eff5f3] border border-[rgba(10,20,19,0.1)] flex items-center justify-center text-[#465754] hover:text-[#0b6e5e] hover:border-[rgba(11,110,94,0.3)] transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('arena')}
                  aria-label="Phòng tranh biện giọng nói"
                  className="w-8 h-8 rounded-lg bg-[#eff5f3] border border-[rgba(10,20,19,0.1)] flex items-center justify-center text-[#465754] hover:text-[#0b6e5e] hover:border-[rgba(11,110,94,0.3)] transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Footer Navigation Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-14">
              <div className="flex flex-col gap-2.5">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361] mb-1">
                  NỀN TẢNG
                </h2>
                <button
                  type="button"
                  onClick={() => navigateToTab('home')}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Tổng quan
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('documents')}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Kho tài liệu RAG
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('setup')}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Thiết lập đề tài
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361] mb-1">
                  QUY TRÌNH
                </h2>
                <button
                  type="button"
                  onClick={() => navigateToTab('arena')}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Phòng tranh biện AI
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('scorecard')}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Bảng điểm 4 trục
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('archive')}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Hồ sơ E-Portfolio
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361] mb-1">
                  HỘI ĐỒNG AI
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersona('feynman');
                    navigateToTab('setup');
                  }}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Cấp 1 · Feynman
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersona('academic_reviewer');
                    navigateToTab('setup');
                  }}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Cấp 2 · Học thuật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersona('strict_council');
                    navigateToTab('setup');
                  }}
                  className="text-left text-xs sm:text-sm text-[#465754] hover:text-[#0a1413] bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Cấp 3 · Stress-Test
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361] mb-1">
                  CÔNG NGHỆ
                </h2>
                <span className="text-xs sm:text-sm text-[#465754]">Gemini CoT Engine</span>
                <span className="text-xs sm:text-sm text-[#465754]">Vector RAG Ground Truth</span>
                <span className="text-xs sm:text-sm text-[#465754]">D-ID WebRTC Stream</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-5 border-t border-[rgba(10,20,19,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-[#556361]">
            <span>© 2026 VivaArena. Bảo lưu toàn bộ quyền sở hữu học thuật.</span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[#0b6e5e]">
              <span
                className="w-2 h-2 rounded-full bg-[#6ee7c8] border border-[#0b6e5e]"
                style={{ boxShadow: '0 0 8px rgba(110, 231, 200, 0.9)' }}
                aria-hidden="true"
              />
              <span>Gemini AI, Vector RAG &amp; WebRTC đang hoạt động</span>
            </span>
          </div>

          {/* Subtle Giant Mint Paper Editorial Wordmark */}
          <div
            aria-hidden="true"
            className="mt-8 text-center font-sans font-semibold select-none whitespace-nowrap overflow-hidden leading-[0.82] tracking-[-0.045em] text-[rgba(10,20,19,0.045)] text-[76px] sm:text-[132px] lg:text-[210px]"
          >
            VivaArena
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
