import React, { useState, useRef } from 'react';

interface DocumentsViewProps {
  onStartSessionWithDoc: (docName: string) => void;
  onFileUpload: (file: File) => Promise<{ document_id: string; filename: string; summary: string }>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  onStartSessionWithDoc,
  onFileUpload,
}) => {
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      title: 'Do_An_Tot_Nghiep_AI_Khang_2025.pdf',
      topic: 'Ứng dụng Heterogeneous GNN kết hợp ViBERT trong phân tích văn bản học thuật',
      pages: 148,
      size: '12.4 MB',
      chunks: 18,
      confidence: '99.4%',
      status: 'active',
      date: 'Hôm nay (16:30)',
    },
    {
      id: 'doc-2',
      title: 'Kien_Truc_Microservices_Fintech_Report.docx',
      topic: 'Kiến trúc Vi dịch vụ Chịu lỗi Cao cho Hệ thống Giao dịch Fintech',
      pages: 96,
      size: '4.8 MB',
      chunks: 15,
      confidence: '98.7%',
      status: 'ready',
      date: '3 ngày trước',
    },
    {
      id: 'doc-3',
      title: 'EdTech_Generative_AI_Personalized_Learning.pdf',
      topic: 'Nền tảng EdTech Cá nhân hóa Lộ trình Học tập Dựa trên Generative AI & RAG',
      pages: 112,
      size: '8.2 MB',
      chunks: 24,
      confidence: '99.1%',
      status: 'ready',
      date: 'Tuần trước',
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await onFileUpload(file);
      const newDoc = {
        id: 'doc-' + Date.now(),
        title: file.name,
        topic: res.summary.slice(0, 80) + '...',
        pages: 50,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        chunks: 12,
        confidence: '99.0%',
        status: 'ready',
        date: 'Vừa xong',
      };
      setDocuments([newDoc, ...documents]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
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
              Nạp luận văn, báo cáo nghiên cứu hoặc slide thuyết trình để Hội đồng AI bóc tách cấu trúc luận cứ và thiết lập ma trận đối soát chuẩn xác trước giờ G.
            </p>
          </div>

          {/* Quick Summary Stats Pill Group */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-container-lowest/90 border border-surface-container-high/80 shadow-xs hover-lift">
              <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-label text-base font-bold text-on-surface">38 Phân đoạn</span>
                <span className="font-label text-[11px] text-on-surface-variant">Đã đánh chỉ mục</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-container-lowest/90 border border-surface-container-high/80 shadow-xs hover-lift">
              <div className="w-9 h-9 rounded-xl bg-secondary-fixed/50 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-label text-base font-bold text-on-surface">99.4% Độ tin cậy</span>
                <span className="font-label text-[11px] text-on-surface-variant">Ground Truth sẵn sàng</span>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-container transition-all flex items-center gap-2 group active:scale-95 cursor-pointer border-none"
              id="quickUploadTrigger"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
                add_circle
              </span>
              <span>Nạp tệp mới</span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Minimal Ingestion Dropzone & Clean Document Repositories (8 COLS) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Streamlined Academic Dropzone */}
            <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl border border-surface-container-highest/80 shadow-xs p-6 hover-lift relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  </div>
                  <h2 className="font-headline text-xl font-semibold text-on-surface">Nạp Tài Liệu Nghiên Cứu</h2>
                </div>
                <span className="font-label text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                  Hỗ trợ PDF, DOCX (Tối đa 50MB)
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
                  <span className={`material-symbols-outlined text-[32px] ${isUploading ? 'animate-spin' : ''}`}>
                    {isUploading ? 'sync' : 'upload_file'}
                  </span>
                </div>
                <p className="font-headline text-lg sm:text-xl font-semibold text-on-surface">
                  {isUploading ? (
                    'Đang trích xuất văn bản & lập chỉ mục Vector DB...'
                  ) : (
                    <>
                      Kéo & thả tệp luận án vào đây, hoặc{' '}
                      <span className="text-primary underline underline-offset-4 decoration-primary-fixed decoration-2 hover:text-primary-container">
                        Chọn tệp từ máy tính
                      </span>
                    </>
                  )}
                </p>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-md">
                  AI sẽ tự động chia đoạn ngữ nghĩa (Semantic Chunking) và trích xuất luận điểm khoa học phục vụ phản biện.
                </p>
                {/* Compact Tag Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  <span className="px-3 py-1 rounded-full bg-surface-container-lowest border border-surface-container-high text-xs font-label text-on-surface-variant flex items-center gap-1.5 shadow-2xs">
                    <span className="material-symbols-outlined text-primary text-[15px]">psychology</span> Bóc tách ngữ nghĩa
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-container-lowest border border-surface-container-high text-xs font-label text-on-surface-variant flex items-center gap-1.5 shadow-2xs">
                    <span className="material-symbols-outlined text-secondary text-[15px]">account_tree</span> Sơ đồ luận cứ
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-container-lowest border border-surface-container-high text-xs font-label text-on-surface-variant flex items-center gap-1.5 shadow-2xs">
                    <span className="material-symbols-outlined text-primary-container text-[15px]">verified_user</span> Bảo mật 100%
                  </span>
                </div>
              </div>
            </section>

            {/* 2. Document Cards Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-2xl font-semibold text-on-surface">
                    Tài Liệu Đã Nạp Vào Hệ Thống ({documents.length})
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Các tài liệu được liên kết làm căn cứ hỏi-đáp cho Hội đồng AI.
                  </p>
                </div>
              </div>

              {/* Document List */}
              <div className="flex flex-col gap-3.5">
                {documents.map((doc) => (
                  <article
                    key={doc.id}
                    className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-5 hover-lift transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <span className="material-symbols-outlined text-[26px]">picture_as_pdf</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-headline text-lg font-semibold text-on-surface truncate">
                              {doc.title}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                              {doc.confidence} Sẵn sàng
                            </span>
                          </div>
                          <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-1">
                            {doc.topic}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-label text-on-surface-variant">
                            <span>{doc.pages} trang</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span className="text-primary font-semibold">{doc.chunks} Phân đoạn RAG</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onStartSessionWithDoc(doc.title)}
                          className="px-4 py-2 rounded-xl bg-primary text-white font-label text-xs font-bold hover:bg-primary-container transition-all cursor-pointer border-none"
                        >
                          Tập phản biện đề tài này
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Knowledge Graph & Ground Truth Verification Details (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-6 border border-primary/20 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
                <h3 className="font-headline text-lg font-bold text-on-surface">Cơ chế Ground Truth Verification</h3>
              </div>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-4">
                Khi sinh viên trả lời câu hỏi, Hội đồng AI sẽ ngay lập tức đối soát phát biểu với nội dung tài liệu gốc để:
              </p>
              <ul className="space-y-2.5 text-xs font-body text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Phát hiện số liệu bịa đặt hoặc phỏng đoán không có trong báo cáo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Nhận diện sự mâu thuẫn giữa phương pháp đề xuất và kết quả thực nghiệm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Đo lường mức độ bao phủ tri thức khoa học theo chuẩn rubric quốc tế.</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};
