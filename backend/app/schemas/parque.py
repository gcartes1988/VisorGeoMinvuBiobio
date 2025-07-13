from pydantic import BaseModel
from typing import Optional, Union, Dict, Any

class ParqueCreate(BaseModel):
    proyecto_id: int
    comuna_id: int
    direccion: Optional[str]
    superficie_ha: Optional[float]
    propiedad: Optional[str]
    administracion: Optional[str]
    costo_construccion: Optional[int]
    costo_anual: Optional[int]
    fuente_financiamiento_id: Optional[int]
    equipamiento: Optional[Dict[str, Any]]
    suministro_basico: Optional[bool]
    conexion_red: Optional[bool]
    viviendas_impactadas: Optional[int]
    poblacion_beneficiada: Optional[int]
    geometria: Union[str, Dict[str, Any]]

    class Config:
        orm_mode = True
