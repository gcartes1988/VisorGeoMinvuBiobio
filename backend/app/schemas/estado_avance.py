from pydantic import BaseModel

class EstadoAvanceOut(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True