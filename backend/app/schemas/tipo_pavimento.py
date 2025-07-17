from pydantic import BaseModel

class TipoPavimentoOut(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True
