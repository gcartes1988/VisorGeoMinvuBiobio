from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class LogCambio(Base):
    __tablename__ = "log_cambios"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyecto.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=True)
    accion = Column(String, nullable=False)
    campo_modificado = Column(String, nullable=False)
    valor_anterior = Column(Text)
    valor_nuevo = Column(Text)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
