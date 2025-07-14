from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes import (
    usuario, proyecto, pavimento, ciclovia, parque,
    auth, categoria, provincia, comuna, log_cambios
)
from app.models.tipo_calzada import TipoCalzada
from app.models.tipo_pavimento import TipoPavimento
from app.models.estado_avance import EstadoAvance
from app.models.contratista import Contratista
from app.schemas.tipo_calzada import TipoCalzadaOut
from app.schemas.tipo_pavimento import TipoPavimentoOut
from app.schemas.estado_avance import EstadoAvanceOut
from app.schemas.contratista import ContratistaOut

app = FastAPI(
    title="VisorGeo Minvu Biobío",
    description="API para el visor territorial VisorGeo. Proyectos públicos.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas principales
app.include_router(usuario.router, prefix="/api", tags=["Usuarios"])
app.include_router(proyecto.router, prefix="/api", tags=["Proyectos"])
app.include_router(pavimento.router, prefix="/api", tags=["Pavimentos"])
app.include_router(ciclovia.router, prefix="/api", tags=["Ciclovías"])
app.include_router(parque.router, prefix="/api", tags=["Parques Urbanos"])
app.include_router(categoria.router, prefix="/api", tags=["Categorías"])
app.include_router(provincia.router, prefix="/api", tags=["Provincias"])
app.include_router(comuna.router, prefix="/api", tags=["Comunas"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(log_cambios.router, tags=["Log de Cambios"])

# Endpoints referenciales
@app.get("/api/tipo-calzada", response_model=list[TipoCalzadaOut])
def get_tipo_calzada(db: Session = Depends(get_db)):
    return db.query(TipoCalzada).all()

@app.get("/api/tipo-pavimento", response_model=list[TipoPavimentoOut])
def get_tipo_pavimento(db: Session = Depends(get_db)):
    return db.query(TipoPavimento).all()

@app.get("/api/estado-avance", response_model=list[EstadoAvanceOut])
def get_estado_avance(db: Session = Depends(get_db)):
    return db.query(EstadoAvance).all()

@app.get("/api/contratistas", response_model=list[ContratistaOut])
def get_contratistas(db: Session = Depends(get_db)):
    return db.query(Contratista).all()

# Ruta raíz para estado del backend
@app.get("/", tags=["Estado"])
def root_status():
    return {
        "VisorGeo": "Minvu Biobío",
        "estado": "✅ API en línea",
        "documentación": "https://visorgeominvubiobio.onrender.com/docs"
    }

# OpenAPI personalizado con JWT
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation.setdefault("security", []).append({"BearerAuth": []})
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
