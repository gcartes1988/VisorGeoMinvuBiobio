from pydantic import BaseModel

class TipoCalzadaOut(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True