# backend/app/routes/log_cambios.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.models.log_cambios import LogCambios
from app.schemas.log_cambios import LogCambioOut

router = APIRouter(prefix="/log_cambios", tags=["Log de Cambios"])

@router.get("/", response_model=list[LogCambioOut])
def obtener_log_cambios(db: Session = Depends(get_db)):
    logs = db.query(LogCambios).options(
        selectinload(LogCambios.usuario),
        selectinload(LogCambios.proyecto)
    ).order_by(LogCambios.fecha.desc()).all()

    resultado = []
    for log in logs:
        resultado.append({
            "id": log.id,
            "fecha": log.fecha,
            "proyecto_id": log.proyecto_id,
            "nombre_proyecto": log.proyecto.nombre if log.proyecto else None,
            "usuario_id": log.usuario_id,
            "nombre_usuario": log.usuario.nombre_usuario if log.usuario else None,
            "accion": log.accion,
            "campo_modificado": log.campo_modificado,
            "valor_anterior": log.valor_anterior,
            "valor_nuevo": log.valor_nuevo,
        })

    return resultado
