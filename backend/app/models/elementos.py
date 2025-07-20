
from typing import List, Optional
from pydantic import BaseModel
from shapely.geometry import mapping


class GeometriaOut(BaseModel):
    type: str
    coordinates: list


class PavimentoMini(BaseModel):
    id: int
    sector: str
    estado_avance: Optional[str]
    comuna: Optional[str]
    geometria: Optional[GeometriaOut]


class CicloviaMini(BaseModel):
    id: int
    nombre_tramo: str
    estado_avance: Optional[str]
    comuna: Optional[str]
    geometria: Optional[GeometriaOut]


class ParqueMini(BaseModel):
    id: int
    direccion: Optional[str]
    comuna: Optional[str]
    superficie_ha: Optional[float]
    geometria: Optional[GeometriaOut]


class ElementosPorProyectoOut(BaseModel):
    pavimentos: List[PavimentoMini]
    ciclovias: List[CicloviaMini]
    parques: List[ParqueMini]
