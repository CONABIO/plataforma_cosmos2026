import enum


class TemaAmbiental(str, enum.Enum):
    INCENDIOS_FORESTALES = "prevencion_incendios_forestales"
    FAUNA_SILVESTRE = "fauna_silvestre_convivencia_responsable"
    CUIDADO_AGUA = "importancia_cuidado_agua"
    SERVICIOS_ECOSISTEMICOS = "servicios_ecosistemicos"
    ESPECIES_INVASORAS = "especies_invasoras"
    TURISMO_RESPONSABLE = "turismo_responsable"
    RESTAURACION_ECOLOGICA = "restauracion_ecologica"


class RangoEdad(str, enum.Enum):
    INFANTIL = "infantil_4_7"
    NINEZ = "ninez_8_12"
    ADOLESCENTES = "adolescentes_13_17"
    ADULTOS = "adultos_18_mas"
    TODAS_LAS_EDADES = "todas_las_edades"
