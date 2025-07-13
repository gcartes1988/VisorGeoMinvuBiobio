from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from sqlalchemy.orm import Session
from app.utils.firebase_auth import verify_token

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioResponse

router = APIRouter()

# 🔐 Obtener el usuario autenticado desde el token JWT
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Usuario:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Cabecera Authorization inválida o faltante")

    token = authorization.replace("Bearer ", "")

    try:
        decoded = verify_token(token)
        uid = decoded["uid"]

        user = db.query(Usuario).filter(Usuario.firebase_uid == uid).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no registrado en la base de datos")

        return user

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")


# GET /me - Retorna el usuario autenticado actual
@router.get("/me", response_model=UsuarioResponse)
def get_user_info(current_user: Usuario = Depends(get_current_user)):
    return current_user
