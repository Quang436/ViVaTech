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
  }, [documents, selectedDoc, customTitle, customSummary]);

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
    if (selectedPersona === 'feynman') return 'GS. Lê Minh Triết (Cấp 1 • Feynman)';
    if (selectedPersona === 'strict_council') return 'GS. Viện sĩ Hoàng Vĩnh (Cấp 3 • Stress-Test)';
    return 'PGS. TS. Trần Thu Hà (Cấp 2 • Học thuật Chuẩn)';
  };

  return (
    <div className="pt-20 pb-16 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 relative z-10">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />

      {/* HERO TITLE & STATUS */}
      <div className="pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container-high/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-label text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>BƯỚC 1: THIẾT LẬP PHIÊN CHẤT VẤN</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-on-surface">
            Thiết Lập Hội Đồng Phản Biện
          </h1>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            Sẵn sàng bước vào phiên chất vấn bảo vệ luận án thực chiến trong 30 giây. Chọn cấp độ hội
            đồng và tùy chỉnh thời lượng phù hợp.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-error-container/80 border border-error/30 text-on-error-container flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-xl">error</span>
          <span className="font-body text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* PHẦN 1: TÓM TẮT ĐỀ ÁN SẴN SÀNG (STREAMLINED & CLEAN) */}
      <section className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-5 sm:p-6 shadow-xs hover-lift">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-primary-fixed/40 border border-primary/20 flex flex-col items-center justify-center text-primary shrink-0 shadow-xs">
              <span className="text-[10px] font-label font-extrabold tracking-tight">PDF</span>
              <span className="material-symbols-outlined text-lg leading-none">description</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-label font-bold text-on-surface truncate">
                  {selectedDoc?.filename || 'Chưa chọn tài liệu đề án'}
                </h2>
                {selectedDoc ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Đã sẵn sàng ({selectedDoc.total_chunks} phân đoạn RAG)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Chế độ tự nhập đề tài
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant font-body mt-0.5 line-clamp-1">
                {customTitle || selectedDoc?.summary || 'Tải lên PDF đồ án để Gemini đối soát chi tiết'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high text-xs font-label font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Tải lên tệp PDF khác"
            >
              <span className="material-symbols-outlined text-base">
                {isUploading ? 'progress_activity' : 'sync'}
              </span>
              <span>{isUploading ? 'Đang nạp...' : 'Thay tệp'}</span>
            </button>
          </div>
        </div>

        {/* Tên đề tài & tóm tắt có thể chỉnh sửa */}
        <div className="mt-4 pt-4 border-t border-surface-container-high/60 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Tên đề tài / Đồ án tốt nghiệp:
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Nhập tên đề tài bảo vệ..."
              className="w-full text-xs font-body px-3 py-2 rounded-xl border border-surface-container-high bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-on-surface"
            />
          </div>
          <div>
            <label className="block text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Trọng tâm nghiên cứu (Hội đồng sẽ xoáy sâu):
            </label>
            <input
              type="text"
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              placeholder="VD: Thuật toán Feature Fusion, giới hạn VRAM, cơ sở toán học..."
              className="w-full text-xs font-body px-3 py-2 rounded-xl border border-surface-container-high bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-on-surface"
            />
          </div>
        </div>
      </section>

      {/* PHẦN 2: LỰA CHỌN 3 CẤP ĐỘ HỘI ĐỒNG PHẢN BIỆN */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="font-label text-xs uppercase tracking-widest text-primary font-bold block mb-1">
              Hội Đồng Trí Tuệ Nhân Tạo
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-on-surface">
              Chọn Phong Cách &amp; Cấp Độ Giám Khảo
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-body">
            Nhấp chọn cấp độ phù hợp nhất với trạng thái ôn luyện của bạn
          </p>
        </div>

        {/* Grid 3 Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CẤP 1 - FEYNMAN */}
          <div
            onClick={() => onSelectPersona('feynman')}
            className={`cursor-pointer rounded-2xl p-6 backdrop-blur-sm hover-lift flex flex-col justify-between transition-all group relative select-none ${
              selectedPersona === 'feynman'
                ? 'bg-surface-container-lowest/90 border-2 border-primary ring-4 ring-primary/10 shadow-lg'
                : 'bg-surface-container-lowest/80 border border-surface-container-high/90 hover:border-primary/40'
            }`}
          >
            {selectedPersona === 'feynman' && (
              <div className="absolute top-4 right-4 text-primary">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs bg-primary-fixed text-on-primary-fixed-variant font-label font-bold tracking-wide">
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
                Trực quan hóa &amp; Bản chất cốt lõi
              </p>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                Kiểm tra khả năng tinh giản vấn đề phức tạp thành ngôn ngữ trực giác, bóc tách luận
                điểm rõ ràng, khúc chiết.
              </p>
              <div className="bg-surface-container-low/70 p-3 rounded-xl border border-surface-container-high/40 text-xs">
                <p className="font-headline text-on-surface italic text-xs leading-relaxed">
                  "Nếu giải thích đóng góp của mô hình cho người ngoài ngành trong 60 giây, bạn sẽ bắt
                  đầu từ đâu?"
                </p>
              </div>
            </div>
            <div className="pt-4 mt-5 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
              <span className="text-on-surface-variant font-medium">
                Cường độ: <strong className="text-on-surface font-semibold">Ôn hòa</strong>
              </span>
              <span className="text-primary font-semibold">Rèn tính khúc chiết</span>
            </div>
          </div>

          {/* CẤP 2 - HỌC THUẬT (MẶC ĐỊNH ACTIVE) */}
          <div
            onClick={() => onSelectPersona('academic_reviewer')}
            className={`cursor-pointer rounded-2xl p-6 backdrop-blur-sm hover-lift flex flex-col justify-between transition-all group relative select-none ${
              selectedPersona === 'academic_reviewer'
                ? 'bg-surface-container-lowest/90 border-2 border-primary ring-4 ring-primary/10 shadow-lg'
                : 'bg-surface-container-lowest/80 border border-surface-container-high/90 hover:border-primary/40'
            }`}
          >
            {selectedPersona === 'academic_reviewer' && (
              <div className="absolute top-4 right-4 text-primary">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs bg-secondary-fixed text-on-secondary-fixed-variant font-label font-bold tracking-wide">
                  Cấp 2 • Học thuật (Khuyên dùng)
                </span>
                <div className="w-9 h-9 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
              </div>
              <h3 className="font-headline text-2xl font-semibold text-on-surface mb-1">
                PGS. TS. Trần Thu Hà
              </h3>
              <p className="font-label text-xs text-secondary font-semibold mb-3">
                Chuẩn phương pháp &amp; Scopus/ISI
              </p>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                Đánh giá theo chuẩn mực học thuật, soi kỹ khoảng trống tri thức và tính hợp lệ của
                phương pháp thực nghiệm.
              </p>
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/15 text-xs">
                <p className="font-headline text-on-surface italic text-xs leading-relaxed">
                  "Phương pháp baseline của bạn đã bỏ sót công trình công bố gần nhất. Hãy chứng minh
                  giải pháp vẫn ưu việt?"
                </p>
              </div>
            </div>
            <div className="pt-4 mt-5 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
              <span className="text-on-surface-variant font-medium">
                Cường độ: <strong className="text-on-surface font-semibold">Chuyên sâu</strong>
              </span>
              <span className="text-secondary font-semibold">Chuẩn hóa phương pháp</span>
            </div>
          </div>

          {/* CẤP 3 - STRESS-TEST */}
          <div
            onClick={() => onSelectPersona('strict_council')}
            className={`cursor-pointer rounded-2xl p-6 backdrop-blur-sm hover-lift flex flex-col justify-between transition-all group relative select-none ${
              selectedPersona === 'strict_council'
                ? 'bg-surface-container-lowest/90 border-2 border-error ring-4 ring-error/10 shadow-lg'
                : 'bg-surface-container-lowest/80 border border-surface-container-high/90 hover:border-error/40'
            }`}
          >
            {selectedPersona === 'strict_council' && (
              <div className="absolute top-4 right-4 text-error">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs bg-error-container text-on-error-container font-label font-bold tracking-wide">
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
                Đối kháng &amp; Bắt bẻ logic góc biên
              </p>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                Truy vấn dồn dập vào trường hợp ngoại lệ (Edge Cases), thử thách bản lĩnh phản biện và
                lập luận logic áp lực cao.
              </p>
              <div className="bg-surface-container-low/70 p-3 rounded-xl border border-surface-container-high/40 text-xs">
                <p className="font-headline text-on-surface italic text-xs leading-relaxed">
                  "Kết luận Chương 3 có vẻ mâu thuẫn với Giả thuyết H2 ban đầu. Đề nghị tác giả giải
                  trình thỏa đáng!"
                </p>
              </div>
            </div>
            <div className="pt-4 mt-5 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label">
              <span className="text-on-surface-variant font-medium">
                Cường độ: <strong className="text-error font-semibold">Dồn dập</strong>
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
          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">timer</span>
              Thời lượng chất vấn:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-surface-container-low/80 rounded-xl border border-surface-container-high/50">
              {[
                { turns: 3, label: '3 lượt', time: '~9 phút' },
                { turns: 5, label: '5 lượt', time: '~15 phút' },
                { turns: 10, label: '10 lượt', time: '~30 phút' },
              ].map(({ turns, label, time }) => (
                <button
                  key={turns}
                  type="button"
                  onClick={() => setMaxTurns(turns)}
                  className={`py-2 px-2 rounded-lg font-label text-xs transition-all text-center cursor-pointer border-none ${
                    maxTurns === turns
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface font-semibold bg-transparent'
                  }`}
                >
                  {label}
                  <span className="block text-[10px] opacity-75 font-normal">{time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cấu hình phương thức tương tác */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">mic</span>
              Phương thức tương tác:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-container-low/80 rounded-xl border border-surface-container-high/50">
              <button
                type="button"
                onClick={() => setInteractionMode('voice')}
                className={`py-2 px-3 rounded-lg font-label text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  interactionMode === 'voice'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface font-semibold bg-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">mic</span>
                <span>Giọng nói</span>
              </button>

              <button
                type="button"
                onClick={() => setInteractionMode('text')}
                className={`py-2 px-3 rounded-lg font-label text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  interactionMode === 'text'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface font-semibold bg-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">keyboard</span>
                <span>Gõ văn bản</span>
              </button>
            </div>
          </div>

          {/* CTA Chính */}
          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="flex items-center justify-between text-xs font-label text-on-surface-variant mb-2">
              <span>
                Hội đồng:{' '}
                <strong className="text-on-surface font-semibold">{getCouncilLabel()}</strong>
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sẵn sàng
              </span>
            </div>
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="shimmer-btn-effect w-full py-3.5 px-6 rounded-xl bg-primary-container text-on-primary font-label text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer border-none disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span>Đang kết nối Hội đồng AI...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                  <span>Bắt Đầu Phiên Phản Biện</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
