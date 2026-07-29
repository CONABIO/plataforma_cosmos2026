import os
from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi import HTTPException

GALERIA_DIR = "/app/galeria"
EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

router = APIRouter(prefix="/galeria", tags=["Galería"])


@router.get("/{anp}")
def listar_fotos(anp: str):
    """Lista las fotos disponibles para un ANP."""
    carpeta = os.path.join(GALERIA_DIR, anp)
    if not os.path.isdir(carpeta):
        return {"fotos": []}
    fotos = sorted([
        f for f in os.listdir(carpeta)
        if os.path.splitext(f)[1].lower() in EXTENSIONES
    ])
    return {"fotos": fotos, "anp": anp}


@router.get("/{anp}/{archivo}")
def obtener_foto(anp: str, archivo: str):
    """Sirve una foto de la galería."""
    ruta = os.path.join(GALERIA_DIR, anp, archivo)
    if not os.path.exists(ruta):
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    return FileResponse(ruta)
