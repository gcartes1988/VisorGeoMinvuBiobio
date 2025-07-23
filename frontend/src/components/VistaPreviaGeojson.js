// src/components/VistaPreviaGeojson.jsx
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";

export default function VistaPreviaGeojson({ geojsonString, tipoEsperado }) {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    try {
      const obj = JSON.parse(geojsonString);

      const esValido =
        obj &&
        obj.type &&
        ["LineString", "Polygon", "MultiPolygon"].includes(obj.type);

      if (esValido && (!tipoEsperado || obj.type === tipoEsperado)) {
        setGeojson({
          type: "Feature",
          geometry: obj,
          properties: {},
        });
      } else {
        setGeojson(null);
      }
    } catch {
      setGeojson(null);
    }
  }, [geojsonString, tipoEsperado]);

  if (!geojson)
    return (
      <p style={{ color: "red", marginTop: "0.5rem" }}>
        ❌ Geometría inválida, vacía o no coincide con el tipo esperado.
      </p>
    );

  // 🧭 Cálculo de centro
  const getCentro = (geometry) => {
    const { type, coordinates } = geometry;

    if (type === "LineString") {
      return coordinates[0]?.slice().reverse() || [-36.82, -73.05];
    }

    if (type === "Polygon") {
      return coordinates[0]?.[0]?.slice().reverse() || [-36.82, -73.05];
    }

    if (type === "MultiPolygon") {
      return coordinates[0]?.[0]?.[0]?.slice().reverse() || [-36.82, -73.05];
    }

    return [-36.82, -73.05];
  };

  const center = getCentro(geojson.geometry);

  return (
    <MapContainer
      style={{ height: "300px", marginTop: "1rem", borderRadius: "8px" }}
      center={center}
      zoom={17}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON key={JSON.stringify(geojson)} data={geojson} />
    </MapContainer>
  );
}
