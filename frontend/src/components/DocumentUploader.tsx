import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, ArrowRight, Loader2, BookOpen } from 'lucide-react';

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
    summary: 'Nghiên cứu kết hợp đặc trưng văn bản bằng Transformer và biểu đồ lan truyền mạng xã hội bằng GNN để tăng độ chính xác phát hiện tin giả lên 94.2%.',
  },
  {
    title: 'Nền tảng EdTech Cá nhân hóa Lộ trình Học tập Dựa trên Generative AI & RAG',
    summary: 'Hệ thống tự động phân tích lỗ hổng kiến thức sinh viên qua các bài kiểm tra thích ứng, từ đó sinh lộ trình học vi mô và câu hỏi gợi mở.',
  },
  {
    title: 'Kiến trúc Microservices Chịu lỗi Cao cho Hệ thống Giao dịch Tài chính Fintech',
    summary: 'Áp dụng mẫu Saga Pattern kết hợp Kafka để đảm bảo tính nhất quán dữ liệu cuối cùng và khả năng tự phục hồi khi 30% node gặp sự cố.',
  },
];

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onStartDebate,
  isLoading,
  onFileUpload,
}) => {
  const [title, setTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string; summary: string } | null>(null);
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

  const handleSelectSample = (sample: typeof SAMPLE_TOPICS[0]) => {
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
    <div className="glass-panel" style={{ padding: '28px', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <BookOpen size={22} color="#6366f1" />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
          Bước 1: Nạp Đề tài hoặc Tài liệu Đồ án
        </h3>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed rgba(99, 102, 241, 0.4)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(99, 102, 241, 0.04)',
          transition: 'all 0.2s ease',
          marginBottom: '20px',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
        />
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Loader2 className="animate-spin" size={32} color="#6366f1" />
            <p style={{ fontSize: '14px', color: '#818cf8' }}>Đang trích xuất văn bản & lập chỉ mục Vector DB...</p>
          </div>
        ) : uploadedFile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <CheckCircle size={24} color="#10b981" />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{uploadedFile.name}</p>
              <p style={{ fontSize: '12px', color: '#10b981' }}>Đã tải lên và tạo Ground Truth thành công</p>
            </div>
          </div>
        ) : (
          <div>
            <Upload size={32} color="#818cf8" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
              Tải lên file báo cáo / slide đồ án (PDF, DOCX, TXT)
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Hệ thống sẽ nạp tài liệu làm kiến thức chuẩn (Ground Truth) để AI đối chiếu khi tranh biện
            </p>
          </div>
        )}
      </div>

      {/* Sample Topics Quick Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
          HOẶC CHỌN NHANH ĐỀ TÀI MẪU:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SAMPLE_TOPICS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                color: '#cbd5e1',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              ⚡ {s.title.slice(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Tên đề tài / Đồ án <span style={{ color: '#f43f5e' }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Tối ưu hóa kiến trúc RAG cho hệ thống hỏi đáp y tế..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Tóm tắt luận điểm chính / Đề cương tóm tắt
          </label>
          <textarea
            rows={3}
            value={topicSummary}
            onChange={(e) => setTopicSummary(e.target.value)}
            placeholder="Mô tả ngắn gọn về giải pháp, công nghệ sử dụng, và kết quả đạt được..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Turn settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Số lượt phản biện:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[3, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxTurns(num)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: maxTurns === num ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                  background: maxTurns === num ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                  color: maxTurns === num ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '13px',
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
        onClick={handleStart}
        disabled={isLoading || !title.trim() || isUploading}
        className="btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: '15px' }}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Đang triệu tập Hội đồng Phản biện AI...
          </>
        ) : (
          <>
            Bước vào Phòng Bảo vệ & Tranh biện
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
};
