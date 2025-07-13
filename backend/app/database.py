# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Importar modelos para que SQLAlchemy los registre
from app.models import (
    region, provincia, comuna, categoria, usuario,
    proyecto, documento, log_cambios, pavimento,
    ciclovia, parque, estado_avance, tipo_calzada,
    tipo_pavimento, tipo_ciclovia, contratista, fuente_financiamiento
)
