# app/models/tipo_calzada.py

from sqlalchemy import Column, Integer, String
from app.database import Base

class TipoCalzada(Base):
    __tablename__ = "tipo_calzada"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
