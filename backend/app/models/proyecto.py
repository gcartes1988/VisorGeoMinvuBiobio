from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class EstadoProyectoEnum(enum.Enum):
    pendiente = "pendiente"
    aprobado = "aprobado"
    rechazado = "rechazado"

class Proyecto(Base):
    __tablename__ = "proyecto"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text)
    categoria_id = Column(Integer, ForeignKey("categoria.id"))
    estado_proyecto = Column(Enum(EstadoProyectoEnum), nullable=False)
    elim_pendiente = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime)
    fecha_aprobacion = Column(DateTime, nullable=True)
    creado_por_id = Column(Integer, ForeignKey("usuario.id"))
    aprobado_por_id = Column(Integer, ForeignKey("usuario.id"), nullable=True)
    proyecto_padre_id = Column(Integer, ForeignKey("proyecto.id"), nullable=True)

    # Relaciones
    categoria = relationship("Categoria", back_populates="proyectos")
    creado_por = relationship("Usuario", foreign_keys=[creado_por_id], back_populates="proyectos_creados")
    aprobado_por = relationship("Usuario", foreign_keys=[aprobado_por_id], back_populates="proyectos_aprobados")
    documentos = relationship("Documento", back_populates="proyecto", cascade="all, delete")
    parques = relationship("Parque", back_populates="proyecto", cascade="all, delete")
    pavimentos = relationship("Pavimento", back_populates="proyecto", cascade="all, delete")
    ciclovias = relationship("Ciclovia", back_populates="proyecto", cascade="all, delete")

    # Relación recursiva (proyecto padre)
    proyecto_padre = relationship("Proyecto", remote_side=[id])
    # en models/proyecto.py
    pavimentos = relationship("Pavimento", back_populates="proyecto")

