# Importaciones necesarias desde FastAPI y SQLAlchemy
from fastapi import APIRouter, Depends                    # APIRouter para crear rutas, Depends para manejar dependencias
from sqlalchemy.orm import Session                        # Session permite interactuar con la base de datos usando SQLAlchemy

# Importación del helper para obtener la sesión activa de la base de datos
from app.database import get_db

# Importación del modelo ORM de categoría (mapea la tabla 'categoria')
from app.models.categoria import Categoria

# Importación del esquema de salida para la API (valida y estructura la respuesta)
from app.schemas.categoria import CategoriaResponse

# Se crea una instancia del enrutador específico para las rutas relacionadas a 'categorias'
router = APIRouter()

# Ruta GET que retorna todas las categorías disponibles
@router.get("/categorias", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    # Realiza una consulta SQL para obtener todas las categorías registradas en la base de datos
    return db.query(Categoria).all()
