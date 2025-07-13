# app/models/contratista.py

from sqlalchemy import Column, Integer, String
from app.database import Base

class Contratista(Base):
    __tablename__ = "contratista"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
