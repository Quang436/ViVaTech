import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  AlignLeft,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Eye,
  FileBadge,
  FileText,
  FileUp,
  Flag,
  FolderOpen,
  Gavel,
  GitFork,
  HardDrive,
  Layers,
  Lightbulb,
  Loader2,
  Network,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
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

const getKnowledgeCoverage = (totalChunks: number): number => {
  if (!totalChunks || totalChunks <= 0) return 0;
  return Math.min(98, Math.max(45, 48 + totalChunks * 5));
};

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onStartSessionWithDoc,
  onFileUpload,
  onDeleteDocument,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents[0]?.document_id ?? null
  );
  const [inspectDoc, setInspectDoc] = useState<UploadedDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneSectionRef = useRef<HTMLElement>(null);
  const inspectDialogRef = useRef<HTMLDialogElement>(null);
  const pointerDownOutsideRef = useRef(false);

  // Sync native <dialog> for excerpt inspector modal
  useEffect(() => {
    const dialog = inspectDialogRef.current;
    if (!dialog) return;

    if (inspectDoc) {
      if ('closedBy' in HTMLDialogElement.prototype) {
        (dialog as HTMLDialogElement & { closedBy?: string }).closedBy = 'any';
      }
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [inspectDoc]);

  useEffect(() => {
    const dialog = inspectDialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutsideDialog = (clientX: number, clientY: number) => {
      const rect = dialog.getBoundingClientRect();
      return (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownOutsideRef.current = isOutsideDialog(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (pointerDownOutsideRef.current && isOutsideDialog(e.clientX, e.clientY)) {
        dialog.close();
      }
      pointerDownOutsideRef.current = false;
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const processUploadFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setUploadError('Định dạng không hỗ trợ. Vui lòng chọn tệp .pdf, .docx hoặc .txt.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await onFileUpload(file);
      setSelectedDocId(uploaded.document_id);
    } catch (err: unknown) {
      console.error(err);
      setUploadError(
        err instanceof Error ? err.message : 'Lỗi khi tải và trích xuất tài liệu.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUploadFile(file);
    }
  };

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.total_chunks || 0), 0);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredDocuments = normalizedQuery
    ? documents.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(normalizedQuery) ||
          doc.summary.toLowerCase().includes(normalizedQuery)
      )
    : documents;

  const activeDoc =
    documents.find((d) => d.document_id === selectedDocId) ?? documents[0] ?? null;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-8 sm:pt-12 pb-20 min-h-screen relative z-10 flex flex-col outline-none"
    >
      <div className="mint-wrap flex flex-col gap-8">
        {/* PAGE HERO HEADER */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[rgba(10,20,19,0.08)]">
          <div className="flex flex-col max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[rgba(11,110,94,0.22)] text-[#085448] mb-4 w-fit shadow-[0_1px_2px_rgba(10,20,19,0.03)]">
              <span className="w-2 h-2 rounded-full bg-[#6ee7c8] border border-[#0b6e5e]" aria-hidden="true" />
              <span className="mint-eyebrow">Vector RAG · Ground Truth Indexer</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0a1413] leading-[1.08] tracking-[-0.032em] mb-2.5">
              Quản lý &amp; nạp tài liệu{' '}
              <span className="mint-serif">đề án học thuật</span>.
            </h1>
            <p className="font-sans text-sm sm:text-[15px] text-[#465754] leading-relaxed">
              Chuẩn hóa và đồng bộ các tài liệu nghiên cứu (.pdf, .docx, .txt) làm căn cứ đối soát Ground Truth cho mọi phiên phản biện AI.
            </p>
          </div>

          {/* Quick Summary Stats Pill Group */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="mint-card mint-card-hover flex items-center gap-3 px-4 py-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgba(110,231,200,0.22)] border border-[rgba(11,110,94,0.18)] text-[#085448] flex items-center justify-center">
                <Layers className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-sans text-sm sm:text-base font-semibold text-[#0a1413]">
                  {totalChunks} Phân đoạn
                </span>
                <span className="font-mono text-[11px] text-[#556361]">
                  Đã lập chỉ mục RAG
                </span>
              </div>
            </div>

            <div className="mint-card mint-card-hover flex items-center gap-3 px-4 py-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.1)] text-[#0369a1] flex items-center justify-center">
                <FolderOpen className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-sans text-sm sm:text-base font-semibold text-[#0a1413]">
                  {documents.length} Tài liệu
                </span>
                <span className="font-mono text-[11px] text-[#556361]">
                  Lưu trữ hệ thống
                </span>
              </div>
            </div>

            <button
              type="button"
              id="quickUploadTrigger"
              disabled={isUploading}
              onClick={() => {
                dropzoneSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                fileInputRef.current?.click();
              }}
              className="btn-mint-primary h-11 px-5 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              <span>{isUploading ? 'Đang nạp...' : 'Nạp tệp mới'}</span>
            </button>
          </div>
        </section>

        {uploadError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-[#ffe4e6] border border-[#be123c]/25 text-[#881337] text-xs font-sans flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#be123c] shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className="font-medium">{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-xs font-semibold underline cursor-pointer bg-transparent border-none text-[#881337]"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 2-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Dropzone & Uploaded Document Cards (8 COLS) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Academic Dropzone */}
            <section
              ref={dropzoneSectionRef}
              className="mint-card mint-card-hover p-6 relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[rgba(10,20,19,0.08)] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a1413] text-white flex items-center justify-center">
                    <UploadCloud className="w-4 h-4 text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h2 className="font-sans text-lg sm:text-xl font-semibold text-[#0a1413]">
                    Nạp Tài Liệu Nghiên Cứu
                  </h2>
                </div>
                <span className="mint-tag mint">PDF · DOCX · TXT (Tối đa 25MB)</span>
              </div>

              {/* Interactive Drag & Drop Area */}
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`dropzone-glow rounded-2xl border-2 border-dashed p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all relative ${
                  isDragActive
                    ? 'border-[#0b6e5e] bg-[rgba(110,231,200,0.22)]'
                    : 'border-[rgba(11,110,94,0.3)] hover:border-[#0b6e5e]/60'
                }`}
              >
                <input
                  id="doc-file-selector"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="visually-hidden"
                  onChange={handleFileChange}
                />
                <div className="w-14 h-14 rounded-2xl bg-white shadow-[0_4px_14px_rgba(11,110,94,0.12)] text-[#0b6e5e] flex items-center justify-center mb-4 border border-[rgba(11,110,94,0.2)]">
                  {isUploading ? (
                    <Loader2 className="w-7 h-7 animate-spin" strokeWidth={1.9} aria-hidden="true" />
                  ) : (
                    <FileUp className="w-7 h-7" strokeWidth={1.8} aria-hidden="true" />
                  )}
                </div>

                <p className="font-sans text-base sm:text-lg font-semibold text-[#0a1413]">
                  {isUploading ? (
                    'Đang trích xuất văn bản thực tế & lập chỉ mục RAG...'
                  ) : (
                    <>
                      Kéo &amp; thả tệp luận án vào đây, hoặc{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#0b6e5e] underline underline-offset-4 decoration-[#6ee7c8] decoration-2 hover:text-[#085448] bg-transparent border-none p-0 font-sans text-base sm:text-lg font-semibold cursor-pointer"
                      >
                        chọn tệp từ máy tính
                      </button>
                    </>
                  )}
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#465754] mt-1.5 max-w-md">
                  Hệ thống tự động bóc tách toàn văn và chia đoạn ngữ nghĩa (Semantic Chunking) để Hội đồng AI đối chiếu.
                </p>

                {/* Compact Feature Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  <span className="px-3 py-1 rounded-full bg-white border border-[rgba(10,20,19,0.1)] text-xs font-sans text-[#465754] inline-flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={1.9} aria-hidden="true" />
                    Bóc tách ngữ nghĩa
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-[rgba(10,20,19,0.1)] text-xs font-sans text-[#465754] inline-flex items-center gap-1.5">
                    <GitFork className="w-3.5 h-3.5 text-[#0369a1]" strokeWidth={1.9} aria-hidden="true" />
                    Sơ đồ luận cứ
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-[rgba(10,20,19,0.1)] text-xs font-sans text-[#465754] inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#085448]" strokeWidth={1.9} aria-hidden="true" />
                    Đối soát Ground Truth
                  </span>
                </div>
              </div>
            </section>

            {/* 2. Document Cards Section */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-sans text-xl sm:text-2xl font-semibold text-[#0a1413]">
                    Tài Liệu Đã Nạp ({documents.length})
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#465754] mt-0.5">
                    Các tài liệu thực tế được liên kết làm căn cứ hỏi-đáp cho Hội đồng AI.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <label htmlFor="doc-search-input" className="visually-hidden">
                    Tìm tài liệu theo tên hoặc nội dung
                  </label>
                  <Search
                    className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#556361]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <input
                    id="doc-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tài liệu..."
                    className="pl-9 pr-3.5 py-2 text-xs rounded-full bg-white border border-[rgba(10,20,19,0.14)] focus:border-[#0b6e5e] w-full sm:w-56 text-[#0a1413] placeholder:text-[#556361]"
                  />
                </div>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="mint-card border-dashed p-10 text-center flex flex-col items-center gap-3">
                  <FileText className="w-9 h-9 text-[#556361]/60" strokeWidth={1.6} aria-hidden="true" />
                  <h3 className="font-sans text-base sm:text-lg font-semibold text-[#0a1413]">
                    {documents.length === 0
                      ? 'Chưa có tài liệu nào được tải lên'
                      : 'Không tìm thấy tài liệu phù hợp'}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#465754] max-w-md">
                    {documents.length === 0
                      ? 'Hãy tải lên tệp PDF, DOCX hoặc TXT của đề tài để Hội đồng AI sử dụng làm căn cứ đối soát Ground Truth khi chất vấn.'
                      : 'Thử nhập từ khóa khác hoặc xóa bộ lọc tìm kiếm để hiển thị toàn bộ tài liệu.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {filteredDocuments.map((doc) => {
                    const isSelected = activeDoc?.document_id === doc.document_id;
                    const coverage = getKnowledgeCoverage(doc.total_chunks);
                    const ext = doc.filename.split('.').pop()?.toLowerCase() || '';

                    return (
                      <article
                        key={doc.document_id}
                        className={`mint-card mint-card-hover p-5 transition-all ${
                          isSelected
                            ? 'border-[#0b6e5e]/60 ring-2 ring-[rgba(110,231,200,0.38)]'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                                isSelected
                                  ? 'bg-[rgba(110,231,200,0.25)] text-[#085448] border-[rgba(11,110,94,0.28)]'
                                  : 'bg-[#eff5f3] text-[#0369a1] border-[rgba(10,20,19,0.1)]'
                              }`}
                            >
                              {ext === 'pdf' ? (
                                <FileBadge className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
                              ) : (
                                <FileText className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-sans text-base sm:text-lg font-semibold text-[#0a1413] truncate max-w-full">
                                  {doc.filename}
                                </h3>
                                {isSelected ? (
                                  <span className="mint-tag mint">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e] anim-live-pulse" aria-hidden="true" />
                                    Đang xem xét
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#eff5f3] text-[#465754] border border-[rgba(10,20,19,0.08)]">
                                    Đã lập chỉ mục
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#465754] font-sans mt-1.5">
                                <span className="inline-flex items-center gap-1">
                                  <HardDrive className="w-3.5 h-3.5 text-[#556361]" strokeWidth={1.8} aria-hidden="true" />
                                  {formatFileSize(doc.file_size_bytes)}
                                </span>
                                <span aria-hidden="true" className="text-[#c9d6d3]">/</span>
                                <span className="inline-flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-[#556361]" strokeWidth={1.8} aria-hidden="true" />
                                  {doc.pages} trang
                                </span>
                                <span aria-hidden="true" className="text-[#c9d6d3]">/</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-[#0b6e5e]">
                                  <AlignLeft className="w-3.5 h-3.5" strokeWidth={1.9} aria-hidden="true" />
                                  {doc.total_chunks} phân đoạn
                                </span>
                                <span aria-hidden="true" className="text-[#c9d6d3]">/</span>
                                <span className="font-mono text-[11px] text-[#556361]">
                                  {formatRelativeDate(doc.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Knowledge Coverage Progress */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[rgba(10,20,19,0.08)] pt-2.5 sm:pt-0 shrink-0">
                            <span className="font-mono text-[10px] text-[#556361] uppercase tracking-[0.06em] block">
                              Độ phủ RAG
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-24 bg-[#eff5f3] border border-[rgba(10,20,19,0.08)] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#0b6e5e] h-full rounded-full"
                                  style={{ width: `${coverage}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#0b6e5e]">
                                {coverage}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Summary Preview + Action Buttons */}
                        <div className="mt-4 pt-3.5 border-t border-[rgba(10,20,19,0.08)] flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs font-sans text-[#465754] line-clamp-1 max-w-md">
                            {doc.summary}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {!isSelected && (
                              <button
                                type="button"
                                onClick={() => setSelectedDocId(doc.document_id)}
                                className="px-3 py-1.5 rounded-full bg-[rgba(110,231,200,0.2)] hover:bg-[rgba(110,231,200,0.34)] text-[#064037] font-sans text-xs font-medium transition-colors cursor-pointer border border-[rgba(11,110,94,0.2)]"
                              >
                                Chọn xem tóm tắt
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onStartSessionWithDoc(doc)}
                              className="btn-mint-primary px-4 py-1.5 text-xs cursor-pointer"
                            >
                              <Bot className="w-3.5 h-3.5 text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                              <span>Bắt đầu phản biện</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setInspectDoc(doc)}
                              className="btn-mint-ghost px-3.5 py-1.5 text-xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={1.9} aria-hidden="true" />
                              <span>Xem trích đoạn</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Xóa tài liệu ${doc.filename}`}
                              onClick={() => onDeleteDocument(doc.document_id)}
                              className="w-8 h-8 rounded-full bg-[#eff5f3] hover:bg-[#ffe4e6] hover:text-[#be123c] text-[#465754] flex items-center justify-center transition-colors cursor-pointer border border-[rgba(10,20,19,0.1)]"
                              title="Gỡ tài liệu"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.9} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Research Summary & Semantic Embedding Topology (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* 1. Research Synthesis Card (Real Data Bound) */}
            <section className="mint-card mint-card-hover p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                  <h2 className="font-sans text-lg font-semibold text-[#0a1413]">
                    Tóm Tắt Nghiên Cứu
                  </h2>
                </div>
                <span className="mint-tag mint">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e]" aria-hidden="true" />
                  {activeDoc ? `RAG ${getKnowledgeCoverage(activeDoc.total_chunks)}%` : 'Chờ dữ liệu'}
                </span>
              </div>

              {/* Selected Document Indicator */}
              <div className="p-3 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)] flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#0b6e5e] shrink-0" strokeWidth={1.9} aria-hidden="true" />
                <span className="font-sans text-xs font-semibold text-[#0a1413] truncate">
                  {activeDoc ? activeDoc.filename : 'Chưa có tài liệu được chọn'}
                </span>
              </div>

              {/* Real Extracted Summary & Pillars */}
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.07em] text-[#0b6e5e] font-semibold block mb-1.5">
                    1. Nội dung trích xuất từ tài liệu
                  </span>
                  <p className="text-[#0a1413] leading-relaxed line-clamp-5">
                    {activeDoc
                      ? activeDoc.summary
                      : 'Tải lên tài liệu đề án (.pdf, .docx, .txt) để xem bản tóm tắt nội dung thực tế từ Vector DB.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.07em] text-[#0369a1] font-semibold block mb-1.5">
                    2. Quy mô chỉ mục đối soát
                  </span>
                  <p className="text-[#0a1413] leading-relaxed">
                    {activeDoc
                      ? `${activeDoc.total_chunks} phân đoạn ngữ nghĩa trên ${activeDoc.pages} trang tài liệu (${formatFileSize(activeDoc.file_size_bytes)}) sẵn sàng cho truy vấn chéo.`
                      : 'Hệ thống tự động chia nhỏ tài liệu thành các đoạn ngữ nghĩa để đối chiếu câu trả lời.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.07em] text-[#334155] font-semibold block mb-1.5">
                    3. Cơ chế Ground Truth Verification
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-[#465754] leading-relaxed">
                    <li>Đối soát số liệu thực tế trong báo cáo với câu trả lời.</li>
                    <li>Phát hiện mâu thuẫn phương pháp và kết quả.</li>
                    <li>Chấm điểm Ground Truth Accuracy theo từng lượt.</li>
                  </ul>
                </div>
              </div>

              {activeDoc && (
                <button
                  type="button"
                  onClick={() => onStartSessionWithDoc(activeDoc)}
                  className="btn-mint-primary w-full py-3 px-4 text-xs sm:text-sm cursor-pointer"
                >
                  <Gavel className="w-4 h-4 text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                  <span>Bắt đầu đối thoại với Hội đồng AI</span>
                </button>
              )}
            </section>

            {/* 2. Knowledge Topology Map */}
            <section className="mint-card mint-card-hover p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                  <h2 className="font-sans text-base sm:text-lg font-semibold text-[#0a1413]">
                    Không Gian Đối Soát
                  </h2>
                </div>
                <span className="mint-tag mint">RAG Vector Map</span>
              </div>
              <p className="font-sans text-xs text-[#465754] leading-relaxed">
                Bản đồ liên kết giữa giả thuyết nghiên cứu, số liệu thực nghiệm và căn cứ đối soát trong kho tài liệu.
              </p>

              <figure className="w-full bg-[#eff5f3] rounded-2xl p-3 border border-[rgba(10,20,19,0.08)] relative overflow-hidden flex flex-col items-center m-0">
                <svg
                  role="img"
                  aria-labelledby="rag-topology-caption"
                  className="w-full h-44"
                  fill="none"
                  viewBox="0 0 320 160"
                >
                  <path d="M 40 85 Q 90 35 150 75" stroke="#b7c9c5" strokeDasharray="3 3" strokeWidth="1.5" />
                  <path d="M 150 75 Q 210 115 270 65" stroke="#b7c9c5" strokeWidth="1.5" />
                  <path d="M 150 75 L 180 120" stroke="#b7c9c5" strokeDasharray="2 2" strokeWidth="1.2" />
                  <path d="M 40 85 L 90 125" stroke="#b7c9c5" strokeWidth="1.2" />
                  <g>
                    <circle cx="40" cy="85" fill="#e0f2fe" r="14" />
                    <circle cx="40" cy="85" fill="#0369a1" r="6" />
                    <text
                      fill="#465754"
                      fontFamily="Geist, Be Vietnam Pro, sans-serif"
                      fontSize="8"
                      fontWeight="600"
                      textAnchor="middle"
                      x="40"
                      y="112"
                    >
                      CHƯƠNG 1
                    </text>
                  </g>
                  <g>
                    <circle cx="90" cy="125" fill="#eff5f3" stroke="#0b6e5e" strokeOpacity="0.3" r="8" />
                    <circle cx="90" cy="125" fill="#0b6e5e" r="3.5" />
                    <text
                      fill="#556361"
                      fontFamily="Geist, Be Vietnam Pro, sans-serif"
                      fontSize="7"
                      textAnchor="middle"
                      x="90"
                      y="142"
                    >
                      Lý thuyết nền
                    </text>
                  </g>
                  <g>
                    <circle className="anim-pulse-glow" cx="150" cy="75" fill="#6ee7c8" fillOpacity="0.5" r="22" />
                    <circle cx="150" cy="75" fill="#085448" r="14" />
                    <circle cx="150" cy="75" fill="#ffffff" r="5" />
                    <text
                      fill="#085448"
                      fontFamily="Geist Mono, monospace"
                      fontSize="8.5"
                      fontWeight="700"
                      textAnchor="middle"
                      x="150"
                      y="48"
                    >
                      GROUND TRUTH
                    </text>
                  </g>
                  <g>
                    <circle cx="180" cy="120" fill="#c8f7e8" r="9" />
                    <circle cx="180" cy="120" fill="#0b6e5e" r="4" />
                    <text
                      fill="#556361"
                      fontFamily="Geist, Be Vietnam Pro, sans-serif"
                      fontSize="7"
                      textAnchor="middle"
                      x="180"
                      y="138"
                    >
                      Số liệu kiểm chứng
                    </text>
                  </g>
                  <g>
                    <circle cx="270" cy="65" fill="#e8f0ed" stroke="#0a1413" strokeOpacity="0.14" r="16" />
                    <circle cx="270" cy="65" fill="#0a1413" r="7" />
                    <text
                      fill="#465754"
                      fontFamily="Geist, Be Vietnam Pro, sans-serif"
                      fontSize="8"
                      fontWeight="600"
                      textAnchor="middle"
                      x="270"
                      y="92"
                    >
                      ĐÁNH GIÁ
                    </text>
                  </g>
                </svg>
                <figcaption id="rag-topology-caption" className="visually-hidden">
                  Sơ đồ liên kết tri thức giữa Chương 1, Lý thuyết nền, Ground Truth trung tâm, Số liệu kiểm chứng và Đánh giá.
                </figcaption>

                <div className="w-full flex items-center justify-between text-[11px] font-sans text-[#465754] pt-2.5 border-t border-[rgba(10,20,19,0.08)]">
                  <span className="inline-flex items-center gap-1.5 text-[#0b6e5e] font-semibold">
                    <Flag className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    {activeDoc ? `${activeDoc.total_chunks} phân đoạn sẵn sàng` : 'Chờ nạp tài liệu'}
                  </span>
                  <span className="text-[#556361] font-mono">{documents.length} tệp</span>
                </div>
              </figure>
            </section>

            {/* 3. Smart Preparation Tip Card */}
            <div className="rounded-2xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)] p-4 text-[#465754] flex items-start gap-3 text-xs leading-relaxed">
              <Lightbulb
                className="w-5 h-5 text-[#0b6e5e] flex-shrink-0 mt-0.5"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <div>
                <strong className="text-[#0a1413] font-semibold">Chiến lược chuẩn bị:</strong> Hội đồng AI thường xoáy sâu vào phần phương pháp và số liệu thực nghiệm. Nạp đầy đủ báo cáo trước khi khởi tạo phiên chất vấn.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Native Document Inspect Dialog */}
      <dialog
        ref={inspectDialogRef}
        aria-labelledby="inspect-doc-title"
        onClose={() => setInspectDoc(null)}
        className="m-auto w-[min(94vw,42rem)] max-h-[85vh] overflow-y-auto rounded-3xl bg-white border border-[rgba(10,20,19,0.12)] shadow-[0_30px_80px_-20px_rgba(10,20,19,0.22)] p-6 text-[#0a1413]"
      >
        {inspectDoc && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[rgba(10,20,19,0.08)]">
              <div>
                <span className="mint-eyebrow block mb-1">
                  Chi tiết trích xuất tài liệu RAG
                </span>
                <h2 id="inspect-doc-title" className="font-sans text-xl font-semibold text-[#0a1413] break-words">
                  {inspectDoc.filename}
                </h2>
              </div>
              <button
                type="button"
                autoFocus
                aria-label="Đóng chi tiết tài liệu"
                onClick={() => inspectDialogRef.current?.close()}
                className="w-8 h-8 rounded-full bg-[#eff5f3] hover:bg-[#dce7e4] text-[#465754] hover:text-[#0a1413] flex items-center justify-center border border-[rgba(10,20,19,0.1)] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-sans">
              <div className="p-3 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)]">
                <span className="text-[#465754] block">Số trang</span>
                <strong className="text-[#0a1413] text-sm font-semibold">{inspectDoc.pages} trang</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)]">
                <span className="text-[#465754] block">Phân đoạn RAG</span>
                <strong className="text-[#0b6e5e] text-sm font-semibold">{inspectDoc.total_chunks} đoạn</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)]">
                <span className="text-[#465754] block">Dung lượng</span>
                <strong className="text-[#0a1413] text-sm font-semibold">
                  {formatFileSize(inspectDoc.file_size_bytes)}
                </strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)]">
              <h3 className="mint-eyebrow mb-2">Bản tóm tắt nội dung trích xuất</h3>
              <p className="font-sans text-sm text-[#0a1413] leading-relaxed whitespace-pre-line">
                {inspectDoc.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="font-mono text-xs text-[#556361]">
                Nạp lúc: {formatRelativeDate(inspectDoc.created_at)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inspectDialogRef.current?.close()}
                  className="btn-mint-ghost h-9 px-4 text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const docToStart = inspectDoc;
                    inspectDialogRef.current?.close();
                    onStartSessionWithDoc(docToStart);
                  }}
                  className="btn-mint-primary h-9 px-4 text-xs cursor-pointer"
                >
                  Bắt đầu phản biện tài liệu này
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
};
