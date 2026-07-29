from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.planeaciones import router, router_pdf
from app.api.galeria import router as router_galeria

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API de CoSMoS — Plataforma de Divulgacion Comunitaria para ANP de Mexico",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.API_V1_STR)
app.include_router(router_pdf, prefix=settings.API_V1_STR)
app.include_router(router_galeria, prefix=settings.API_V1_STR)


@app.get("/", tags=["Salud"])
def estado():
    return {"estado": "ok", "proyecto": settings.PROJECT_NAME}
