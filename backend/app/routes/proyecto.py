from fastapi import APIRouter, Depends, HTTPException, Request, Query
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
from app.schemas.proyecto import ProyectoCreate as ProyectoIn, ProyectoOut

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])


# --------------------- 📍 RUTAS PÚBLICAS --------------------- #

@router.get("/publicos")
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
        parque_query = db.query(Parque).options(selectinload(Parque.proyecto)).filter(
            Parque.proyecto.has(and_(
                Proyecto.estado_proyecto == 'aprobado',
                Proyecto.elim_pendiente == False
            ))
        )
        if comuna:
            parque_query = parque_query.filter(Parque.comuna_id == comuna)
        for pk in parque_query:
            if not pk.proyecto:
                continue
            f = construir_feature(pk, pk.proyecto.nombre, pk.direccion or "Sin dirección", "Parque")
            if f:
                features.append(f)

    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.get("/publicos/totales")
def obtener_totales(db: Session = Depends(get_db)):
    query = text("""
        SELECT COUNT(*) FROM proyecto p
        WHERE p.estado_proyecto = 'aprobado'
          AND elim_pendiente = false
          AND (
              EXISTS (SELECT 1 FROM pavimento pa WHERE pa.proyecto_id = p.id)
              OR EXISTS (SELECT 1 FROM parque pr WHERE pr.proyecto_id = p.id)
              OR EXISTS (SELECT 1 FROM ciclovia c WHERE c.proyecto_id = p.id)
          )
    """)
    proyectos_activos = db.execute(query).scalar()

    total_pavimentos = db.query(Pavimento).join(Pavimento.proyecto).filter(
        Proyecto.estado_proyecto == 'aprobado',
        Proyecto.elim_pendiente == False,
        Pavimento.geometria.isnot(None)
    ).count()

    total_ciclovias = db.query(Ciclovia).join(Ciclovia.proyecto).filter(
        Proyecto.estado_proyecto == 'aprobado',
        Proyecto.elim_pendiente == False,
        Ciclovia.geometria.isnot(None)
    ).count()

    total_parques = db.query(Parque).join(Parque.proyecto).filter(
        Proyecto.estado_proyecto == 'aprobado',
        Proyecto.elim_pendiente == False,
        Parque.geometria.isnot(None)
    ).count()

    return {
        "proyectos_activos": proyectos_activos,
        "pavimentos": total_pavimentos,
        "ciclovias": total_ciclovias,
        "parques": total_parques
    }

# --------------------- 🔐 RUTAS PRIVADAS --------------------- #

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


@router.get("/")
def listar_proyectos_sin_geo(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")

    proyectos = db.query(Proyecto).filter(
        Proyecto.estado_proyecto == "aprobado",
        Proyecto.elim_pendiente == False,
        ~Proyecto.pavimentos.any(Pavimento.geometria.isnot(None)),
        ~Proyecto.ciclovias.any(Ciclovia.geometria.isnot(None)),
        ~Proyecto.parques.any(Parque.geometria.isnot(None))
    ).options(selectinload(Proyecto.categoria)).all()

    return [{
        "id": p.id,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "categoria": {
            "id": p.categoria.id,
            "nombre": p.categoria.nombre
        } if p.categoria else None,
        "estado_proyecto": p.estado_proyecto,
        "editable": user["rol"] == "admin" or p.creado_por_id == user["usuario_id"]
    } for p in proyectos]


@router.get("/padres")
def listar_proyectos_padres_reales(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")

    proyectos_padres = db.query(Proyecto).options(selectinload(Proyecto.categoria)).filter(
        Proyecto.estado_proyecto == "aprobado",
        Proyecto.elim_pendiente == False,
        ~Proyecto.categoria_id.in_([1, 2, 3])
    ).all()

    return [{
        "id": p.id,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "categoria": {
            "id": p.categoria.id,
            "nombre": p.categoria.nombre
        } if p.categoria else None,
        "estado_proyecto": p.estado_proyecto,
        "editable": user["rol"] == "admin" or p.creado_por_id == user["usuario_id"],
        "hijos": []
    } for p in proyectos_padres]


@router.get("/aprobados")
def listar_proyectos_aprobados(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")

    proyectos = db.query(Proyecto).options(selectinload(Proyecto.categoria)).filter(
        Proyecto.estado_proyecto == "aprobado",
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
        "estado_proyecto": p.estado_proyecto,
        "editable": user["rol"] == "admin" or p.creado_por_id == user["usuario_id"]
    } for p in proyectos]


@router.get("/{id}", response_model=ProyectoOut)
def obtener_proyecto(id: int, db: Session = Depends(get_db)):
    proyecto = db.query(Proyecto).options(selectinload(Proyecto.categoria)).get(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


@router.put("/{id}", response_model=ProyectoOut)
def actualizar_proyecto(id: int, datos: ProyectoIn, request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")

    proyecto = db.query(Proyecto).get(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if user["rol"] != "admin" and proyecto.creado_por_id != user["usuario_id"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    for campo, valor in datos.dict().items():
        setattr(proyecto, campo, valor)

    db.commit()
    db.refresh(proyecto)
    return proyecto


@router.delete("/{id}")
def eliminar_proyecto(id: int, request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")

    proyecto = db.query(Proyecto).get(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if user["rol"] != "admin" and proyecto.creado_por_id != user["usuario_id"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    proyecto.elim_pendiente = True
    db.commit()
    return {"detail": "Proyecto eliminado correctamente"}


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
