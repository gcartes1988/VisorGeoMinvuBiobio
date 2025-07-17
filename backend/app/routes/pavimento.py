import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import text
from shapely.geometry import shape, mapping
from shapely.wkb import loads as wkb_loads
from geoalchemy2.shape import from_shape

from typing import List
from app.database import get_db
from app.models.pavimento import Pavimento
from app.schemas.pavimento import PavimentoCreate, PavimentoUpdate, PavimentoOut
from app.routes.usuario import get_current_user
from app.models.usuario import Usuario

router = APIRouter(prefix="/pavimentos", tags=["Pavimentos"])

@router.post("/", response_model=PavimentoOut)
async def crear_pavimento(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
        print("📨 BODY RECIBIDO:", json.dumps(body, indent=2, ensure_ascii=False))

        # Validar payload contra el esquema
        payload = PavimentoCreate(**body)
        print("🔍 Campos activos en schema:", PavimentoCreate.__annotations__)
        print("📦 Payload recibido:", payload)
        print("📏 Geometría cruda:", payload.geometria)

        # Convertir string a dict si es necesario
        geojson = json.loads(payload.geometria) if isinstance(payload.geometria, str) else payload.geometria
        print("📏 GeoJSON como dict:", geojson)

        # Validar estructura mínima del GeoJSON
        if "type" not in geojson or "coordinates" not in geojson:
            raise HTTPException(status_code=400, detail="❌ Geometría inválida.")

        # Convertir a formato PostGIS
        geom_pg = from_shape(shape(geojson), srid=4326)

        # Crear nuevo pavimento
        nuevo = Pavimento(
            proyecto_id=payload.proyecto_id,
            comuna_id=payload.comuna_id,
            sector=payload.sector,
            longitud_metros=payload.longitud_metros,
            tipo_calzada_id=payload.tipo_calzada_id,
            estado_avance_id=payload.estado_avance_id,
            geometria=geom_pg
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)

        # Insertar en tabla intermedia
        for tipo_id in payload.tipos_pavimento:
            db.execute(
                text("INSERT INTO pavimento_tipo_pavimento (pavimento_id, tipo_pavimento_id) VALUES (:pid, :tid)"),
                {"pid": nuevo.id, "tid": tipo_id}
            )

        # Consultar los tipos agregados
        tipos = db.execute(
            text("SELECT id, nombre FROM tipo_pavimento WHERE id IN (SELECT tipo_pavimento_id FROM pavimento_tipo_pavimento WHERE pavimento_id = :pid)"),
            {"pid": nuevo.id}
        ).fetchall()

        # Devolver geometría como GeoJSON
        geojson_geom = mapping(shape(geojson))

        return PavimentoOut(
            id=nuevo.id,
            proyecto_id=nuevo.proyecto_id,
            sector=nuevo.sector,
            longitud_metros=nuevo.longitud_metros,
            tipo_calzada_id=nuevo.tipo_calzada_id,
            geometria=geojson_geom,
            comuna={"id": nuevo.comuna.id, "nombre": nuevo.comuna.nombre},
            estado_avance={"id": nuevo.estado_avance.id, "nombre": nuevo.estado_avance.nombre},
            tipos_pavimento=[{"id": t.id, "nombre": t.nombre} for t in tipos]
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"❌ Error interno: {str(e)}")

@router.get("/", response_model=List[PavimentoOut])
def listar_pavimentos(db: Session = Depends(get_db)):
    pavimentos = db.query(Pavimento).options(
        selectinload(Pavimento.comuna),
        selectinload(Pavimento.estado_avance)
    ).all()

    resultados = []
    for p in pavimentos:
        try:
            tipos = db.execute(
                text("SELECT id, nombre FROM tipo_pavimento WHERE id IN (SELECT tipo_pavimento_id FROM pavimento_tipo_pavimento WHERE pavimento_id = :pid)"),
                {"pid": p.id}
            ).fetchall()

            geojson_geom = mapping(wkb_loads(bytes(p.geometria.data)))
            resultados.append(PavimentoOut(
                id=p.id,
                proyecto_id=p.proyecto_id,
                sector=p.sector,
                longitud_metros=p.longitud_metros,
                tipo_calzada_id=p.tipo_calzada_id,
                geometria=geojson_geom,
                comuna={"id": p.comuna.id, "nombre": p.comuna.nombre},
                estado_avance={"id": p.estado_avance.id, "nombre": p.estado_avance.nombre},
                tipos_pavimento=[{"id": t.id, "nombre": t.nombre} for t in tipos]
            ))
        except Exception:
            continue
    return resultados

@router.get("/{pavimento_id}", response_model=PavimentoOut)
def obtener_pavimento(pavimento_id: int, db: Session = Depends(get_db)):
    pavimento = db.query(Pavimento).options(
        selectinload(Pavimento.comuna),
        selectinload(Pavimento.estado_avance)
    ).filter(Pavimento.id == pavimento_id).first()

    if not pavimento:
        raise HTTPException(status_code=404, detail="❌ Pavimento no encontrado.")

    tipos = db.execute(
        text("SELECT id, nombre FROM tipo_pavimento WHERE id IN (SELECT tipo_pavimento_id FROM pavimento_tipo_pavimento WHERE pavimento_id = :pid)"),
        {"pid": pavimento.id}
    ).fetchall()

    geojson_geom = mapping(wkb_loads(bytes(pavimento.geometria.data)))
    return PavimentoOut(
        id=pavimento.id,
        proyecto_id=pavimento.proyecto_id,
        sector=pavimento.sector,
        longitud_metros=pavimento.longitud_metros,
        tipo_calzada_id=pavimento.tipo_calzada_id,
        geometria=geojson_geom,
        comuna={"id": pavimento.comuna.id, "nombre": pavimento.comuna.nombre},
        estado_avance={"id": pavimento.estado_avance.id, "nombre": pavimento.estado_avance.nombre},
        tipos_pavimento=[{"id": t.id, "nombre": t.nombre} for t in tipos]
    )

@router.put("/{pavimento_id}", response_model=dict)
def actualizar_pavimento(
    pavimento_id: int,
    payload: PavimentoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    pavimento = db.query(Pavimento).filter(Pavimento.id == pavimento_id).first()
    if not pavimento:
        raise HTTPException(status_code=404, detail="❌ Pavimento no encontrado.")

    try:
        cambios = []

        if payload.geometria:
            nueva_geom = json.loads(payload.geometria) if isinstance(payload.geometria, str) else payload.geometria
            if "type" not in nueva_geom or "coordinates" not in nueva_geom:
                raise HTTPException(status_code=400, detail="❌ Geometría inválida.")
            nueva_geom_shape = from_shape(shape(nueva_geom), srid=4326)
            if pavimento.geometria != nueva_geom_shape:
                from app.models.log_cambios import LogCambio
                cambios.append(LogCambio(
                    proyecto_id=pavimento.proyecto_id,
                    usuario_id=current_user.id,
                    accion="edición",
                    campo_modificado="geometría",
                    valor_anterior=str(pavimento.geometria),
                    valor_nuevo=json.dumps(nueva_geom)
                ))
                pavimento.geometria = nueva_geom_shape

        for attr, value in payload.dict(exclude_unset=True).items():
            if attr in ["geometria", "tipos_pavimento"]:
                continue
            valor_anterior = getattr(pavimento, attr)
            if value != valor_anterior:
                from app.models.log_cambios import LogCambio
                cambios.append(LogCambio(
                    proyecto_id=pavimento.proyecto_id,
                    usuario_id=current_user.id,
                    accion="edición",
                    campo_modificado=attr,
                    valor_anterior=str(valor_anterior),
                    valor_nuevo=str(value)
                ))
                setattr(pavimento, attr, value)

        db.execute(
            text("DELETE FROM pavimento_tipo_pavimento WHERE pavimento_id = :pid"),
            {"pid": pavimento_id}
        )

        for tipo_id in payload.tipos_pavimento or []:
            db.execute(
                text("INSERT INTO pavimento_tipo_pavimento (pavimento_id, tipo_pavimento_id) VALUES (:pid, :tid)"),
                {"pid": pavimento_id, "tid": tipo_id}
            )

        for cambio in cambios:
            db.add(cambio)

        db.commit()
        db.refresh(pavimento)
        return {"mensaje": "✅ Pavimento actualizado correctamente"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"❌ Error interno: {str(e)}")

@router.delete("/{pavimento_id}", response_model=dict)
def eliminar_pavimento(pavimento_id: int, db: Session = Depends(get_db)):
    pavimento = db.query(Pavimento).filter(Pavimento.id == pavimento_id).first()
    if not pavimento:
        raise HTTPException(status_code=404, detail="❌ Pavimento no encontrado.")

    db.delete(pavimento)
    db.commit()
    return {"mensaje": "🗑️ Pavimento eliminado correctamente"}
