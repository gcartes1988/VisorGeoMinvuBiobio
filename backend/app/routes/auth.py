from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()

class UserOut(BaseModel):
    id: int
    nombre_usuario: str
    rol: str

@router.get("/auth/user", response_model=UserOut)
def get_authenticated_user(request: Request):
    user = request.state.user

    if not user:
        raise HTTPException(status_code=401, detail="Token inválido o ausente")

    return {
        "id": user["usuario_id"],
        "nombre_usuario": user["nombre_usuario"],
        "rol": user["rol"]
    }
