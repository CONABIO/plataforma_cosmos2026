import os
import uuid
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable
from app.core.config import settings

os.makedirs(settings.PDF_OUTPUT_DIR, exist_ok=True)

# Colores de marca CoSMoS / CONABIO
VERDE_OSCURO = colors.HexColor("#1F3D2B")
VERDE_MEDIO = colors.HexColor("#3E6B4F")
VERDE_CLARO = colors.HexColor("#D6E3DA")
OCRE = colors.HexColor("#B6622B")
ARENA = colors.HexColor("#EFE7D8")
GRIS_TEXTO = colors.HexColor("#333333")
GRIS_CLARO = colors.HexColor("#F4F7F4")
BLANCO = colors.white

LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "logo_conabio.png")

ETIQUETAS_TEMA = {
    "prevencion_incendios_forestales": "Prevención de incendios forestales",
    "fauna_silvestre_convivencia_responsable": "Fauna silvestre y convivencia responsable",
    "importancia_cuidado_agua": "Importancia y cuidado del agua",
    "servicios_ecosistemicos": "Servicios ecosistémicos",
    "especies_invasoras": "Especies invasoras",
    "turismo_responsable": "Turismo responsable",
    "restauracion_ecologica": "Restauración ecológica",
}

ETIQUETAS_EDAD = {
    "infantil_4_7": "Infantil (4–7 años)",
    "ninez_8_12": "Niñez (8–12 años)",
    "adolescentes_13_17": "Adolescentes (13–17 años)",
    "adultos_18_mas": "Adultos (18+ años)",
    "todas_las_edades": "Todas las edades",
}


def _build_styles():
    estilos = {}

    estilos["titulo"] = ParagraphStyle(
        "titulo",
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=VERDE_OSCURO,
        spaceAfter=6,
        leading=22,
        alignment=TA_LEFT,
    )
    estilos["subtitulo"] = ParagraphStyle(
        "subtitulo",
        fontName="Helvetica",
        fontSize=10,
        textColor=OCRE,
        spaceAfter=4,
        leading=14,
        alignment=TA_LEFT,
    )
    estilos["seccion"] = ParagraphStyle(
        "seccion",
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=BLANCO,
        spaceAfter=0,
        leading=16,
        alignment=TA_LEFT,
    )
    estilos["subseccion"] = ParagraphStyle(
        "subseccion",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=VERDE_OSCURO,
        spaceBefore=8,
        spaceAfter=4,
        leading=14,
        alignment=TA_LEFT,
    )
    estilos["etapa"] = ParagraphStyle(
        "etapa",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=BLANCO,
        spaceAfter=0,
        leading=15,
        alignment=TA_LEFT,
    )
    estilos["cuerpo"] = ParagraphStyle(
        "cuerpo",
        fontName="Helvetica",
        fontSize=9.5,
        textColor=GRIS_TEXTO,
        spaceAfter=4,
        leading=14,
        alignment=TA_JUSTIFY,
    )
    estilos["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=9.5,
        textColor=GRIS_TEXTO,
        spaceAfter=3,
        leading=13,
        leftIndent=12,
        bulletIndent=0,
        alignment=TA_LEFT,
    )
    estilos["pie"] = ParagraphStyle(
        "pie",
        fontName="Helvetica-Oblique",
        fontSize=8,
        textColor=colors.grey,
        leading=10,
        alignment=TA_CENTER,
    )
    estilos["dato"] = ParagraphStyle(
        "dato",
        fontName="Helvetica",
        fontSize=9,
        textColor=GRIS_TEXTO,
        spaceAfter=2,
        leading=12,
    )
    return estilos


def _header_seccion(texto, estilos, color_fondo=None):
    """Retorna una tabla con fondo de color para encabezados de sección."""
    if color_fondo is None:
        color_fondo = VERDE_OSCURO
    tabla = Table(
        [[Paragraph(texto, estilos["seccion"])]],
        colWidths=[17.5 * cm],
    )
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color_fondo),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [color_fondo]),
    ]))
    return tabla


def _header_etapa(texto, estilos):
    """Encabezado de etapa (5E) en color ocre."""
    tabla = Table(
        [[Paragraph(texto, estilos["etapa"])]],
        colWidths=[17.5 * cm],
    )
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), OCRE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return tabla


def _tabla_markdown(lineas_tabla: list, estilos: dict):
    """Convierte una tabla markdown (| col | col |) en una Table de ReportLab."""
    filas_rl = []
    for i, linea in enumerate(lineas_tabla):
        if re.match(r"^\s*\|[-\s|]+\|\s*$", linea):
            continue  # Saltar línea separadora
        celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
        estilo = "Helvetica-Bold" if i == 0 else "Helvetica"
        color_fondo = VERDE_OSCURO if i == 0 else (GRIS_CLARO if i % 2 == 0 else colors.white)
        color_texto = BLANCO if i == 0 else GRIS_TEXTO
        fila_rl = [
            Paragraph(c, ParagraphStyle(f"td{i}", fontName=estilo, fontSize=9,
                                         textColor=color_texto, leading=12))
            for c in celdas
        ]
        filas_rl.append((fila_rl, color_fondo))

    if not filas_rl:
        return None

    n_cols = max(len(f[0]) for f in filas_rl)
    ancho_col = 17.5 * cm / n_cols

    tabla = Table(
        [f[0] for f in filas_rl],
        colWidths=[ancho_col] * n_cols,
    )
    style_cmds = [
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.5, VERDE_CLARO),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    for i, (_, color_fondo) in enumerate(filas_rl):
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), color_fondo))
    tabla.setStyle(TableStyle(style_cmds))
    return tabla


def _parsear_contenido(contenido: str, estilos: dict) -> list:
    """
    Convierte el texto Markdown-like generado por la IA en elementos de ReportLab.
    Detecta encabezados de sección, etapas del 5E, listas y párrafos.
    """
    elementos = []
    # Limpiar etiquetas HTML mal formadas que genera el modelo de IA
    contenido = contenido.replace('<b>', '').replace('</b>', '')
    contenido = contenido.replace('<i>', '').replace('</i>', '')
    contenido = contenido.replace('<strong>', '').replace('</strong>', '')
    contenido = contenido.replace('<em>', '').replace('</em>', '')
    lineas = contenido.split("\n")
    i = 0

    etapas_5e = ["ENGANCHAR", "EXPLORAR", "EXPLICAR", "ELABORAR", "EVALUAR"]

    while i < len(lineas):
        linea = lineas[i].rstrip()
        linea_upper = linea.upper().strip()

        # Línea vacía
        if not linea.strip():
            elementos.append(Spacer(1, 0.2 * cm))
            i += 1
            continue

        # Tabla markdown (| col | col |)
        if linea.strip().startswith("|"):
            tabla_lineas = []
            while i < len(lineas) and lineas[i].strip().startswith("|"):
                tabla_lineas.append(lineas[i])
                i += 1
            tabla_rl = _tabla_markdown(tabla_lineas, estilos)
            if tabla_rl:
                elementos.append(Spacer(1, 0.2 * cm))
                elementos.append(tabla_rl)
                elementos.append(Spacer(1, 0.2 * cm))
            continue

        # Detectar encabezados de ETAPA del 5E (ej: "1. ENGANCHAR", "ENGANCHAR")
        es_etapa = False
        for etapa in etapas_5e:
            if etapa in linea_upper and (linea.strip().startswith("#") or
               re.match(r"^\d+[\.\)]\s+", linea.strip()) or
               linea.strip().upper().startswith(etapa)):
                # Limpiar el texto
                texto_etapa = re.sub(r"^#+\s*", "", linea).strip()
                texto_etapa = re.sub(r"^\d+[\.\)]\s*", "", texto_etapa).strip()
                texto_etapa = texto_etapa.replace("**", "").replace("*", "")
                elementos.append(Spacer(1, 0.3 * cm))
                elementos.append(_header_etapa(texto_etapa, estilos))
                es_etapa = True
                break
        if es_etapa:
            i += 1
            continue

        # Encabezados de sección con # o TODO MAYÚSCULAS largo
        if linea.strip().startswith("#"):
            nivel = len(linea) - len(linea.lstrip("#"))
            texto = linea.strip("#").strip().replace("**", "").replace("*", "")
            if nivel == 1:
                elementos.append(Spacer(1, 0.4 * cm))
                elementos.append(_header_seccion(texto, estilos))
            elif nivel == 2:
                elementos.append(Spacer(1, 0.3 * cm))
                elementos.append(_header_seccion(texto, estilos, VERDE_MEDIO))
            else:
                elementos.append(Paragraph(texto, estilos["subseccion"]))
            i += 1
            continue

        # Líneas que parecen encabezados de sección (TODO MAYÚSCULAS, sin #)
        texto_limpio = linea.strip().replace("**", "").replace("*", "")
        es_encabezado_mayus = (
            len(texto_limpio) > 4 and
            len(texto_limpio) < 80 and
            texto_limpio == texto_limpio.upper() and
            not texto_limpio.startswith("-") and
            not texto_limpio.startswith("•")
        )
        if es_encabezado_mayus:
            elementos.append(Spacer(1, 0.3 * cm))
            elementos.append(_header_seccion(texto_limpio, estilos))
            i += 1
            continue

        # Bullet points (-, •, *)
        if re.match(r"^[\s]*[-•\*]\s+", linea):
            texto_bullet = re.sub(r"^[\s]*[-•\*]\s+", "", linea).strip()
            texto_bullet = re.sub(r"\*\*(.+?)\*\*", r"\1", texto_bullet)
            elementos.append(Paragraph(f"• {texto_bullet}", estilos["bullet"]))
            i += 1
            continue

        # Listas numeradas
        if re.match(r"^[\s]*\d+[\.\)]\s+", linea):
            num = re.match(r"^[\s]*(\d+)[\.\)]\s+", linea).group(1)
            texto_num = re.sub(r"^[\s]*\d+[\.\)]\s+", "", linea).strip()
            texto_num = re.sub(r"\*\*(.+?)\*\*", r"\1", texto_num)
            elementos.append(Paragraph(f"{num}. {texto_num}", estilos["bullet"]))
            i += 1
            continue

        # Negrita con **
        texto_parrafo = linea.strip()
        texto_parrafo = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", texto_parrafo)
        texto_parrafo = re.sub(r"\*(.+?)\*", r"<i>\1</i>", texto_parrafo)

        # Detectar etiquetas tipo "Proposito:", "Duracion:", etc.
        if re.match(r"^[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+:", texto_parrafo) and len(texto_parrafo) < 60:
            elementos.append(Paragraph(texto_parrafo, estilos["subseccion"]))
        else:
            elementos.append(Paragraph(texto_parrafo, estilos["cuerpo"]))

        i += 1

    return elementos


def _construir_header(titulo: str, datos_generales: str, estilos: dict) -> list:
    """Construye el encabezado del documento con logo y datos."""
    elementos = []

    # Tabla de header: logo izquierda, título derecha
    logo_cell = ""
    if os.path.exists(LOGO_PATH):
        logo = Image(LOGO_PATH, width=3.5 * cm, height=3.5 * cm)
        logo.hAlign = "CENTER"
        logo_content = logo
    else:
        logo_content = Paragraph("CONABIO", estilos["titulo"])

    titulo_content = [
        Paragraph("CoSMoS · CONABIO · CONANP", estilos["subtitulo"]),
        Paragraph(titulo, estilos["titulo"]),
        Paragraph("Planeación didáctica — Modelo de las 5E", estilos["dato"]),
    ]

    tabla_header = Table(
        [[logo_content, titulo_content]],
        colWidths=[4 * cm, 13.5 * cm],
    )
    tabla_header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    elementos.append(tabla_header)
    elementos.append(Spacer(1, 0.2 * cm))
    elementos.append(HRFlowable(width="100%", thickness=2, color=VERDE_OSCURO, spaceAfter=6))

    return elementos


def generar_pdf_planeacion(titulo: str, contenido: str, tema: str = "", rango_edad: str = "") -> str:
    nombre = f"planeacion_{uuid.uuid4().hex[:10]}.pdf"
    path = os.path.join(settings.PDF_OUTPUT_DIR, nombre)

    estilos = _build_styles()

    doc = SimpleDocTemplate(
        path,
        pagesize=letter,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        title=titulo,
        author="CoSMoS — CONABIO · CONANP",
        subject=f"Planeación didáctica: {tema}",
    )

    elementos = []

    # Header con logo
    elementos.extend(_construir_header(titulo, "", estilos))
    elementos.append(Spacer(1, 0.3 * cm))

    # Chips de metadata con etiquetas legibles
    if tema or rango_edad:
        chips_data = []
        if tema:
            # El enum puede venir como "TemaAmbiental.prevencion_incendios_forestales" o directo
            tema_key = tema.split(".")[-1].lower().strip()
            tema_legible = ETIQUETAS_TEMA.get(tema_key)
            if not tema_legible:
                # Intentar con el valor completo
                tema_legible = ETIQUETAS_TEMA.get(tema.lower().strip(), tema.replace("_", " ").title())
            chips_data.append("Tema: " + tema_legible)
        if rango_edad:
            edad_key = rango_edad.split(".")[-1].lower().strip()
            edad_legible = ETIQUETAS_EDAD.get(edad_key)
            if not edad_legible:
                edad_legible = ETIQUETAS_EDAD.get(rango_edad.lower().strip(), rango_edad.replace("_", " ").title())
            chips_data.append("Público: " + edad_legible)

        chips_texto = "   ·   ".join(chips_data)
        tabla_chips = Table(
            [[Paragraph(chips_texto, ParagraphStyle("chips", fontName="Helvetica", fontSize=9, textColor=OCRE))]],
            colWidths=[17.5 * cm],
        )
        tabla_chips.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), ARENA),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("ROUNDEDCORNERS", [4]),
        ]))
        elementos.append(tabla_chips)
        elementos.append(Spacer(1, 0.4 * cm))

    # Contenido generado por la IA
    elementos.extend(_parsear_contenido(contenido, estilos))

    # Pie de página
    elementos.append(Spacer(1, 0.6 * cm))
    elementos.append(HRFlowable(width="100%", thickness=1, color=VERDE_CLARO, spaceAfter=4))
    elementos.append(Paragraph(
        "Generado por la Plataforma CoSMoS · CONABIO · CONANP · Conservación y Uso Sostenible en Montañas y Sierras",
        estilos["pie"],
    ))

    doc.build(elementos)
    return nombre


def _limpiar_html(texto: str) -> str:
    """Elimina etiquetas HTML mal formadas que puede generar el modelo de IA."""
    texto = re.sub(r'</?b>', '', texto)
    texto = re.sub(r'</?i>', '', texto)
    texto = re.sub(r'</?strong>', '', texto)
    texto = re.sub(r'</?em>', '', texto)
    return texto
