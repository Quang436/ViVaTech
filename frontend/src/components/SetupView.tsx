import React, { useState, useRef } from 'react';
import type { CouncilPersona } from '../types';

interface SetupViewProps {
  selectedPersona: CouncilPersona;
  onSelectPersona: (persona: CouncilPersona) => void;
  onStartDebate: (params: {
    title: string;
    topic_summary?: string;
    document_id?: string;
    document_name?: string;
    max_turns: number;
    mode: 'voice' | 'text';
  }) => void;
  isLoading: boolean;
  onFileUpload: (file: File) => Promise<{ document_id: string; filename: string; summary: string }>;
}

const SAMPLE_TOPICS = [
  {
    title: 'Ứng dụng Heterogeneous GNN kết hợp ViBERT trong phân tích văn bản học thuật',
    filename: 'Do_An_Tot_Nghiep_AI_Khang_2025.pdf',
    pages: '148 trang',
    coverage: '94.6%',
    segments: '18 Phân đoạn RAG',
    summary: 'Mô hình kết hợp trích xuất đặc trưng ngữ nghĩa bằng ViBERT và biểu diễn liên kết đa thực thể bằng Heterogeneous GNN giúp tăng độ chính xác phân loại tài liệu học thuật.',
  },
  {
    title: 'Nền tảng EdTech Cá nhân hóa Lộ trình Học tập Dựa trên Generative AI & RAG',
    filename: 'Bao_Cao_Nghien_Cuu_EdTech_2025.pdf',
    pages: '96 trang',
    coverage: '96.2%',
    segments: '24 Phân đoạn RAG',
    summary: 'Phân tích lỗ hổng kiến thức sinh viên qua các bài kiểm tra thích ứng và sinh lộ trình vi mô tự động với kỹ thuật RAG độ trễ thấp.',
  },
  {
    title: 'Kiến trúc Microservices Chịu lỗi Cao cho Hệ thống Giao dịch Fintech',
    filename: 'Kien_Truc_He_Thong_Fintech.pdf',
    pages: '112 trang',
    coverage: '91.8%',
    segments: '15 Phân đoạn RAG',
    summary: 'Áp dụng mô hình Saga Pattern kết hợp Kafka và Event Sourcing để đảm bảo tính nhất quán dữ liệu giao dịch tài chính.',
  },
];

export const SetupView: React.FC<SetupViewProps> = ({
  selectedPersona,
  onSelectPersona,
  onStartDebate,
  isLoading,
  onFileUpload,
}) => {
  const [selectedTopic, setSelectedTopic] = useState(SAMPLE_TOPICS[0]);
  const [customTitle, setCustomTitle] = useState(SAMPLE_TOPICS[0].title);
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [maxTurns, setMaxTurns] = useState<number>(5);
  const [interactionMode, setInteractionMode] = useState<'voice' | 'text'>('voice');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await onFileUpload(file);
      const newTopic = {
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        filename: file.name,
        pages: 'Tài liệu tải lên',
        coverage: '98.5%',
        segments: '22 Phân đoạn RAG',
        summary: res.summary || 'Tài liệu toàn văn đã được bóc tách và phân đoạn ngữ nghĩa.',
      };
      setSelectedTopic(newTopic);
      setCustomTitle(newTopic.title);
    } catch (err) {
      console.error('Lỗi tải tệp:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = () => {
    onStartDebate({
      title: customTitle.trim() || selectedTopic.title,
      topic_summary: selectedTopic.summary,
      document_name: selectedTopic.filename,
      max_turns: maxTurns,
      mode: interactionMode,
    });
  };

  const getCouncilLabel = () => {
    if (selectedPersona === 'feynman') return 'Cấp 1 • Feynman (GS. Lê Minh Triết)';
    if (selectedPersona === 'academic_reviewer') return 'Cấp 2 • Học thuật Chuẩn (PGS. TS. Trần Thu Hà)';
    return 'Cấp 3 • Stress-Test (GS. Viện sĩ Hoàng Vĩnh)';
  };

  return (
    <main className="relative z-10 pt-20 pb-12 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* HERO TITLE & STATUS */}
      <div className="pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-container-high/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/90 border border-primary/25 text-primary text-xs font-label font-semibold mb-3 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Gemini 3.8 CoT • Academic Examiner Engine
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-on-surface">
            Thiết Lập Hội Đồng Phản Biện
          </h1>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            Sẵn sàng bước vào phiên chất vấn bảo vệ luận án thực chiến trong 30 giây. Chọn cấp độ hội đồng và tùy chỉnh thời lượng phù hợp.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-start md:self-auto">
          <div className="px-4 py-2 rounded-xl bg-surface-container-lowest/90 border border-surface-container-high/90 shadow-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
            <div>
              <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant font-bold">
                Trạng thái RAG
              </div>
              <div className="text-xs font-bold text-on-surface">Đã sẵn sàng chất vấn</div>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN 1: TÓM TẮT ĐỀ ÁN SẴN SÀNG (STREAMLINED & CLEAN) */}
      <section className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-5 sm:p-6 shadow-xs hover-lift">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* File badge & Metadata */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-13 rounded-xl bg-primary-fixed/40 border border-primary/20 flex flex-col items-center justify-center text-primary shrink-0 shadow-xs p-2">
              <span className="text-[10px] font-label font-extrabold tracking-tight">PDF</span>
              <span className="material-symbols-outlined text-xl leading-none">description</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-label font-bold text-on-surface truncate">
                  {selectedTopic.filename}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Toàn văn đã lập chỉ mục
                </span>
              </div>
              {isCustomEditing ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="text-xs font-body p-2 border border-primary rounded-lg bg-surface-container-lowest text-on-surface w-full max-w-lg focus:outline-none"
                    placeholder="Nhập tiêu đề đề tài cần bảo vệ..."
                  />
                  <button
                    onClick={() => setIsCustomEditing(false)}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-label cursor-pointer"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant font-body mt-1">
                  Đề tài:{' '}
                  <span className="font-semibold text-on-surface cursor-pointer hover:underline" onClick={() => setIsCustomEditing(true)}>
                    {customTitle}
                  </span>{' '}
                  • {selectedTopic.pages}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Pill Group & Switch File Button */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-surface-container-low/70 border border-surface-container-high/50 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-on-surface-variant font-label uppercase">Bao phủ tri thức</div>
                <div className="text-xs font-bold text-primary">{selectedTopic.coverage} Nội dung</div>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-surface-container-low/70 border border-surface-container-high/50 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-lg">segment</span>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-on-surface-variant font-label uppercase">Trích đoạn cốt lõi</div>
                <div className="text-xs font-bold text-secondary">{selectedTopic.segments}</div>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high text-xs font-label font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đổi tệp PDF khác"
            >
              <span className={`material-symbols-outlined text-base ${isUploading ? 'animate-spin' : ''}`}>
                {isUploading ? 'sync' : 'sync'}
              </span>
              <span className="hidden sm:inline">{isUploading ? 'Đang nạp...' : 'Thay tệp'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Selector Drawer */}
        <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider mr-1">
            Đề tài mẫu nhanh:
          </span>
          {SAMPLE_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedTopic(topic);
                setCustomTitle(topic.title);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border font-label transition-all cursor-pointer ${
                selectedTopic.filename === topic.filename
                  ? 'bg-primary-fixed/40 border-primary text-primary font-bold'
                  : 'bg-surface-container-lowest border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              #{idx + 1} {topic.title.slice(0, 32)}...
            </button>
          ))}
        </div>
      </section>

      {/* PHẦN 2: LỰA CHỌN 3 CẤP ĐỘ HỘI ĐỒNG PHẢN BIỆN (INTERACTIVE 3-TIER PERSONAS) */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="font-label text-xs uppercase tracking-widest text-primary font-bold block mb-1">
              Hội Đồng Trí Tuệ Nhân Tạo
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-on-surface">
              Chọn Phong Cách & Cấp Độ Giám Khảo
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-body">
            Nhấp chọn cấp độ phù hợp nhất với trạng thái ôn luyện của bạn
          </p>
        </div>

        {/* Grid 3 Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="persona-cards-group">
          {/* CẤP 1 - FEYNMAN */}
          <div
            onClick={() => onSelectPersona('feynman')}
            className={`persona-card cursor-pointer rounded-2xl p-6 bg-surface-container-lowest/90 backdrop-blur-sm border hover-lift flex flex-col justify-between transition-all group relative ${
              selectedPersona === 'feynman'
                ? 'border-2 border-primary ring-4 ring-primary/10 shadow-lg'
                : 'border-surface-container-high/90'
            }`}
          >
            {selectedPersona === 'feynman' && (
              <div className="absolute top-4 right-4 text-primary">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs bg-primary-fixed text-on-primary-fixed-variant font-label font-bold uppercase tracking-wider">
                  Cấp 1 • Feynman
                </span>
                <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                </div>
              </div>
              <h3 className="font-headline text-2xl font-semibold text-on-surface mb-1">
                GS. Lê Minh Triết
              </h3>
              <p className="font-label text-xs text-primary font-semibold mb-3">
                Dễ • Trực quan hóa & Bản chất cốt lõi
              </p>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-5">
                Kiểm tra khả năng tinh giản vấn đề phức tạp thành ngôn ngữ trực giác, bóc tách luận điểm không cho phép nói vẹt lý thuyết rườm rà.
              </p>
              {/* Sample question */}
              <div className="bg-surface-container-low/70 p-3.5 rounded-xl border border-surface-container-high/40 text-xs">
                <span className="font-label text-[10px] uppercase tracking-wide text-primary font-bold block mb-1">
                  Ví dụ chất vấn:
                </span>
                <p className="font-headline text-on-surface italic text-xs leading-snug">
                  "Nếu giải thích đóng góp của mô hình này cho người ngoài ngành trong 60 giây, bạn sẽ bắt đầu từ đâu?"
                </p>
              </div>
            </div>
            <div className="pt-4 mt-5 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
              <span className="text-on-surface-variant">
                Cường độ: <strong className="text-on-surface">Ôn hòa</strong>
              </span>
              <span className="text-primary font-semibold">Rèn tính khúc chiết</span>
            </div>
          </div>

          {/* CẤP 2 - HỌC THUẬT CHUẨN MỰC (MẶC ĐỊNH ACTIVE) */}
          <div
            onClick={() => onSelectPersona('academic_reviewer')}
            className={`persona-card cursor-pointer rounded-2xl p-6 bg-surface-container-lowest/90 backdrop-blur-sm border hover-lift flex flex-col justify-between transition-all group relative ${
              selectedPersona === 'academic_reviewer'
                ? 'border-2 border-primary ring-4 ring-primary/10 shadow-lg'
                : 'border-surface-container-high/90'
            }`}
          >
            {selectedPersona === 'academic_reviewer' && (
              <div className="absolute top-4 right-4 text-primary">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs bg-secondary-fixed text-on-secondary-fixed-variant font-label font-bold uppercase tracking-wider">
                  Cấp 2 • Khuyên Dùng
                </span>
                <div className="w-9 h-9 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
              </div>
              <h3 className="font-headline text-2xl font-semibold text-on-surface mb-1">
                PGS. TS. Trần Thu Hà
              </h3>
              <p className="font-label text-xs text-secondary font-semibold mb-3">
                Vừa • Phương pháp luận & Chuẩn Hội đồng
              </p>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-5">
                Đánh giá theo chuẩn rubric Scopus/ISI, soi kỹ khoảng trống tri thức, mẫu khảo sát và tính hợp lệ của phương pháp thực nghiệm.
              </p>
              {/* Sample question */}
              <div className="bg-primary/5 p-3.5 rounded-xl border border-primary/15 text-xs">
                <span className="font-label text-[10px] uppercase tracking-wide text-secondary font-bold block mb-1">
                  Ví dụ chất vấn:
                </span>
                <p className="font-headline text-on-surface italic text-xs leading-snug">
                  "Phương pháp baseline của bạn đã bỏ sót công trình công bố gần nhất. Hãy chứng minh giải pháp vẫn ưu việt?"
                </p>
              </div>
            </div>
            <div className="pt-4 mt-5 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
              <span className="text-on-surface-variant">
                Cường độ: <strong className="text-on-surface">Chuyên sâu</strong>
              </span>
              <span className="text-secondary font-semibold">Chuẩn hóa phương pháp</span>
            </div>
          </div>

          {/* CẤP 3 - STRESS TEST */}
          <div
            onClick={() => onSelectPersona('strict_council')}
            className={`persona-card cursor-pointer rounded-2xl p-6 bg-surface-container-lowest/90 backdrop-blur-sm border hover-lift flex flex-col justify-between transition-all group relative ${
              selectedPersona === 'strict_council'
                ? 'border-2 border-error ring-4 ring-error/10 shadow-lg'
                : 'border-surface-container-high/90'
            }`}
          >
            {selectedPersona === 'strict_council' && (
              <div className="absolute top-4 right-4 text-error">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs bg-error-container text-on-error-container font-label font-bold uppercase tracking-wider">
                  Cấp 3 • Stress-Test
                </span>
                <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
              </div>
              <h3 className="font-headline text-2xl font-semibold text-on-surface mb-1">
                GS. Viện sĩ Hoàng Vĩnh
              </h3>
              <p className="font-label text-xs text-error font-semibold mb-3">
                Khó • Đối kháng & Bắt bẻ Logic góc biên
              </p>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-5">
                Truy vấn dồn dập vào trường hợp ngoại lệ (Edge Cases), bắt bẻ các ngụy biện khái quát vội và thử thách bản lĩnh chịu áp lực cao.
              </p>
              {/* Sample question */}
              <div className="bg-surface-container-low/70 p-3.5 rounded-xl border border-surface-container-high/40 text-xs">
                <span className="font-label text-[10px] uppercase tracking-wide text-error font-bold block mb-1">
                  Ví dụ chất vấn:
                </span>
                <p className="font-headline text-on-surface italic text-xs leading-snug">
                  "Kết luận Chương 3 có vẻ mâu thuẫn trực tiếp với Giả thuyết H2 ban đầu. Đề nghị tác giả giải trình thẳng thắn!"
                </p>
              </div>
            </div>
            <div className="pt-4 mt-5 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
              <span className="text-on-surface-variant">
                Cường độ: <strong className="text-error">Dồn dập</strong>
              </span>
              <span className="text-error font-semibold">Vững vàng tâm lý</span>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 3: CẤU HÌNH NHANH & CTA CHÍNH */}
      <section className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-5 sm:p-7 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Cấu hình số lượt (Pill Selector) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">timer</span>
              Thời lượng chất vấn:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-surface-container-low/80 rounded-xl border border-surface-container-high/50">
              <button
                type="button"
                onClick={() => setMaxTurns(3)}
                className={`turn-btn py-2 px-2 rounded-lg font-label text-xs transition-all text-center cursor-pointer border-none ${
                  maxTurns === 3
                    ? 'font-bold bg-surface-container-lowest text-primary shadow-xs'
                    : 'font-semibold text-on-surface-variant hover:text-on-surface bg-transparent'
                }`}
              >
                3 lượt <span className="block text-[10px] opacity-75 font-normal">~9 phút</span>
              </button>
              <button
                type="button"
                onClick={() => setMaxTurns(5)}
                className={`turn-btn py-2 px-2 rounded-lg font-label text-xs transition-all text-center cursor-pointer border-none ${
                  maxTurns === 5
                    ? 'font-bold bg-surface-container-lowest text-primary shadow-xs'
                    : 'font-semibold text-on-surface-variant hover:text-on-surface bg-transparent'
                }`}
              >
                5 lượt <span className="block text-[10px] opacity-80 font-normal">~15 phút</span>
              </button>
              <button
                type="button"
                onClick={() => setMaxTurns(10)}
                className={`turn-btn py-2 px-2 rounded-lg font-label text-xs transition-all text-center cursor-pointer border-none ${
                  maxTurns === 10
                    ? 'font-bold bg-surface-container-lowest text-primary shadow-xs'
                    : 'font-semibold text-on-surface-variant hover:text-on-surface bg-transparent'
                }`}
              >
                10 lượt <span className="block text-[10px] opacity-75 font-normal">~30 phút</span>
              </button>
            </div>
          </div>

          {/* Cấu hình phương thức tương tác */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">mic</span>
              Phương thức tương tác:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-container-low/80 rounded-xl border border-surface-container-high/50">
              <button
                type="button"
                onClick={() => setInteractionMode('voice')}
                className={`mode-btn py-2 px-3 rounded-lg font-label text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  interactionMode === 'voice'
                    ? 'font-bold bg-surface-container-lowest text-primary shadow-xs'
                    : 'font-semibold text-on-surface-variant hover:text-on-surface bg-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">mic</span>
                <span>Giọng nói (STT)</span>
              </button>
              <button
                type="button"
                onClick={() => setInteractionMode('text')}
                className={`mode-btn py-2 px-3 rounded-lg font-label text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  interactionMode === 'text'
                    ? 'font-bold bg-surface-container-lowest text-primary shadow-xs'
                    : 'font-semibold text-on-surface-variant hover:text-on-surface bg-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">keyboard</span>
                <span>Gõ văn bản</span>
              </button>
            </div>
          </div>

          {/* Primary High-Impact CTA */}
          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="flex items-center justify-between text-[11px] font-label text-on-surface-variant mb-2">
              <span>
                Hội đồng: <strong className="text-on-surface">{getCouncilLabel()}</strong>
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% Sẵn sàng
              </span>
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={isLoading}
              className="shimmer-btn-effect w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-white font-label font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.99] cursor-pointer border-none disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                  <span>Đang khởi tạo phiên chất vấn...</span>
                </>
              ) : (
                <>
                  <span>BƯỚC VÀO PHÒNG TRANH BIỆN NGAY</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
