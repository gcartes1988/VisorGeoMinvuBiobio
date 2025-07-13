from pydantic import BaseModel

class ComunaResponse(BaseModel):
    id: int
    nombre: str
    provincia_id: int

    class Config:
        from_attributes = True
