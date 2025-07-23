import React, { useMemo, useCallback } from "react";
import { GeoJSON } from "react-leaflet";

const CapaPavimentos = ({ data }) => {
  const onEachFeature = useCallback((feature, layer) => {
    const p = feature.properties || {};
    const contenido = `
      <div class="popup-proyecto">
        <strong>${p.nombre || "Pavimento"}</strong><br/>
        <b>Sector:</b> ${p.sector || "N/A"}<br/>
        <b>Longitud:</b> ${p.longitud_metros || 0} m<br/>
        <b>Estado:</b> ${p.estado_avance || "N/A"}
      </div>`;
    layer.bindPopup(contenido);
  }, []);

  const geojson = useMemo(() => (
    <GeoJSON
      data={data}
      style={{ color: "#007BFF", weight: 3, fillOpacity: 0.4 }}
      onEachFeature={onEachFeature}
    />
  ), [data, onEachFeature]);

  return geojson;
};

export default CapaPavimentos;
