from pydantic import BaseModel
from typing import Optional, Dict
from .comuna import ComunaOut
from .fuente_financiamiento import FuenteFinanciamientoOut
from .proyecto import ProyectoOut

class ParqueCreate(BaseModel):
    nombre: str
    descripcion: Optional[str]
    creado_por_id: int
    comuna_id: int
    direccion: Optional[str]
    superficie_ha: Optional[float]
    fuente_financiamiento_id: Optional[int]
    geometria: Dict

    model_config = {"from_attributes": True}

class ParqueUpdate(BaseModel):
    nombre: Optional[str] = None
    comuna_id: Optional[int] = None
    direccion: Optional[str] = None
    superficie_ha: Optional[float] = None
    fuente_financiamiento_id: Optional[int] = None
    geometria: Optional[Dict] = None
    estado_proyecto: Optional[str] = None  


    model_config = {"from_attributes": True}

class ParqueOut(BaseModel):
    id: int
    proyecto_id: int
    comuna_id: int
    nombre: str
    direccion: Optional[str]
    superficie_ha: Optional[float]
    fuente_financiamiento_id: Optional[int]
    geometria: Dict

    model_config = {"from_attributes": True}

class ParqueDetalleOut(ParqueOut):
    comuna: Optional[ComunaOut]
    fuente_financiamiento: Optional[FuenteFinanciamientoOut]
    proyecto: Optional[ProyectoOut]

    model_config = {"from_attributes": True}
