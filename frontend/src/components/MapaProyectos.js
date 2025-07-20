import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoomControl from "./ZoomControl";
import LeyendaMapa from "./LeyendaMapa";

const colorPorTipo = (tipo) => {
  const tipoNormalizado = tipo?.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  switch (tipoNormalizado) {
    case "pavimento": return "#007BFF";
    case "ciclovia": return "#2D717C";
    case "parque": return "#FFA11B";
    default: return "#555";
  }
};

function ResetViewButton({ center, zoom, limpiarCapas, position = "topright" }) {
  const map = useMap();

  useEffect(() => {
    const button = L.DomUtil.create("button", "leaflet-bar leaflet-control material-symbols-outlined");
    button.textContent = "refresh";
    button.title = "Resetear vista";
    Object.assign(button.style, {
      backgroundColor: "var(--white)",
      color: "var(--gray-a)",
      width: "34px",
      height: "34px",
      fontSize: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0",
    });

    const container = L.DomUtil.create("div", `leaflet-${position}`);
    container.appendChild(button);

    const ControlReset = L.Control.extend({ onAdd: () => container, onRemove: () => {} });
    const control = new ControlReset({ position });
    control.addTo(map);

    button.onclick = () => {
      map.setView(center, zoom);
      if (limpiarCapas) limpiarCapas();
    };

    return () => {
      map.removeControl(control);
    };
  }, [map, center, zoom, limpiarCapas, position]);

  return null;
}

function ToggleStyleButton({ estiloMapa, setEstiloMapa, position = "bottomright" }) {
  const map = useMap();

  useEffect(() => {
    const button = L.DomUtil.create("button", "leaflet-bar leaflet-control material-symbols-outlined");
    button.textContent = "contrast";
    button.title = "Cambiar estilo";
    Object.assign(button.style, {
      backgroundColor: "var(--white)",
      color: "var(--gray-a)",
      width: "34px",
      height: "34px",
      fontSize: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0",
    });

    const container = L.DomUtil.create("div", `leaflet-${position}`);
    container.appendChild(button);

    const ControlStyle = L.Control.extend({ onAdd: () => container, onRemove: () => {} });
    const control = new ControlStyle({ position });
    control.addTo(map);

    button.onclick = () => setEstiloMapa(estiloMapa === "positron" ? "dark" : "positron");

    return () => {
      map.removeControl(control);
    };
  }, [map, estiloMapa, setEstiloMapa, position]);

  return null;
}

function MapaProyectos({ capas = [], limpiarCapas, sidebarMinimizada }) {
  const [mapCenter, setMapCenter] = useState([-36.82, -73.05]);
  const initialZoom = 12;
  const [mapInstance, setMapInstance] = useState(null);
  const [estiloMapa, setEstiloMapa] = useState("positron");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
      () => console.warn("📍 No se pudo obtener la ubicación"),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (mapInstance && capas.length > 0) {
      const bounds = L.latLngBounds([]);
      capas.forEach(({ data }) => {
        if (data?.features?.length > 0) {
          const layer = L.geoJSON(data);
          bounds.extend(layer.getBounds());
        }
      });
      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [capas, mapInstance]);

  const mapStyleURL =
    estiloMapa === "positron"
      ? "https://api.maptiler.com/maps/dataviz/256/{z}/{x}/{y}.png?key=O8YcZts6MT1e0Gu0XMnr"
      : "https://api.maptiler.com/maps/positron/256/{z}/{x}/{y}.png?key=O8YcZts6MT1e0Gu0XMnr";

  return (
    <MapContainer
      center={mapCenter}
      zoom={initialZoom}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
      whenCreated={setMapInstance}
    >
      <TileLayer url={mapStyleURL} />
      <ZoomControl position="bottomright" />
      <ResetViewButton center={mapCenter} zoom={initialZoom} limpiarCapas={limpiarCapas} />
      <ToggleStyleButton estiloMapa={estiloMapa} setEstiloMapa={setEstiloMapa} />

      {(capas || []).map(({ tipo, data }, i) =>
        data?.features?.length > 0 && (
          <GeoJSON
            key={`${tipo}-${i}`}
            data={data}
            style={{ color: colorPorTipo(tipo), weight: 3, fillOpacity: 0.4 }}
            onEachFeature={(feature, layer) => {
              const props = feature.properties || {};
              const tipo = props.tipo?.toLowerCase();

              let contenido = "";

              if (tipo === "pavimento") {
                contenido = `
                  <div class="popup-proyecto">
                    <strong>${props.nombre || "Pavimento"}</strong><br/>
                    <b>Sector:</b> ${props.sector || "N/A"}<br/>
                    <b>Longitud:</b> ${props.longitud_metros || 0} m<br/>
                    <b>Estado:</b> ${props.estado_avance || "N/A"}
                  </div>`;
              } else if (tipo === "ciclovia") {
                contenido = `
                  <div class="popup-proyecto">
                    <strong>${props.nombre || "Ciclovía"}</strong><br/>
                    <b>Tramo:</b> ${props.nombre_tramo || "N/A"}<br/>
                    <b>Longitud:</b> ${props.longitud_metros || 0} m<br/>
                    <b>Estado:</b> ${props.estado_avance || "N/A"}
                  </div>`;
              } else if (tipo === "parque") {
                contenido = `
                  <div class="popup-proyecto">
                    <strong>${props.nombre || "Parque"}</strong><br/>
                    <b>Sector:</b> ${props.sector || "N/A"}<br/>
                    <b>Superficie:</b> ${props.superficie_ha || 0} ha<br/>
                    <b>Financiamiento:</b> ${props.fuente_financiamiento || "N/A"}
                  </div>`;
              } else {
                contenido = `
                  <div class="popup-proyecto">
                    <strong>${props.nombre || "Proyecto"}</strong><br/>
                    <b>Tipo:</b> ${tipo || "Desconocido"}
                  </div>`;
              }

              layer.bindPopup(contenido);
            }}
          />
        )
      )}

      {capas?.length > 0 && <LeyendaMapa sidebarMinimizada={sidebarMinimizada} />}
    </MapContainer>
  );
}

export default MapaProyectos;
