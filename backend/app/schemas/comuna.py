from pydantic import BaseModel

class ComunaOut(BaseModel):
    id: int
    nombre: str
    provincia_id: int

    model_config = {
        "from_attributes": True
    }
