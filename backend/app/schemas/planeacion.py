import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import TemaAmbiental, RangoEdad


class PlaneacionRequest(BaseModel):
    tema: TemaAmbiental
    rango_edad: RangoEdad
    duracion_minutos: int = 60
    numero_participantes: Optional[int] = Field(None, ge=1)
    contexto_adicional: Optional[str] = None


class PlaneacionOut(BaseModel):
    id: uuid.UUID
    titulo: str
    tema: TemaAmbiental
    rango_edad: RangoEdad
    duracion_minutos: int
    numero_participantes: Optional[int]
    contenido_generado: Optional[str] = None
    estado: str
    error_mensaje: Optional[str] = None
    pdf_generado_url: Optional[str] = None
    creado_en: datetime

    class Config:
        from_attributes = True
