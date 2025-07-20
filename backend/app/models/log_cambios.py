# backend/app/models/log_cambios.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class LogCambios(Base):
    __tablename__ = "log_cambios"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow)

    proyecto_id = Column(Integer, ForeignKey("proyecto.id"))
    usuario_id = Column(Integer, ForeignKey("usuario.id"))

    accion = Column(String)
    campo_modificado = Column(String)
    valor_anterior = Column(Text)
    valor_nuevo = Column(Text)

    proyecto = relationship("Proyecto")
    usuario = relationship("Usuario")
