# backend/app/routes/auth.py

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario
from app.utils import firebase_auth as firebase_utils

router = APIRouter()

class UserOut(BaseModel):
    id: int
    nombre_usuario: str
    rol: str

    class Config:
        orm_mode = True

@router.get("/auth/user", response_model=UserOut)
def get_authenticated_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    print("📥 Header recibido:", auth_header)

    if not auth_header or not auth_header.startswith("Bearer "):
        print("❌ Token no proporcionado o mal formado")
        raise HTTPException(status_code=401, detail="No se proporcionó un token válido")

    token = auth_header.split(" ")[1]
    print("🔑 Token limpio:", token[:30])  # Solo los primeros caracteres por seguridad

    try:
        decoded_token = firebase_utils.verify_token(token)
        firebase_uid = decoded_token["uid"]
        print("🧾 UID desde token:", firebase_uid)
    except Exception as e:
        print("💥 Error al verificar token:", e)
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

    user = db.query(Usuario).filter(Usuario.firebase_uid == firebase_uid).first()

    if not user:
        print("❌ Usuario con UID no encontrado en la base")
        raise HTTPException(status_code=404, detail="Usuario no encontrado en base de datos")

    print("✅ Usuario encontrado:", user.nombre_usuario)
    return user
