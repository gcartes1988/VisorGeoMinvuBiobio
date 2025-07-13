from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Parque(Base):
    __tablename__ = "parque"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text)

    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    comuna = relationship("Comuna")

    # Relaciones
    proyecto_id = Column(Integer, ForeignKey("proyecto.id"), nullable=False)
    proyecto = relationship("Proyecto", back_populates="parques")
