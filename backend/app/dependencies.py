from fastapi import Depends, HTTPException, Header
from firebase_admin import auth
from app.models.usuario import Usuario
from app.database import get_db
from sqlalchemy.orm import Session

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> Usuario:
    try:
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario = db.query(Usuario).filter(Usuario.firebase_uid == firebase_uid).first()
    if not usuario:
        raise HTTPException(status_code=403, detail="Usuario no registrado")
    return usuario
