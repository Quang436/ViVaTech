import React, { useState, useRef } from 'react';
import type { UploadedDocument } from '../types';

interface DocumentsViewProps {
  documents: UploadedDocument[];
  onStartSessionWithDoc: (doc: UploadedDocument) => void;
  onFileUpload: (file: File) => Promise<UploadedDocument>;
  onDeleteDocument: (docId: string) => Promise<void>;
}

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const formatRelativeDate = (iso?: string): string => {
  if (!iso) return 'Vừa nạp';
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onStartSessionWithDoc,
  onFileUpload,
  onDeleteDocument,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.total_chunks || 0), 0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await onFileUpload(file);
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Lỗi khi tải và trích xuất tài liệu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <main className="pt-24 min-h-screen relative z-10 flex flex-col pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        {/* PAGE HERO HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
          <div className="flex flex-col max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/90 border border-primary/25 shadow-xs text-primary mb-3 w-fit">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="font-label text-xs font-semibold tracking-wide">
                Cơ Sở Tri Thức Phản Biện • Ground Truth Verification
              </span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-on-surface leading-[1.18]">
              Quản Lý & Tải Tài Liệu{' '}
              <span className="italic font-headline text-primary underline decoration-primary-fixed decoration-4 underline-offset-6">
                Đề Án Học Thuật
              </span>
            </h1>
            <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
              Nạp luận văn, báo cáo nghiên cứu hoặc đề cương (.pdf, .docx, .txt) để Hội đồng AI bóc tách cấu trúc luận cứ thực tế trên Vector DB.
            </p>
          </div>

          {/* Quick Summary Stats Pill Group (Dữ liệu thật) */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-container-lowest/90 border border-surface-container-high/80 shadow-xs hover-lift">
              <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-label text-base font-bold text-on-surface">
                  {totalChunks} Phân đoạn
                </span>
                <span className="font-label text-[11px] text-on-surface-variant">
                  Đã đánh chỉ mục RAG
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-container-lowest/90 border border-surface-container-high/80 shadow-xs hover-lift">
              <div className="w-9 h-9 rounded-xl bg-secondary-fixed/50 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">folder_Special</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-label text-base font-bold text-on-surface">
                  {documents.length} Tài liệu
                </span>
                <span className="font-label text-[11px] text-on-surface-variant">
                  Lưu trữ trong Vector DB
                </span>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-container transition-all flex items-center gap-2 group active:scale-95 cursor-pointer border-none disabled:opacity-50"
              id="quickUploadTrigger"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
                add_circle
              </span>
              <span>{isUploading ? 'Đang nạp...' : 'Nạp tệp mới'}</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="p-4 rounded-xl bg-error-container/80 border border-error/30 text-on-error-container text-xs font-label flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{uploadError}</span>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-xs font-bold underline cursor-pointer bg-transparent border-none"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 2-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Minimal Ingestion Dropzone & Real Document Repositories (8 COLS) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Streamlined Academic Dropzone */}
            <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl border border-surface-container-highest/80 shadow-xs p-6 hover-lift relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  </div>
                  <h2 className="font-headline text-xl font-semibold text-on-surface">
                    Nạp Tài Liệu Nghiên Cứu Thật
                  </h2>
                </div>
                <span className="font-label text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                  Hỗ trợ PDF, DOCX, TXT (Tối đa 25MB)
                </span>
              </div>

              {/* Interactive Drag & Drop Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="dropzone-glow rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group relative"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-md text-primary flex items-center justify-center group-hover:scale-110 transition-transform mb-3.5 border border-primary/20">
                  <span
                    className={`material-symbols-outlined text-[32px] ${
                      isUploading ? 'animate-spin' : ''
                    }`}
                  >
                    {isUploading ? 'sync' : 'upload_file'}
                  </span>
                </div>
                <p className="font-headline text-lg sm:text-xl font-semibold text-on-surface">
                  {isUploading ? (
                    'Đang trích xuất văn bản thật & lập chỉ mục ChromaDB...'
                  ) : (
                    <>
                      Nhấp để chọn tệp báo cáo / luận án (.pdf, .docx, .txt){' '}
                      <span className="text-primary underline underline-offset-4 decoration-primary-fixed decoration-2 hover:text-primary-container">
                        từ máy tính của bạn
                      </span>
                    </>
                  )}
                </p>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-md">
                  Hệ thống sẽ trích xuất toàn văn thực tế, chia đoạn ngữ nghĩa (Semantic Chunking) và lưu vào ChromaDB để Hội đồng AI đối chiếu.
                </p>
              </div>
            </section>

            {/* 2. Real Document Cards Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-2xl font-semibold text-on-surface">
                    Tài Liệu Đã Nạp Vào Hệ Thống ({documents.length})
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Dữ liệu thật được lưu trữ trong Vector DB của dự án.
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="bg-surface-container-lowest/90 rounded-2xl border border-dashed border-surface-container-high p-10 text-center flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/60">
                    description
                  </span>
                  <h3 className="font-headline text-lg font-semibold text-on-surface">
                    Chưa có tài liệu nào được tải lên
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant max-w-md">
                    Hãy tải lên tệp PDF, DOCX hoặc TXT của đề tài để Hội đồng AI sử dụng làm căn cứ đối soát Ground Truth khi chất vấn.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {documents.map((doc) => (
                    <article
                      key={doc.document_id}
                      className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-5 hover-lift transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <span className="material-symbols-outlined text-[26px]">
                              picture_as_pdf
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-headline text-lg font-semibold text-on-surface truncate">
                                {doc.filename}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                                Đã lập chỉ mục RAG
                              </span>
                            </div>
                            <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2">
                              {doc.summary}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs font-label text-on-surface-variant flex-wrap">
                              <span>{doc.pages} trang</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size_bytes)}</span>
                              <span>•</span>
                              <span className="text-primary font-semibold">
                                {doc.total_chunks} Phân đoạn RAG
                              </span>
                              <span>•</span>
                              <span>{formatRelativeDate(doc.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => onDeleteDocument(doc.document_id)}
                            className="p-2 rounded-xl border border-surface-container-high text-on-surface-variant hover:text-error hover:border-error/40 transition-all cursor-pointer bg-surface-container-lowest"
                            title="Xóa tài liệu này"
                          >
                            <span className="material-symbols-outlined text-[18px] block">
                              delete
                            </span>
                          </button>
                          <button
                            onClick={() => onStartSessionWithDoc(doc)}
                            className="px-4 py-2 rounded-xl bg-primary text-white font-label text-xs font-bold hover:bg-primary-container transition-all cursor-pointer border-none"
                          >
                            Tập phản biện đề tài này
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Knowledge Graph & Ground Truth Verification Details (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-6 border border-primary/20 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Cơ chế Ground Truth Verification
                </h3>
              </div>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-4">
                Khi thí sinh trả lời câu hỏi, Hội đồng AI sẽ truy vấn trực tiếp các phân đoạn RAG từ tài liệu bạn đã tải lên để:
              </p>
              <ul className="space-y-2.5 text-xs font-body text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Đối soát số liệu thực tế trong báo cáo với câu trả lời miệng của thí sinh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Phát hiện mâu thuẫn giữa phương pháp đề xuất và kết quả thực nghiệm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Chấm điểm độ chính xác kiến thức (Ground Truth Accuracy) theo từng lượt.</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};
