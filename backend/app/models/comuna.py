from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Comuna(Base):
    __tablename__ = "comuna"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String, nullable=False)
    provincia_id = Column(Integer, ForeignKey("provincia.id"))

    # Relaciones
    provincia = relationship("Provincia", back_populates="comunas")
    pavimentos = relationship("Pavimento", back_populates="comuna")

