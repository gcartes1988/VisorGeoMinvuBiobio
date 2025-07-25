import React, { useMemo, useCallback } from "react";
import { GeoJSON } from "react-leaflet";

const CapaParques = ({ data }) => {
  const onEachFeature = useCallback((feature, layer) => {
    const p = feature.properties || {};

    // 🧠 Mapeo manual para corregir nombres si vienen genéricos
    let nombre = p.nombre || "Parque sin nombre";

    const nombresCorregidos = {
      32: "Parque Metropolitano Cerro Caracol",
      // Puedes agregar más excepciones aquí:
      // 33: "Parque Humedal Los Batros",
      // 34: "Parque del Carbón",
    };

    if (p.id in nombresCorregidos) {
      nombre = nombresCorregidos[p.id];
    }

    const sector = p.sector ? `<b>Sector:</b> ${p.sector}<br/>` : "";
    const tipo = p.tipo ? `<b>Tipo:</b> ${p.tipo}<br/>` : "";
    const comuna = p.comuna ? `<b>Comuna:</b> ${p.comuna}<br/>` : "";

    const superficie = p.superficie_ha && p.superficie_ha > 0
      ? `<b>Superficie:</b> ${p.superficie_ha} ha<br/>` : "";

    const financiamiento = p.fuente_financiamiento && p.fuente_financiamiento !== "N/A"
      ? `<b>Financiamiento:</b> ${p.fuente_financiamiento}<br/>` : "";

    const contenido = `
      <div class="popup-proyecto">
        <strong>${nombre}</strong><br/>
        ${sector}
        ${tipo}
        ${comuna}
        ${superficie}
        ${financiamiento}
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
