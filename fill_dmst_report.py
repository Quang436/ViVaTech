import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import shutil

def set_cell_background(cell, fill_hex):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = OxmlElement('w:tcMar')
    for m_name, m_val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m_name}')
        node.set(qn('w:w'), str(m_val))
        node.set(qn('w:type'), 'dxa')
        tc_mar.append(node)
    tc_pr.append(tc_mar)

def generate_updated_dmst():
    src_path = "f:/luu vao day di/DMST/DMST.docx"
    doc = docx.Document(src_path)

    # Backup original
    backup_path = "f:/luu vao day di/DMST/DMST_backup.docx"
    shutil.copyfile(src_path, backup_path)

    # Helper styling functions
    def add_h1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(30, 58, 138)
        return h

    def add_h2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)
        r.font.color.rgb = RGBColor(79, 70, 229)
        return h

    def add_h3(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(3)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.name = "Times New Roman"
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
            r_pre.font.name = "Times New Roman"
            r_pre.font.size = Pt(12)
        r_txt = p.add_run(text)
        r_txt.font.name = "Times New Roman"
        r_txt.font.size = Pt(12)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.2
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = "Times New Roman"
            r_pre.font.size = Pt(12)
        r_txt = p.add_run(text)
        r_txt.font.name = "Times New Roman"
        r_txt.font.size = Pt(12)
        return p

    # Update title
    for p in doc.paragraphs[:15]:
        if p.text.strip() == "ĐỀ TÀI:":
            p.text = "ĐỀ TÀI: EDUTECH – VIVAARENA\nNỀN TẢNG MÔ PHỎNG HỘI ĐỒNG PHẢN BIỆN VÀ ĐÁNH GIÁ TƯ DUY LOGIC CHO SINH VIÊN BẰNG TRÍ TUỆ NHÂN TẠO"
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.bold = True
                r.font.name = "Times New Roman"
                r.font.size = Pt(13)
                r.font.color.rgb = RGBColor(30, 58, 138)

    # Append complete section 1 and 2
    add_h1("1. Ý TƯỞNG, GIÁ TRỊ CỐT LÕI")

    add_h2("1.1. Vấn đề cần giải quyết (Xác định điểm khuyết của thị trường)")
    add_p(
        "Trong môi trường giáo dục đại học, bảo vệ đồ án và thi vấn đáp là cột mốc quyết định chuẩn đầu ra, "
        "nhưng thực tế đang tồn tại 3 điểm khuyết lớn của thị trường:"
    )
    add_bullet(
        "Đa số sinh viên nắm vững sản phẩm và lý thuyết, nhưng khi ra hội đồng lại bị hoảng loạn tâm lý, lúng túng, trả lời vòng vo hoặc ngụy biện trước các câu hỏi phản biện từ giám khảo.",
        bold_prefix="• Hội chứng 'Đơ' trước Hội đồng (Defense Freeze): "
    )
    add_bullet(
        "Kỹ năng phản biện chỉ hình thành qua cọ xát. Tuy nhiên, giảng viên hướng dẫn luôn quá tải (1 giảng viên quản lý 8–15 nhóm đồ án) nên không thể kèm vấn đáp thử 1-1; trong khi bạn bè cùng lớp lại nể nang, thiếu chuyên môn sâu để đặt câu hỏi hiểm hóc mang tính 'thử lửa' (stress-test).",
        bold_prefix="• Khoảng trống diễn tập thực chiến (Mock-Defense Gap): "
    )
    add_bullet(
        "Thói quen đọc slide và nghe giảng tạo ra ảo tưởng nắm vững kiến thức; khi bị chất vấn ngược lại, lỗ hổng tư duy lập tức bộc lộ.",
        bold_prefix="• Bẫy 'Học thụ động' (Passive Learning): "
    )
    add_p(
        "Hoàn toàn thiếu một công cụ đóng vai 'Hội đồng Phản biện học thuật ảo' hoạt động 24/7 để sinh viên được luyện tập bị chất vấn và sửa lỗi tư duy trước khi bước vào phòng bảo vệ thật.",
        bold_prefix="👉 Điểm khuyết thị trường: "
    )

    add_h2("1.2. Giải pháp: Nền tảng VivaArena (AI Debate / Viva Defense Arena)")
    add_p(
        "VivaArena là nền tảng phòng bảo vệ đồ án mô phỏng ứng dụng Trí tuệ Nhân tạo thế hệ mới (Generative AI), "
        "nơi AI không phải là công cụ 'trả lời thay' cho sinh viên mà đóng vai Hội đồng Phản biện khắt khe đối chất thời gian thực. "
        "Hệ thống vận hành thông qua quy trình 3 bước khép kín:"
    )
    add_bullet(
        "Sinh viên tải lên slide, báo cáo (.PDF/.DOCX). AI dùng công nghệ RAG kết hợp ChromaDB bóc tách tri thức chuẩn (Ground Truth), loại bỏ ảo giác AI. Người học chọn 1 trong 3 cấp độ Hội đồng: Cấp độ 1 - Feynman Method (Dễ: ép giải thích đơn giản bản chất cốt lõi); Cấp độ 2 - Thầy Phản biện Học thuật (Vừa: soi định nghĩa, công thức, đối sánh State-of-the-Art); Cấp độ 3 - Hội đồng Gắt gao Stress-Test (Khó: vạch trần mâu thuẫn câu trước câu sau, ép vào tình huống ngoại lệ cực đoan).",
        bold_prefix="1. Nạp tài liệu & Kiến tạo Tri thức chuẩn (Ground Truth RAG): "
    )
    add_bullet(
        "Hội đồng AI cất tiếng hỏi bằng Text-to-Speech tiếng Việt. Sinh viên trả lời trực tiếp bằng giọng nói qua micro dưới áp lực đồng hồ đếm ngược 60-90 giây. AI chạy thuật toán Chain-of-Thought (CoT) 3 bước ngầm: Fact-check tài liệu ➔ Bắt bài lỗi logic, nói vòng vo ➔ Phản bác đanh thép.",
        bold_prefix="2. Tranh biện Trực tiếp Thời gian thực (Live Debate Arena): "
    )
    add_bullet(
        "Tự động chấm điểm 4 trục năng lực (Độ chính xác kiến thức 35%, Kỹ năng lập luận 30%, Bản lĩnh chịu áp lực 20%, Độ mạch lạc 15%). Cung cấp Gợi ý Câu trả lời Chuẩn mực (Optimal Model Answers) và bài học kinh nghiệm để sinh viên sửa bài ngay.",
        bold_prefix="3. Bảng điểm Toàn diện & Học tập Sau phản biện: "
    )

    add_h2("1.3. Điểm khác biệt (USP - Unique Selling Proposition)")
    add_p(
        "Khác với các ứng dụng học tập thông thường, VivaArena sở hữu 5 trụ cột giá trị độc quyền được trình bày tại Bảng 1.1:"
    )

    # Add Table 1.1 USP Horizontal
    usp_tbl = doc.add_table(rows=6, cols=5)
    usp_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    usp_headers = ["STT", "Trụ cột Khác biệt (USP)", "Cách thức VivaArena thực hiện", "Khác biệt so với cách học thông thường", "Giá trị đem lại cho sinh viên"]
    for idx, name in enumerate(usp_headers):
        cell = usp_tbl.cell(0, idx)
        cell.text = name
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 120, 120, 140, 140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(10.5)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)

    usp_data = [
        ("01", "Chất vấn ngược chủ động (Retrieval Practice)", "AI chủ động đóng vai Giám khảo đặt câu hỏi truy vấn dồn dập, ép sinh viên phải tự tìm luận điểm bảo vệ.", "Các công cụ AI khác chỉ thụ động 'trả lời hộ' khi người dùng hỏi, khiến người học càng lười tư duy.", "Kích hoạt vùng nhớ sâu của não bộ, triệt tiêu thói quen học vẹt và ảo tưởng hiểu bài."),
        ("02", "Cá nhân hóa 100% theo Đề tài riêng (Ground Truth RAG)", "Ứng dụng RAG đọc hiểu trực tiếp slide báo cáo, file khóa luận (.PDF) của chính sinh viên làm căn cứ hỏi thi.", "AI thông thường chỉ hỏi đáp dựa trên kiến thức chung trên mạng, dễ bị ảo giác (hallucination) lan man.", "Sinh viên được tập dượt đúng những câu hỏi mà Hội đồng thật sẽ xoáy sâu vào đề tài của mình."),
        ("03", "Bắt bài Lỗi logic & Ngụy biện (CoT 3 bước ngầm)", "Thuật toán CoT ngầm: Kiểm tra tính đúng đắn ➔ Rà soát nói vòng vo, mâu thuẫn câu trước câu sau ➔ Phản bác đanh thép.", "Chatbot thông thường hay khen ngợi xã giao ('Ý kiến của bạn rất hay'), bỏ qua hoàn toàn các lỗ hổng lập luận.", "Sinh viên nhận diện ngay các lỗi ngụy biện của bản thân để kịp thời bổ sung số liệu chứng minh."),
        ("04", "Mô phỏng Áp lực Phòng bảo vệ Thực tế 24/7", "Tương tác giọng nói tiếng Việt 2 chiều (STT/TTS) kết hợp đồng hồ đếm ngược 60–90 giây tạo áp lực thời gian.", "Luyện tập truyền thống khó xếp lịch với thầy cô; gõ chữ thông thường không tạo được phản xạ nghe – nói.", "Giải tỏa hoàn toàn hội chứng 'đơ' tâm lý, tôi luyện bản lĩnh và sự tự tin trước khi bước ra Hội đồng thật."),
        ("05", "Học sau phản biện với Câu trả lời Chuẩn (Optimal Answers)", "Tự động chấm điểm 4 trục năng lực và đưa ra câu trả lời kiểu mẫu chuẩn học thuật cho từng câu hỏi sinh viên chưa đạt.", "Thầy cô hay bạn bè thường chỉ nhận xét chung chung ('chưa tốt, cần sửa'), không có lời giải mẫu tức thì.", "Sinh viên biết chính xác một chuyên gia sẽ trả lời như thế nào, nâng cấp bài thuyết trình đạt điểm A/A+.")
    ]

    col_widths = [Inches(0.6), Inches(1.5), Inches(1.6), Inches(1.5), Inches(1.6)]
    for r_idx, row_data in enumerate(usp_data):
        row = usp_tbl.rows[r_idx+1]
        bg = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.text = val
            cell.width = col_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 90, 90, 110, 110)
            p = cell.paragraphs[0]
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(10)
            if c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.runs[0].font.bold = True
            elif c_idx == 1:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(30, 58, 138)
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_p(
        "\"Sinh viên chọn VivaArena vì đây là công cụ duy nhất cho phép họ bị chất vấn thử trước giờ G dựa trên chính tài liệu của mình, nhận diện được các chỗ trả lời sơ hở và có ngay câu trả lời chuẩn mực để tự tin bước ra Hội đồng bảo vệ chính thức.\"",
        bold_prefix="💡 Tóm tắt lý do khách hàng chọn VivaArena: "
    )

    # Section 2
    add_h1("2. NGHIÊN CỨU THỊ TRƯỜNG & KHÁCH HÀNG")

    add_h2("2.1. Phân tích Thị trường: Quy mô, Tốc độ tăng trưởng và Xu hướng")
    add_h3("2.1.1. Quy mô thị trường (TAM - SAM - SOM)")
    add_p(
        "Dự án áp dụng mô hình định lượng quy mô thị trường chuẩn khởi nghiệp:",
        bold_prefix="Ước tính quy mô: "
    )
    add_bullet(
        "Thị trường Công nghệ Giáo dục (EdTech) tại Việt Nam đang có tốc độ phát triển hàng đầu Đông Nam Á, dự kiến đạt quy mô 3 tỷ USD vào năm 2026 với tốc độ tăng trưởng kép (CAGR) đạt 20.2%. Cả nước hiện có hơn 2.1 triệu sinh viên đang theo học tại các trường đại học và học viện.",
        bold_prefix="• TAM (Total Addressable Market): "
    )
    add_bullet(
        "Tập trung vào nhóm sinh viên năm 3, năm 4, học viên cao học và sinh viên các khối ngành có yêu cầu bắt buộc phải thực hiện đồ án môn học, khóa luận tốt nghiệp hoặc thi vấn đáp học phần (Công nghệ thông tin, Kinh tế, Quản trị, Luật, Y dược). Quy mô ước tính khoảng 650.000 sinh viên/năm, tương đương dung lượng thị trường dịch vụ phần mềm khoảng 30 triệu USD/năm.",
        bold_prefix="• SAM (Serviceable Addressable Market): "
    )
    add_bullet(
        "Trong 2 năm đầu, VivaArena đặt mục tiêu tiếp cận 40.000 - 60.000 sinh viên tại các cụm đại học lớn trọng điểm (Đà Nẵng, TP. Hồ Chí Minh, Hà Nội), hướng tới doanh thu ước tính 2.5 - 4 tỷ VNĐ/năm.",
        bold_prefix="• SOM (Serviceable Obtainable Market): "
    )

    add_h3("2.1.2. Xu hướng thị trường (Market Trends)")
    add_bullet("Chuyển dịch từ việc dùng AI để tìm kiếm thông tin đơn thuần sang việc ứng dụng AI để mô phỏng tình huống thực chiến (Simulation-based Learning) và rèn luyện kỹ năng phản xạ.", bold_prefix="• Sự bùng nổ của Generative AI trong Sư phạm: ")
    add_bullet("Các trường đại học và nhà tuyển dụng chuyển trọng tâm từ việc kiểm tra học vẹt sang đánh giá năng lực Tư duy phản biện (Critical Thinking) và Giao tiếp - Thuyết phục.", bold_prefix="• Chuẩn đầu ra chú trọng Kỹ năng thế kỷ 21: ")
    add_bullet("Sinh viên thế hệ Gen Z rất cởi mở và sẵn sàng chi trả từ 50.000đ đến 200.000đ cho các gói công cụ hỗ trợ thi cử, làm đồ án (Quizlet, Grammarly, ChatGPT Plus, Canva Edu).", bold_prefix="• Thói quen sẵn sàng chi trả cho các công cụ học tập số: ")

    add_h2("2.2. Phân khúc Khách hàng (Customer Segments)")
    add_h3("2.2.1. Khách hàng B2C (Khách hàng Cá nhân - Sinh viên)")
    add_bullet("Sinh viên năm 2 đến năm 4 các trường đại học; thí sinh tham gia các cuộc thi Khởi nghiệp, Nghiên cứu khoa học hoặc Tranh biện (Debate).", bold_prefix="• Chân dung: ")
    add_bullet("Có áp lực tâm lý cực lớn vào 2 mùa đồ án cao điểm trong năm (tháng 4-5 và tháng 11-12); thường thức đêm tìm kiếm câu hỏi phản biện mẫu trên mạng; thích trải nghiệm giọng nói nhanh gọn, có đánh giá ngay.", bold_prefix="• Hành vi: ")
    add_bullet("Cần biết giám khảo sẽ hỏi những gì dựa trên chính slide/khóa luận của mình; muốn biết cách trả lời chuẩn mực khi gặp câu hỏi hóc búa để đạt điểm A/A+ trước hội đồng.", bold_prefix="• Nhu cầu & Nỗi đau cốt lõi: ")

    add_h3("2.2.2. Khách hàng B2B (Khách hàng Tổ chức - Trường Đại học & Giảng viên)")
    add_bullet("Các trường Đại học (như Trường Đại học Sư phạm Kỹ thuật – ĐH Đà Nẵng, ĐH Bách Khoa,...), Ban Chủ nhiệm Khoa, Giảng viên phụ trách môn học có thi vấn đáp hoặc hướng dẫn đồ án; các Trung tâm Ngoại ngữ/Debate.", bold_prefix="• Chân dung: ")
    add_bullet("Giảng viên muốn sinh viên có ý thức tự rèn luyện trước khi gặp thầy cô; Khoa đào tạo muốn chuẩn hóa chất lượng bảo vệ khóa luận, giảm tỷ lệ trượt; cần nền tảng quản lý tập trung để tạo phòng thi thử tự động cho lớp học phần đông sinh viên (50 - 100 người) với chi phí thấp.", bold_prefix="• Nhu cầu: ")

    add_h2("2.3. Đối thủ Cạnh tranh (Competitor Analysis)")
    add_p(
        "Nhóm nghiên cứu phân tích môi trường cạnh tranh thông qua 3 nhóm giải pháp thay thế hiện có trên thị trường:"
    )

    # Competitor Table
    comp_tbl = doc.add_table(rows=5, cols=4)
    comp_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    comp_headers = ["Nhóm Giải Pháp", "Đối Thủ Điển Hình", "Họ Đang Làm Gì? (Ưu & Nhược điểm)", "VivaArena Khác Gì Họ? (Vị thế cạnh tranh)"]
    for idx, name in enumerate(comp_headers):
        cell = comp_tbl.cell(0, idx)
        cell.text = name
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 120, 120, 140, 140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(10.5)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)

    comp_data = [
        ("1. Diễn tập Truyền thống", "Bạn học cùng lớp, Giảng viên hướng dẫn đồ án", "• Ưu điểm: Tương tác người - người thật.\n• Nhược điểm: Giảng viên luôn quá tải thời gian; bạn bè nể nang, thiếu khách quan và thiếu chuyên môn sâu để hỏi xoáy.", "VivaArena là Hội đồng khách quan 24/7, không nể nang, sẵn sàng chất vấn bất kỳ lúc nào với chi phí gần như bằng 0."),
        ("2. Chatbot AI Tổng quát", "ChatGPT, Claude, Google Gemini Web", "• Ưu điểm: Xử lý ngôn ngữ tốt, phổ biến.\n• Nhược điểm: Đóng vai 'trợ lý phục vụ' (người dùng hỏi AI trả lời), hay nịnh hót xã giao, không soi lỗi ngụy biện, dễ bị ảo giác khi hỏi sâu.", "VivaArena chủ động hỏi ngược (Socratic), đọc hiểu trực tiếp khóa luận cá nhân qua RAG và chạy CoT 3 bước ngầm bắt bài lỗi vòng vo."),
        ("3. App Phân tích Nói", "ELSA Speak, Yoodli, Poised", "• Ưu điểm: Đo tốt phát âm, ngữ điệu, từ ngữ thừa.\n• Nhược điểm: Chỉ hỗ trợ tiếng Anh thuyết trình một chiều, hoàn toàn không hiểu tài liệu chuyên môn và không có tư duy phản biện.", "VivaArena tập trung vào chiều sâu tư duy logic và tính đúng đắn của học thuật, tương tác giọng nói tiếng Việt tự nhiên hai chiều."),
        ("4. Vị thế VivaArena", "Nền tảng VivaArena (Giải pháp của nhóm)", "Điểm giao thoa duy nhất giữa AI Đọc hiểu Tài liệu chuyên sâu (RAG) và Phương pháp Vấn đáp Socrates (Retrieval Practice).", "Định vị tại 'đại dương xanh': Giải pháp mô phỏng Hội đồng phản biện học thuật đầu tiên tại Việt Nam.")
    ]

    comp_widths = [Inches(1.5), Inches(1.3), Inches(2.3), Inches(2.1)]
    for r_idx, row_data in enumerate(comp_data):
        row = comp_tbl.rows[r_idx+1]
        bg = "EEF2FF" if r_idx == 3 else ("F8FAFC" if r_idx % 2 == 0 else "FFFFFF")
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.text = val
            cell.width = comp_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 90, 90, 110, 110)
            p = cell.paragraphs[0]
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(10)
            if c_idx == 0:
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(30, 58, 138)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    updated_copy = "f:/luu vao day di/DMST/DMST_VivaArena_Updated.docx"
    doc.save(updated_copy)
    print("Successfully created:", updated_copy)

if __name__ == "__main__":
    generate_updated_dmst()
