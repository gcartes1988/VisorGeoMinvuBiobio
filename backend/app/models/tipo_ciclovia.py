# app/models/tipo_ciclovia.py

from sqlalchemy import Column, Integer, String
from app.database import Base

class TipoCiclovia(Base):
    __tablename__ = "tipo_ciclovia"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
