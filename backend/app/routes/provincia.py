from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.provincia import Provincia
from app.schemas.provincia import ProvinciaResponse

router = APIRouter()

@router.get("/provincias", response_model=list[ProvinciaResponse])
def listar_provincias(db: Session = Depends(get_db)):
    return db.query(Provincia).all()
