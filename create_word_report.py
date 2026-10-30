import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

def set_cell_background(cell, fill_hex):
    """Sets background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell internal padding."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = OxmlElement('w:tcMar')
    for m_name, m_val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m_name}')
        node.set(qn('w:w'), str(m_val))
        node.set(qn('w:type'), 'dxa')
        tc_mar.append(node)
    tc_pr.append(tc_mar)

def add_callout_box(doc, text, title=None, border_color="4F46E5", bg_color="F1F5F9"):
    """Creates a stylized callout box using a 1x1 table."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    # Left border only
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    left = OxmlElement('w:left')
    left.set(qn('w:val'), 'single')
    left.set(qn('w:sz'), '24') # 3pt
    left.set(qn('w:space'), '0')
    left.set(qn('w:color'), border_color)
    borders.append(left)

    for b in ['top', 'bottom', 'right']:
        node = OxmlElement(f'w:{b}')
        node.set(qn('w:val'), 'none')
        borders.append(node)
    tc_pr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.25

    if title:
        run_title = p.add_run(f"★ {title}\n")
        run_title.bold = True
        run_title.font.name = "Times New Roman"
        run_title.font.size = Pt(11.5)
        run_title.font.color.rgb = RGBColor(30, 58, 138)

    run_text = p.add_run(text)
    run_text.font.name = "Times New Roman"
    run_text.font.size = Pt(11)
    run_text.font.italic = True
    run_text.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def generate_report():
    doc = docx.Document()

    # Page Margins (Standard Academic: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.79)     # 2.0 cm
        section.bottom_margin = Inches(0.79)  # 2.0 cm
        section.left_margin = Inches(1.18)    # 3.0 cm
        section.right_margin = Inches(0.79)   # 2.0 cm

    # Default Style Configurations
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(30, 41, 59)

    # ==========================================
    # TRANG BÌA (COVER PAGE)
    # ==========================================
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_header.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO — CUỘC THI ĐỔI MỚI SÁNG TẠO EDUTECH\n")
    run_sub.bold = True
    run_sub.font.size = Pt(12)
    run_sub.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph().paragraph_format.space_after = Pt(24)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_t1 = p_title.add_run("BÁO CÁO THUYẾT MINH ĐỀ ÁN\n")
    run_t1.bold = True
    run_t1.font.size = Pt(16)
    run_t1.font.color.rgb = RGBColor(15, 23, 42)

    run_t2 = p_title.add_run("EDUTECH – VIVAARENA\n")
    run_t2.bold = True
    run_t2.font.size = Pt(24)
    run_t2.font.color.rgb = RGBColor(79, 70, 229) # Indigo

    run_t3 = p_title.add_run("NỀN TẢNG MÔ PHỎNG HỘI ĐỒNG PHẢN BIỆN VÀ ĐÁNH GIÁ TƯ DUY LOGIC CHO SINH VIÊN BẰNG TRÍ TUỆ NHÂN TẠO\n")
    run_t3.bold = True
    run_t3.font.size = Pt(14)
    run_t3.font.color.rgb = RGBColor(30, 58, 138)

    p_slogan = doc.add_paragraph()
    p_slogan.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sl = p_slogan.add_run('Khẩu hiệu: "Từ Học thụ động sang Tư duy Phản biện — Vững vàng bước ra Hội đồng"')
    run_sl.italic = True
    run_sl.font.size = Pt(12)
    run_sl.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(60)

    # Info table on cover
    info_table = doc.add_table(rows=4, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_data = [
        ("Đơn vị thực hiện:", "Nhóm EDUTECH — Đổi Mới Sáng Tạo"),
        ("Chủ đề đề án:", "Mô hình Tranh biện cùng Phản biện AI theo Phong cách Hội đồng (Viva Arena)"),
        ("Công nghệ cốt lõi:", "Google Gemini 3.8 Flash, Chain-of-Thought (CoT), RAG & ChromaDB"),
        ("Năm thực hiện:", "2026 - 2027")
    ]
    for row_idx, (label, val) in enumerate(info_data):
        cell_lbl = info_table.cell(row_idx, 0)
        cell_val = info_table.cell(row_idx, 1)
        cell_lbl.width = Inches(2.2)
        cell_val.width = Inches(4.2)
        
        p_lbl = cell_lbl.paragraphs[0]
        r_lbl = p_lbl.add_run(label)
        r_lbl.bold = True
        r_lbl.font.size = Pt(11.5)
        
        p_val = cell_val.paragraphs[0]
        r_val = p_val.add_run(val)
        r_val.font.size = Pt(11.5)

    doc.add_page_break()

    # Helper function for adding headings and body text
    def add_h1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.size = Pt(16)
        r.font.color.rgb = RGBColor(30, 58, 138)
        return h

    def add_h2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.size = Pt(13.5)
        r.font.color.rgb = RGBColor(79, 70, 229)
        return h

    def add_h3(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(3)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(15, 23, 42)
        return h

    def add_p(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.25
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
        r_txt = p.add_run(text)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.2
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
        p.add_run(text)
        return p

    # ==========================================
    # CHƯƠNG 1
    # ==========================================
    add_h1("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI & TÍNH CẤP THIẾT")
    
    add_h2("1.1. Bối cảnh Nghiên cứu và Thực trạng Đào tạo Đại học")
    add_p(
        "Trong tiến trình đổi mới giáo dục đại học và sau đại học, kỹ năng thuyết trình, bảo vệ đồ án, "
        "khóa luận tốt nghiệp và bảo vệ đề tài nghiên cứu khoa học đóng vai trò quyết định trong việc đánh giá "
        "chuẩn đầu ra của sinh viên. Tuy nhiên, qua khảo sát thực tế tại các trường đại học khối ngành Công nghệ, "
        "Kinh tế và Khoa học Xã hội, nhóm nghiên cứu nhận thấy ba nghịch lý lớn đang cản trở người học:"
    )
    add_bullet(
        "Đa phần sinh viên dành từ 3 đến 6 tháng để hoàn thiện mô hình, sản phẩm kỹ thuật hoặc slide báo cáo. "
        "Dù vậy, khi bước ra trước Hội đồng chấm thi chính thức, sinh viên rất dễ rơi vào trạng thái hoảng loạn, "
        "mất bình tĩnh, trả lời ngắc ngứ hoặc không bảo vệ được quan điểm của mình trước các câu hỏi phản biện.",
        bold_prefix="1. Hội chứng 'Đơ' trước Hội đồng (Defense Freeze): "
    )
    add_bullet(
        "Kỹ năng phản biện đòi hỏi phải được rèn luyện thông qua diễn tập thực chiến (mock-defense). "
        "Tuy nhiên, mỗi giảng viên hướng dẫn thường phải quản lý từ 8 đến 15 đồ án cùng lúc, hoàn toàn không đủ thời gian "
        "tổ chức các buổi vấn đáp thử nghiệm 1-1 chuyên sâu. Khi sinh viên tự lập nhóm tập dượt với nhau, bạn bè cùng lớp "
        "thường nể nang, thiếu góc nhìn phản biện khách quan và không có đủ chuyên môn sâu để đặt câu hỏi hiểm hóc mang tính 'thử lửa' (stress-test).",
        bold_prefix="2. Khoảng trống trong quy trình diễn tập (Mock-Defense Gap): "
    )
    add_bullet(
        "Phương pháp học tập phổ biến của sinh viên hiện nay vẫn là tiếp thu một chiều (Passive Learning) thông qua việc nghe giảng, "
        "đọc slide bài giảng hoặc xem video. Cách tiếp cận này tạo ra 'ảo tưởng về sự thông thạo' (Illusion of Competence). "
        "Sinh viên nghĩ rằng mình đã làm chủ kiến thức, nhưng khi bị truy vấn ngược, các lỗ hổng tư duy và sự thiếu nhất quán lập tức bị bộc lộ.",
        bold_prefix="3. Ảo tưởng năng lực do thói quen học thụ động: "
    )

    add_h2("1.2. Tính Cấp Thiết và Cơ sở Khoa học Sư phạm")
    add_p(
        "Theo các công trình nghiên cứu nổi tiếng trong lĩnh vực Khoa học Thần kinh Nhận thức (Cognitive Neuroscience), "
        "phương pháp Truy vấn ngược (Retrieval Practice) mang lại hiệu quả ghi nhớ dài hạn và rèn luyện tư duy logic cao hơn "
        "gấp 3 đến 4 lần so với việc đọc lại tài liệu thụ động. Khi một người liên tục bị chất vấn, các mạng lưới liên kết "
        "nơ-ron buộc phải tái cấu trúc để tìm kiếm và diễn đạt lại thông tin nhằm bảo vệ một luận điểm."
    )
    add_p(
        "Chính vì vậy, việc xây dựng nền tảng VivaArena — nơi Trí tuệ Nhân tạo đóng vai trò Hội đồng Phản biện Học thuật đa cấp độ, "
        "chủ động đối chất sinh viên bằng giọng nói thời gian thực dựa trên chính tài liệu đồ án của họ — là một giải pháp cấp bách, "
        "mang tính tiên phong trong việc chuyển đổi tư duy giáo dục từ 'thụ động tiếp nhận' sang 'chủ động phản biện'."
    )

    add_h2("1.3. Mục tiêu của Đề án")
    add_bullet("Xây dựng nền tảng mô phỏng phòng bảo vệ học thuật trực tuyến hoạt động 24/7, loại bỏ triệt để rào cản tâm lý sợ hãi của sinh viên.", bold_prefix="Mục tiêu giáo dục: ")
    add_bullet("Ứng dụng thành công kỹ thuật RAG (Retrieval-Augmented Generation) kết hợp ChromaDB để biến tài liệu đồ án thành Ground Truth; làm chủ kỹ thuật Chain-of-Thought (CoT) 3 bước ngầm trên mô hình Google Gemini 3.8 Flash.", bold_prefix="Mục tiêu công nghệ: ")
    add_bullet("Phát triển sản phẩm hoàn chỉnh với độ trễ phản hồi thấp, tương tác giọng nói tiếng Việt mượt mà, sẵn sàng triển khai B2C và B2B.", bold_prefix="Mục tiêu thương mại: ")

    # ==========================================
    # CHƯƠNG 2
    # ==========================================
    add_h1("CHƯƠNG 2: MÔ HÌNH KINH DOANH TINH GỌN (LEAN CANVAS) & THỊ TRƯỜNG")
    
    add_h2("2.1. Bảng Phân Tích Lean Canvas 9 Ô Chuẩn Quốc Tế")
    add_p(
        "Nhằm đảm bảo tính khả thi về mặt thương mại và phát triển bền vững sau cuộc thi, nhóm EDUTECH đã thiết kế mô hình kinh doanh "
        "theo phương pháp Lean Canvas của Ash Maurya:"
    )

    lean_tbl = doc.add_table(rows=10, cols=2)
    lean_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    lean_data = [
        ("1. Vấn đề (Problem)", "• Sinh viên thiếu phản xạ phản biện, dễ bị 'đơ' khi ra bảo vệ đồ án/khóa luận.\n• Giảng viên hướng dẫn quá tải, không thể tổ chức vấn đáp thử 1-1 thường xuyên.\n• Thói quen học thụ động khiến kiến thức bị hời hợt, dễ ngụy biện khi đối đáp."),
        ("2. Khách hàng Mục tiêu (Customer Segments)", "• B2C: Sinh viên đại học/cao đẳng chuẩn bị bảo vệ đồ án tốt nghiệp, thí sinh thi tranh biện/khởi nghiệp.\n• B2B: Trường Đại học, Viện nghiên cứu, Khoa đào tạo, Trung tâm Ngoại ngữ (IELTS Debate), Doanh nghiệp."),
        ("3. Tuyên ngôn Giá trị Độc nhất (UVP)", "'Phòng bảo vệ đồ án ảo 24/7 — Nơi AI đóng vai Hội đồng khó tính nhất để bạn tự tin tỏa sáng trước Hội đồng thật.'"),
        ("4. Giải pháp (Solution)", "• RAG nạp tài liệu đồ án tự động thành Ground Truth đối chiếu kiến thức chuẩn.\n• Gemini CoT 3 bước ngầm phát hiện lỗ hổng logic & mâu thuẫn câu trước câu sau.\n• Phòng bảo vệ giọng nói tiếng Việt thời gian thực kèm đồng hồ đếm ngược áp lực.\n• Bảng điểm 4 trục năng lực & Gợi ý câu trả lời chuẩn mực (Optimal Answers)."),
        ("5. Kênh Phân phối (Channels)", "• Hợp tác trực tiếp với Đoàn Hội Sinh viên, các CLB Học thuật & Nghiên cứu Khoa học.\n• Chiến dịch viral: 'Thử thách Đấu trí cùng Giám khảo AI khó tính' trên TikTok / Facebook.\n• Tổ chức Hội thảo EdTech tại các trường đại học công nghệ và kinh tế."),
        ("6. Dòng Doanh thu (Revenue Streams)", "• B2C Freemium: Miễn phí 1 phiên (10 phút)/ngày; Gói Pro (69.000đ/tháng hoặc 199.000đ/mùa đồ án) không giới hạn phiên & xuất báo cáo PDF chuyên sâu.\n• B2B SaaS: Bán bản quyền cho giảng viên tạo phòng thi vấn đáp tự động (15 - 50 triệu/năm/khoa)."),
        ("7. Cấu trúc Chi phí (Cost Structure)", "• Chi phí hạ tầng Cloud & GPU Server (FastAPI + ChromaDB).\n• Chi phí Token API (Google Gemini 3.8 Flash — chi phí tối ưu hóa cực thấp).\n• Chi phí Nghiên cứu & Phát triển (R&D) và Tiếp thị cộng đồng sinh viên."),
        ("8. Chỉ số Then chốt (Key Metrics)", "• Số phiên tranh biện hoàn thành (Completed Debate Sessions).\n• Tỷ lệ cải thiện điểm logic của sinh viên sau 3 phiên tập dượt liên tiếp.\n• Tỷ lệ chuyển đổi người dùng trả phí trong mùa làm đồ án tốt nghiệp."),
        ("9. Lợi thế Cạnh tranh (Unfair Advantage)", "• Thuật toán CoT 3 bước ngầm chuyên sâu cho phản biện học thuật (không nịnh hót xã giao).\n• Bộ dữ liệu câu hỏi phản biện đồ án chuẩn hóa học thuật tiếng Việt độc quyền.\n• Tối ưu hóa chi phí vận hành RAG lai giúp duy trì mức giá rẻ vượt trội.")
    ]

    # Style table header
    hdr_cells = lean_tbl.rows[0].cells
    hdr_cells[0].text = "Hạng Mục Lean Canvas"
    hdr_cells[1].text = "Nội Dung Phân Tích Của Đề Án VivaArena"
    for c in hdr_cells:
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 120, 120, 160, 160)
        p = c.paragraphs[0]
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(11)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)

    for idx, (k, v) in enumerate(lean_data):
        row_cells = lean_tbl.rows[idx+1].cells
        row_cells[0].text = k
        row_cells[1].text = v
        row_cells[0].width = Inches(2.3)
        row_cells[1].width = Inches(4.3)
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for c_idx, c in enumerate(row_cells):
            set_cell_background(c, bg)
            set_cell_margins(c, 100, 100, 140, 140)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(10.5)
            if c_idx == 0:
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_h2("2.2. Chiến lược Tiếp cận Thị trường (Go-to-Market Strategy)")
    add_p(
        "Nhóm EDUTECH hoạch định lộ trình thương mại hóa theo 3 giai đoạn rõ rệt:",
        bold_prefix="Lộ trình 3 giai đoạn: "
    )
    add_bullet("Giai đoạn 1 (Thâm nhập): Triển khai thử nghiệm miễn phí tại 3 trường đại học trọng điểm; thu thập phản hồi của 1.000 sinh viên để tinh chỉnh bộ Prompt và kiểm thử chịu tải hệ thống.")
    add_bullet("Giai đoạn 2 (Bùng nổ B2C): Đẩy mạnh chiến dịch truyền thông vào 2 mùa cao điểm bảo vệ đồ án (tháng 4-5 và tháng 11-12 hàng năm), chuyển đổi sinh viên sang gói Pro trả phí theo mùa thi.")
    add_bullet("Giai đoạn 3 (Mở rộng B2B): Đóng gói phần mềm theo mô hình SaaS (Software-as-a-Service) bán cho các trường đại học và trung tâm đào tạo để tổ chức thi vấn đáp học phần tự động hóa.")

    # ==========================================
    # CHƯƠNG 3
    # ==========================================
    add_h1("CHƯƠNG 3: BỘ NÃO AI & THIẾT KẾ SƯ PHẠM (AI CORE & COT)")

    add_h2("3.1. Đặc tả 3 Cấp độ Hội đồng Phản biện (Council Personas)")
    add_p(
        "VivaArena không xây dựng một nhân vật AI chung chung. Thay vào đó, hệ thống thiết kế 3 nhân cách giám khảo "
        "đại diện cho 3 cấp bậc phát triển nhận thức và rèn luyện kỹ năng của người học:"
    )

    add_h3("Cấp độ 1: Phương pháp Feynman (Dễ) — 'Bạn học tò mò'")
    add_p(
        "Đóng vai một bạn học ngô nghê nhưng ham học hỏi theo tư tưởng của nhà vật lý Richard Feynman. AI liên tục đặt ra các câu hỏi: "
        "'Tại sao lại chọn giải pháp này thay vì cách truyền thống?', 'Nếu giải thích cho một học sinh lớp 5 thì bạn ví von với cái gì ngoài đời?'. "
        "Mục tiêu là triệt tiêu thói quen học vẹt và ép người học phải nắm vững bản chất cốt lõi của đề tài."
    )

    add_h3("Cấp độ 2: Thầy Phản biện Học thuật (Vừa) — 'Giáo sư chuẩn mực'")
    add_p(
        "Đóng vai một giảng viên phản biện nghiêm túc và sâu sát. AI xoáy sâu vào tính chính xác của định nghĩa, công thức toán học, "
        "thuật toán, ưu nhược điểm so với các công trình nghiên cứu hiện nay (State-of-the-Art) và phương pháp đánh giá thực nghiệm."
    )

    add_h3("Cấp độ 3: Hội đồng Bảo vệ Gắt gao (Khó - Stress-Test) — 'Chủ tịch hội đồng khó tính'")
    add_p(
        "Đóng vai vị Chủ tịch Hội đồng chấm tốt nghiệp giàu kinh nghiệm thực chiến. Mục tiêu là kiểm tra bản lĩnh tâm lý và sức chịu tải "
        "của sinh viên. AI lập tức chỉ ra các mâu thuẫn giữa câu phát biểu hiện tại với các lượt trước, bắt bài khi sinh viên nói vòng vo "
        "hoặc né tránh câu hỏi, và ép sinh viên vào các tình huống ngoại lệ cực đoan (edge-cases)."
    )

    add_h2("3.2. Kỹ thuật Chain-of-Thought (CoT) 3 Bước Ngầm")
    add_p(
        "Các chatbot AI hiện nay (như ChatGPT mặc định) thường có xu hướng 'nịnh hót' và khen ngợi xã giao người dùng, làm mất đi tính nghiêm cẩn "
        "của môi trường học thuật. VivaArena giải quyết triệt để vấn đề này bằng cách bắt buộc mô hình Google Gemini 3.8 Flash phải thực thi "
        "quy trình suy luận ngầm qua 3 bước (Chain-of-Thought) trước khi phát ngôn:"
    )

    add_callout_box(
        doc,
        "1. [Bước 1 - Fact-Checking]: Trích xuất nội dung trả lời của sinh viên, đối chiếu với các chunks tài liệu Ground Truth để chấm điểm độ chuẩn xác kiến thức (0-100%).\n"
        "2. [Bước 2 - Logic Flaws Detection]: Rà soát toàn bộ các lỗi ngụy biện (Strawman, Red Herring), phát hiện biểu hiện nói vòng vo, lảng tránh hoặc mâu thuẫn luận điểm.\n"
        "3. [Bước 3 - Rebuttal Synthesis]: Tổng hợp lời phản bác đanh thép và sinh ra câu hỏi chất vấn dồn ép tiếp theo theo đúng phong cách hội đồng đã chọn.",
        title="QUY TRÌNH 3 BƯỚC SUY LUẬN NGẦM (INTERNAL CHAIN-OF-THOUGHT)"
    )

    add_h2("3.3. Ma trận Đánh giá Bảng điểm (Scorecard Rubric 4 Trục)")
    add_p(
        "Sau khi kết thúc phiên tranh biện, hệ thống sử dụng thuật toán tổng hợp để chấm điểm toàn diện dựa trên 4 trục năng lực:"
    )

    rubric_tbl = doc.add_table(rows=5, cols=3)
    rubric_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    rubric_headers = ["Trục Năng Lực", "Trọng Số", "Chỉ Số Đo Lường Cụ Thể"]
    for idx, name in enumerate(rubric_headers):
        cell = rubric_tbl.cell(0, idx)
        cell.text = name
        set_cell_background(cell, "4F46E5")
        set_cell_margins(cell, 120, 120, 140, 140)
        p = cell.paragraphs[0]
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(11)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)

    rubric_rows = [
        ("1. Độ chính xác Kiến thức & Logic", "35%", "Mức độ trùng khớp với Ground Truth tài liệu; định nghĩa chuẩn xác; không phát ngôn sai khoa học."),
        ("2. Kỹ năng Lập luận & Phản biện", "30%", "Cấu trúc luận điểm chặt chẽ (luận điểm -> dẫn chứng -> số liệu); không mắc ngụy biện logic (Fallacies)."),
        ("3. Bản lĩnh & Sức chịu tải Tâm lý", "20%", "Khả năng giữ bình tĩnh trước câu hỏi stress-test; không đầu hàng vô căn cứ; tốc độ phản xạ tốt."),
        ("4. Độ Mạch lạc & Súc tích", "15%", "Trả lời thẳng vào trọng tâm; văn phong gãy gọn; không dùng từ ngữ thừa thãi để kéo dài thời gian.")
    ]

    for r_idx, (t1, t2, t3) in enumerate(rubric_rows):
        row = rubric_tbl.rows[r_idx+1]
        row.cells[0].text = t1
        row.cells[1].text = t2
        row.cells[2].text = t3
        row.cells[0].width = Inches(2.2)
        row.cells[1].width = Inches(1.0)
        row.cells[2].width = Inches(3.4)
        bg = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
        for c in row.cells:
            set_cell_background(c, bg)
            set_cell_margins(c, 100, 100, 120, 120)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(10.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_h2("3.4. Cơ chế Sinh Câu trả lời Chuẩn mực (Optimal Model Answers)")
    add_p(
        "Điểm độc đáo tạo nên giá trị sư phạm vượt bậc của VivaArena là tính năng học tập sau phản biện. "
        "Với từng câu chất vấn mà sinh viên trả lời chưa tối ưu, hệ thống sẽ đưa ra phương án phản biện chuẩn mực "
        "do AI tổng hợp từ tài liệu chuyên môn, kèm theo 'Bài học kinh nghiệm' (Key Takeaway) giúp sinh viên hoàn thiện "
        "bài nói của mình ngay trước buổi bảo vệ chính thức."
    )

    # ==========================================
    # CHƯƠNG 4
    # ==========================================
    add_h1("CHƯƠNG 4: KIẾN TRÚC CÔNG NGHỆ & THIẾT KẾ HỆ THỐNG")

    add_h2("4.1. Kiến trúc Tổng thể Hệ thống (System Architecture)")
    add_p(
        "Hệ thống VivaArena được tổ chức theo mô hình phân tầng độc lập (Decoupled Architecture) gồm 5 tầng chính "
        "nhằm đảm bảo tính mở rộng, độ trễ phản hồi thấp và tính bảo mật cao:"
    )
    add_bullet("Sử dụng React 19 kết hợp TypeScript và Vite. Cung cấp giao diện phòng bảo vệ mô phỏng, avatar cử động theo nhịp nói, thanh đếm ngược thời gian và tích hợp Web Speech Recognition API để chuyển giọng nói tiếng Việt thành văn bản.", bold_prefix="1. Client Layer (Frontend): ")
    add_bullet("Sử dụng framework FastAPI (Python) bất đồng bộ. Điều phối toàn bộ các yêu cầu RESTful và duy trì kênh truyền thời gian thực hai chiều WebSocket (/ws/debate/{session_id}) giúp truyền tải âm thanh và trạng thái tức thì.", bold_prefix="2. API Gateway & Backend Layer: ")
    add_bullet("Trích xuất tài liệu (PDF, Word, TXT), làm sạch và phân mảnh thành các khối 500 từ có độ chồng lấp (overlap) 100 từ; đánh chỉ mục và lưu trữ vào Vector DB ChromaDB để phục vụ truy hồi ngữ cảnh chính xác.", bold_prefix="3. Knowledge & RAG Layer: ")
    add_bullet("Mô hình Google Gemini 3.8 Flash đóng vai trò hạt nhân phân tích. Tích hợp sẵn bộ Prompt CoT 3 bước ngầm và các bộ Persona giám khảo học thuật.", bold_prefix="4. AI Brain Layer: ")
    add_bullet("Cơ sở dữ liệu SQLAlchemy (SQLite cho phát triển cục bộ, PostgreSQL cho môi trường sản xuất) quản lý phiên tranh biện, chi tiết từng lượt đối thoại và bảng điểm tổng kết.", bold_prefix="5. Persistence Layer: ")

    add_h2("4.2. Thiết kế Cơ sở Dữ liệu (Database Schema)")
    add_p(
        "Cơ sở dữ liệu quan hệ của hệ thống bao gồm 3 thực thể cốt lõi:",
        bold_prefix="Mô hình dữ liệu: "
    )
    add_bullet("DEBATE_SESSIONS: Lưu trữ thông tin định danh phiên, tên đề tài, cấp độ hội đồng đã chọn, trạng thái phiên (in_progress, completed) và số lượt tối đa.", bold_prefix="• ")
    add_bullet("DEBATE_TURNS: Lưu vết từng lượt đối thoại gồm câu hỏi của AI, câu trả lời của sinh viên, phương thức trả lời (Voice/Text), thời gian phản hồi, độ chuẩn xác đối chiếu và kết quả suy luận CoT.", bold_prefix="• ")
    add_bullet("SCORECARDS: Lưu trữ điểm số 4 trục năng lực, điểm tổng kết toàn diện, danh sách điểm mạnh, điểm yếu, các lỗi ngụy biện bị bắt bài và danh sách câu trả lời kiểu mẫu.", bold_prefix="• ")

    add_h2("4.3. Công nghệ Xử lý Giọng nói Tiếng Việt (Speech-to-Text & Text-to-Speech)")
    add_p(
        "Để tạo nên bầu không khí chân thực như một buổi bảo vệ đồ án thực tế, hệ thống tích hợp công nghệ giọng nói hai chiều:"
    )
    add_bullet("Ứng dụng Web Speech Recognition API với mã ngôn ngữ 'vi-VN', cho phép nhận diện giọng nói tiếng Việt liên tục với độ chính xác cao mà không tốn chi phí gọi API bên thứ ba.", bold_prefix="Nhận diện giọng nói (STT): ")
    add_bullet("Ứng dụng Web Speech Synthesis API kết hợp voice tiếng Việt chuẩn, tự động phát âm câu hỏi chất vấn của Hội đồng AI ngay khi được sinh ra, tạo áp lực phản xạ nghe - nói tức thì cho sinh viên.", bold_prefix="Tổng hợp giọng đọc (TTS): ")

    # ==========================================
    # CHƯƠNG 5
    # ==========================================
    add_h1("CHƯƠNG 5: KỊCH BẢN THỬ NGHIỆM THỰC TẾ & KẾT QUẢ ĐẠT ĐƯỢC")

    add_h2("5.1. Thiết lập Môi trường Thử nghiệm")
    add_p(
        "Nhóm nghiên cứu đã tiến hành chạy thử nghiệm một phiên tranh biện hoàn chỉnh trên hệ thống VivaArena với các thông số:"
    )
    add_bullet("Hệ thống Phát hiện Tin giả Đa phương thức trên Mạng xã hội bằng Deep Learning & Graph Neural Networks (GNN).", bold_prefix="Tên đề tài đồ án: ")
    add_bullet("File báo cáo khóa luận định dạng PDF (độ dài 45 trang, dung lượng 3.2 MB).", bold_prefix="Tài liệu nạp (Ground Truth): ")
    add_bullet("Cấp độ 2 — Thầy Phản biện Học thuật (Số lượt đối đáp: 3 lượt).", bold_prefix="Cấp độ lựa chọn: ")

    add_h2("5.2. Diễn biến Chi tiết Phiên Tranh biện Thực tế")

    add_callout_box(
        doc,
        "Giáo sư Phản biện: 'Hội đồng đã đọc báo cáo của bạn. Bạn hãy nêu rõ cơ sở lý thuyết chứng minh việc xây dựng đồ thị lan truyền GNN giúp cải thiện độ chính xác so với việc chỉ phân tích nội dung văn bản thuần túy?'\n\n"
        "Sinh viên (nói qua Micro): 'Dạ thưa thầy, vì tin giả thường viết rất khéo léo nên nếu chỉ đọc chữ thì khó nhận biết. Khi đưa vào mạng xã hội, cách người dùng chia sẻ và bình luận sẽ tạo ra đồ thị lan truyền khác biệt, từ đó GNN sẽ bắt được cấu trúc này ạ.'\n\n"
        "AI CoT Phân tích: Độ chuẩn xác kiến thức 85% (khớp với chương 3 trong PDF). Tuy nhiên, câu trả lời hoàn toàn mang tính định tính, chưa có số liệu thực nghiệm.\n\n"
        "Giáo sư Phản biện 'Bắt bài': 'Bạn đã hiểu đúng bản chất hiện tượng. Tuy nhiên câu trả lời của bạn hoàn toàn là định tính! Trong báo cáo, chỉ số F1-Score đã tăng chính xác bao nhiêu phần trăm khi bổ sung GNN, và độ trễ tính toán tăng thêm bao nhiêu miligiây?'",
        title="LƯỢT ĐỐI ĐÁP THỨ NHẤT: CHẤT VẤN VỀ TÍNH ĐỊNH LƯỢNG KHOA HỌC"
    )

    add_callout_box(
        doc,
        "Sinh viên: 'Dạ, trên tập kiểm thử thì F1-Score tăng từ 82.4% lên 89.1%, nhưng độ trễ tăng khoảng 120ms. Em nghĩ mức tăng 120ms này người dùng mạng xã hội vẫn hoàn toàn chấp nhận được ạ.'\n\n"
        "Giáo sư Phản biện 'Bắt bài': 'Bạn nói người dùng chấp nhận được là phỏng đoán chủ quan! Nếu hệ thống gặp kịch bản ngoại lệ: 10.000 bài đăng mỗi giây trong các sự kiện nóng, độ trễ 120ms trên mỗi đồ thị sẽ gây nghẽn toàn bộ hàng đợi. Giải pháp kỹ thuật nào để bạn giải quyết bài toán nút thắt cổ chai (bottleneck) này?'",
        title="LƯỢT ĐỐI ĐÁP THỨ HAI: DỒN ÉP VÀO KỊCH BẢN NGOẠI LỆ (STRESS-TEST)"
    )

    add_h2("5.3. Bảng điểm Đánh giá Tổng kết (Scorecard)")
    add_p(
        "Sau khi kết thúc phiên tranh biện, hệ thống VivaArena đã tổng kết Bảng điểm chi tiết của sinh viên:",
        bold_prefix="Kết quả đánh giá từ Hội đồng AI: "
    )
    add_bullet("84.5 / 100 điểm (Xếp loại: Giỏi — Hạng A).", bold_prefix="• Điểm Tổng kết Toàn diện: ")
    add_bullet("Độ chính xác Kiến thức & Logic: 88.0% | Kỹ năng Lập luận: 80.0% | Bản lĩnh Chịu áp lực: 82.0% | Độ Mạch lạc: 88.0%.", bold_prefix="• Chi tiết 4 trục năng lực: ")
    add_bullet("Nắm vững cấu trúc mô hình; nhớ chính xác chỉ số thực nghiệm F1-Score khi bị truy vấn dồn dập.", bold_prefix="• Điểm mạnh: ")
    add_bullet("Còn thói quen đưa ra phán đoán cảm tính ('nghĩ là người dùng chấp nhận được'); chưa chuẩn bị kỹ kịch bản chịu tải cao.", bold_prefix="• Lỗ hổng logic & Điểm cần cải thiện: ")
    add_bullet("'Thưa hội đồng, để xử lý bài toán nghẽn 120ms ở quy mô 10.000 req/s, giải pháp tối ưu là áp dụng cơ chế lọc 2 tầng (Two-stage Pipeline): Tầng 1 dùng mô hình văn bản nhẹ để lọc nhanh 90% tin tức an toàn trong 10ms; chỉ 10% tin tức nghi vấn cao mới được đưa vào nhánh đồ thị GNN xử lý bất đồng bộ qua hàng đợi Kafka.'", bold_prefix="• Câu trả lời chuẩn mực đề xuất (Optimal Answer): ")

    # ==========================================
    # CHƯƠNG 6
    # ==========================================
    add_h1("CHƯƠNG 6: KẾT LUẬN & LỘ TRÌNH PHÁT TRIỂN")

    add_h2("6.1. Đóng góp Nổi bật của Đề án")
    add_bullet("Hiện thực hóa phương pháp Sư phạm Socrates và Truy vấn ngược (Retrieval Practice) thông qua AI, chuyển đổi căn bản từ học thụ động sang rèn luyện tư duy phản biện thực chiến.", bold_prefix="1. Về mặt sư phạm: ")
    add_bullet("Làm chủ công nghệ RAG và kỹ thuật CoT 3 bước ngầm trên nền tảng Google Gemini 3.8 Flash, tạo ra mô hình AI có khả năng 'bắt bài' logic chuẩn xác.", bold_prefix="2. Về mặt công nghệ: ")
    add_bullet("Khung Lean Canvas chứng minh tính khả thi cao, mở ra tiềm năng thương mại hóa lớn ở cả hai phân khúc B2C (sinh viên cá nhân) và B2B (các trường đại học).", bold_prefix="3. Về mặt thực tiễn: ")

    add_h2("6.2. Lộ trình Triển khai trong 12 Tháng Tới (Roadmap)")
    add_bullet("Triển khai thử nghiệm phiên bản Beta trên 500 sinh viên tại Đại học Bách Khoa và Đại học Quốc Gia; hoàn thiện thêm các bộ Persona hội đồng chuyên ngành Luật, Kinh tế và Y Dược.", bold_prefix="• Quý 1 - 2/2027: ")
    add_bullet("Nghiên cứu tích hợp mô hình Computer Vision qua Webcam để phân tích biểu cảm khuôn mặt, ánh mắt và ngôn ngữ cơ thể, từ đó chấm điểm phong thái tự tin của sinh viên.", bold_prefix="• Quý 3/2027: ")
    add_bullet("Đóng gói giải pháp SaaS thương mại hóa cho các trường đại học, phục vụ công tác tổ chức thi vấn đáp học phần tự động hóa quy mô lớn.", bold_prefix="• Quý 4/2027: ")

    # ==========================================
    # TÀI LIỆU THAM KHẢO
    # ==========================================
    add_h1("TÀI LIỆU THAM KHẢO")
    refs = [
        "Roediger, H. L., & Butler, A. C. (2011). The critical role of retrieval practice in long-term retention. Trends in Cognitive Sciences, 15(1), 20-27.",
        "Wei, J., Wang, X., Schuurmans, D., et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. Advances in Neural Information Processing Systems (NeurIPS 2022).",
        "Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. Advances in Neural Information Processing Systems (NeurIPS 2020).",
        "Google AI. (2026). Google GenAI SDK & Gemini 3.8 Flash Documentation. Google DeepMind.",
        "Maurya, A. (2012). Running Lean: Iterate from Plan A to a Plan That Works. O'Reilly Media."
    ]
    for r_idx, ref in enumerate(refs):
        add_p(f"[{r_idx+1}] {ref}", space_after=4)

    # Save documents
    out_path_1 = "f:/luu vao day di/DMST/ViVaTech/BAO_CAO_DE_AN_VIVAARENA.docx"
    out_path_2 = "f:/luu vao day di/DMST/ViVaTech/docs/BAO_CAO_DE_AN_VIVAARENA.docx"
    
    os.makedirs(os.path.dirname(out_path_2), exist_ok=True)
    doc.save(out_path_1)
    doc.save(out_path_2)
    print(f"Document successfully created at:\n- {out_path_1}\n- {out_path_2}")

if __name__ == "__main__":
    generate_report()
