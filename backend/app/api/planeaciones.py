import os
import uuid
import threading
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.core.config import settings
from app.models.planeacion import Planeacion
from app.schemas.planeacion import PlaneacionRequest, PlaneacionOut
from app.services.ai_service import generar_planeacion
from app.services.pdf_service import generar_pdf_planeacion

router = APIRouter(prefix="/ia", tags=["Planeaciones IA"])


def _generar_en_background(planeacion_id: str, tema: str, rango_edad: str,
                            duracion_minutos: int, numero_participantes,
                            contexto_adicional: str, titulo: str):
    """Genera la planeación en un hilo separado y actualiza el estado en la BD."""
    db = SessionLocal()
    try:
        contenido = generar_planeacion(
            tema=tema,
            rango_edad=rango_edad,
            duracion_minutos=duracion_minutos,
            numero_participantes=numero_participantes,
            contexto_adicional=contexto_adicional,
        )
        planeacion = db.query(Planeacion).filter(
            Planeacion.id == uuid.UUID(planeacion_id)
        ).first()
        if planeacion:
            planeacion.contenido_generado = contenido
            planeacion.estado = "listo"
            db.commit()
    except Exception as e:
        planeacion = db.query(Planeacion).filter(
            Planeacion.id == uuid.UUID(planeacion_id)
        ).first()
        if planeacion:
            planeacion.estado = "error"
            planeacion.error_mensaje = str(e)
            db.commit()
    finally:
        db.close()


@router.post("/planeaciones", response_model=PlaneacionOut, status_code=201)
def crear_planeacion(data: PlaneacionRequest, db: Session = Depends(get_db)):
    titulo = f"Taller: {data.tema.value.replace('_', ' ').title()}"

    # Crear el registro inmediatamente con estado "procesando"
    planeacion = Planeacion(
        titulo=titulo,
        tema=data.tema,
        rango_edad=data.rango_edad,
        duracion_minutos=data.duracion_minutos,
        numero_participantes=data.numero_participantes,
        prompt_utilizado=data.contexto_adicional,
        contenido_generado=None,
        estado="procesando",
    )
    db.add(planeacion)
    db.commit()
    db.refresh(planeacion)

    # Lanzar la generación en un hilo separado
    hilo = threading.Thread(
        target=_generar_en_background,
        args=(
            str(planeacion.id),
            data.tema.value,
            data.rango_edad.value,
            data.duracion_minutos,
            data.numero_participantes,
            data.contexto_adicional,
            titulo,
        ),
        daemon=True,
    )
    hilo.start()

    return planeacion


@router.get("/planeaciones/{planeacion_id}", response_model=PlaneacionOut)
def obtener_planeacion(planeacion_id: uuid.UUID, db: Session = Depends(get_db)):
    planeacion = db.query(Planeacion).filter(Planeacion.id == planeacion_id).first()
    if not planeacion:
        raise HTTPException(status_code=404, detail="Planeacion no encontrada")
    return planeacion


@router.get("/planeaciones", response_model=List[PlaneacionOut])
def listar_planeaciones(db: Session = Depends(get_db)):
    return db.query(Planeacion).order_by(Planeacion.creado_en.desc()).all()


@router.post("/planeaciones/{planeacion_id}/pdf")
def generar_pdf(planeacion_id: uuid.UUID, db: Session = Depends(get_db)):
    planeacion = db.query(Planeacion).filter(Planeacion.id == planeacion_id).first()
    if not planeacion:
        raise HTTPException(status_code=404, detail="Planeacion no encontrada")
    if planeacion.estado != "listo":
        raise HTTPException(status_code=400, detail="La planeacion aun no está lista")

    nombre_archivo = generar_pdf_planeacion(
        planeacion.titulo,
        planeacion.contenido_generado,
        str(planeacion.tema),
        str(planeacion.rango_edad),
    )
    planeacion.pdf_generado_url = f"/api/v1/pdf/descargar/{nombre_archivo}"
    db.commit()
    return {"pdf_url": planeacion.pdf_generado_url}


router_pdf = APIRouter(prefix="/pdf", tags=["PDF"])


@router_pdf.get("/descargar/{nombre_archivo}")
def descargar_pdf(nombre_archivo: str):
    ruta = os.path.join(settings.PDF_OUTPUT_DIR, nombre_archivo)
    if not os.path.exists(ruta):
        raise HTTPException(status_code=404, detail="PDF no encontrado")
    return FileResponse(ruta, media_type="application/pdf", filename=nombre_archivo)
