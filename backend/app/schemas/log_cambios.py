# backend/app/schemas/log_cambios.py

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class LogCambioOut(BaseModel):
    id: int
    fecha: datetime
    proyecto_id: Optional[int]
    nombre_proyecto: Optional[str]
    usuario_id: Optional[int]
    nombre_usuario: Optional[str]
    accion: str
    campo_modificado: Optional[str]
    valor_anterior: Optional[Any]
    valor_nuevo: Optional[Any]

    model_config = {
        "from_attributes": True
    }
