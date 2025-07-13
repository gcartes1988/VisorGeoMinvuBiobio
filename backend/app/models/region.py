from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Region(Base):
    __tablename__ = "region"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)

    # Relaciones
    provincias = relationship("Provincia", back_populates="region")
