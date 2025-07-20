from pydantic import BaseModel
from typing import List
from app.schemas.pavimento import PavimentoOut
from app.schemas.ciclovia import CicloviaOut
from app.schemas.parque import ParqueOut

class ElementosPorProyectoOut(BaseModel):
    pavimentos: List[PavimentoOut]
    ciclovias: List[CicloviaOut]
    parques: List[ParqueOut]

    model_config = {"from_attributes": True}
    