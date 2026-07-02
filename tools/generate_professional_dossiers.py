from pathlib import Path
from textwrap import wrap

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO = ROOT / "portfolio"
ASSETS = ROOT / "assets"

BLUE = colors.HexColor("#243f50")
BLUE_SOFT = colors.HexColor("#dce8eb")
GOLD = colors.HexColor("#c9a857")
INK = colors.HexColor("#172032")
MUTED = colors.HexColor("#667386")
IVORY = colors.HexColor("#fbf7ee")
LINE = colors.HexColor("#d7e0e4")


def register_fonts():
    font_dir = Path("C:/Windows/Fonts")
    candidates = {
        "ScriptSans": font_dir / "segoeui.ttf",
        "ScriptSansBold": font_dir / "segoeuib.ttf",
        "ScriptSerif": font_dir / "times.ttf",
        "ScriptSerifBold": font_dir / "timesbd.ttf",
        "ScriptCJK": font_dir / "NotoSerifSC-VF.ttf",
    }
    for name, path in candidates.items():
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))


def styles():
    register_fonts()
    base = getSampleStyleSheet()
    base.add(
        ParagraphStyle(
            name="CoverKicker",
            fontName="ScriptSansBold",
            fontSize=9,
            leading=12,
            textColor=GOLD,
            uppercase=True,
            spaceAfter=14,
        )
    )
    base.add(
        ParagraphStyle(
            name="CoverTitle",
            fontName="ScriptSerifBold",
            fontSize=30,
            leading=34,
            textColor=BLUE,
            spaceAfter=10,
        )
    )
    base.add(
        ParagraphStyle(
            name="Subtitle",
            fontName="ScriptSans",
            fontSize=11,
            leading=17,
            textColor=MUTED,
            spaceAfter=18,
        )
    )
    base.add(
        ParagraphStyle(
            name="SectionTitle",
            fontName="ScriptSerifBold",
            fontSize=18,
            leading=22,
            textColor=INK,
            spaceBefore=14,
            spaceAfter=8,
        )
    )
    base.add(
        ParagraphStyle(
            name="Body",
            fontName="ScriptSans",
            fontSize=9.5,
            leading=14.5,
            textColor=INK,
            spaceAfter=8,
        )
    )
    base.add(
        ParagraphStyle(
            name="Small",
            fontName="ScriptSans",
            fontSize=8,
            leading=11,
            textColor=MUTED,
        )
    )
    base.add(
        ParagraphStyle(
            name="CJK",
            fontName="ScriptCJK",
            fontSize=9.5,
            leading=14.5,
            textColor=INK,
            spaceAfter=8,
        )
    )
    return base


def header_footer(canvas, doc, title):
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(BLUE)
    canvas.setFont("ScriptSerifBold", 11)
    canvas.drawString(0.72 * inch, height - 0.5 * inch, "Scriptorium")
    canvas.setFillColor(MUTED)
    canvas.setFont("ScriptSans", 7.5)
    canvas.drawRightString(width - 0.72 * inch, height - 0.5 * inch, title)
    canvas.setStrokeColor(LINE)
    canvas.line(0.72 * inch, height - 0.62 * inch, width - 0.72 * inch, height - 0.62 * inch)
    canvas.setFillColor(MUTED)
    canvas.setFont("ScriptSans", 7.5)
    canvas.drawString(0.72 * inch, 0.45 * inch, "Professional sample dossier - non-certified language and documentation work")
    canvas.drawRightString(width - 0.72 * inch, 0.45 * inch, str(doc.page))
    canvas.restoreState()


def make_table(data, widths, header=True):
    body_style = ParagraphStyle(
        name="TableBody",
        fontName="ScriptSans",
        fontSize=8.6,
        leading=11.5,
        textColor=INK,
    )
    head_style = ParagraphStyle(
        name="TableHead",
        fontName="ScriptSansBold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )
    prepared = []
    for row_index, row in enumerate(data):
        prepared.append(
            [
                Paragraph(str(cell), head_style if header and row_index == 0 else body_style)
                for cell in row
            ]
        )
    table = Table(prepared, colWidths=widths, hAlign="LEFT")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]
    if header:
        commands.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "ScriptSansBold"),
            ]
        )
    table.setStyle(TableStyle(commands))
    return table


def para(text, style):
    return Paragraph(text, style)


def cover(story, st, kicker, title, subtitle, meta_rows):
    story.append(Spacer(1, 0.45 * inch))
    story.append(para(kicker, st["CoverKicker"]))
    story.append(para(title, st["CoverTitle"]))
    story.append(para(subtitle, st["Subtitle"]))
    story.append(Spacer(1, 0.14 * inch))
    story.append(make_table(meta_rows, [1.6 * inch, 4.4 * inch], header=False))
    story.append(Spacer(1, 0.25 * inch))
    story.append(
        para(
            "Prepared as a polished portfolio sample. The text demonstrates scope definition, "
            "editorial judgment, terminology control and multilingual presentation. It is not a "
            "sworn translation, legal opinion, medical advice or academic guarantee.",
            st["Small"],
        )
    )
    story.append(PageBreak())


def build_pdf(filename, title, story_builder):
    st = styles()
    path = PORTFOLIO / filename
    doc = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        rightMargin=0.72 * inch,
        leftMargin=0.72 * inch,
        topMargin=0.86 * inch,
        bottomMargin=0.75 * inch,
        title=title,
        author="Scriptorium",
        subject="Professional language services portfolio sample",
    )
    story = []
    story_builder(story, st)
    doc.build(story, onFirstPage=lambda c, d: header_footer(c, d, title), onLaterPages=lambda c, d: header_footer(c, d, title))
    return path


def research_dossier(story, st):
    cover(
        story,
        st,
        "Research Translation Dossier",
        "Language Access and Digital Trust",
        "A compact multilingual research-style sample for academic, business and public-information translation.",
        [
            ["Document type", "Research brief with multilingual translation extracts"],
            ["Working languages", "Spanish, English, German, French, Portuguese, Italian, Chinese, Japanese, Hebrew and Arabic"],
            ["Deliverable model", "Edited source text, translated abstracts, terminology table, QA notes"],
            ["Professional limit", "Portfolio sample; not a published study or certified translation"],
        ],
    )
    story.append(para("Executive Abstract", st["SectionTitle"]))
    story.append(
        para(
            "Clear language access improves trust when a service asks users to share personal, academic or professional information. "
            "This sample brief presents a research-style argument: multilingual pages should not merely translate words, but preserve "
            "tone, consent, expectations and document hierarchy across cultures.",
            st["Body"],
        )
    )
    story.append(
        para(
            "The sample demonstrates a workflow for Scriptorium: source review, terminology control, audience adaptation, localized "
            "summary and final quality notes. It is intentionally concise so clients can inspect the method quickly.",
            st["Body"],
        )
    )
    story.append(para("Terminology Control", st["SectionTitle"]))
    story.append(
        make_table(
            [
                ["Term", "Recommended Spanish", "Usage note"],
                ["language access", "acceso lingüístico", "Use in service and public-information contexts."],
                ["informed consent", "consentimiento informado", "Preserve legal/ethical seriousness; avoid casual wording."],
                ["delivery scope", "alcance de entrega", "Define what is included before project approval."],
                ["revision round", "ronda de revisión", "Separate agreed revision from new scope."],
            ],
            [1.55 * inch, 1.75 * inch, 2.7 * inch],
        )
    )
    story.append(para("Multilingual Extracts", st["SectionTitle"]))
    rows = [
        ["EN", "A multilingual service page must explain scope, privacy and delivery expectations before the client shares sensitive files."],
        ["ES", "Una página de servicios multilingüe debe explicar alcance, privacidad y expectativas de entrega antes de que el cliente comparta archivos sensibles."],
        ["DE", "Eine mehrsprachige Serviceseite sollte Umfang, Datenschutz und Liefererwartungen klären, bevor vertrauliche Dateien geteilt werden."],
        ["FR", "Une page de service multilingue doit préciser la portée, la confidentialité et les attentes de livraison avant tout partage de fichiers sensibles."],
        ["PT", "Uma página de serviços multilíngue deve explicar escopo, privacidade e expectativas de entrega antes do envio de arquivos sensíveis."],
        ["IT", "Una pagina di servizi multilingue deve chiarire ambito, privacy e consegna prima della condivisione di file sensibili."],
    ]
    story.append(make_table(rows, [0.6 * inch, 5.4 * inch], header=False))
    story.append(Spacer(1, 0.12 * inch))
    story.append(para("CJK / RTL Display Check", st["SectionTitle"]))
    story.append(para("ZH: 多语言服务页面应在客户分享敏感文件之前说明范围、隐私和交付预期。", st["CJK"]))
    story.append(para("JA: 多言語サービスページでは、機密ファイルを共有する前に範囲、プライバシー、納品条件を明確にする必要があります。", st["CJK"]))
    story.append(para("HE: דף שירות רב-לשוני צריך להבהיר היקף, פרטיות וציפיות מסירה לפני שיתוף קבצים רגישים.", st["Body"]))
    story.append(para("AR: يجب أن توضح صفحة الخدمة متعددة اللغات النطاق والخصوصية وتوقعات التسليم قبل مشاركة الملفات الحساسة.", st["Body"]))
    story.append(para("Quality Notes", st["SectionTitle"]))
    story.append(
        para(
            "A professional translation sample should show decisions, not only final wording. The visible indicators are: terminology consistency, "
            "short sentences for service clarity, preserved hierarchy, client-safety language and explicit limits for sensitive materials.",
            st["Body"],
        )
    )


def ancient_dossier(story, st):
    cover(
        story,
        st,
        "Ancient Language Annotation Dossier",
        "Classical Texts, Scripts and Transliteration",
        "A portfolio sample for educational annotation, transliteration and historical-language presentation.",
        [
            ["Document type", "Annotated historical-language sample"],
            ["Areas covered", "Latin, Ancient Greek, Biblical Hebrew, Sanskrit and runic notation"],
            ["Deliverable model", "Transliteration, translation, note, context and uncertainty markers"],
            ["Professional limit", "Educational and documentary work; not religious, legal or academic authority"],
        ],
    )
    story.append(para("Editorial Method", st["SectionTitle"]))
    story.append(
        para(
            "Ancient-language work needs humility and structure. A credible sample separates the original form, transliteration, literal meaning, "
            "reader-friendly translation and contextual note. This avoids pretending that complex texts can be reduced to a decorative symbol.",
            st["Body"],
        )
    )
    story.append(para("Annotated Sample Table", st["SectionTitle"]))
    story.append(
        make_table(
            [
                ["Language", "Text", "Transliteration", "Working note"],
                ["Latin", "Vita brevis, ars longa.", "vita brevis, ars longa", "A concise aphoristic structure; useful for motto and cultural commentary."],
                ["Ancient Greek", "gnothi seauton", "gnothi seauton", "Imperative phrase; often translated as Know yourself. Original script can be supplied after font/source review."],
                ["Biblical Hebrew", "shalom", "shalom", "Peace, wholeness or wellbeing depending on context. Direction and pointing are reviewed separately."],
                ["Sanskrit", "dharma", "dharma", "Duty, order, law or teaching; original Devanagari or IAST form depends on the selected transliteration system."],
            ],
            [0.8 * inch, 1.2 * inch, 1.35 * inch, 2.65 * inch],
        )
    )
    story.append(para("Client-Facing Notes", st["SectionTitle"]))
    for item in [
        "Decorative scripts should be checked before use in logos, tattoos, publications or ceremonial materials.",
        "Transliteration systems must be named when precision matters, especially for Sanskrit, Arabic and Hebrew.",
        "If a source is sacred, legal or culturally sensitive, Scriptorium should define the purpose of the work before accepting it.",
    ]:
        story.append(para(f"- {item}", st["Body"]))
    story.append(para("Sample Deliverable", st["SectionTitle"]))
    story.append(
        para(
            "Final files can include a clean PDF, source notes, a glossary, alternative translations and a short explanation of uncertainty. "
            "This is more professional than presenting a single exotic-looking phrase without context.",
            st["Body"],
        )
    )


def agreement_dossier(story, st):
    cover(
        story,
        st,
        "Service Agreement Dossier",
        "Translation and Documentation Scope",
        "A client-ready contract model for language-service projects, revisions and confidentiality.",
        [
            ["Document type", "Service agreement template"],
            ["Use case", "Translation, localization, editing, publication support and study materials"],
            ["Core value", "Defines scope before files are shared or work begins"],
            ["Professional limit", "Template language only; not legal advice"],
        ],
    )
    story.append(para("Recommended Scope Clause", st["SectionTitle"]))
    story.append(
        para(
            "Scriptorium will provide language and documentation services according to the agreed language pair, document type, word count, "
            "file format, delivery date and revision terms. Any additional language pair, urgent delivery, formatting reconstruction or "
            "confidential handling must be confirmed before work begins.",
            st["Body"],
        )
    )
    story.append(para("Project Intake Checklist", st["SectionTitle"]))
    story.append(
        make_table(
            [
                ["Item", "Client provides", "Scriptorium confirms"],
                ["Language pair", "Source and target language", "Service level and feasibility"],
                ["Document type", "Field, purpose and file format", "Scope, limits and delivery format"],
                ["Deadline", "Preferred delivery date", "Standard or urgent handling"],
                ["Revision", "Expected review needs", "Included rounds and extra-scope rules"],
                ["Confidentiality", "Sensitivity level", "Handling method before file transfer"],
            ],
            [1.15 * inch, 2.2 * inch, 2.65 * inch],
        )
    )
    story.append(para("Professional Boundaries", st["SectionTitle"]))
    story.append(
        para(
            "This agreement model clarifies that Scriptorium provides language work, documentation and educational support. It does not replace "
            "a sworn translator, lawyer, physician, clinical provider or academic committee. Sensitive files should be shared only after a written "
            "scope and confidentiality expectation are agreed.",
            st["Body"],
        )
    )
    story.append(para("Revision Model", st["SectionTitle"]))
    story.append(
        para(
            "One revision round can cover terminology correction, minor tone adjustment and formatting issues within the original scope. New text, "
            "new files, new target languages or substantial rewrites should be quoted separately.",
            st["Body"],
        )
    )


def main():
    PORTFOLIO.mkdir(exist_ok=True)
    ASSETS.mkdir(exist_ok=True)
    outputs = [
        build_pdf("scriptorium-research-dossier.pdf", "Language Access and Digital Trust", research_dossier),
        build_pdf("scriptorium-ancient-language-dossier.pdf", "Classical Texts, Scripts and Transliteration", ancient_dossier),
        build_pdf("scriptorium-service-agreement-dossier.pdf", "Translation and Documentation Scope", agreement_dossier),
    ]
    for path in outputs:
        print(path)


if __name__ == "__main__":
    main()
