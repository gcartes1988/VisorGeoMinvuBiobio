import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoomControl from "./ZoomControl";

// 🔄 Botón para resetear el mapa
function ResetViewButton({ center, zoom, clearGeoJSON, position = "topright" }) {
  const map = useMap();

  useEffect(() => {
    const button = L.DomUtil.create("button", "leaflet-bar leaflet-control");
    button.innerHTML = '<span class="material-symbols-outlined">refresh</span>';
    button.title = "Resetear mapa";
    button.style.backgroundColor = "white";
    button.style.width = "34px";
    button.style.height = "34px";
    button.style.fontSize = "18px";
    button.style.cursor = "pointer";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.padding = "0";

    const container = L.DomUtil.create("div");
    container.className = `leaflet-${position}`;
    container.style.margin = "0px";
    container.appendChild(button);

    const CustomControl = L.Control.extend({
      onAdd: () => container,
      onRemove: () => {},
    });

    const control = new CustomControl({ position });
    control.addTo(map);

    button.onclick = () => {
      map.setView(center, zoom);
      if (clearGeoJSON) clearGeoJSON();
    };

    return () => {
      map.removeControl(control);
    };
  }, [map, center, zoom, clearGeoJSON, position]);

  return null;
}

// Botón para alternar el estilo del mapa
function ToggleStyleButton({ setEstiloMapa, estiloMapa, position = "topright" }) {
  const map = useMap();

  useEffect(() => {
    const button = L.DomUtil.create("button", "leaflet-bar leaflet-control");
    button.innerHTML = '<span class="material-symbols-outlined">contrast</span>';
    button.title = "Cambiar estilo del mapa";
    button.style.backgroundColor = "white";
    button.style.width = "34px";
    button.style.height = "34px";
    button.style.fontSize = "18px";
    button.style.cursor = "pointer";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.padding = "0";

    const container = L.DomUtil.create("div");
    container.className = `leaflet-${position}`;
    container.style.margin = "0px";
    container.appendChild(button);

    const CustomControl = L.Control.extend({
      onAdd: () => container,
      onRemove: () => {},
    });

    const control = new CustomControl({ position });
    control.addTo(map);

    button.onclick = () => {
      setEstiloMapa(estiloMapa === "positron" ? "dark" : "positron");
    };

    return () => {
      map.removeControl(control);
    };
  }, [map, estiloMapa, setEstiloMapa, position]);

  return null;
}

// Componente principal
function PavimentoMap({ geojsonData, setGeojsonData }) {
  const [mapCenter, setMapCenter] = useState([-36.82, -73.05]);
  const initialZoom = 10;
  const [mapInstance, setMapInstance] = useState(null);
  const [estiloMapa, setEstiloMapa] = useState("positron");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
      },
      () => console.warn("📍 No se pudo obtener la ubicación del usuario"),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (mapInstance && geojsonData?.features?.length > 0) {
      const layer = L.geoJSON(geojsonData);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        console.log("🗺 Ajustando vista a proyectos encontrados");
        mapInstance.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [geojsonData, mapInstance]);

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
      <ZoomControl position="bottomright" />

      <TileLayer
        url={mapStyleURL}
        attribution=""
      />

      <ResetViewButton
        center={mapCenter}
        zoom={initialZoom}
        clearGeoJSON={() => setGeojsonData(null)}
        position="bottomright"
      />

      <ToggleStyleButton
        setEstiloMapa={setEstiloMapa}
        estiloMapa={estiloMapa}
        position="bottomright"
      />

      {geojsonData?.features?.length > 0 && (
        <GeoJSON
          key={JSON.stringify(geojsonData)}
          data={geojsonData}
          onEachFeature={(feature, layer) => {
            const props = feature.properties || {};
            layer.bindPopup(
              `<strong>${props.nombre || "Proyecto"}</strong><br/>Sector: ${props.sector || "N/A"}`
            );
          }}
          style={{ color: "#007BFF", weight: 3 }}
        />
      )}
    </MapContainer>
  );
}

export default PavimentoMap;
