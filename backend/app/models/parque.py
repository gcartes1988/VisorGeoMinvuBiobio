from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base

class Parque(Base):
    __tablename__ = "parque"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)

    proyecto_id = Column(Integer, ForeignKey("proyecto.id"), nullable=False)
    proyecto = relationship("Proyecto", back_populates="parques")

    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    comuna = relationship("Comuna")

    direccion = Column(String)
    superficie_ha = Column(Float)

    fuente_financiamiento_id = Column(Integer, ForeignKey("fuente_financiamiento.id"))
    fuente_financiamiento = relationship("FuenteFinanciamiento")

    geometria = Column(Geometry(geometry_type="POLYGON", srid=4326))


