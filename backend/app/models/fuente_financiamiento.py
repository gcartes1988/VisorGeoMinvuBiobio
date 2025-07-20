from sqlalchemy import Column, Integer, String
from app.database import Base

class FuenteFinanciamiento(Base):
    __tablename__ = "fuente_financiamiento"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
