from pydantic import BaseModel

class ContratistaOut(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True