import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.enums import TemaAmbiental, RangoEdad


class Planeacion(Base):
    __tablename__ = "planeaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String(200), nullable=False)
    tema = Column(
        Enum(TemaAmbiental, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False, index=True,
    )
    rango_edad = Column(
        Enum(RangoEdad, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    duracion_minutos = Column(Integer, default=60)
    numero_participantes = Column(Integer, nullable=True)
    prompt_utilizado = Column(Text, nullable=True)
    contenido_generado = Column(Text, nullable=True)
    estado = Column(String(20), default="procesando")  # procesando | listo | error
    error_mensaje = Column(Text, nullable=True)
    pdf_generado_url = Column(String(500), nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
