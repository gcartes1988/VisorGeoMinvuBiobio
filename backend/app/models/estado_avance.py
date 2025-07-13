from sqlalchemy import Column, Integer, String
from app.database import Base

class EstadoAvance(Base):
    __tablename__ = 'estado_avance'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
