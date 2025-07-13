from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Documento(Base):
    __tablename__ = "documento"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    url = Column(String, nullable=False)
    proyecto_id = Column(Integer, ForeignKey("proyecto.id"))

    # Relaciones
    proyecto = relationship("Proyecto", back_populates="documentos")
