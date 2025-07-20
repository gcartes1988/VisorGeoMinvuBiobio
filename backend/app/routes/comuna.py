from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.comuna import Comuna
from app.schemas.comuna import ComunaOut

router = APIRouter()

@router.get("/comunas", response_model=list[ComunaOut])
def listar_comunas(db: Session = Depends(get_db)):
    return db.query(Comuna).all()
