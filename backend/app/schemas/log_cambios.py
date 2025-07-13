from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LogCambioOut(BaseModel):
    id: int
    proyecto_id: Optional[int]
    usuario_id: Optional[int]
    accion: str
    campo_modificado: str
    valor_anterior: Optional[str]
    valor_nuevo: Optional[str]
    fecha: datetime

    class Config:
        orm_mode = True
