import { useEffect, useState } from "react";
import axios from "../services/api";
import MapaProyectos from "../components/MapaProyectos";
import Sidebar from "../components/Sidebar";
import Icono from "../components/Icono";
import { useNavigate } from "react-router-dom";
import "../css/home.css";

function Home() {
  const [categorias, setCategorias] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [geojsonData, setGeojsonData] = useState([]);
  const [mensajeUsuario, setMensajeUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [sidebarMinimizada, setSidebarMinimizada] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/categorias").then((res) =>
      setCategorias(res.data.map((cat) => ({
        value: cat.id,
        label: cat.nombre,
      })))
    );

    axios.get("/comunas").then((res) =>
      setComunas(res.data.map((com) => ({
        value: com.id,
        label: com.nombre,
      })))
    );
  }, []);

  const handleResultados = async (geojson) => {
    setCargando(true);
    try {
      if (geojson?.features?.length > 0) {
        const agrupadas = {};
        geojson.features.forEach((f) => {
          const tipo = f.properties?.tipo?.toLowerCase() || "otros";
          if (!agrupadas[tipo]) agrupadas[tipo] = [];
          agrupadas[tipo].push(f);
        });

        const capasFormateadas = Object.entries(agrupadas).map(([tipo, features]) => ({
          tipo,
          data: {
            type: "FeatureCollection",
            features,
          },
        }));

        setGeojsonData(capasFormateadas);
        setMensajeUsuario({
          tipo: "success",
          texto: `Se encontraron ${geojson.features.length} proyecto(s).`,
        });
      } else {
        setGeojsonData([]);
        setMensajeUsuario({
          tipo: "info",
          texto: "No se encontraron proyectos para los filtros seleccionados.",
        });
      }
    } catch (error) {
      setMensajeUsuario({
        tipo: "error",
        texto: "Ocurrió un error al procesar los datos.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="visor-container">
      <Sidebar
        categorias={categorias}
        comunas={comunas}
        onResultados={handleResultados}
        onToggleMinimizada={setSidebarMinimizada}
      />

      <div className="mapa">
        <div className="topbar right">
          <button className="btn-admin" onClick={() => navigate("/admin")}>
            <Icono nombre="admin_panel_settings" /> Área Admin
          </button>
        </div>

        {cargando && (
          <div className="mensaje-info cargando">
            <Icono nombre="progress_activity" size={20} />
            Buscando proyectos...
          </div>
        )}

        {mensajeUsuario && (
          <div className={`toast-mensaje ${mensajeUsuario.tipo}`}>
            <Icono
              nombre={
                mensajeUsuario.tipo === "success"
                  ? "check_circle"
                  : mensajeUsuario.tipo === "info"
                  ? "info"
                  : "error"
              }
              className="icon-toast"
            />
            {mensajeUsuario.texto}
            <button onClick={() => setMensajeUsuario(null)}>✖</button>
          </div>
        )}

        <MapaProyectos
          capas={geojsonData}
          limpiarCapas={() => setGeojsonData([])}
          sidebarMinimizada={sidebarMinimizada}
        />
      </div>
    </div>
  );
}

export default Home;
