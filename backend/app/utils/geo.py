from shapely import wkb
from shapely.geometry import mapping
from pyproj import Transformer

# UTM zona 18S → WGS84
transformer = Transformer.from_crs("EPSG:32718", "EPSG:4326", always_xy=True)

def convertir_wkb_a_geojson(wkb_element):
    """
    Convierte una geometría WKB (de PostGIS) a GeoJSON simple
    """
    shape = wkb.loads(bytes(wkb_element.data))
    return mapping(shape)  # dict con 'type' y 'coordinates'

def convertir_utm_a_wgs84(utm_coords):
    """
    Convierte lista de coordenadas UTM a coordenadas WGS84
    """
    return [list(transformer.transform(x, y)) for x, y in utm_coords]
