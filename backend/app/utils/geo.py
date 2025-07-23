# app/utils/geo.py

from shapely import wkb
from shapely.geometry import shape, mapping
from pyproj import Transformer
from fastapi import HTTPException
from geoalchemy2.shape import from_shape
import json

# 🗺️ Definimos el transformer para convertir UTM a WGS84 (si alguna vez lo necesitas)
transformer = Transformer.from_crs("EPSG:32718", "EPSG:4326", always_xy=True)

def convertir_wkb_a_geojson(wkb_element):
    """
    Convierte una geometría WKB de PostGIS a un objeto GeoJSON (dict con 'type' y 'coordinates').
    """
    if not wkb_element:
        return None
    shape_obj = wkb.loads(bytes(wkb_element.data))
    return mapping(shape_obj)


def convertir_utm_a_wgs84(utm_coords):
    """
    Convierte una lista de coordenadas UTM (EPSG:32718) a WGS84 (EPSG:4326).
    """
    if not utm_coords:
        return []
    return [list(transformer.transform(x, y)) for x, y in utm_coords]


def validar_y_convertir_geojson(geometria_raw, tipo_esperado="Polygon"):
    """
    Valida un objeto GeoJSON (dict o string) y lo convierte en una geometría PostGIS válida.
    
    Parámetros:
        - geometria_raw: dict o str en formato GeoJSON
        - tipo_esperado: "Polygon", "LineString", etc. (por defecto Polygon)

    Retorna:
        - Objeto Geometry compatible con GeoAlchemy2
    """
    try:
        geojson = json.loads(geometria_raw) if isinstance(geometria_raw, str) else geometria_raw

        if not geojson.get("type") or not geojson.get("coordinates"):
            raise HTTPException(status_code=400, detail="❌ Geometría inválida: faltan campos obligatorios.")

        if tipo_esperado and geojson["type"].lower() != tipo_esperado.lower():
            raise HTTPException(
                status_code=400,
                detail=f"❌ Tipo de geometría inválido. Se esperaba '{tipo_esperado}', se recibió '{geojson['type']}'.")

        return from_shape(shape(geojson), srid=4326)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"❌ Error al procesar geometría: {str(e)}")
