import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoomControl from "./ZoomControl";
import LeyendaMapa from "./LeyendaMapa";
import CapaPavimentos from "./capas/CapaPavimentos";
import CapaCiclovias from "./capas/CapaCiclovias";
import CapaParques from "./capas/CapaParques";

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
    return () => { map.removeControl(control); };
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
    return () => { map.removeControl(control); };
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

      {capas.map(({ tipo, data }, i) => {
        if (!data?.features?.length) return null;
        const tipoLower = tipo.toLowerCase();
        if (tipoLower === "pavimento") return <CapaPavimentos key={i} data={data} />;
        if (tipoLower === "ciclovia") return <CapaCiclovias key={i} data={data} />;
        if (tipoLower === "parque") return <CapaParques key={i} data={data} />;
        return null;
      })}

      {capas?.length > 0 && <LeyendaMapa sidebarMinimizada={sidebarMinimizada} />}
    </MapContainer>
  );
}

export default MapaProyectos;
