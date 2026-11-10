import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  GraduationCap,
  Keyboard,
  Lightbulb,
  Loader2,
  Mic,
  RefreshCw,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { CouncilPersona, UploadedDocument } from '../types';

interface SetupViewProps {
  selectedPersona: CouncilPersona;
  onSelectPersona: (persona: CouncilPersona) => void;
  documents: UploadedDocument[];
  onStartDebate: (params: {
    title: string;
    topic_summary?: string;
    document_id?: string;
    document_name?: string;
    max_turns: number;
    mode: 'voice' | 'text';
  }) => void;
  isLoading: boolean;
  onFileUpload: (file: File) => Promise<UploadedDocument>;
}

const PERSONA_CARDS: Array<{
  id: CouncilPersona;
  badge: string;
  tagVariant: 'mint' | 'sky' | 'red';
  Icon: LucideIcon;
  name: string;
  subtitle: string;
  subtitleCls: string;
  desc: string;
  quote: string;
  quoteBoxCls: string;
  intensityLabel: string;
  intensityCls: string;
  benefit: string;
  benefitCls: string;
  activeBorderCls: string;
  checkCls: string;
  iconWrapCls: string;
}> = [
  {
    id: 'feynman',
    badge: 'Cấp 1 · Feynman',
    tagVariant: 'mint',
    Icon: Lightbulb,
    name: 'GS. Lê Minh Triết',
    subtitle: 'Trực quan hóa & Bản chất cốt lõi',
    subtitleCls: 'text-[#0b6e5e]',
    desc: 'Kiểm tra khả năng tinh giản vấn đề phức tạp thành ngôn ngữ trực giác, bóc tách luận điểm rõ ràng, khúc chiết.',
    quote:
      '“Nếu giải thích đóng góp của mô hình cho người ngoài ngành trong 60 giây, bạn sẽ bắt đầu từ đâu?”',
    quoteBoxCls: 'bg-[#f7faf9] border-[rgba(10,20,19,0.08)]',
    intensityLabel: 'Ôn hòa',
    intensityCls: 'text-[#0a1413]',
    benefit: 'Rèn tính khúc chiết',
    benefitCls: 'text-[#0b6e5e]',
    activeBorderCls: 'border-[#0b6e5e] ring-4 ring-[rgba(110,231,200,0.34)] shadow-[0_14px_34px_-14px_rgba(11,110,94,0.2)]',
    checkCls: 'text-[#0b6e5e]',
    iconWrapCls: 'bg-[rgba(110,231,200,0.22)] text-[#085448] border border-[rgba(11,110,94,0.2)]',
  },
  {
    id: 'academic_reviewer',
    badge: 'Cấp 2 · Học thuật (Khuyên dùng)',
    tagVariant: 'sky',
    Icon: GraduationCap,
    name: 'PGS. TS. Trần Thu Hà',
    subtitle: 'Chuẩn phương pháp & Scopus/ISI',
    subtitleCls: 'text-[#0369a1]',
    desc: 'Đánh giá theo chuẩn mực học thuật, soi kỹ khoảng trống tri thức và tính hợp lệ của phương pháp thực nghiệm.',
    quote:
      '“Phương pháp baseline của bạn đã bỏ sót công trình công bố gần nhất. Hãy chứng minh giải pháp vẫn ưu việt?”',
    quoteBoxCls: 'bg-[#eff5f3] border-[rgba(11,110,94,0.16)]',
    intensityLabel: 'Chuyên sâu',
    intensityCls: 'text-[#0a1413]',
    benefit: 'Chuẩn hóa phương pháp',
    benefitCls: 'text-[#0369a1]',
    activeBorderCls: 'border-[#0b6e5e] ring-4 ring-[rgba(110,231,200,0.34)] shadow-[0_14px_34px_-14px_rgba(11,110,94,0.2)]',
    checkCls: 'text-[#0b6e5e]',
    iconWrapCls: 'bg-[#e0f2fe] text-[#0369a1] border border-[rgba(3,105,161,0.2)]',
  },
  {
    id: 'strict_council',
    badge: 'Cấp 3 · Stress-Test',
    tagVariant: 'red',
    Icon: Zap,
    name: 'GS. Viện sĩ Hoàng Vĩnh',
    subtitle: 'Đối kháng & Bắt bẻ logic góc biên',
    subtitleCls: 'text-[#be123c]',
    desc: 'Truy vấn dồn dập vào trường hợp ngoại lệ (Edge Cases), thử thách bản lĩnh phản biện và lập luận logic áp lực cao.',
    quote:
      '“Kết luận Chương 3 có vẻ mâu thuẫn với Giả thuyết H2 ban đầu. Đề nghị tác giả giải trình thỏa đáng!”',
    quoteBoxCls: 'bg-[#f7faf9] border-[rgba(190,18,60,0.12)]',
    intensityLabel: 'Dồn dập',
    intensityCls: 'text-[#be123c]',
    benefit: 'Vững vàng tâm lý',
    benefitCls: 'text-[#be123c]',
    activeBorderCls: 'border-[#be123c] ring-4 ring-[rgba(190,18,60,0.12)] shadow-[0_14px_34px_-14px_rgba(190,18,60,0.16)]',
    checkCls: 'text-[#be123c]',
    iconWrapCls: 'bg-[#ffe4e6] text-[#be123c] border border-[rgba(190,18,60,0.2)]',
  },
];

export const SetupView: React.FC<SetupViewProps> = ({
  selectedPersona,
  onSelectPersona,
  documents,
  onStartDebate,
  isLoading,
  onFileUpload,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    () => documents[0]?.document_id ?? null
  );
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [summaryOverride, setSummaryOverride] = useState<string | null>(null);
  const [maxTurns, setMaxTurns] = useState<number>(5);
  const [interactionMode, setInteractionMode] = useState<'voice' | 'text'>('voice');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDoc =
    documents.find((d) => d.document_id === selectedDocId) ?? documents[0] ?? null;

  const customTitle =
    titleOverride ??
    (selectedDoc ? selectedDoc.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') : '');

  const customSummary = summaryOverride ?? (selectedDoc ? selectedDoc.summary : '');

  const handleSelectDocumentById = (docId: string) => {
    setSelectedDocId(docId);
    setTitleOverride(null);
    setSummaryOverride(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const uploaded = await onFileUpload(file);
      setSelectedDocId(uploaded.document_id);
      setTitleOverride(null);
      setSummaryOverride(null);
    } catch (err: unknown) {
      console.error('Lỗi tải tệp:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Không thể tải tệp lên hệ thống.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStart = () => {
    const finalTitle =
      customTitle.trim() ||
      (selectedDoc ? selectedDoc.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') : '');

    if (!finalTitle) {
      setErrorMsg('Vui lòng tải lên tài liệu đề án hoặc nhập tên đề tài cần bảo vệ.');
      return;
    }

    setErrorMsg(null);
    onStartDebate({
      title: finalTitle,
      topic_summary: customSummary.trim() || selectedDoc?.summary || undefined,
      document_id: selectedDoc?.document_id,
      document_name: selectedDoc?.filename,
      max_turns: maxTurns,
      mode: interactionMode,
    });
  };

  const getCouncilLabel = () => {
    if (selectedPersona === 'feynman') return 'Cấp 1 · Feynman (GS. Triết)';
    if (selectedPersona === 'strict_council') return 'Cấp 3 · Stress-Test (GS. Vĩnh)';
    return 'Cấp 2 · Học thuật Chuẩn (PGS. Hà)';
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-8 sm:pt-12 pb-20 flex-1 relative z-10 outline-none"
    >
      <div className="mint-wrap flex flex-col gap-8">
        <input
          id="setup-file-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          className="visually-hidden"
          aria-label="Chọn tệp đề án PDF, DOCX hoặc TXT"
        />

        {/* HERO TITLE & STATUS */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[rgba(10,20,19,0.08)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[rgba(11,110,94,0.22)] text-[#085448] mb-3.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#6ee7c8] border border-[#0b6e5e]" aria-hidden="true" />
              <span className="mint-eyebrow">Council Session Configuration</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-[-0.032em] leading-[1.08] text-[#0a1413]">
              Thiết lập{' '}
              <span className="mint-serif">Hội đồng phản biện</span> AI.
            </h1>
            <p className="font-sans text-sm sm:text-[15px] text-[#465754] mt-2.5 max-w-2xl leading-relaxed">
              Sẵn sàng bước vào phiên chất vấn bảo vệ luận án thực chiến trong 30 giây. Chọn cấp độ hội đồng và tùy chỉnh thời lượng phù hợp.
            </p>
          </div>
        </section>

        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-[#ffe4e6] border border-[#be123c]/25 text-[#881337] flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#be123c] shrink-0" strokeWidth={2} aria-hidden="true" />
            <span className="font-sans text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        {/* PHẦN 1: TÓM TẮT ĐỀ ÁN SẴN SÀNG */}
        <section className="mint-card mint-card-hover p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[rgba(110,231,200,0.22)] border border-[rgba(11,110,94,0.24)] flex flex-col items-center justify-center text-[#085448] shrink-0">
                <span className="text-[9px] font-mono font-bold leading-none mb-0.5">
                  {selectedDoc
                    ? selectedDoc.filename.split('.').pop()?.toUpperCase() || 'DOC'
                    : 'DOC'}
                </span>
                <FileText className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-sans font-semibold text-[#0a1413] truncate">
                    {selectedDoc?.filename || 'Chưa chọn tài liệu đề án'}
                  </h2>
                  {selectedDoc ? (
                    <span className="mint-tag mint whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e]" aria-hidden="true" />
                      Đã sẵn sàng ({selectedDoc.total_chunks} phân đoạn)
                    </span>
                  ) : (
                    <span className="mint-tag amber whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" aria-hidden="true" />
                      Chế độ tự nhập đề tài
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#465754] font-sans mt-1 line-clamp-1">
                  {customTitle || selectedDoc?.summary || 'Tải lên tệp đề án để Gemini đối soát chi tiết'}
                  {selectedDoc ? ` · ${selectedDoc.pages} trang` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto flex-wrap">
              {documents.length > 1 && (
                <div>
                  <label htmlFor="setup-doc-select" className="visually-hidden">
                    Chọn tài liệu đã tải lên
                  </label>
                  <select
                    id="setup-doc-select"
                    value={selectedDoc?.document_id || ''}
                    onChange={(e) => handleSelectDocumentById(e.target.value)}
                    className="text-xs font-sans font-medium px-3.5 py-2 rounded-full border border-[rgba(10,20,19,0.14)] bg-[#eff5f3] text-[#0a1413] focus:border-[#0b6e5e] max-w-[210px]"
                  >
                    {documents.map((d) => (
                      <option key={d.document_id} value={d.document_id}>
                        {d.filename}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-mint-ghost h-9 px-4 text-xs cursor-pointer"
                title="Tải lên tệp đề án mới"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                )}
                <span>{isUploading ? 'Đang nạp...' : 'Thay tệp'}</span>
              </button>
            </div>
          </div>

          {/* Tên đề tài & tóm tắt có thể chỉnh sửa */}
          <div className="mt-4 pt-4 border-t border-[rgba(10,20,19,0.08)] grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="input-focus-glow rounded-xl">
              <label
                htmlFor="setup-topic-title"
                className="block font-mono text-[10px] font-medium uppercase tracking-[0.07em] text-[#556361] mb-1.5"
              >
                Tên đề tài / Đồ án tốt nghiệp
              </label>
              <input
                id="setup-topic-title"
                type="text"
                value={customTitle}
                onChange={(e) => setTitleOverride(e.target.value)}
                placeholder="Nhập tên đề tài bảo vệ..."
                className="w-full h-10 text-xs sm:text-sm font-sans px-3.5 rounded-xl border border-[rgba(10,20,19,0.14)] bg-[#f7faf9] focus:bg-white focus:border-[#0b6e5e] text-[#0a1413] transition-colors"
              />
            </div>
            <div className="input-focus-glow rounded-xl">
              <label
                htmlFor="setup-topic-summary"
                className="block font-mono text-[10px] font-medium uppercase tracking-[0.07em] text-[#556361] mb-1.5"
              >
                Trọng tâm nghiên cứu (Hội đồng sẽ xoáy sâu)
              </label>
              <input
                id="setup-topic-summary"
                type="text"
                value={customSummary}
                onChange={(e) => setSummaryOverride(e.target.value)}
                placeholder="VD: Thuật toán Feature Fusion, giới hạn VRAM, cơ sở toán học..."
                className="w-full h-10 text-xs sm:text-sm font-sans px-3.5 rounded-xl border border-[rgba(10,20,19,0.14)] bg-[#f7faf9] focus:bg-white focus:border-[#0b6e5e] text-[#0a1413] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* PHẦN 2: LỰA CHỌN 3 CẤP ĐỘ HỘI ĐỒNG PHẢN BIỆN */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="mint-eyebrow block mb-1">
                Hội Đồng Trí Tuệ Nhân Tạo · 03 Cấp Độ
              </span>
              <h2 className="mint-h2 text-2xl sm:text-3xl">
                Chọn phong cách &amp;{' '}
                <span className="mint-serif">giám khảo</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#465754] font-sans">
              Nhấp chọn cấp độ phù hợp nhất với trạng thái ôn luyện của bạn
            </p>
          </div>

          {/* Grid 3 Accessible Native Button Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            role="group"
            aria-label="Chọn cấp độ hội đồng phản biện"
          >
            {PERSONA_CARDS.map((card) => {
              const isActive = selectedPersona === card.id;
              const CardIcon = card.Icon;
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelectPersona(card.id)}
                  className={`text-left cursor-pointer mint-card mint-card-hover p-6 flex flex-col justify-between transition-all group relative ${
                    isActive ? `border-2 ${card.activeBorderCls}` : ''
                  }`}
                >
                  {isActive && (
                    <div className={`absolute top-5 right-5 ${card.checkCls}`} aria-hidden="true">
                      <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                  )}
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-2 mb-4 pr-7">
                      <span className={`mint-tag ${card.tagVariant}`}>
                        {card.badge}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconWrapCls}`}
                      >
                        <CardIcon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="font-sans text-xl font-semibold text-[#0a1413] mb-1">
                      {card.name}
                    </h3>
                    <p className={`font-sans text-xs font-semibold mb-3 ${card.subtitleCls}`}>
                      {card.subtitle}
                    </p>
                    <p className="font-sans text-xs sm:text-sm text-[#465754] leading-relaxed mb-4">
                      {card.desc}
                    </p>
                    <div className={`p-3.5 rounded-xl border text-xs ${card.quoteBoxCls}`}>
                      <p className="font-serif text-[#0a1413] italic text-sm leading-relaxed">
                        {card.quote}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-5 border-t border-[rgba(10,20,19,0.08)] flex items-center justify-between text-xs font-sans w-full">
                    <span className="text-[#465754] font-medium">
                      Cường độ:{' '}
                      <strong className={`font-semibold ${card.intensityCls}`}>
                        {card.intensityLabel}
                      </strong>
                    </span>
                    <span className={`font-semibold ${card.benefitCls}`}>{card.benefit}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* PHẦN 3: CẤU HÌNH NHANH & CTA CHÍNH */}
        <section className="mint-card p-5 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Cấu hình số lượt */}
            <fieldset className="lg:col-span-4 flex flex-col gap-2 border-none p-0 m-0">
              <legend className="font-mono text-[11px] uppercase tracking-[0.07em] text-[#556361] font-medium flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                Thời lượng chất vấn
              </legend>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#eff5f3] rounded-2xl border border-[rgba(10,20,19,0.08)]">
                {[
                  { turns: 3, label: '3 lượt', time: '~9 phút' },
                  { turns: 5, label: '5 lượt', time: '~15 phút' },
                  { turns: 10, label: '10 lượt', time: '~30 phút' },
                ].map(({ turns, label, time }) => (
                  <button
                    key={turns}
                    type="button"
                    aria-pressed={maxTurns === turns}
                    onClick={() => setMaxTurns(turns)}
                    className={`py-2 px-2 rounded-xl font-sans text-xs transition-all text-center cursor-pointer border-none ${
                      maxTurns === turns
                        ? 'bg-[#0a1413] text-white font-semibold shadow-xs'
                        : 'text-[#465754] hover:text-[#0a1413] font-medium bg-transparent'
                    }`}
                  >
                    {label}
                    <span className="block text-[10px] opacity-75 font-mono font-normal">{time}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Cấu hình phương thức tương tác */}
            <fieldset className="lg:col-span-4 flex flex-col gap-2 border-none p-0 m-0">
              <legend className="font-mono text-[11px] uppercase tracking-[0.07em] text-[#556361] font-medium flex items-center gap-1.5 mb-1.5">
                <Mic className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                Phương thức tương tác
              </legend>
              <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#eff5f3] rounded-2xl border border-[rgba(10,20,19,0.08)]">
                <button
                  type="button"
                  aria-pressed={interactionMode === 'voice'}
                  onClick={() => setInteractionMode('voice')}
                  className={`py-2.5 px-3 rounded-xl font-sans text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                    interactionMode === 'voice'
                      ? 'bg-[#0a1413] text-white font-semibold shadow-xs'
                      : 'text-[#465754] hover:text-[#0a1413] font-medium bg-transparent'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                  <span>Giọng nói</span>
                </button>

                <button
                  type="button"
                  aria-pressed={interactionMode === 'text'}
                  onClick={() => setInteractionMode('text')}
                  className={`py-2.5 px-3 rounded-xl font-sans text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                    interactionMode === 'text'
                      ? 'bg-[#0a1413] text-white font-semibold shadow-xs'
                      : 'text-[#465754] hover:text-[#0a1413] font-medium bg-transparent'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                  <span>Gõ văn bản</span>
                </button>
              </div>
            </fieldset>

            {/* CTA Chính */}
            <div className="lg:col-span-4 flex flex-col justify-end">
              <div className="flex items-center justify-between text-xs font-sans text-[#465754] mb-2 gap-2">
                <span className="truncate">
                  Hội đồng:{' '}
                  <strong className="text-[#0a1413] font-semibold">{getCouncilLabel()}</strong>
                </span>
                <span className="text-[#0b6e5e] font-mono text-[11px] font-medium inline-flex items-center gap-1.5 shrink-0">
                  <span
                    className="w-2 h-2 rounded-full bg-[#6ee7c8] border border-[#0b6e5e]"
                    aria-hidden="true"
                  />
                  Sẵn sàng
                </span>
              </div>
              <button
                type="button"
                onClick={handleStart}
                disabled={isLoading}
                className="btn-mint-primary w-full py-3.5 px-6 text-sm sm:text-[15px] group cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                    <span>Đang kết nối Hội đồng AI...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4 text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                    <span>Bắt Đầu Phiên Phản Biện</span>
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
