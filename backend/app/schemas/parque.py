from pydantic import BaseModel
from typing import Optional, Dict
from app.schemas.comuna import ComunaOut
from app.schemas.fuente_financiamiento import FuenteFinanciamientoOut
from app.schemas.proyecto import ProyectoOut


class ParqueCreate(BaseModel):
    nombre: str
    comuna_id: int
    direccion: Optional[str] = None
    superficie_ha: Optional[float] = None
    fuente_financiamiento_id: Optional[int] = None
    geometria: Dict
    proyecto_id: int

    model_config = {"from_attributes": True}


class ParqueUpdate(BaseModel):
    nombre: Optional[str] = None
    comuna_id: Optional[int] = None
    direccion: Optional[str] = None
    superficie_ha: Optional[float] = None
    fuente_financiamiento_id: Optional[int] = None
    geometria: Optional[Dict] = None

    model_config = {"from_attributes": True}


class ParqueOut(BaseModel):
    id: int
    proyecto_id: Optional[int] = None
    comuna_id: Optional[int] = None
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    superficie_ha: Optional[float] = None
    fuente_financiamiento_id: Optional[int] = None
    geometria: Optional[Dict] = None
    comuna: Optional[ComunaOut] = None
    fuente_financiamiento: Optional[FuenteFinanciamientoOut] = None
    proyecto: Optional[ProyectoOut] = None
    editable: bool

    model_config = {"from_attributes": True}


class ParqueDetalleOut(ParqueOut):
    pass
