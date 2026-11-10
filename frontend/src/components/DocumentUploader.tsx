import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, ArrowRight, Loader2, BookOpen, Sparkles } from 'lucide-react';

interface DocumentUploaderProps {
  onStartDebate: (params: {
    title: string;
    topic_summary?: string;
    document_id?: string;
    document_name?: string;
    max_turns: number;
  }) => void;
  isLoading: boolean;
  onFileUpload: (file: File) => Promise<{ document_id: string; filename: string; summary: string }>;
}

const SAMPLE_TOPICS = [
  {
    title: 'Phát hiện Tin giả Đa phương thức bằng Deep Learning & Graph Neural Networks',
    summary:
      'Nghiên cứu kết hợp đặc trưng văn bản bằng Transformer và biểu đồ lan truyền mạng xã hội bằng GNN để tăng độ chính xác phát hiện tin giả lên 94.2%.',
  },
  {
    title: 'Nền tảng EdTech Cá nhân hóa Lộ trình Học tập Dựa trên Generative AI & RAG',
    summary:
      'Hệ thống tự động phân tích lỗ hổng kiến thức sinh viên qua các bài kiểm tra thích ứng, từ đó sinh lộ trình học vi mô và câu hỏi gợi mở.',
  },
  {
    title: 'Kiến trúc Microservices Chịu lỗi Cao cho Hệ thống Giao dịch Tài chính Fintech',
    summary:
      'Áp dụng mẫu Saga Pattern kết hợp Kafka để đảm bảo tính nhất quán dữ liệu cuối cùng và khả năng tự phục hồi khi 30% node gặp sự cố.',
  },
];

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onStartDebate,
  isLoading,
  onFileUpload,
}) => {
  const [title, setTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    name: string;
    summary: string;
  } | null>(null);
  const [maxTurns, setMaxTurns] = useState<number>(5);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await onFileUpload(file);
      setUploadedFile({ id: res.document_id, name: res.filename, summary: res.summary });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (!topicSummary && res.summary) {
        setTopicSummary(res.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectSample = (sample: (typeof SAMPLE_TOPICS)[0]) => {
    setTitle(sample.title);
    setTopicSummary(sample.summary);
  };

  const handleStart = () => {
    if (!title.trim()) return;
    onStartDebate({
      title: title.trim(),
      topic_summary: topicSummary.trim() || undefined,
      document_id: uploadedFile?.id,
      document_name: uploadedFile?.name,
      max_turns: maxTurns,
    });
  };

  return (
    <div className="mint-card" style={{ padding: '28px', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <BookOpen size={20} color="#0b6e5e" aria-hidden="true" />
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0a1413' }}>
          Bước 1: Nạp Đề tài hoặc Tài liệu Đồ án
        </h3>
      </div>

      {/* Upload Zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="dropzone-glow"
        style={{
          width: '100%',
          border: '2px dashed rgba(11, 110, 94, 0.35)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '20px',
        }}
      >
        <input
          id="legacy-uploader-input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          className="visually-hidden"
          aria-label="Chọn tệp báo cáo hoặc slide đồ án"
        />
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Loader2 className="animate-spin" size={28} color="#0b6e5e" aria-hidden="true" />
            <p style={{ fontSize: '14px', color: '#085448', fontWeight: 500 }}>
              Đang trích xuất văn bản &amp; lập chỉ mục Vector DB...
            </p>
          </div>
        ) : uploadedFile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <CheckCircle size={22} color="#0b6e5e" aria-hidden="true" />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0a1413' }}>
                {uploadedFile.name}
              </p>
              <p style={{ fontSize: '12px', color: '#0b6e5e' }}>
                Đã tải lên và tạo Ground Truth thành công
              </p>
            </div>
          </div>
        ) : (
          <div>
            <Upload size={28} color="#0b6e5e" style={{ margin: '0 auto 8px' }} aria-hidden="true" />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0a1413' }}>
              Tải lên file báo cáo / slide đồ án (PDF, DOCX, TXT)
            </p>
            <p style={{ fontSize: '12px', color: '#465754', marginTop: '4px' }}>
              Hệ thống sẽ nạp tài liệu làm kiến thức chuẩn (Ground Truth) để AI đối chiếu khi tranh biện
            </p>
          </div>
        )}
      </button>

      {/* Sample Topics Quick Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#556361', marginBottom: '8px' }}>
          HOẶC CHỌN NHANH ĐỀ TÀI MẪU:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SAMPLE_TOPICS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="btn-mint-ghost"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Sparkles size={13} color="#0b6e5e" aria-hidden="true" />
              <span>{s.title.slice(0, 35)}...</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        <div>
          <label
            htmlFor="legacy-topic-title"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0a1413', marginBottom: '6px' }}
          >
            Tên đề tài / Đồ án <span style={{ color: '#be123c' }}>*</span>
          </label>
          <input
            id="legacy-topic-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Tối ưu hóa kiến trúc RAG cho hệ thống hỏi đáp y tế..."
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              background: '#f7faf9',
              border: '1px solid rgba(10, 20, 19, 0.14)',
              color: '#0a1413',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="legacy-topic-summary"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0a1413', marginBottom: '6px' }}
          >
            Tóm tắt luận điểm chính / Đề cương tóm tắt
          </label>
          <textarea
            id="legacy-topic-summary"
            rows={3}
            value={topicSummary}
            onChange={(e) => setTopicSummary(e.target.value)}
            placeholder="Mô tả ngắn gọn về giải pháp, công nghệ sử dụng, và kết quả đạt được..."
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              background: '#f7faf9',
              border: '1px solid rgba(10, 20, 19, 0.14)',
              color: '#0a1413',
              fontSize: '13px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Turn settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a1413' }}>Số lượt phản biện:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[3, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                aria-pressed={maxTurns === num}
                onClick={() => setMaxTurns(num)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border:
                    maxTurns === num
                      ? '1px solid #0a1413'
                      : '1px solid rgba(10, 20, 19, 0.14)',
                  background: maxTurns === num ? '#0a1413' : '#eff5f3',
                  color: maxTurns === num ? '#ffffff' : '#465754',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {num} lượt {num === 5 && '(Khuyên dùng)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={isLoading || !title.trim() || isUploading}
        className="btn-mint-primary"
        style={{ width: '100%', padding: '13px 20px', fontSize: '14px', cursor: 'pointer' }}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            <span>Đang triệu tập Hội đồng Phản biện AI...</span>
          </>
        ) : (
          <>
            <span>Bước vào Phòng Bảo vệ &amp; Tranh biện</span>
            <ArrowRight size={18} aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
};
