# app/models/tipo_pavimento.py

from sqlalchemy import Column, Integer, String
from app.database import Base

class TipoPavimento(Base):
    __tablename__ = "tipo_pavimento"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
