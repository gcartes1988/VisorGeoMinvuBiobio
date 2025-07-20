from app.schemas.elementos import ElementosPorProyectoOut

@router.get("/elementos/por_proyecto/{proyecto_id}", response_model=ElementosPorProyectoOut)
def obtener_elementos_por_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    pavimentos = db.query(Pavimento).filter(Pavimento.proyecto_id == proyecto_id).all()
    ciclovias = db.query(Ciclovia).filter(Ciclovia.proyecto_id == proyecto_id).all()
    parques = db.query(Parque).filter(Parque.proyecto_id == proyecto_id).all()

    def parse_geom(geom):
        try:
            return mapping(wkb_loads(bytes(geom.data)))
        except Exception:
            return None

    return {
        "pavimentos": [
            {
                "id": p.id,
                "sector": p.sector,
                "estado_avance": p.estado_avance.nombre if p.estado_avance else None,
                "comuna": p.comuna.nombre if p.comuna else None,
                "geometria": parse_geom(p.geometria)
            }
            for p in pavimentos
        ],
        "ciclovias": [
            {
                "id": c.id,
                "nombre_tramo": c.nombre_tramo,
                "estado_avance": c.estado_avance.nombre if c.estado_avance else None,
                "comuna": c.comuna.nombre if c.comuna else None,
                "geometria": parse_geom(c.geometria)
            }
            for c in ciclovias
        ],
        "parques": [
            {
                "id": pq.id,
                "direccion": pq.direccion,
                "comuna": pq.comuna.nombre if pq.comuna else None,
                "superficie_ha": pq.superficie_ha,
                "geometria": parse_geom(pq.geometria)
            }
            for pq in parques
        ]
    }
