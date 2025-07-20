// src/components/VistaPreviaGeojson.js
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";

export default function VistaPreviaGeojson({ geojsonStr }) {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    try {
      const obj = JSON.parse(geojsonStr);
      if (
        obj.type === "LineString" ||
        obj.type === "Polygon" ||
        obj.type === "MultiPolygon"
      ) {
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
  }, [geojsonStr]);

  if (!geojson)
    return (
      <p style={{ color: "red", marginTop: "0.5rem" }}>
        ❌ Geometría inválida o vacía
      </p>
    );

  // Cálculo de centro para centrado del mapa
  const coords = geojson.geometry?.coordinates;
  const tipo = geojson.geometry?.type;
  let center = [-36.82, -73.05];

  if (tipo === "LineString") {
    center = coords[0].slice().reverse(); // [lat, lon]
  } else if (tipo === "Polygon") {
    center = coords?.[0]?.[0]?.slice().reverse();
  }

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
