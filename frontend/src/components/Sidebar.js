import { useState } from "react";
import Select from "react-select";
import Icono from "../components/Icono";
import api from "../services/api";
import "../css/sidebarvisor.css";

function Sidebar({ categorias, comunas, onResultados, mostrarSidebar }) {
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [selectedComuna, setSelectedComuna] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const customStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#0055A5",
      boxShadow: "none",
      "&:hover": { borderColor: "#003366" },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const handleBuscar = async () => {
    const categoriaIds = selectedCategorias.map((cat) => cat.value);
    const comunaId = selectedComuna?.value;

    setIsLoading(true);
    setMensaje("");

    try {
      const params = new URLSearchParams();
      if (categoriaIds.length > 0) {
        categoriaIds.forEach((id) => params.append("categorias", id));
      }
      if (comunaId) params.append("comuna", comunaId);

      const res = await api.get(`/proyectos/publicos?${params.toString()}`);
      const resultados = res.data;

      if (resultados.length === 0) {
        setMensaje("⚠️ No se encontraron proyectos con los filtros aplicados.");
      } else {
        setMensaje("");
      }

      onResultados(resultados);
    } catch (error) {
      setMensaje("❌ Error al cargar los proyectos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setSelectedCategorias([]);
    setSelectedComuna(null);
    setMensaje("");
    onResultados([]);
  };

  return (
    <div className={`sidebar ${mostrarSidebar ? "mostrar" : ""}`}>
      <div className="sidebar-logo">
        <img
          src="/imagenes/logo.png"
          alt="Logo VisorGeo Minvu Biobío"
          className="logo-sidebar"
        />
      </div>

      <div className="buscador-wrapper">
        <div className="input-icon-container-sidebar">
          <Icono nombre="search" size={20} color="#8A8A8A" />
          <input
            type="text"
            className="input-busqueda-sidebar"
            placeholder="Buscar..."
          />
        </div>
      </div>

      <div className="sidebar-contenido">
        <h4 className="font-level-5">Filtrar proyectos</h4>

        <label className="text-gray-a"><strong>Categoría</strong></label>
        <Select
          isMulti
          options={categorias}
          value={selectedCategorias}
          onChange={setSelectedCategorias}
          styles={customStyles}
          placeholder="Seleccionar..."
        />

        <label className="text-gray-a"><strong>Comuna</strong></label>
        <Select
          options={comunas}
          value={selectedComuna}
          onChange={setSelectedComuna}
          styles={customStyles}
          placeholder="Seleccionar..."
        />

        <button
          className="btn-buscar w-100"
          onClick={handleBuscar}
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Buscar proyectos"}
        </button>

        <button className="btn-limpiar w-100" onClick={handleLimpiarFiltros}>
          Limpiar filtros
        </button>

        {mensaje && (
          <div className="mensaje-info">
            <Icono nombre={isLoading ? "progress_activity" : "info"} />
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
