from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, nullable=False)
    nombre_usuario = Column(String, nullable=False)
    rol = Column(String, nullable=False)  # 'admin' o 'editor'

    proyectos_creados = relationship(
        "Proyecto",
        foreign_keys="[Proyecto.creado_por_id]",
        back_populates="creado_por"
    )

    proyectos_aprobados = relationship(
        "Proyecto",
        foreign_keys="[Proyecto.aprobado_por_id]",
        back_populates="aprobado_por"
    )
