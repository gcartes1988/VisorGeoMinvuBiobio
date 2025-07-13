# Importaciones necesarias para definir la ruta y trabajar con la base de datos
from fastapi import APIRouter, Depends                     # APIRouter para crear rutas, Depends para inyectar dependencias
from sqlalchemy.orm import Session                         # Session para hacer consultas con SQLAlchemy
from app.database import get_db                            # Función que retorna una sesión activa a la base de datos

# Importa el modelo ORM y el esquema de salida
from app.models.log_cambios import LogCambio               # Modelo que representa la tabla 'log_cambios'
from app.schemas.log_cambios import LogCambioOut           # Esquema para estructurar la respuesta

from typing import List                                    # Tipado para indicar que se retorna una lista

# Se crea el enrutador con prefijo y tag para organizar mejor la API
router = APIRouter(prefix="/log-cambios", tags=["Log de Cambios"])

# Ruta GET que devuelve todos los registros del historial de cambios
@router.get("/", response_model=List[LogCambioOut])
def listar_logs(db: Session = Depends(get_db)):
    # Consulta todos los registros de la tabla log_cambios, ordenados de más reciente a más antiguo
    return db.query(LogCambio).order_by(LogCambio.fecha.desc()).all()
