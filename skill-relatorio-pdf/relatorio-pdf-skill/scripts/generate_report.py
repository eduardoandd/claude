#!/usr/bin/env python3
"""
generate_report.py — Gerador de relatórios PDF com identidade visual Credify

Uso:
    python3 generate_report.py --content /tmp/relatorio_content.json --output /caminho/saida.pdf

O JSON de entrada deve seguir o schema descrito no SKILL.md da skill relatorio-pdf.
"""

import argparse
import json
import os
import sys
import io
import urllib.request
from datetime import datetime

# ---------------------------------------------------------------------------
# Dependências
# ---------------------------------------------------------------------------
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm, cm
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, PageBreak, KeepTogether
    )
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except ImportError:
    print("Instalando reportlab...")
    os.system("pip install reportlab --break-system-packages -q")
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm, cm
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, PageBreak, KeepTogether
    )
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

# ---------------------------------------------------------------------------
# Cores Credify
# ---------------------------------------------------------------------------
CREDIFY_RED       = colors.HexColor("#E71225")   # Vermelho Credify (primária / logo)
CREDIFY_DARK      = colors.HexColor("#1A1A2E")   # Quase Preto (headers, fundos escuros)
CREDIFY_TEAL      = colors.HexColor("#00B4D8")   # Azul Turquesa (secundária)
CREDIFY_DARK_TEXT = colors.HexColor("#1F2937")   # Cinza Escuro (texto principal)
CREDIFY_MED_TEXT  = colors.HexColor("#6B7280")   # Cinza Médio (texto secundário)
CREDIFY_LIGHT_BG  = colors.HexColor("#F3F4F6")   # Cinza Claro (fundos de cards)
CREDIFY_RED_LIGHT = colors.HexColor("#FFF0F1")   # Vermelho suave (fundos de alerta)
CREDIFY_WHITE     = colors.HexColor("#FFFFFF")

# Aliases semânticos para facilitar leitura
CREDIFY_NAVY      = CREDIFY_DARK    # usado em headers / fundos
CREDIFY_ACCENT    = CREDIFY_RED     # usado em destaques e alertas

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm

# ---------------------------------------------------------------------------
# Fontes
# ---------------------------------------------------------------------------
POPPINS_URLS = {
    "Poppins-Regular":    "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf",
    "Poppins-Bold":       "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf",
    "Poppins-SemiBold":   "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf",
    "Poppins-Medium":     "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Medium.ttf",
    "Poppins-Light":      "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Light.ttf",
}

FONT_DIR = "/tmp/poppins_fonts"
FONT_LOADED = False


def load_poppins():
    """Tenta carregar Poppins; em caso de falha, usa Helvetica."""
    global FONT_LOADED
    if FONT_LOADED:
        return True

    os.makedirs(FONT_DIR, exist_ok=True)
    success = True

    for name, url in POPPINS_URLS.items():
        path = os.path.join(FONT_DIR, f"{name}.ttf")
        if not os.path.exists(path):
            try:
                print(f"  Baixando {name}...")
                urllib.request.urlretrieve(url, path)
            except Exception as e:
                print(f"  Falha ao baixar {name}: {e}")
                success = False
                break

        if success:
            try:
                pdfmetrics.registerFont(TTFont(name, path))
            except Exception as e:
                print(f"  Falha ao registrar {name}: {e}")
                success = False
                break

    FONT_LOADED = success
    if not success:
        print("  Usando Helvetica como fallback.")
    return success


def font(variant="Regular"):
    """Retorna nome da fonte adequada."""
    mapping = {
        "Regular":  "Poppins-Regular",
        "Bold":     "Poppins-Bold",
        "SemiBold": "Poppins-SemiBold",
        "Medium":   "Poppins-Medium",
        "Light":    "Poppins-Light",
    }
    if FONT_LOADED:
        return mapping.get(variant, "Poppins-Regular")
    # Fallback Helvetica
    fallback = {
        "Regular":  "Helvetica",
        "Bold":     "Helvetica-Bold",
        "SemiBold": "Helvetica-Bold",
        "Medium":   "Helvetica",
        "Light":    "Helvetica",
    }
    return fallback.get(variant, "Helvetica")


# ---------------------------------------------------------------------------
# Estilos
# ---------------------------------------------------------------------------
def make_styles():
    return {
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName=font("Bold"),
            fontSize=28,
            textColor=CREDIFY_WHITE,
            leading=36,
            spaceAfter=8,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle",
            fontName=font("Light"),
            fontSize=14,
            textColor=colors.HexColor("#B8CCE8"),
            leading=20,
            spaceAfter=6,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta",
            fontName=font("Regular"),
            fontSize=10,
            textColor=colors.HexColor("#8EB3D6"),
            leading=16,
        ),
        "section_title": ParagraphStyle(
            "section_title",
            fontName=font("SemiBold"),
            fontSize=14,
            textColor=CREDIFY_NAVY,
            leading=20,
            spaceBefore=18,
            spaceAfter=8,
            borderPadding=(0, 0, 4, 0),
        ),
        "body": ParagraphStyle(
            "body",
            fontName=font("Regular"),
            fontSize=10,
            textColor=CREDIFY_DARK_TEXT,
            leading=16,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
        ),
        "body_bold": ParagraphStyle(
            "body_bold",
            fontName=font("SemiBold"),
            fontSize=10,
            textColor=CREDIFY_DARK_TEXT,
            leading=16,
            spaceAfter=4,
        ),
        "label": ParagraphStyle(
            "label",
            fontName=font("SemiBold"),
            fontSize=9,
            textColor=CREDIFY_TEAL,
            leading=14,
            spaceAfter=2,
        ),
        "metric_value": ParagraphStyle(
            "metric_value",
            fontName=font("Bold"),
            fontSize=20,
            textColor=CREDIFY_NAVY,
            leading=26,
            alignment=TA_CENTER,
        ),
        "metric_label": ParagraphStyle(
            "metric_label",
            fontName=font("Medium"),
            fontSize=9,
            textColor=CREDIFY_MED_TEXT,
            leading=14,
            alignment=TA_CENTER,
        ),
        "metric_desc": ParagraphStyle(
            "metric_desc",
            fontName=font("Regular"),
            fontSize=8,
            textColor=CREDIFY_MED_TEXT,
            leading=12,
            alignment=TA_CENTER,
        ),
        "highlight_title": ParagraphStyle(
            "highlight_title",
            fontName=font("SemiBold"),
            fontSize=11,
            textColor=CREDIFY_ACCENT,
            leading=16,
            spaceAfter=4,
        ),
        "highlight_body": ParagraphStyle(
            "highlight_body",
            fontName=font("Regular"),
            fontSize=10,
            textColor=CREDIFY_DARK_TEXT,
            leading=16,
        ),
        "list_item": ParagraphStyle(
            "list_item",
            fontName=font("Regular"),
            fontSize=10,
            textColor=CREDIFY_DARK_TEXT,
            leading=16,
            leftIndent=16,
            spaceAfter=4,
        ),
        "executive_summary": ParagraphStyle(
            "executive_summary",
            fontName=font("Regular"),
            fontSize=11,
            textColor=CREDIFY_DARK_TEXT,
            leading=18,
            spaceAfter=10,
            alignment=TA_JUSTIFY,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontName=font("Regular"),
            fontSize=8,
            textColor=CREDIFY_MED_TEXT,
            leading=12,
            alignment=TA_CENTER,
        ),
        "table_header": ParagraphStyle(
            "table_header",
            fontName=font("SemiBold"),
            fontSize=9,
            textColor=CREDIFY_WHITE,
            leading=14,
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            fontName=font("Regular"),
            fontSize=9,
            textColor=CREDIFY_DARK_TEXT,
            leading=14,
            alignment=TA_LEFT,
        ),
    }


# ---------------------------------------------------------------------------
# Helpers de layout
# ---------------------------------------------------------------------------
def section_divider(styles):
    """Linha divisória com cor vermelha Credify."""
    return HRFlowable(
        width="100%",
        thickness=2,
        color=CREDIFY_RED,
        spaceAfter=6,
        spaceBefore=2,
    )


def build_cover(content, styles):
    """Gera a página de capa como elementos platypus sobre fundo escuro."""
    # Capa via Table para simular fundo colorido
    titulo    = content.get("titulo", "Relatório")
    subtitulo = content.get("subtitulo", "")
    data      = content.get("data", datetime.now().strftime("%d de %B de %Y"))
    autor     = content.get("autor", "Credify")

    capa_content = [
        [Paragraph("", styles["cover_title"])],  # Espaçador
        [Paragraph("", styles["cover_title"])],
        [Paragraph("", styles["cover_title"])],
        [Paragraph(titulo, styles["cover_title"])],
        [Paragraph(subtitulo, styles["cover_subtitle"]) if subtitulo else Paragraph("", styles["cover_subtitle"])],
        [Spacer(1, 12)],
        [HRFlowable(width="40%", thickness=2, color=CREDIFY_RED, spaceAfter=10, spaceBefore=4)],
        [Paragraph(f"{autor}  ·  {data}", styles["cover_meta"])],
    ]

    cover_table = Table(
        capa_content,
        colWidths=[PAGE_W - 2 * MARGIN],
        rowHeights=None,
    )
    cover_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), CREDIFY_NAVY),
        ("TOPPADDING",   (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
        ("LEFTPADDING",  (0, 0), (-1, -1), 24),
        ("RIGHTPADDING", (0, 0), (-1, -1), 24),
        ("ROUNDEDCORNERS", [8]),
    ]))

    return [cover_table, Spacer(1, 20)]


def build_sumario(sumario, styles):
    """Bloco de sumário executivo com fundo sutil."""
    if not sumario:
        return []

    rows = [
        [Paragraph("SUMÁRIO EXECUTIVO", styles["label"])],
        [Paragraph(sumario, styles["executive_summary"])],
    ]
    t = Table(rows, colWidths=[PAGE_W - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), CREDIFY_LIGHT_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
        ("ROUNDEDCORNERS", [6]),
    ]))
    return [t, Spacer(1, 16)]


def build_metricas(secao, styles):
    """Cards de métricas lado a lado."""
    itens = secao.get("itens", [])
    if not itens:
        return []

    story = [
        Paragraph(secao.get("titulo", "Indicadores"), styles["section_title"]),
        section_divider(styles),
    ]

    # Distribuir em grupos de 3
    for i in range(0, len(itens), 3):
        grupo = itens[i:i+3]
        card_cells = []
        for item in grupo:
            cell_content = [
                Paragraph(str(item.get("valor", "")), styles["metric_value"]),
                Paragraph(item.get("label", ""), styles["metric_label"]),
            ]
            if item.get("descricao"):
                cell_content.append(Paragraph(item["descricao"], styles["metric_desc"]))
            card_cells.append(cell_content)

        # Preenche colunas vazias se grupo < 3
        while len(card_cells) < 3:
            card_cells.append([Paragraph("", styles["metric_value"])])

        col_width = (PAGE_W - 2 * MARGIN - 16) / 3
        metric_table = Table(
            [card_cells],
            colWidths=[col_width] * 3,
            rowHeights=None,
        )
        metric_table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), CREDIFY_LIGHT_BG),
            ("TOPPADDING",    (0, 0), (-1, -1), 16),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ("LINEAFTER",     (0, 0), (1, -1), 1, CREDIFY_WHITE),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("ROUNDEDCORNERS", [6]),
        ]))
        story.append(metric_table)
        story.append(Spacer(1, 8))

    return story


def build_tabela(secao, styles):
    """Tabela com cabeçalho escuro e linhas alternadas."""
    cabecalho = secao.get("cabecalho", [])
    linhas    = secao.get("linhas", [])
    titulo    = secao.get("titulo", "")

    if not cabecalho and not linhas:
        return []

    story = []
    if titulo:
        story += [
            Paragraph(titulo, styles["section_title"]),
            section_divider(styles),
        ]

    header_row = [Paragraph(str(c), styles["table_header"]) for c in cabecalho]
    data_rows  = [[Paragraph(str(cell), styles["table_cell"]) for cell in row] for row in linhas]
    all_rows   = [header_row] + data_rows if header_row else data_rows

    n_cols     = len(cabecalho) if cabecalho else (len(linhas[0]) if linhas else 1)
    col_width  = (PAGE_W - 2 * MARGIN) / n_cols

    t = Table(all_rows, colWidths=[col_width] * n_cols, repeatRows=1 if header_row else 0)

    ts = [
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]

    if header_row:
        ts += [
            ("BACKGROUND", (0, 0), (-1, 0), CREDIFY_NAVY),
            ("TEXTCOLOR",  (0, 0), (-1, 0), CREDIFY_WHITE),
        ]
        # Linhas alternadas
        for idx in range(1, len(data_rows) + 1):
            if idx % 2 == 0:
                ts.append(("BACKGROUND", (0, idx), (-1, idx), CREDIFY_LIGHT_BG))

    t.setStyle(TableStyle(ts))
    story.append(t)
    story.append(Spacer(1, 12))
    return story


def build_texto(secao, styles):
    """Seção de texto simples."""
    story = []
    titulo   = secao.get("titulo", "")
    conteudo = secao.get("conteudo", "")

    if titulo:
        story += [
            Paragraph(titulo, styles["section_title"]),
            section_divider(styles),
        ]
    if conteudo:
        # Suporta quebras de linha via \n
        for paragrafo in conteudo.split("\n\n"):
            paragrafo = paragrafo.strip()
            if paragrafo:
                story.append(Paragraph(paragrafo.replace("\n", "<br/>"), styles["body"]))
    return story


def build_lista(secao, styles):
    """Lista com marcadores turquesa."""
    titulo = secao.get("titulo", "")
    itens  = secao.get("itens", [])

    story = []
    if titulo:
        story += [
            Paragraph(titulo, styles["section_title"]),
            section_divider(styles),
        ]
    for item in itens:
        story.append(Paragraph(f'<font color="#E71225">▸</font>  {item}', styles["list_item"]))
    story.append(Spacer(1, 8))
    return story


def build_destaque(secao, styles):
    """Bloco de destaque com borda laranja — para alertas e informações críticas."""
    titulo   = secao.get("titulo", "")
    conteudo = secao.get("conteudo", "")

    rows = []
    if titulo:
        rows.append([Paragraph(titulo, styles["highlight_title"])])
    if conteudo:
        rows.append([Paragraph(conteudo, styles["highlight_body"])])

    if not rows:
        return []

    t = Table(rows, colWidths=[PAGE_W - 2 * MARGIN - 24])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), CREDIFY_RED_LIGHT),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
        ("LINEBEFORE",    (0, 0), (0, -1), 4, CREDIFY_RED),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return [t, Spacer(1, 12)]


def build_conclusao(conclusao, styles):
    """Seção de conclusão com fundo marinho."""
    if not conclusao:
        return []

    rows = [
        [Paragraph("CONCLUSÃO", ParagraphStyle(
            "conc_label", fontName=font("SemiBold"), fontSize=9,
            textColor=CREDIFY_TEAL, leading=14
        ))],
        [Paragraph(conclusao, ParagraphStyle(
            "conc_body", fontName=font("Regular"), fontSize=10,
            textColor=CREDIFY_WHITE, leading=16, alignment=TA_JUSTIFY
        ))],
    ]

    t = Table(rows, colWidths=[PAGE_W - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), CREDIFY_NAVY),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
        ("ROUNDEDCORNERS", [8]),
    ]))
    return [Spacer(1, 20), t]


# ---------------------------------------------------------------------------
# Header/Footer de página (callbacks para SimpleDocTemplate)
# ---------------------------------------------------------------------------
def _draw_page_decorations(canvas, doc):
    """Desenha header e footer em todas as páginas (exceto capa)."""
    w, h = A4
    page_num = canvas.getPageNumber()

    # Não desenha na capa (página 1)
    if page_num == 1:
        return

    canvas.saveState()

    # ---- HEADER ----
    canvas.setFillColor(CREDIFY_NAVY)
    canvas.rect(0, h - 18 * mm, w, 18 * mm, fill=1, stroke=0)

    canvas.setFont(font("SemiBold"), 9)
    canvas.setFillColor(CREDIFY_WHITE)
    canvas.drawString(MARGIN, h - 11 * mm, doc.titulo_relatorio)

    canvas.setFont(font("Bold"), 9)
    canvas.setFillColor(CREDIFY_RED)
    credify_x = w - MARGIN - canvas.stringWidth("CREDIFY", font("Bold"), 9)
    canvas.drawString(credify_x, h - 11 * mm, "CREDIFY")

    canvas.setStrokeColor(CREDIFY_RED)
    canvas.setLineWidth(2)
    canvas.line(0, h - 18 * mm, w, h - 18 * mm)

    # ---- FOOTER ----
    canvas.setFillColor(CREDIFY_LIGHT_BG)
    canvas.rect(0, 0, w, 14 * mm, fill=1, stroke=0)

    canvas.setStrokeColor(colors.HexColor("#E5E7EB"))
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 14 * mm, w - MARGIN, 14 * mm)

    canvas.setFont(font("Regular"), 8)
    canvas.setFillColor(CREDIFY_MED_TEXT)
    canvas.drawString(MARGIN, 5 * mm, doc.rodape_texto)
    canvas.drawRightString(w - MARGIN, 5 * mm, f"Página {page_num}")

    canvas.restoreState()


class CredifyDocTemplate(SimpleDocTemplate):
    """Template com header e footer personalizados Credify."""

    def __init__(self, filename, titulo="Relatório", rodape="Credify", **kwargs):
        super().__init__(filename, **kwargs)
        self.titulo_relatorio = titulo
        self.rodape_texto = rodape


# ---------------------------------------------------------------------------
# Gerador principal
# ---------------------------------------------------------------------------
def gerar_pdf(content: dict, output_path: str):
    load_poppins()
    styles = make_styles()

    titulo  = content.get("titulo", "Relatório")
    rodape  = content.get("rodape", f"Credify  ·  {datetime.now().strftime('%d/%m/%Y')}")

    doc = CredifyDocTemplate(
        output_path,
        titulo=titulo,
        rodape=rodape,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=2.4 * cm,
        bottomMargin=2 * cm,
        onFirstPage=_draw_page_decorations,
        onLaterPages=_draw_page_decorations,
    )

    story = []

    # Capa
    story += build_cover(content, styles)
    story.append(PageBreak())

    # Sumário executivo
    if content.get("sumario_executivo"):
        story += build_sumario(content["sumario_executivo"], styles)

    # Seções dinâmicas
    for secao in content.get("secoes", []):
        tipo = secao.get("tipo", "texto")

        if tipo == "texto":
            story += build_texto(secao, styles)
        elif tipo == "metricas":
            story += build_metricas(secao, styles)
        elif tipo == "tabela":
            story += build_tabela(secao, styles)
        elif tipo == "lista":
            story += build_lista(secao, styles)
        elif tipo == "destaque":
            story += build_destaque(secao, styles)
        else:
            # Tipo desconhecido — trata como texto
            story += build_texto(secao, styles)

        story.append(Spacer(1, 6))

    # Conclusão
    if content.get("conclusao"):
        story += build_conclusao(content["conclusao"], styles)

    doc.build(story)
    print(f"✅ PDF gerado em: {output_path}")
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gera relatório PDF com identidade visual Credify")
    parser.add_argument("--content", required=True, help="Caminho para o JSON de conteúdo")
    parser.add_argument("--output",  required=True, help="Caminho de saída do PDF")
    args = parser.parse_args()

    with open(args.content, "r", encoding="utf-8") as f:
        content = json.load(f)

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    gerar_pdf(content, args.output)
