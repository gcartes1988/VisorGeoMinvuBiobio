from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.sql import text
from sqlalchemy import and_
from shapely.wkb import loads as wkb_loads
from shapely.geometry import mapping
from typing import List, Optional
from sqlalchemy import union_all, select


from app.database import get_db
from app.models.proyecto import Proyecto
from app.models.pavimento import Pavimento
from app.models.ciclovia import Ciclovia
from app.models.parque import Parque
from app.schemas.proyecto import ProyectoCreate as ProyectoIn, ProyectoOut
from app.schemas.proyecto import ProyectoOut
from app.schemas.proyecto import ProyectoOutConCategoria





router = APIRouter(prefix="/proyectos", tags=["Proyectos"])

# Crear proyecto
@router.post("/", response_model=ProyectoOut)
def crear_proyecto(proyecto_in: ProyectoIn, request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")

    if user["rol"] == "editor":
        proyecto_in.estado_proyecto = "pendiente"

    proyecto = Proyecto(**proyecto_in.dict(), creado_por_id=user["usuario_id"])
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return proyecto

# Listar todos los proyectos con campo editable
@router.get("/")
def listar_proyectos(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")

    proyectos = db.query(Proyecto).options(selectinload(Proyecto.categoria)).filter(Proyecto.elim_pendiente == False).all()

    salida = []
    for p in proyectos:
        editable = user["rol"] == "admin" or p.creado_por_id == user["usuario_id"]
        salida.append({
            "id": p.id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "categoria": {
                "id": p.categoria.id,
                "nombre": p.categoria.nombre
            } if p.categoria else None,
            "estado_proyecto": p.estado_proyecto,
            "editable": editable
        })

    return salida

# Obtener un proyecto por ID
@router.get("/{id}", response_model=ProyectoOut)
def obtener_proyecto(id: int, db: Session = Depends(get_db)):
    proyecto = db.query(Proyecto).options(selectinload(Proyecto.categoria)).get(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto



# 🔍 Obtener proyectos aprobados que aún no están en pavimento, parque ni ciclovía
@router.get("/proyectos/huerfanos", response_model=List[ProyectoOutConCategoria])
def listar_proyectos_huerfanos(db: Session = Depends(get_db)):
    subquery_pavimento = db.query(models.Pavimento.proyecto_id)
    subquery_parque = db.query(models.Parque.proyecto_id)
    subquery_ciclovia = db.query(models.Ciclovia.proyecto_id)

    sub_union = subquery_pavimento.union(subquery_parque).union(subquery_ciclovia).subquery()

    proyectos = db.query(models.Proyecto).options(
        selectinload(models.Proyecto.categoria)  # para que venga embebida en el JSON
    ).filter(
        models.Proyecto.estado_proyecto == "aprobado",
        ~models.Proyecto.id.in_(select(sub_union))
    ).all()

    return proyectos

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

# Aprobar proyecto
@router.put("/{id}/aprobar")
def aprobar_proyecto(id: int, request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user or user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    proyecto = db.query(Proyecto).filter_by(id=id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    proyecto.estado_proyecto = "aprobado"
    proyecto.aprobado_por_id = user["usuario_id"]
    db.commit()
    return {"mensaje": "✅ Proyecto aprobado correctamente"}

# Rechazar proyecto
@router.put("/{id}/rechazar")
def rechazar_proyecto(id: int, request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user or user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    proyecto = db.query(Proyecto).filter_by(id=id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    proyecto.estado_proyecto = "rechazado"
    proyecto.aprobado_por_id = user["usuario_id"]
    db.commit()
    return {"mensaje": "⚠️ Proyecto rechazado correctamente"}

# Listar solo los pendientes (para admin)
@router.get("/pendientes")
def listar_proyectos_pendientes(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user or user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    proyectos = db.query(Proyecto).options(selectinload(Proyecto.categoria)).filter(
        Proyecto.estado_proyecto == "pendiente",
        Proyecto.elim_pendiente == False
    ).all()

    return [{
        "id": p.id,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "categoria": {
            "id": p.categoria.id,
            "nombre": p.categoria.nombre
        } if p.categoria else None,
        "estado_proyecto": p.estado_proyecto
    } for p in proyectos]

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
