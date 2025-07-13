// src/utils/validarGeoJSON.js

export function validarLineString(str) {
    try {
      const obj = JSON.parse(str);
      if (
        obj.type !== "LineString" ||
        !Array.isArray(obj.coordinates) ||
        obj.coordinates.length < 2
      ) {
        return false;
      }
      return obj.coordinates.every(coord =>
        Array.isArray(coord) &&
        coord.length === 2 &&
        typeof coord[0] === "number" &&
        typeof coord[1] === "number"
      );
    } catch {
      return false;
    }
  }
  
  export function validarPolygon(str) {
    try {
      const obj = JSON.parse(str);
      if (obj.type !== "Polygon" || !Array.isArray(obj.coordinates)) {
        return false;
      }
      const rings = obj.coordinates;
      return rings.every(ring =>
        Array.isArray(ring) &&
        ring.length >= 4 &&
        ring[0][0] === ring[ring.length - 1][0] && // Primer y último punto iguales
        ring[0][1] === ring[ring.length - 1][1]
      );
    } catch {
      return false;
    }
  }
  
  export function validarPoint(str) {
    try {
      const obj = JSON.parse(str);
      return (
        obj.type === "Point" &&
        Array.isArray(obj.coordinates) &&
        obj.coordinates.length === 2 &&
        typeof obj.coordinates[0] === "number" &&
        typeof obj.coordinates[1] === "number"
      );
    } catch {
      return false;
    }
  }
  