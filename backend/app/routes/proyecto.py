from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.sql import text
from sqlalchemy import and_
from shapely.wkb import loads as wkb_loads
from shapely.geometry import mapping
from typing import List, Optional

from app.database import get_db
from app.models.proyecto import Proyecto
from app.models.pavimento import Pavimento
from app.models.ciclovia import Ciclovia
from app.models.parque import Parque
from app.models.usuario import Usuario
from app.schemas.proyecto import ProyectoCreate as ProyectoIn, ProyectoOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])

# Ruta pública GeoJSON
@router.get("/publicos", tags=["Proyectos Públicos"])
def obtener_feature_collection(
    categorias: List[int] = Query(default=[]),
    comuna: Optional[int] = Query(default=None),
    db: Session = Depends(get_db)
):
    def construir_feature(objeto, nombre, sector, tipo):
        if not objeto.geometria:
            return None
        return {
            "type": "Feature",
            "geometry": mapping(wkb_loads(bytes(objeto.geometria.data))),
            "properties": {
                "id": objeto.id,
                "nombre": nombre,
                "sector": sector,
                "tipo": tipo,
                "proyecto_id": objeto.proyecto_id,
                "comuna_id": objeto.comuna_id
            }
        }

    features = []

    if not categorias:
        categorias = [1, 2, 3]

    # Pavimentos
    if 1 in categorias:
        pav_query = db.query(Pavimento).join(Pavimento.proyecto).filter(
            Proyecto.estado_proyecto == 'aprobado',
            Proyecto.elim_pendiente == False
        )
        if comuna:
            pav_query = pav_query.filter(Pavimento.comuna_id == comuna)
        for p in pav_query:
            f = construir_feature(p, p.proyecto.nombre, p.sector, "Pavimento")
            if f:
                features.append(f)

    # Ciclovías
    if 2 in categorias:
        cic_query = db.query(Ciclovia).join(Ciclovia.proyecto).filter(
            Proyecto.estado_proyecto == 'aprobado',
            Proyecto.elim_pendiente == False
        )
        if comuna:
            cic_query = cic_query.filter(Ciclovia.comuna_id == comuna)
        for c in cic_query:
            f = construir_feature(c, c.proyecto.nombre, c.nombre_tramo, "Ciclovía")
            if f:
                features.append(f)

    # Parques
    if 3 in categorias:
        parque_query = db.query(Parque)\
            .options(selectinload(Parque.proyecto))\
            .filter(
                Parque.proyecto.has(
                    and_(
                        Proyecto.estado_proyecto == 'aprobado',
                        Proyecto.elim_pendiente == False
                    )
                )
            )
        if comuna:
            parque_query = parque_query.filter(Parque.comuna_id == comuna)

        for pk in parque_query:
            if not pk.proyecto:
                continue
            f = construir_feature(
                pk,
                pk.proyecto.nombre,
                pk.direccion or "Sin dirección",
                "Parque"
            )
            if f:
                features.append(f)

    return {
        "type": "FeatureCollection",
        "features": features
    }


# Crear proyecto (editor o admin)
@router.post("/", response_model=ProyectoOut)
def crear_proyecto(
    proyecto_in: ProyectoIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    if usuario.rol == "editor":
        proyecto_in.estado_proyecto = "pendiente"
    proyecto = Proyecto(**proyecto_in.dict(), creado_por_id=usuario.id)
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return proyecto

# Listar todos los proyectos
@router.get("/", response_model=List[ProyectoOut])
def listar_proyectos(db: Session = Depends(get_db)):
    return db.query(Proyecto).options(selectinload(Proyecto.categoria)).filter(Proyecto.elim_pendiente == False).all()

# Obtener un proyecto por ID
@router.get("/{id}", response_model=ProyectoOut)
def obtener_proyecto(id: int, db: Session = Depends(get_db)):
    proyecto = db.query(Proyecto).options(selectinload(Proyecto.categoria)).get(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto

# Actualizar proyecto
@router.put("/{id}", response_model=ProyectoOut)
def actualizar_proyecto(id: int, datos: ProyectoIn, db: Session = Depends(get_db)):
    proyecto = db.query(Proyecto).get(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    for campo, valor in datos.dict().items():
        setattr(proyecto, campo, valor)
    db.commit()
    db.refresh(proyecto)
    return proyecto

# Eliminar proyecto (soft delete)
@router.delete("/{id}")
def eliminar_proyecto(id: int, db: Session = Depends(get_db)):
    proyecto = db.query(Proyecto).get(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    proyecto.elim_pendiente = True
    db.commit()
    return {"detail": "Proyecto marcado como eliminado"}

# Totales públicos
@router.get("/publicos/totales")
def obtener_totales(db: Session = Depends(get_db)):
    query = text("""
        SELECT COUNT(*) FROM proyecto p
        WHERE p.estado_proyecto IN ('aprobado', 'pendiente')
          AND elim_pendiente = false
          AND (
              EXISTS (SELECT 1 FROM pavimento pa WHERE pa.proyecto_id = p.id)
              OR EXISTS (SELECT 1 FROM parque pr WHERE pr.proyecto_id = p.id)
              OR EXISTS (SELECT 1 FROM ciclovia c WHERE c.proyecto_id = p.id)
          )
    """)
    proyectos_activos = db.execute(query).scalar()

    total_pavimentos = db.query(Pavimento).count()
    total_ciclovias = db.query(Ciclovia).count()
    total_parques = db.query(Parque).count()

    return {
        "proyectos_activos": proyectos_activos,
        "pavimentos": total_pavimentos,
        "ciclovias": total_ciclovias,
        "parques": total_parques
    }
