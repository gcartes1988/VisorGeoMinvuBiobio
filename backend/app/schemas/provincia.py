from pydantic import BaseModel

class ProvinciaResponse(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True
