import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.models.proyecto import Proyecto, EstadoProyectoEnum
from app.schemas.proyecto import ProyectoCreate, ProyectoPublicoOut
from app.models.usuario import Usuario
from app.utils.firebase_auth import verify_token

router = APIRouter()

# Obtener usuario actual desde token JWT Firebase
# Se utiliza para autenticar usuarios en rutas protegidas

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> Usuario:
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Formato de token inválido")
        decoded_token = verify_token(token)
        firebase_uid = decoded_token["uid"]
        user = db.query(Usuario).filter(Usuario.firebase_uid == firebase_uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado en la base de datos")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {e}")

# Middleware para verificar si el usuario tiene rol admin

def admin_required(user: Usuario = Depends(get_current_user)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="⛔ Acceso solo para administradores")
    return user

# Ruta GET que lista proyectos con filtros opcionales por categoría y estado
@router.get("/proyectos")
def listar_proyectos(categoria_id: int = Query(None), estado: str = Query(None), db: Session = Depends(get_db)):
    condiciones = []
    if categoria_id:
        condiciones.append(f"p.categoria_id = {categoria_id}")
    if estado:
        condiciones.append(f"p.estado_proyecto = '{estado}'")

    where_clause = " AND ".join(condiciones)
    if where_clause:
        where_clause = "WHERE " + where_clause

    query = text(f"""
        SELECT p.id, p.nombre, p.descripcion, p.estado_proyecto, cat.nombre AS categoria
        FROM proyecto p
        JOIN categoria cat ON p.categoria_id = cat.id
        {where_clause};
    """)

    result = db.execute(query)

    proyectos = [
        {
            "id": row.id,
            "nombre": row.nombre,
            "descripcion": row.descripcion,
            "estado": row.estado_proyecto,
            "categoria": row.categoria,
        } for row in result
    ]

    return proyectos

# Ruta POST para crear un proyecto como administrador
@router.post("/proyectos")
def crear_proyecto(payload: ProyectoCreate, db: Session = Depends(get_db), user: Usuario = Depends(admin_required)):
    try:
        nuevo_proyecto = Proyecto(
            nombre=payload.nombre,
            descripcion=payload.descripcion,
            categoria_id=payload.categoria_id,
            estado_proyecto=payload.estado_proyecto,
            creado_por_id=user.id,
            fecha_creacion=payload.fecha_creacion or datetime.utcnow()
        )
        db.add(nuevo_proyecto)
        db.commit()
        db.refresh(nuevo_proyecto)

        return {"mensaje": "✅ Proyecto creado correctamente", "id": nuevo_proyecto.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Ruta POST para crear un proyecto por un editor (estado por defecto: pendiente)
@router.post("/proyectos/editor")
def crear_proyecto_por_editor(payload: ProyectoCreate, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    if user.rol not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="⛔ Acceso no autorizado")

    try:
        nuevo_proyecto = Proyecto(
            nombre=payload.nombre,
            descripcion=payload.descripcion,
            categoria_id=payload.categoria_id,
            estado_proyecto="pendiente",
            creado_por_id=user.id,
            fecha_creacion=payload.fecha_creacion or datetime.utcnow()
        )
        db.add(nuevo_proyecto)
        db.commit()
        db.refresh(nuevo_proyecto)

        return {"mensaje": "📝 Proyecto creado y pendiente de aprobación", "id": nuevo_proyecto.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Ruta PUT para aprobar un proyecto (solo admin)
@router.put("/proyectos/{id}/aprobar")
def aprobar_proyecto(id: int, db: Session = Depends(get_db), user: Usuario = Depends(admin_required)):
    proyecto = db.query(Proyecto).filter(Proyecto.id == id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="🚫 Proyecto no encontrado")
    if proyecto.estado_proyecto == "aprobado":
        raise HTTPException(status_code=400, detail="📌 El proyecto ya está aprobado")

    proyecto.estado_proyecto = "aprobado"
    proyecto.aprobado_por_id = user.id
    proyecto.fecha_aprobacion = datetime.utcnow()
    db.commit()

    return {"mensaje": f"✅ Proyecto '{proyecto.nombre}' aprobado correctamente"}

# Ruta PUT para rechazar un proyecto
@router.put("/proyectos/{id}/rechazar")
def rechazar_proyecto(id: int, db: Session = Depends(get_db), user: Usuario = Depends(admin_required)):
    proyecto = db.query(Proyecto).filter(Proyecto.id == id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="🚫 Proyecto no encontrado")
    if proyecto.estado_proyecto == "rechazado":
        raise HTTPException(status_code=400, detail="📌 El proyecto ya fue rechazado")

    proyecto.estado_proyecto = "rechazado"
    proyecto.aprobado_por_id = user.id
    proyecto.fecha_aprobacion = datetime.utcnow()
    db.commit()

    return {"mensaje": f"❌ Proyecto '{proyecto.nombre}' rechazado correctamente"}

# Ruta PUT para marcar proyecto como pendiente de eliminación
@router.put("/proyectos/{id}/eliminar")
def marcar_para_eliminar(id: int, db: Session = Depends(get_db), user: Usuario = Depends(admin_required)):
    proyecto = db.query(Proyecto).filter(Proyecto.id == id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="🚫 Proyecto no encontrado")

    proyecto.elim_pendiente = True
    db.commit()
    return {"mensaje": f"🗑️ Proyecto '{proyecto.nombre}' marcado para eliminación"}

# Ruta pública que lista proyectos aprobados por tipo y comuna
@router.get("/proyectos/publicos", response_model=list[ProyectoPublicoOut])
def get_proyectos_publicos(categoria_id: Optional[int] = Query(None), comuna_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if not categoria_id and not comuna_id:
        raise HTTPException(status_code=400, detail="Debes seleccionar al menos una categoría o una comuna.")

    condiciones_base = "p.elim_pendiente = FALSE AND p.estado_proyecto = 'aprobado'"
    condiciones_pav = condiciones_base
    condiciones_cic = condiciones_base
    condiciones_par = condiciones_base

    if categoria_id:
        condiciones_pav += " AND p.categoria_id = :categoria_id"
        condiciones_cic += " AND p.categoria_id = :categoria_id"
        condiciones_par += " AND p.categoria_id = :categoria_id"

    if comuna_id:
        condiciones_pav += " AND pav.comuna_id = :comuna_id"
        condiciones_cic += " AND cic.comuna_id = :comuna_id"
        condiciones_par += " AND par.comuna_id = :comuna_id"

    query = f"""
        SELECT p.id AS proyecto_id, p.nombre, pav.sector, ST_AsGeoJSON(pav.geometria) AS geometria, 'pavimento' AS tipo
        FROM proyecto p
        JOIN pavimento pav ON pav.proyecto_id = p.id
        WHERE {condiciones_pav}

        UNION

        SELECT p.id AS proyecto_id, p.nombre, cic.nombre_tramo AS sector, ST_AsGeoJSON(cic.geometria) AS geometria, 'ciclovia' AS tipo
        FROM proyecto p
        JOIN ciclovia cic ON cic.proyecto_id = p.id
        WHERE {condiciones_cic}

        UNION

        SELECT p.id AS proyecto_id, p.nombre, par.direccion AS sector, ST_AsGeoJSON(par.geometria) AS geometria, 'parque' AS tipo
        FROM proyecto p
        JOIN parque par ON par.proyecto_id = p.id
        WHERE {condiciones_par}
    """

    params = {}
    if categoria_id:
        params["categoria_id"] = categoria_id
    if comuna_id:
        params["comuna_id"] = comuna_id

    resultados = db.execute(text(query), params)
    column_names = resultados.keys()

    resultados_limpios = []
    for row in resultados.fetchall():
        fila = dict(zip(column_names, row))
        try:
            fila["geometria"] = json.loads(fila["geometria"])
        except Exception:
            fila["geometria"] = None
        resultados_limpios.append(fila)

    return resultados_limpios

# Ruta para obtener el detalle de un proyecto con sus pavimentos asociados
@router.get("/proyectos/detalle/{id}")
def detalle_proyecto(id: int, db: Session = Depends(get_db)):
    proyecto = db.query(Proyecto).filter(Proyecto.id == id, Proyecto.elim_pendiente == False).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    pavimentos = db.execute(text("""
        SELECT p.id, p.sector, p.longitud_metros, ST_AsGeoJSON(p.geometria)::json AS geometria
        FROM pavimento p
        WHERE p.proyecto_id = :pid
    """), {"pid": id}).fetchall()

    return {
        "id": proyecto.id,
        "nombre": proyecto.nombre,
        "descripcion": proyecto.descripcion,
        "categoria_id": proyecto.categoria_id,
        "estado": proyecto.estado_proyecto,
        "pavimentos": [
            {
                "id": pav.id,
                "sector": pav.sector,
                "longitud_metros": pav.longitud_metros,
                "geometria": pav.geometria
            } for pav in pavimentos
        ]
    }