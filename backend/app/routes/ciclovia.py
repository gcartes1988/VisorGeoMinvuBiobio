from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

@router.get("/ciclovias")
def listar_ciclovias(
    proyecto_id: int = Query(None),
    comuna_id: int = Query(None),
    db: Session = Depends(get_db)
):
    condiciones = []
    if proyecto_id:
        condiciones.append(f"c.proyecto_id = {proyecto_id}")
    if comuna_id:
        condiciones.append(f"proy.comuna_id = {comuna_id}")
    
    where_clause = " AND ".join(condiciones)
    if where_clause:
        where_clause = "WHERE " + where_clause

    query = text(f"""
        SELECT 
            c.id, c.nombre, c.estado, c.sentido,
            ST_AsGeoJSON(c.geometria)::json AS geometria,
            proy.nombre AS proyecto,
            comu.nombre AS comuna
        FROM ciclovia c
        JOIN proyecto proy ON c.proyecto_id = proy.id
        JOIN comuna comu ON proy.comuna_id = comu.id
        {where_clause};
    """)

    result = db.execute(query)
    ciclovias = []
    for row in result:
        ciclovias.append({
            "id": row.id,
            "nombre": row.nombre,
            "estado": row.estado,
            "sentido": row.sentido,
            "geometria": row.geometria,
            "proyecto": row.proyecto,
            "comuna": row.comuna
        })

    return ciclovias
