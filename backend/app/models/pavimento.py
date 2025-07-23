from sqlalchemy import Column, Integer, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base

class Pavimento(Base):
    __tablename__ = "pavimento"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyecto.id"), nullable=False)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    sector = Column(Text, nullable=False)
    tipo_calzada_id = Column(Integer, ForeignKey("tipo_calzada.id"), nullable=False)
    estado_avance_id = Column(Integer, ForeignKey("estado_avance.id"), nullable=False)
    longitud_metros = Column(Float, nullable=False)
    geometria = Column(Geometry("LINESTRING", srid=4326), nullable=False)
    


    # Relaciones
    proyecto = relationship("Proyecto", back_populates="pavimentos")
    comuna = relationship("Comuna", back_populates="pavimentos")
    tipo_calzada = relationship("TipoCalzada", backref="pavimentos")
    estado_avance = relationship("EstadoAvance", backref="pavimentos")
