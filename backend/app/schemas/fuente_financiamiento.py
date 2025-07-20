from pydantic import BaseModel

class FuenteFinanciamientoOut(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }
