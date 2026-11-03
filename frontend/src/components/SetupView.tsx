import React, { useState, useRef, useEffect } from 'react';
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

export const SetupView: React.FC<SetupViewProps> = ({
  selectedPersona,
  onSelectPersona,
  documents,
  onStartDebate,
  isLoading,
  onFileUpload,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(
    documents.length > 0 ? documents[0] : null
  );
  const [customTitle, setCustomTitle] = useState<string>(
    documents.length > 0
      ? documents[0].filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
      : ''
  );
  const [customSummary, setCustomSummary] = useState<string>(
    documents.length > 0 ? documents[0].summary : ''
  );
  const [maxTurns, setMaxTurns] = useState<number>(5);
  const [interactionMode, setInteractionMode] = useState<'voice' | 'text'>('voice');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedDoc && documents.length > 0) {
      const first = documents[0];
      setSelectedDoc(first);
      if (!customTitle.trim()) {
        setCustomTitle(first.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
      if (!customSummary.trim()) {
        setCustomSummary(first.summary);
      }
    }
  }, [documents]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const uploaded = await onFileUpload(file);
      setSelectedDoc(uploaded);
      setCustomTitle(uploaded.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      setCustomSummary(uploaded.summary);
    } catch (err: any) {
      console.error('Lỗi tải tệp:', err);
      setErrorMsg(err?.message || 'Không thể tải tệp lên hệ thống.');
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
    if (selectedPersona === 'feynman') return 'Cấp 1 • Feynman (GS. Lê Minh Triết)';
    if (selectedPersona === 'academic_reviewer')
      return 'Cấp 2 • Học thuật Chuẩn (PGS. TS. Trần Thu Hà)';
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
            Gemini AI Live CoT • Academic Examiner Engine
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-on-surface">
            Thiết Lập Hội Đồng Phản Biện
          </h1>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            Nhập đề tài hoặc chọn tài liệu thực tế đã tải lên, chọn cấp độ Hội đồng AI và bước vào phiên bảo vệ trực tiếp.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-start md:self-auto">
          <div className="px-4 py-2 rounded-xl bg-surface-container-lowest/90 border border-surface-container-high/90 shadow-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
            <div>
              <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant font-bold">
                Trạng thái RAG
              </div>
              <div className="text-xs font-bold text-on-surface">
                {selectedDoc
                  ? `Đã gắn: ${selectedDoc.total_chunks} phân đoạn`
                  : 'Nhập đề tài trực tiếp / Tải file'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-error-container/80 border border-error/30 text-on-error-container text-xs font-label flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs font-bold underline cursor-pointer bg-transparent border-none"
          >
            Đóng
          </button>
        </div>
      )}

      {/* PHẦN 1: THÔNG TIN ĐỀ TÀI & TÀI LIỆU THẬT */}
      <section className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-5 sm:p-6 shadow-xs hover-lift space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 border border-primary/20 flex flex-col items-center justify-center text-primary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-label font-bold text-on-surface">
                  {selectedDoc ? selectedDoc.filename : 'Thiết lập đề tài bảo vệ'}
                </h2>
                {selectedDoc && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {selectedDoc.pages} trang • {selectedDoc.total_chunks} phân đoạn RAG
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant font-body mt-0.5">
                {selectedDoc
                  ? 'Hội đồng AI sẽ đối chiếu trực tiếp với nội dung tài liệu này khi chất vấn.'
                  : 'Bạn có thể tải tệp báo cáo (.pdf, .docx, .txt) hoặc nhập tên & tóm tắt đề tài bên dưới.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-container text-xs font-label font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-xs"
            >
              <span className={`material-symbols-outlined text-base ${isUploading ? 'animate-spin' : ''}`}>
                {isUploading ? 'sync' : 'upload_file'}
              </span>
              <span>{isUploading ? 'Đang bóc tách RAG...' : 'Tải tệp đề án (.PDF / .DOCX / .TXT)'}</span>
            </button>
            {selectedDoc && (
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-xs font-label font-semibold border border-surface-container-high cursor-pointer"
              >
                Bỏ chọn tệp
              </button>
            )}
          </div>
        </div>

        {/* Inputs cho Tên đề tài & Tóm tắt đề tài thật */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          <div className="md:col-span-5 flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold text-on-surface">
              Tên đề tài / Khóa luận bảo vệ <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Nhập tên đề tài nghiên cứu hoặc đồ án của bạn..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-sm font-body text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="md:col-span-7 flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold text-on-surface">
              Tóm tắt nội dung / Luận điểm cốt lõi (Ground Truth Context)
            </label>
            <input
              type="text"
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              placeholder="Mô tả ngắn gọn phương pháp, công nghệ hoặc kết quả chính của đề tài (tự động điền khi tải file)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-sm font-body text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Danh sách các tài liệu thật đã nạp trước đó (nếu có) */}
        {documents.length > 0 && (
          <div className="pt-3 border-t border-surface-container-high/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider mr-1">
              Tài liệu đã tải lên ({documents.length}):
            </span>
            {documents.map((doc) => (
              <button
                key={doc.document_id}
                type="button"
                onClick={() => {
                  setSelectedDoc(doc);
                  setCustomTitle(doc.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                  setCustomSummary(doc.summary);
                }}
                className={`text-xs px-3 py-1 rounded-lg border font-label transition-all cursor-pointer ${
                  selectedDoc?.document_id === doc.document_id
                    ? 'bg-primary-fixed/40 border-primary text-primary font-bold'
                    : 'bg-surface-container-lowest border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {doc.filename} ({doc.total_chunks} đoạn)
              </button>
            ))}
          </div>
        )}
      </section>

      {/* PHẦN 2: LỰA CHỌN 3 CẤP ĐỘ HỘI ĐỒNG PHẢN BIỆN */}
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
            </div>
            <div className="pt-4 mt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
              <span className="text-on-surface-variant">
                Cường độ: <strong className="text-on-surface">Ôn hòa</strong>
              </span>
              <span className="text-primary font-semibold">Rèn tính khúc chiết</span>
            </div>
          </div>

          {/* CẤP 2 - HỌC THUẬT CHUẨN MỰC */}
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
            </div>
            <div className="pt-4 mt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
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
            </div>
            <div className="pt-4 mt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
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
          {/* Cấu hình số lượt */}
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Gemini AI Live
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
                  <span>Gemini AI đang sinh câu hỏi...</span>
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
