import React, { useMemo, useCallback } from "react";
import { GeoJSON } from "react-leaflet";

const CapaCiclovias = ({ data }) => {
  const onEachFeature = useCallback((feature, layer) => {
    const p = feature.properties || {};
    const contenido = `
      <div class="popup-proyecto">
        <strong>${p.nombre || "Ciclovía"}</strong><br/>
        <b>Tramo:</b> ${p.nombre_tramo || "N/A"}<br/>
        <b>Longitud:</b> ${p.longitud_metros || 0} m<br/>
        <b>Estado:</b> ${p.estado_avance || "N/A"}
      </div>`;
    layer.bindPopup(contenido);
  }, []);

  const geojson = useMemo(() => (
    <GeoJSON
      data={data}
      style={{ color: "#2D717C", weight: 3, fillOpacity: 0.4 }}
      onEachFeature={onEachFeature}
    />
  ), [data, onEachFeature]);

  return geojson;
};

export default CapaCiclovias;
