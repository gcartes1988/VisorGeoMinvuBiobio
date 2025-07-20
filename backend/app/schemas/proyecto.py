from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from .categoria import CategoriaOut


class CategoriaOut(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }

# ✅ Esquema para crear/editar proyecto
class ProyectoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    categoria_id: int
    estado_proyecto: Optional[str] = "pendiente"

    model_config = {
        "from_attributes": True
    }

# ✅ Esquema para respuestas generales
class ProyectoOut(ProyectoCreate):
    id: int
    fecha_creacion: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

# ✅ Esquema para respuestas públicas con categoría embebida
class ProyectoPublicoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    estado_proyecto: str
    fecha_creacion: Optional[datetime]
    categoria: CategoriaOut

    model_config = {
        "from_attributes": True
    }

# ✅ Esquema simple para usar dentro de ParqueDetalleOut
class ProyectoOutSimple(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }
