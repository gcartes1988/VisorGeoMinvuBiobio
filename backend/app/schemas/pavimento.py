from pydantic import BaseModel, Field
from typing import Optional, Union, Dict, Any, List
from .tipo_pavimento import TipoPavimentoOut

class EstadoAvanceOut(BaseModel):
    id: int
    nombre: str
    class Config:
        orm_mode = True

class ComunaOut(BaseModel):
    id: int
    nombre: str
    class Config:
        orm_mode = True

class PavimentoCreate(BaseModel):
    proyecto_id: int
    sector: str = Field(..., min_length=1)
    longitud_metros: float
    tipo_calzada_id: int
    estado_avance_id: int
    comuna_id: int
    geometria: Union[str, Dict[str, Any]]
    tipos_pavimento: List[int]
    class Config:
        orm_mode = True

class PavimentoUpdate(BaseModel):
    proyecto_id: Optional[int]
    sector: Optional[str] = Field(None, min_length=1)
    longitud_metros: Optional[float]
    tipo_calzada_id: Optional[int]
    tipos_pavimento: Optional[List[int]]
    estado_avance_id: Optional[int]
    comuna_id: Optional[int]
    geometria: Optional[Union[str, Dict[str, Any]]]
    class Config:
        orm_mode = True

class PavimentoOut(BaseModel):
    id: int
    proyecto_id: int
    sector: str
    longitud_metros: float
    tipo_calzada_id: int
    geometria: dict
    comuna: ComunaOut
    estado_avance: EstadoAvanceOut
    tipos_pavimento: List[TipoPavimentoOut]
    class Config:
        orm_mode = True
