// src/components/ZoomControl.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const ZoomControl = ({ position = "topright" }) => {
  const map = useMap();

  useEffect(() => {
    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control zoom-control-custom");

    const zoomInButton = L.DomUtil.create("a", "zoom-in", container);
    zoomInButton.innerHTML = "+";
    zoomInButton.title = "Acercar";

    const zoomOutButton = L.DomUtil.create("a", "zoom-out", container);
    zoomOutButton.innerHTML = "−";
    zoomOutButton.title = "Alejar";

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
