import json
import traceback
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, selectinload
from shapely.geometry import shape, mapping
from shapely.wkb import loads as wkb_loads
from geoalchemy2.shape import from_shape

from app.database import get_db
from app.models.parque import Parque
from app.models.proyecto import Proyecto
from app.models.log_cambios import LogCambios
from app.models.usuario import Usuario
from app.schemas.parque import ParqueCreate, ParqueUpdate, ParqueOut, ParqueDetalleOut
from app.routes.usuario import get_current_user

router = APIRouter(prefix="/parques", tags=["Parques"])

@router.post("/crear-completo", response_model=ParqueOut)
async def crear_parque_con_proyecto(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        body = await request.json()
        payload = ParqueCreate(**body)
        geojson = payload.geometria if isinstance(payload.geometria, dict) else json.loads(payload.geometria)

        if not geojson.get("type") or not geojson.get("coordinates"):
            raise HTTPException(status_code=400, detail="❌ Geometría inválida.")

        geom_pg = from_shape(shape(geojson), srid=4326)

        nuevo_proyecto = Proyecto(
            nombre=payload.nombre,
            descripcion=payload.descripcion or "Proyecto tipo Parque",
            categoria_id=3,
            estado_proyecto="pendiente",
            creado_por_id=current_user.id
        )
        db.add(nuevo_proyecto)
        db.commit()
        db.refresh(nuevo_proyecto)

        nuevo = Parque(
            nombre=payload.nombre,
            proyecto_id=nuevo_proyecto.id,
            comuna_id=payload.comuna_id,
            direccion=payload.direccion,
            superficie_ha=payload.superficie_ha,
            fuente_financiamiento_id=payload.fuente_financiamiento_id,
            geometria=geom_pg
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)

        return ParqueOut(
            id=nuevo.id,
            proyecto_id=nuevo.proyecto_id,
            comuna_id=nuevo.comuna_id,
            nombre=nuevo.nombre,
            direccion=nuevo.direccion,
            superficie_ha=nuevo.superficie_ha,
            fuente_financiamiento_id=nuevo.fuente_financiamiento_id,
            geometria=mapping(shape(geojson))
        )

    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"❌ Error al crear parque completo: {str(e)}")

@router.get("/", response_model=list[ParqueDetalleOut])
def listar_parques(db: Session = Depends(get_db)):
    parques = db.query(Parque).options(
        selectinload(Parque.comuna),
        selectinload(Parque.fuente_financiamiento),
        selectinload(Parque.proyecto)
    ).all()

    resultados = []
    for p in parques:
        try:
            if p.geometria is None:
                continue
            geojson_geom = mapping(wkb_loads(bytes(p.geometria.data)))
            resultados.append(ParqueDetalleOut(
                id=p.id,
                proyecto_id=p.proyecto_id,
                nombre=p.nombre,
                direccion=p.direccion,
                superficie_ha=p.superficie_ha,
                fuente_financiamiento_id=p.fuente_financiamiento_id,
                comuna_id=p.comuna_id,
                geometria=geojson_geom,
                comuna=p.comuna,
                fuente_financiamiento=p.fuente_financiamiento,
                proyecto=p.proyecto
            ))
        except:
            continue
    return resultados

@router.get("/{parque_id}", response_model=ParqueDetalleOut)
def obtener_parque(parque_id: int, db: Session = Depends(get_db)):
    p = db.query(Parque).options(
        selectinload(Parque.comuna),
        selectinload(Parque.fuente_financiamiento),
        selectinload(Parque.proyecto)
    ).filter(Parque.id == parque_id).first()

    if not p:
        raise HTTPException(status_code=404, detail="❌ Parque no encontrado")

    geojson_geom = mapping(wkb_loads(bytes(p.geometria.data)))

    return ParqueDetalleOut(
        id=p.id,
        proyecto_id=p.proyecto_id,
        nombre=p.nombre,
        direccion=p.direccion,
        superficie_ha=p.superficie_ha,
        fuente_financiamiento_id=p.fuente_financiamiento_id,
        comuna_id=p.comuna_id,
        geometria=geojson_geom,
        comuna=p.comuna,
        fuente_financiamiento=p.fuente_financiamiento,
        proyecto=p.proyecto
    )

@router.put("/{parque_id}", response_model=dict)
def actualizar_parque(
    parque_id: int,
    payload: ParqueUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    parque = db.query(Parque).options(selectinload(Parque.proyecto)).filter(Parque.id == parque_id).first()
    if not parque:
        raise HTTPException(status_code=404, detail="❌ Parque no encontrado")

    cambios = []

    # ✅ Validar y actualizar geometría si cambió
    if payload.geometria:
        geojson = payload.geometria if isinstance(payload.geometria, dict) else json.loads(payload.geometria)
        nueva_geom_shape = shape(geojson)
        nueva_geom = from_shape(nueva_geom_shape, srid=4326)

        geom_actual = shape(wkb_loads(bytes(parque.geometria.data))) if parque.geometria else None

        if not geom_actual or geom_actual != nueva_geom_shape:
            cambios.append(LogCambios(
                proyecto_id=parque.proyecto_id,
                usuario_id=current_user.id,
                accion="update",
                campo_modificado="geometria",
                valor_anterior=str(geom_actual),
                valor_nuevo=json.dumps(geojson)
            ))
            parque.geometria = nueva_geom

    # ✅ Resto de los campos del modelo Parque
    for attr, value in payload.dict(exclude={"geometria", "estado_proyecto"}, exclude_unset=True).items():
        anterior = getattr(parque, attr)
        if value != anterior:
            cambios.append(LogCambios(
                proyecto_id=parque.proyecto_id,
                usuario_id=current_user.id,
                accion="update",
                campo_modificado=attr,
                valor_anterior=str(anterior),
                valor_nuevo=str(value)
            ))
            setattr(parque, attr, value)

    # ✅ Solo el admin puede cambiar el estado del proyecto
        if hasattr(payload, "estado_proyecto") and payload.estado_proyecto and current_user.rol == "admin":
            proyecto = parque.proyecto
            if payload.estado_proyecto != proyecto.estado_proyecto:
                cambios.append(LogCambios(
                    proyecto_id=proyecto.id,
                    usuario_id=current_user.id,
                    accion="update",
                    campo_modificado="estado_proyecto",
                    valor_anterior=proyecto.estado_proyecto.value,  # 🔧 conversión del Enum a string
                    valor_nuevo=payload.estado_proyecto  # asumimos que esto viene como string desde el frontend
                ))
                proyecto.estado_proyecto = payload.estado_proyecto


    if not cambios:
        return {"mensaje": "⚠️ No se detectaron cambios para actualizar."}

    for c in cambios:
        db.add(c)

    db.commit()
    return {"mensaje": "✅ Parque actualizado correctamente"}



@router.delete("/{parque_id}", response_model=dict)
def eliminar_parque(parque_id: int, db: Session = Depends(get_db)):
    parque = db.query(Parque).filter(Parque.id == parque_id).first()
    if not parque:
        raise HTTPException(status_code=404, detail="❌ Parque no encontrado")
    db.delete(parque)
    db.commit()
    return {"mensaje": "🗑️ Parque eliminado correctamente"}
