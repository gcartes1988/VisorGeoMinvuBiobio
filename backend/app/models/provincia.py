# app/models/provincia.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Provincia(Base):
    __tablename__ = "provincia"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    codigo = Column(String)
    region_id = Column(Integer, ForeignKey("region.id"))

    # Relación con Region
    region = relationship("Region", back_populates="provincias")
    # Relación con Comuna (declarada como string para evitar problemas)
    comunas = relationship("Comuna", back_populates="provincia")
