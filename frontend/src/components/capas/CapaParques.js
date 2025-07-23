import React, { useMemo, useCallback } from "react";
import { GeoJSON } from "react-leaflet";

const CapaParques = ({ data }) => {
  const onEachFeature = useCallback((feature, layer) => {
    const p = feature.properties || {};
    const contenido = `
      <div class="popup-proyecto">
        <strong>${p.nombre || "Parque"}</strong><br/>
        <b>Sector:</b> ${p.sector || "N/A"}<br/>
        <b>Superficie:</b> ${p.superficie_ha || 0} ha<br/>
        <b>Financiamiento:</b> ${p.fuente_financiamiento || "N/A"}
      </div>`;
    layer.bindPopup(contenido);
  }, []);

  const geojson = useMemo(() => (
    <GeoJSON
      data={data}
      style={{ color: "#FFA11B", weight: 3, fillOpacity: 0.4 }}
      onEachFeature={onEachFeature}
    />
  ), [data, onEachFeature]);

  return geojson;
};

export default CapaParques;
