from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.proyecto import EstadoProyectoEnum

class ProyectoCreate(BaseModel):
    nombre: str
    descripcion: str
    categoria_id: int
    estado_proyecto: EstadoProyectoEnum
    fecha_creacion: Optional[datetime] = None

    class Config:
        use_enum_values = True
        from_attributes = True

class ProyectoPublicoOut(BaseModel):
    proyecto_id: int
    nombre: str
    sector: str
    geometria: dict
    tipo: str
