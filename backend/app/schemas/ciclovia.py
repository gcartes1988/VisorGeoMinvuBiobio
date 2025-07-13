from pydantic import BaseModel
from typing import Optional, Union, Dict, Any

class CicloviaCreate(BaseModel):
    proyecto_id: int
    tipo_ciclovia_id: int
    comuna_id: int  # 🟣 Nueva relación directa con comuna
    longitud_metros: int
    observaciones: Optional[str]
    geometria: Union[str, Dict[str, Any]]

    class Config:
        orm_mode = True
