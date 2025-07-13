from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

@router.get("/parques")
def listar_parques(
    proyecto_id: int = Query(None),
    comuna_id: int = Query(None),
    db: Session = Depends(get_db)
):
    condiciones = []
    if proyecto_id:
        condiciones.append(f"p.proyecto_id = {proyecto_id}")
    if comuna_id:
        condiciones.append(f"proy.comuna_id = {comuna_id}")
    
    where_clause = " AND ".join(condiciones)
    if where_clause:
        where_clause = "WHERE " + where_clause

    query = text(f"""
        SELECT 
            p.id, p.nombre, p.superficie, 
            ST_AsGeoJSON(p.geometria)::json AS geometria,
            proy.nombre AS proyecto,
            comu.nombre AS comuna
        FROM parque p
        JOIN proyecto proy ON p.proyecto_id = proy.id
        JOIN comuna comu ON proy.comuna_id = comu.id
        {where_clause};
    """)

    result = db.execute(query)
    parques = []
    for row in result:
        parques.append({
            "id": row.id,
            "nombre": row.nombre,
            "superficie": row.superficie,
            "geometria": row.geometria,
            "proyecto": row.proyecto,
            "comuna": row.comuna
        })

    return parques
