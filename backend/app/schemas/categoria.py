from pydantic import BaseModel

# ✅ Esquema de salida público o embebido (como en ProyectoPublicoOut)
class CategoriaOut(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }

# ✅ Esquema general para admin, si se usa en GET /categorias o similares
class CategoriaResponse(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }
