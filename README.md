# CoSMoS — Plataforma de Divulgación Comunitaria para ANP

**Conservación y Uso Sostenible en Montañas y Sierras**  
Plataforma web de divulgación ambiental para las Áreas Naturales Protegidas del Eje Neovolcánico y el Altiplano de México.

 

## ¿Qué hace el sistema?

- Mapa interactivo con las 19 ANP del proyecto
- Galería fotográfica organizada por ANP
- Repositorio de materiales descargables (fichas, guías, diagnósticos, libros)
- Generador automático de planeaciones didácticas con IA (Modelo 5E)
- Descarga de planeaciones en PDF con identidad institucional CONABIO/CONANP

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 5 + TailwindCSS 3 |
| Mapa | Leaflet 1.9 |
| Backend | FastAPI (Python 3.12) |
| Base de datos | PostgreSQL 16 |
| IA | Ollama (modelo local) |
| PDF | ReportLab 4.2 |
| Infraestructura | Docker + Docker Compose |

---

## Requisitos del servidor

### Mínimos (funcional pero lento con IA)

| Componente | Mínimo |
|---|---|
| Sistema operativo | Ubuntu 22.04 LTS |
| CPU | 4 núcleos |
| RAM | 8 GB |
| Disco | 40 GB SSD |
| Red | 10 Mbps |

Con esta configuración el modelo `qwen2.5:0.5b` genera una planeación en **2–5 minutos**.

### Recomendados (para uso real con mejor calidad de IA)

| Componente | Recomendado |
|---|---|
| Sistema operativo | Ubuntu 22.04 LTS |
| CPU | 8+ núcleos (Intel i7/Xeon o AMD Ryzen 7+) |
| RAM | 16 GB |
| Disco | 80 GB SSD NVMe |
| Red | 50 Mbps |

Con esta configuración el modelo `llama3.2:3b` genera una planeación en **5–10 minutos**.

### Óptimos (producción con IA rápida)

| Componente | Óptimo |
|---|---|
| Sistema operativo | Ubuntu 22.04 LTS |
| CPU | 16+ núcleos |
| RAM | 32 GB |
| GPU | NVIDIA con 8+ GB VRAM (RTX 3080, A10, T4 o similar) |
| Disco | 100 GB SSD NVMe |
| Red | 100 Mbps |

Con GPU, cualquier modelo genera una planeación en **15–30 segundos**.

### Comparativa de modelos de IA

| Modelo | RAM requerida | Calidad | Velocidad CPU | Velocidad GPU |
|---|---|---|---|---|
| qwen2.5:0.5b | 2 GB | Básica | 2–5 min | ~15 seg |
| qwen2.5:3b | 4 GB | Buena | 8–15 min | ~20 seg |
| llama3.2:3b | 4 GB | Buena | 10–20 min | ~20 seg |
| llama3.1:8b | 10 GB | Muy buena | 30–60 min | ~30 seg |


---

## Instalación paso a paso

### 1. Instalar Docker (en caso de no tenerlo)

```bash
sudo apt update && sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Cerrar sesión y volver a entrar para que el grupo `docker` tome efecto.

### 2. Clonar el repositorio

```bash
git clone https://github.com/CONABIO/plataforma_cosmos2026.git /opt/cosmos
cd /opt/cosmos
```

### 3. Configurar las variables de entorno

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

El archivo `.env.example` contiene la estructura.  

- `DATABASE_URL` — cadena de conexión a PostgreSQL (cambiar usuario y contraseña)
- `OPENAI_API_KEY` — escribir `ollama` si se usa Ollama local
- `OPENAI_MODEL` — nombre del modelo a usar (ver tabla de modelos arriba)
- `OPENAI_BASE_URL` — URL del servidor de IA (`http://ollama:11434/v1` para Ollama local)
- `BACKEND_CORS_ORIGINS` — dominio del frontend en producción


### 4. Configurar docker-compose.yml para producción

```bash
nano docker-compose.yml
```

Cambios necesarios:

| Qué cambiar | Valor desarrollo | Valor producción |
|---|---|---|
| `POSTGRES_PASSWORD` | valor de ejemplo | Contraseña segura (misma que en `.env`) |
| Puerto PostgreSQL | `"5433:5432"` | `"127.0.0.1:5433:5432"` |
| Puerto backend | `"8000:8000"` | `"127.0.0.1:8000:8000"` |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | `https://tudominio.com/api/v1` |
| `restart` | `unless-stopped` | `always` |
| Modelo en `ollama-init` | `qwen2.5:0.5b` | El modelo que corresponda al hardware |

El modelo en `ollama-init` se configura así: buscar esta línea en el `docker-compose.yml` y cambiar por el modelo que se quiera usar:

```yaml
entrypoint: ["/bin/sh", "-c", "ollama pull qwen2.5:0.5b && echo 'Modelo listo'"]
```

Por ejemplo para usar `llama3.2:3b`:

```yaml
entrypoint: ["/bin/sh", "-c", "ollama pull llama3.2:3b && echo 'Modelo listo'"]
```

Y en `backend/.env` asegurar de que `OPENAI_MODEL` coincida con el modelo configurado en `ollama-init`.

### 5. Crear las carpetas de la galería

```bash
mkdir -p /opt/cosmos/galeria/mariposa-monarca
mkdir -p /opt/cosmos/galeria/barranca-meztitlan
mkdir -p /opt/cosmos/galeria/veladero
mkdir -p /opt/cosmos/galeria/sierra-huautla
```

### 6. Agregar materiales descargables

Copiar los PDFs:

```bash
cp /ruta/de/pdfs/*.pdf /opt/cosmos/frontend/public/materiales/
```

Edita el índice de materiales:

```bash
nano /opt/cosmos/frontend/public/materiales/index.json
```

Formato:

```json
[
  {
    "nombre": "Nombre del documento",
    "archivo": "nombre-del-archivo.pdf",
    "tipo": "Ficha temática",
    "descripcion": "Descripción breve."
  }
]
```

Tipos disponibles: `Ficha temática`, `Guía`, `Diagnóstico`, `Libro`, `Actividad`, `Plantilla`.

### 7. Agregar fotos a la galería

```bash
cp /ruta/de/fotos/*.jpg /opt/cosmos/galeria/mariposa-monarca/
```

Las fotos aparecen inmediatamente sin necesidad de reconstruir Docker.

### 8. Levantar el proyecto

```bash
cd /opt/cosmos
docker compose up --build -d
```

La primera vez descarga las imágenes de Docker (~3-4 GB) y el modelo de IA. Puede tardar varios minutos dependiendo de la conexión y el modelo elegido.

Verificar que todo esté corriendo:

```bash
docker compose ps
```

Deben aparecer los servicios `frontend`, `backend`, `db` y `ollama` en estado `Up`.

### 9. Configurar Nginx con SSL

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo nano /etc/nginx/sites-available/cosmos
```

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 1200s;
        proxy_connect_timeout 1200s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cosmos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d tudominio.com
```

El sistema quedará accesible en `https://dominioconabio.com`.

---

## Comandos de mantenimiento

```bash
# Ver estado de los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs backend --tail=50

# Reiniciar un servicio sin rebuild
docker compose restart backend

# Detener todo
docker compose down

# Levantar todo
docker compose up -d

# Actualizar el proyecto desde GitHub
git pull
docker compose build
docker compose up -d

# Backup de la base de datos
docker compose exec db pg_dump -U conabio_user conabio_mvp > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T db psql -U conabio_user conabio_mvp < backup.sql

# Limpiar caché de Docker
docker system prune -a
```

---

## Agregar contenido sin reconstruir Docker

| Contenido | Dónde colocarlo | Requiere rebuild |
|---|---|---|
| Fotos de la galería | `galeria/{nombre-anp}/` | **No** |
| Materiales PDF | `frontend/public/materiales/` + actualizar `index.json` | **Sí** (solo frontend) |
| Cambiar modelo de IA | `backend/.env` + `docker-compose.yml` | Solo `restart backend` |
| Cambiar prompt de IA | `backend/app/services/ai_service.py` | Solo `restart backend` |

---

## Cambiar el modelo de IA

### Paso 1: Editar `docker-compose.yml`

Buscar el servicio `ollama-init` y cambia el modelo:

```yaml
entrypoint: ["/bin/sh", "-c", "ollama pull NOMBRE_DEL_MODELO && echo 'Modelo listo'"]
```

### Paso 2: Editar `backend/.env`

```env
OPENAI_MODEL=NOMBRE_DEL_MODELO
```

> El modelo en `.env` y en `docker-compose.yml` deben ser exactamente el mismo.

### Paso 3: Descargar el nuevo modelo y reiniciar

```bash
# Descargar el nuevo modelo
docker compose exec ollama ollama pull NOMBRE_DEL_MODELO

# Reiniciar el backend
docker compose restart backend
```

### Otros comandos útiles para modelos

```bash
# Ver modelos descargados
docker compose exec ollama ollama list

# Eliminar un modelo que ya no se usa (libera espacio)
docker compose exec ollama ollama rm qwen2.5:0.5b
```

---

## Acceso a la base de datos

```bash
docker compose exec db psql -U conabio_user -d conabio_mvp
```

Comandos útiles:

```sql
-- Ver planeaciones generadas
SELECT id, titulo, tema, estado, creado_en FROM planeaciones ORDER BY creado_en DESC;

-- Contar planeaciones
SELECT COUNT(*) FROM planeaciones;

-- Salir
\q
```

---

## Estructura del proyecto

```
cosmos/
  backend/
    app/
      api/          # Endpoints: planeaciones, galeria, PDF
      assets/       # Logo CONABIO
      core/         # Configuración y base de datos
      models/       # Modelos SQLAlchemy
      schemas/      # Schemas Pydantic
      services/     # ai_service.py, pdf_service.py
    alembic/        # Migraciones de base de datos
    .env.example    # Plantilla de variables de entorno (sin valores reales)
    Dockerfile
    requirements.txt
  frontend/
    public/
      geojson/      # GeoJSON de ANP y estados
      materiales/   # PDFs descargables + index.json
    src/
      components/landing/
      pages/
      services/
    Dockerfile
    nginx.conf
  galeria/          # Fotos por ANP (volumen Docker, no incluido en el repo)
  docker-compose.yml
  README.md
```
