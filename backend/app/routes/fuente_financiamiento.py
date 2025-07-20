from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.fuente_financiamiento import FuenteFinanciamiento
from app.schemas.fuente_financiamiento import FuenteFinanciamientoOut

router = APIRouter(prefix="/fuentes-financiamiento")

@router.get("/", response_model=list[FuenteFinanciamientoOut])
def listar_fuentes(db: Session = Depends(get_db)):
    return db.query(FuenteFinanciamiento).all()
