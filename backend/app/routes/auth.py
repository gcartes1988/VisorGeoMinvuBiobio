# backend/app/routes/auth.py

# Importación de módulos necesarios
from fastapi import APIRouter, HTTPException, Depends, Request  # FastAPI para crear rutas, manejar errores, dependencias y solicitudes HTTP
from pydantic import BaseModel                                  # BaseModel para definir esquemas de datos
from sqlalchemy.orm import Session                              # Session para operaciones ORM con SQLAlchemy
from app.database import get_db                                 # Función que obtiene la sesión activa de la base de datos
from app.models import Usuario                                  # Modelo ORM que representa la tabla de usuarios
from app.utils import firebase_auth as firebase_utils           # Módulo con funciones para verificar tokens de Firebase

# Se crea un enrutador específico para las rutas de autenticación
router = APIRouter()

# Esquema de salida para el usuario autenticado
class UserOut(BaseModel):
    id: int                            # Identificador único del usuario
    nombre_usuario: str               # Nombre de usuario mostrado en el sistema
    rol: str                          # Rol del usuario (ej: admin, editor, visitante)

    class Config:
        orm_mode = True               # Permite que Pydantic trabaje directamente con modelos ORM (SQLAlchemy)

# Ruta protegida que permite obtener los datos del usuario autenticado mediante token JWT
@router.get("/auth/user", response_model=UserOut)
def get_authenticated_user(request: Request, db: Session = Depends(get_db)):
    # Extrae el encabezado Authorization de la solicitud
    auth_header = request.headers.get("Authorization")

    # Verifica que el encabezado contenga un token en formato Bearer
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No se proporcionó un token válido")

    # Extrae solo el token desde el encabezado
    token = auth_header.split(" ")[1]

    try:
        # Verifica el token con Firebase
        decoded_token = firebase_utils.verify_token(token)
        firebase_uid = decoded_token["uid"]  # Extrae el UID del usuario desde el token verificado
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

    # Busca en la base de datos al usuario cuyo UID coincida con el verificado por Firebase
    user = db.query(Usuario).filter(Usuario.firebase_uid == firebase_uid).first()
    
    # Si el usuario no existe en la base de datos, lanza un error
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado en base de datos")

    # Retorna los datos del usuario, que se ajustarán al esquema UserOut
    return user
