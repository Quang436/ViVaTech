import { useState, useEffect, useCallback } from 'react';
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
import type { CouncilPersona, DebateSession, Scorecard, UploadedDocument } from './types';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDjGexftNC_DNLJj7IX4Z7rHQ_XTgpKbqOiwpp0s5LxgeGmdFtlRXRPKEmkGo1gI8yBzrul2zPhizefq5gsyRzi49YA88bhhRMiBTpSaeaZVdF3HnMhqLNRo1CAhxy9PZPyOd8z7uq2pcseL7JSsrXAP5Jn_5IbfFCZy6q-Eb9a098cU2FmFpSREXLX7BmU2Pv2opto9iHC8gYrfMSBczNO__akHUIM84VMgfGyw9Ms';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('setup');
  const [selectedPersona, setSelectedPersona] = useState<CouncilPersona>('academic_reviewer');
  const [activeSession, setActiveSession] = useState<DebateSession | null>(null);
  const [scorecardData, setScorecardData] = useState<Scorecard | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCouncilThinking, setIsCouncilThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Auth & User Profile State (Lưu thực tế vào localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('viva_arena_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      name: 'Nghiên cứu sinh',
      email: 'researcher@viva-arena.edu.vn',
      role: 'Bảo vệ Khóa luận',
      avatar: DEFAULT_AVATAR,
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Notifications State (Sinh động từ sự kiện thực tế của hệ thống)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Tải toàn bộ dữ liệu thật từ Backend (Documents, Sessions, Scorecards)
  const refreshRealData = useCallback(async () => {
    try {
      const [docsList, sessList, cardsList] = await Promise.all([
        api.listDocuments().catch(() => []),
        api.listSessions().catch(() => []),
        api.listScorecards().catch(() => []),
      ]);
      setDocuments(docsList);
      setSessions(sessList);
      setScorecards(cardsList);

      // Tạo thông báo thực tế từ dữ liệu hệ thống
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
          description: `Trạng thái: ${sessList[0].status === 'completed' ? 'Đã hoàn thành' : `Đang ở lượt ${sessList[0].current_turn}/${sessList[0].max_turns}`}.`,
          time: 'Lịch sử hệ thống',
          unread: false,
          type: 'info',
          actionLabel: 'Xem lịch sử',
          actionTab: 'archive',
        });
      }
      setNotifications(realNotifs);

      if (!scorecardData && cardsList.length > 0) {
        setScorecardData(cardsList[0]);
      }
    } catch (err) {
      console.error('Lỗi đồng bộ dữ liệu thật từ Backend:', err);
    }
  }, [scorecardData]);

  useEffect(() => {
    refreshRealData();
  }, []);

  // Upload Document thật & cập nhật danh sách
  const handleUploadDocument = async (file: File): Promise<UploadedDocument> => {
    const uploaded = await api.uploadDocument(file);
    setDocuments((prev) => [uploaded, ...prev.filter((d) => d.document_id !== uploaded.document_id)]);
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
    return uploaded;
  };

  const handleDeleteDocument = async (docId: string) => {
    await api.deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
  };

  // Step 1: Start Debate Session (Dữ liệu thật từ Gemini AI & SQLite)
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
        document_name: params.document_name,
        topic_summary: params.topic_summary,
        max_turns: params.max_turns,
      });
      setActiveSession(session);
      setSessions((prev) => [session, ...prev]);
      setActiveTab('arena');
    } catch (err) {
      console.error('Lỗi khởi tạo phiên:', err);
      alert(err instanceof Error ? err.message : 'Không thể khởi tạo phiên tranh biện.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit Turn Response (Gửi câu trả lời thật -> Gemini CoT chấm & hỏi tiếp)
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
        await refreshRealData();
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
      }
    } catch (err) {
      console.error('Lỗi gửi phản hồi:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi xử lý câu trả lời.');
    } finally {
      setIsCouncilThinking(false);
    }
  };

  const handleViewSessionScorecard = async (sess: DebateSession) => {
    setIsLoading(true);
    try {
      const card = await api.getScorecard(sess.id);
      setActiveSession(sess);
      setScorecardData(card);
      await refreshRealData();
      setActiveTab('scorecard');
    } catch (err) {
      console.error('Lỗi lấy bảng điểm:', err);
      alert(err instanceof Error ? err.message : 'Không thể tạo bảng điểm cho phiên này.');
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
    } catch (err) {
      console.error('Lỗi xóa phiên:', err);
    }
  };

  const handleRestart = () => {
    setActiveSession(null);
    setActiveTab('setup');
  };

  const handleLoginSuccess = (user: { name: string; email: string; role: string }) => {
    const newProfile: UserProfile = {
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: DEFAULT_AVATAR,
    };
    setCurrentUser(newProfile);
    try {
      localStorage.setItem('viva_arena_user', JSON.stringify(newProfile));
    } catch {
      // ignore
    }
    if (activeTab === 'home') {
      setActiveTab('setup');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSession(null);
    try {
      localStorage.removeItem('viva_arena_user');
    } catch {
      // ignore
    }
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
          if (tab === 'archive' || tab === 'documents') {
            refreshRealData();
          }
          setActiveTab(tab);
        }}
        sessionCode={
          activeSession ? `#VV-${activeSession.id.slice(0, 4).toUpperCase()}` : '#CHƯA-MỞ'
        }
        hasActiveSession={!!activeSession}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        unreadNotificationCount={unreadCount}
      />

      {/* Notifications Popover */}
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
            onExploreArchive={() => {
              refreshRealData();
              setActiveTab('archive');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            user={currentUser}
          />
        )}

        {activeTab === 'setup' && (
          <SetupView
            selectedPersona={selectedPersona}
            onSelectPersona={(p) => setSelectedPersona(p)}
            documents={documents}
            onStartDebate={handleStartDebate}
            isLoading={isLoading}
            onFileUpload={handleUploadDocument}
          />
        )}

        {activeTab === 'arena' && !activeSession && (
          <div className="pt-28 pb-16 flex-1 max-w-xl w-full mx-auto px-4 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              Chưa có phiên tranh biện đang mở
            </h2>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-md">
              Vui lòng chọn tài liệu / nhập đề tài thực tế tại mục Thiết lập để khởi tạo phiên chất vấn với Hội đồng AI, hoặc tiếp tục một phiên từ Lịch sử.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('setup')}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs sm:text-sm font-bold hover:bg-primary-container transition-all cursor-pointer border-none"
              >
                Đến Thiết lập đề tài
              </button>
              <button
                onClick={() => {
                  refreshRealData();
                  setActiveTab('archive');
                }}
                className="px-5 py-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface font-label text-xs sm:text-sm font-bold hover:bg-surface-container-low transition-all cursor-pointer"
              >
                Mở phiên từ Lịch sử ({sessions.length})
              </button>
            </div>
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
            scorecard={scorecardData}
            persona={selectedPersona}
            topicTitle={activeSession?.title || 'Phiên bảo vệ học thuật'}
            onRestart={handleRestart}
            onGoToArchive={() => {
              refreshRealData();
              setActiveTab('archive');
            }}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsView
            documents={documents}
            onStartSessionWithDoc={(doc) => {
              handleStartDebate({
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

        {activeTab === 'archive' && (
          <ArchiveView
            sessions={sessions}
            scorecards={scorecards}
            onNewSession={() => setActiveTab('setup')}
            onViewScorecard={handleViewSessionScorecard}
            onResumeSession={(sess) => {
              setActiveSession(sess);
              setSelectedPersona(sess.persona);
              setActiveTab('arena');
            }}
            onDeleteSession={handleDeleteSession}
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
            Powered by Google Gemini AI, ChromaDB RAG & D-ID WebRTC Agent
          </span>
        </div>
      </footer>
    </div>
  );
}
export default App;
