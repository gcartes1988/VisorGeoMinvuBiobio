from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, selectinload
from geoalchemy2.shape import from_shape
from shapely.geometry import shape

from app.database import get_db
from app.models.parque import Parque
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario
from app.schemas.parque import ParqueOut, ParqueCreate, ParqueUpdate
from app.routes.usuario import get_current_user
from app.utils.geo import convertir_wkb_a_geojson, validar_y_convertir_geojson


router = APIRouter(prefix="/parques", tags=["Parques"])


@router.get("/", response_model=list[ParqueOut])
def listar_parques(db: Session = Depends(get_db), request: Request = None):
    parques = db.query(Parque).options(
        selectinload(Parque.comuna),
        selectinload(Parque.fuente_financiamiento),
        selectinload(Parque.proyecto)
    ).all()

    user = request.state.user if request else None
    resultados = []

    for p in parques:
        comuna_dict = {
            "id": p.comuna.id,
            "nombre": p.comuna.nombre,
            "provincia_id": p.comuna.provincia_id
        } if p.comuna else None

        fuente_dict = {
            "id": p.fuente_financiamiento.id,
            "nombre": p.fuente_financiamiento.nombre
        } if p.fuente_financiamiento else None

        proyecto_dict = {
            "id": p.proyecto.id,
            "nombre": p.proyecto.nombre,
            "categoria_id": p.proyecto.categoria_id,
            "estado_proyecto": p.proyecto.estado_proyecto.value,
            "fecha_creacion": p.proyecto.fecha_creacion
        } if p.proyecto else None

        editable = False
        if user and user["rol"] == "admin":
            editable = True
        elif p.proyecto and p.proyecto.creado_por_id == user["usuario_id"]:
            editable = True

        resultados.append({
            "id": p.id,
            "nombre": p.nombre,
            "direccion": p.direccion,
            "superficie_ha": p.superficie_ha,
            "comuna_id": p.comuna_id,
            "fuente_financiamiento_id": p.fuente_financiamiento_id,
            "proyecto_id": p.proyecto_id,
            "geometria": convertir_wkb_a_geojson(p.geometria),
            "comuna": comuna_dict,
            "fuente_financiamiento": fuente_dict,
            "proyecto": proyecto_dict,
            "editable": editable
        })

    return resultados




@router.post("/", response_model=ParqueOut)
async def crear_parque(request: Request, db: Session = Depends(get_db)):
    try:
        user = request.state.user
        body = await request.json()

        payload = ParqueCreate(**body)
        geojson = json.loads(payload.geometria) if isinstance(payload.geometria, str) else payload.geometria

        if not geojson.get("type") or not geojson.get("coordinates"):
            raise HTTPException(status_code=400, detail="❌ Geometría inválida.")

        geom_pg = from_shape(shape(geojson), srid=4326)

        nuevo = Parque(
            proyecto_id=payload.proyecto_id,
            comuna_id=payload.comuna_id,
            nombre=payload.nombre,
            direccion=payload.direccion,
            superficie_ha=payload.superficie_ha,
            fuente_financiamiento_id=payload.fuente_financiamiento_id,
            geometria=geom_pg
        )

        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)

        # Asegurar que relaciones estén cargadas
        try:
            _ = nuevo.comuna.provincia_id
        except:
            db.refresh(nuevo, attribute_names=["comuna"])

        if nuevo.fuente_financiamiento_id and not nuevo.fuente_financiamiento:
            db.refresh(nuevo, attribute_names=["fuente_financiamiento"])
        if nuevo.proyecto_id and not nuevo.proyecto:
            db.refresh(nuevo, attribute_names=["proyecto"])

        geojson_geom = mapping(shape(geojson))

        editable = False
        if user and user["rol"] == "admin":
            editable = True
        else:
            proyecto = db.query(Proyecto).filter(Proyecto.id == nuevo.proyecto_id).first()
            if proyecto and proyecto.creado_por_id == user["usuario_id"]:
                editable = True

        return ParqueOut(
            id=nuevo.id,
            proyecto_id=nuevo.proyecto_id,
            comuna_id=nuevo.comuna_id,
            nombre=nuevo.nombre,
            direccion=nuevo.direccion,
            superficie_ha=nuevo.superficie_ha,
            fuente_financiamiento_id=nuevo.fuente_financiamiento_id,
            geometria=geojson_geom,
            comuna=nuevo.comuna,
            fuente_financiamiento=nuevo.fuente_financiamiento,
            proyecto=nuevo.proyecto,
            editable=editable
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"❌ Error interno: {str(e)}")


@router.put("/{parque_id}", response_model=dict)
def actualizar_parque(parque_id: int, payload: ParqueUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    parque = db.query(Parque).filter(Parque.id == parque_id).first()
    if not parque:
        raise HTTPException(status_code=404, detail="❌ Parque no encontrado")

    proyecto = db.query(Proyecto).filter(Proyecto.id == parque.proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="❌ Proyecto no encontrado")

    if current_user.rol != "admin" and proyecto.creado_por_id != current_user.id:
        raise HTTPException(status_code=403, detail="❌ No autorizado para editar este parque")

    try:
        if payload.geometria:
            parque.geometria = validar_y_convertir_geojson(payload.geometria, tipo_esperado="Polygon")

        for attr, value in payload.dict(exclude_unset=True).items():
            if attr != "geometria":
                setattr(parque, attr, value)

        db.commit()
        return {"mensaje": "✅ Parque actualizado correctamente"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"❌ Error al actualizar parque: {str(e)}")


@router.delete("/{parque_id}", response_model=dict)
def eliminar_parque(parque_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    parque = db.query(Parque).filter(Parque.id == parque_id).first()
    if not parque:
        raise HTTPException(status_code=404, detail="❌ Parque no encontrado")

    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="❌ Solo administradores pueden eliminar parques")

    try:
        db.delete(parque)
        db.commit()
        return {"mensaje": "🗑️ Parque eliminado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"❌ Error al eliminar parque: {str(e)}")
