from pydantic import BaseModel
from typing import Optional
from app.schemas.comuna import ComunaOut
from app.schemas.estado_avance import EstadoAvanceOut
from app.schemas.tipo_ciclovia import TipoCicloviaOut

class CicloviaOut(BaseModel):
    id: int
    nombre: str
    longitud_metros: float
    ancho: Optional[float]
    comuna: ComunaOut
    tipo_ciclovia: TipoCicloviaOut
    estado_avance: EstadoAvanceOut
    geometria: Optional[dict]

    class Config:
        orm_mode = True
