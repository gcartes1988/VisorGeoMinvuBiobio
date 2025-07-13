from pydantic import BaseModel

class UsuarioResponse(BaseModel):
    id: int
    firebase_uid: str
    nombre_usuario: str
    rol: str

    class Config:
        from_attributes = True  # Pydantic v2 reemplazo de orm_mode
