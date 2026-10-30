import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

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

def create_dmst_sections():
    src_path = "f:/luu vao day di/DMST/DMST.docx"
    doc = docx.Document(src_path)

    # Fill in Title on cover page if blank
    for p in doc.paragraphs[:15]:
        if p.text.strip() == "ĐỀ TÀI:":
            p.text = "ĐỀ TÀI: EDUTECH – VIVAARENA\nNỀN TẢNG MÔ PHỎNG HỘI ĐỒNG PHẢN BIỆN VÀ ĐÁNH GIÁ TƯ DUY LOGIC CHO SINH VIÊN BẰNG TRÍ TUỆ NHÂN TẠO"
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.bold = True
                r.font.size = Pt(13)
                r.font.color.rgb = RGBColor(30, 58, 138)

    # Save to a fresh copy so we don't accidentally corrupt original
    out_path = "f:/luu vao day di/DMST/DMST_VivaArena_Updated.docx"
    doc.save(out_path)
    print("Base file saved to:", out_path)

if __name__ == "__main__":
    create_dmst_sections()
