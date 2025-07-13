from sqlalchemy import Column, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base

class Ciclovia(Base):
    __tablename__ = "ciclovia"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyecto.id", ondelete="CASCADE"), nullable=False)
    tipo_ciclovia_id = Column(Integer, ForeignKey("tipo_ciclovia.id"), nullable=False)
    longitud_metros = Column(Integer, nullable=False)
    observaciones = Column(Text)

    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    comuna = relationship("Comuna")

    geometria = Column(Geometry(geometry_type="LINESTRING", srid=4326), nullable=False)

    # Relaciones
    proyecto = relationship("Proyecto", back_populates="ciclovias")
    tipo_ciclovia = relationship("TipoCiclovia")
