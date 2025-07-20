// src/components/ZoomControl.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "../css/map-controls.css";


const ZoomControl = ({ position = "topright" }) => {
  const map = useMap();

  useEffect(() => {
    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control zoom-control-custom");

    const zoomInButton = L.DomUtil.create("a", "zoom-in", container);
    zoomInButton.innerHTML = "+";
    zoomInButton.title = "Acercar";
    Object.assign(zoomInButton.style, {
      color: "var(--gray-a)",
      backgroundColor: "var(--white)",
      fontSize: "20px",
      fontWeight: "bold",
      padding: "6px",
      userSelect: "none",
      textAlign: "center",
    });

    const zoomOutButton = L.DomUtil.create("a", "zoom-out", container);
    zoomOutButton.innerHTML = "−";
    zoomOutButton.title = "Alejar";
    Object.assign(zoomOutButton.style, {
      color: "var(--gray-a)",
      backgroundColor: "var(--white)",
      fontSize: "20px",
      fontWeight: "bold",
      padding: "6px",
      userSelect: "none",
      textAlign: "center",
    });

    const CustomZoom = L.Control.extend({
      onAdd: () => container,
      onRemove: () => {}
    });

    const control = new CustomZoom({ position });
    control.addTo(map);

    zoomInButton.onclick = () => map.zoomIn();
    zoomOutButton.onclick = () => map.zoomOut();

    return () => {
      map.removeControl(control);
    };
  }, [map, position]);

  return null;
};

export default ZoomControl;
