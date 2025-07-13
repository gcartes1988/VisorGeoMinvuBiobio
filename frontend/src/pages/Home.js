import { useEffect, useState } from "react";
import axios from "../services/api";
import PavimentoMap from "../components/PavimentoMap";
import FiltroModal from "../components/FiltroModal";
import Sidebar from "../components/Sidebar";
import "../css/home.css";
import { LatLngBounds } from "leaflet";
import { useNavigate } from "react-router-dom";

function Home() {
  const [categorias, setCategorias] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedComuna, setSelectedComuna] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/categorias").then(res => setCategorias(res.data));
    axios.get("/comunas").then(res => setComunas(res.data));
  }, []);

  const calcularBounds = (features) => {
    let bounds = null;
    features.forEach((f) => {
      const coords = f.geometry.coordinates;
      if (f.geometry.type === "Point") {
        const latlng = [coords[1], coords[0]];
        bounds = bounds ? bounds.extend(latlng) : new LatLngBounds(latlng, latlng);
      } else if (f.geometry.type === "LineString") {
        coords.forEach(([lng, lat]) => {
          const latlng = [lat, lng];
          bounds = bounds ? bounds.extend(latlng) : new LatLngBounds(latlng, latlng);
        });
      } else if (f.geometry.type === "Polygon") {
        coords[0].forEach(([lng, lat]) => {
          const latlng = [lat, lng];
          bounds = bounds ? bounds.extend(latlng) : new LatLngBounds(latlng, latlng);
        });
      }
    });
    return bounds;
  };

  const handleBuscar = () => {
    setMensaje("");
    setMostrarToast(false);

    if (!selectedCategoria && !selectedComuna) {
      setMensaje("⚠️ Selecciona al menos una categoría o comuna.");
      setMostrarToast(true);
      return;
    }

    setLoading(true);

    const params = {};
    if (selectedCategoria) params.categoria_id = selectedCategoria.value;
    if (selectedComuna) params.comuna_id = selectedComuna.value;

    axios
      .get("/proyectos/publicos", { params })
      .then(res => {
        const features = res.data.map(item => ({
          type: "Feature",
          geometry: item.geometria,
          properties: {
            proyecto_id: item.proyecto_id,
            nombre: item.nombre,
            sector: item.sector,
            tipo: item.tipo,
          }
        }));

        if (features.length === 0) {
          setGeojsonData(null);
          setMapBounds(null);
          setMensaje("⚠️ No se encontraron resultados.");
          setMostrarToast(true);
          return;
        }

        const bounds = calcularBounds(features);
        setGeojsonData({ type: "FeatureCollection", features });
        setMapBounds(bounds);
        setMensaje(`✅ Se encontraron ${features.length} proyecto(s).`);
        setMostrarToast(true);
      })
      .catch(err => {
        console.error("❌ Error al buscar proyectos:", err);
        setMensaje("❌ Ocurrió un error al buscar.");
        setMostrarToast(true);
      })
      .finally(() => setLoading(false));
  };

  const handleClearAll = () => {
    setSelectedCategoria(null);
    setSelectedComuna(null);
    setGeojsonData(null);
    setMapBounds(null);
  };

  return (
    <div className="visor-container">
      <Sidebar
        categorias={categorias}
        comunas={comunas}
        selectedCategoria={selectedCategoria}
        selectedComuna={selectedComuna}
        onCategoriaChange={setSelectedCategoria}
        onComunaChange={setSelectedComuna}
        onBuscar={handleBuscar}
      />

      <div className="mapa">
        <div className="topbar right">

          <button className="btn-admin" onClick={() => navigate("/admin")}>
            Área Admin
          </button>
        </div>

        <PavimentoMap geojsonData={geojsonData} setGeojsonData={setGeojsonData} bounds={mapBounds} />

        {mostrarToast && (
          <div className="toast-mensaje">
            {mensaje}
            <button onClick={() => setMostrarToast(false)}>✖</button>
          </div>
        )}

        {loading && <p className="estado-busqueda"> <span className="material-symbols-outlined">refresh</span>
          Buscando proyectos...</p>}
      </div>

      <FiltroModal
        visible={mostrarModal}
        categoria={selectedCategoria}
        comuna={selectedComuna}
        onRemoveCategoria={() => setSelectedCategoria(null)}
        onRemoveComuna={() => setSelectedComuna(null)}
        onClearAll={handleClearAll}
        onClose={() => setMostrarModal(false)}
      />

      {(selectedCategoria || selectedComuna) && (
        <button
          className="filtro-fab"
          onClick={() => setMostrarModal(true)}
          title="Ver filtros activos"
        >
         <span>FILTROS</span> 
        </button>
      )}
    </div>
  );
}

export default Home;
