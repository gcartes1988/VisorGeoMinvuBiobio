// src/components/VistaPreviaGeojson.js
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useEffect, useState } from 'react';

export default function VistaPreviaGeojson({ geojsonStr }) {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    try {
      const obj = JSON.parse(geojsonStr);
      if (obj.type === 'LineString') {
        setGeojson({ type: 'Feature', geometry: obj });
      } else {
        setGeojson(null);
      }
    } catch {
      setGeojson(null);
    }
  }, [geojsonStr]);

  if (!geojson) return <p style={{ color: 'gray' }}>🧭 Geometría inválida o vacía</p>;

  return (
    <MapContainer
      style={{ height: '300px', marginTop: '1rem', borderRadius: '8px' }}
      center={geojson.geometry.coordinates[0].slice().reverse()} // [lat, lon]
      zoom={17}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
<GeoJSON key={JSON.stringify(geojson)} data={geojson} />
</MapContainer>
  );
}
