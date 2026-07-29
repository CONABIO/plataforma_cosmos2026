from typing import Optional
from openai import OpenAI
from app.core.config import settings

_client: Optional[OpenAI] = None

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
    "infantil_4_7": "Niñas y niños de 4 a 7 años",
    "ninez_8_12": "Niñas y niños de 8 a 12 años",
    "adolescentes_13_17": "Jóvenes de 13 a 17 años",
    "adultos_18_mas": "Personas adultas (18 años o más)",
    "todas_las_edades": "Todas las edades",
}


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
        )
    return _client


def _cortar_repeticiones(texto: str) -> str:
    lineas = texto.split("\n")
    vistas = {}
    resultado = []
    consecutivas = 0
    for linea in lineas:
        limpia = linea.strip()
        if len(limpia) > 20:
            if limpia in vistas:
                consecutivas += 1
                if consecutivas >= 1:
                    break
            else:
                vistas[limpia] = True
                consecutivas = 0
        resultado.append(linea)
    return "\n".join(resultado).strip()


def generar_planeacion(
    tema: str,
    rango_edad: str,
    duracion_minutos: int,
    numero_participantes,
    contexto_adicional: str,
) -> str:
    tema_legible = ETIQUETAS_TEMA.get(tema, tema)
    edad_legible = ETIQUETAS_EDAD.get(rango_edad, rango_edad)
    participantes_texto = f"{numero_participantes} personas" if numero_participantes else "no especificado"
    contexto_texto = contexto_adicional or "ninguno"

    e1 = round(duracion_minutos * 0.11)
    e2 = round(duracion_minutos * 0.22)
    e3 = round(duracion_minutos * 0.22)
    e4 = round(duracion_minutos * 0.27)
    e5 = duracion_minutos - e1 - e2 - e3 - e4

    prompt = f"""Eres un especialista en educacion ambiental y divulgacion comunitaria para Areas Naturales Protegidas de Mexico, trabajando para el proyecto CoSMoS (CONANP-CONABIO). Experto en redaccion y ortografia.

Genera una PLANEACION DIDACTICA completa usando el MODELO DE LAS 5E (Enganchar, Explorar, Explicar, Elaborar, Evaluar), con la siguiente informacion:

- Tema: {tema_legible}
- Publico: {edad_legible}
- Duracion total: {duracion_minutos} minutos
- Numero de participantes: {participantes_texto}
- Contexto adicional: {contexto_texto}

La planeacion debe seguir EXACTAMENTE esta estructura:

TITULO
Un titulo creativo y descriptivo para el taller.

DATOS GENERALES
- Duracion total: {duracion_minutos} minutos
- Publico: {edad_legible}
- Modalidad: Presencial, adaptable a espacios abiertos o cerrados
- Metodologia: Modelo de las 5E
- Tema: {tema_legible}
- Numero sugerido de participantes: {participantes_texto}
- Nota: No necesita energia electrica ni equipo audiovisual. El pizarron es opcional.

OBJETIVO DE APRENDIZAJE
Al finalizar el taller, las y los participantes seran capaces de: (lista de 4 a 6 objetivos especificos y medibles)

MENSAJES CLAVE
Lista de 5 a 8 mensajes clave que deben quedar claros al finalizar el taller.

MATERIALES
Materiales indispensables: (lista)
Materiales opcionales: (lista)
Nota: Si no hay materiales disponibles, indicar como pueden hacerse las actividades sin ellos.

PREPARACION PREVIA DEL TALLERISTA
Lista de 6 a 8 pasos que debe seguir el tallerista antes de la sesion.

DESARROLLO DE LA SESION

1. ENGANCHAR ({e1} minutos)
Proposito: (breve descripcion)
Que debe hacer el tallerista: (descripcion detallada con preguntas detonadoras y recomendaciones)
Cierre de la etapa: (como cerrar esta seccion)

2. EXPLORAR ({e2} minutos)
Proposito: (breve descripcion)
Preparacion: (materiales o configuracion necesaria)
Que debe hacer el tallerista: (descripcion detallada con preguntas orientadoras)
Cierre de la etapa: (como cerrar esta seccion)

3. EXPLICAR ({e3} minutos)
Proposito: (breve descripcion)
Que debe hacer el tallerista: (explicacion conceptual con preguntas de verificacion)
Cierre de la etapa: (como cerrar esta seccion)

4. ELABORAR ({e4} minutos)
Proposito: (breve descripcion)
Que debe hacer el tallerista: (actividad practica con ejercicios concretos y preguntas de analisis)
Cierre de la etapa: (como cerrar esta seccion)

5. EVALUAR ({e5} minutos)
Proposito: (breve descripcion)
Actividad de evaluacion: (como verificar el aprendizaje de forma participativa)
Criterio para saber si se alcanzo el objetivo: (lista de indicadores observables)
Cierre del taller: (mensaje final motivador)

DISTRIBUCION DEL TIEMPO
Tabla con las 5 etapas, actividad y tiempo asignado.

RECOMENDACIONES PARA EL TALLERISTA
Lista de 8 a 12 recomendaciones practicas para facilitar el taller.

IMPORTANTE:
- Usa lenguaje claro, calido y directo.
- Usa frases completas.
- Adapta el lenguaje y las actividades al rango de edad indicado.
- Todas las actividades deben poder realizarse SIN internet, SIN energia electrica y con materiales sencillos.
- No incluyas actividades que requieran fuego real, sustancias peligrosas o equipo especializado.
- Escribe en espanol, sin mezclar idiomas."""

    client = get_client()
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "Eres un experto en educacion ambiental comunitaria para Areas Naturales Protegidas de Mexico. Generas planeaciones didacticas siguiendo el Modelo de las 5E. Respondes en espanol."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        max_tokens=1000,
        presence_penalty=0.8,
        frequency_penalty=0.8,
    )
    contenido = response.choices[0].message.content
    return _cortar_repeticiones(contenido)