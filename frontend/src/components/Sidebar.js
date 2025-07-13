import { useState } from "react";
import Select from "react-select";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Sidebar({
  categorias,
  comunas,
  selectedCategoria,
  selectedComuna,
  onCategoriaChange,
  onComunaChange,
  onBuscar
}) {
  const [minimizada, setMinimizada] = useState(false);

  return (
<div className={`sidebar ${minimizada ? "minimizada" : "visible"}`}>
<button
        className="toggle-sidebar"
        onClick={() => setMinimizada(!minimizada)}
        title={minimizada ? "Mostrar filtros" : "Ocultar filtros"}
      >
        {minimizada ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {!minimizada && (
        <div className="sidebar-contenido">
          <h2>
        VisorGeo<br />MinvuBiobío
      </h2>

          <Select
            options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
            placeholder="Selecciona categoría"
            value={selectedCategoria}
            onChange={onCategoriaChange}
            isClearable
          />

          <Select
            options={comunas.map(c => ({ value: c.id, label: c.nombre }))}
            placeholder="Selecciona comuna (opcional)"
            value={selectedComuna}
            onChange={onComunaChange}
            isClearable
          />

          <button className="btn-buscar" onClick={onBuscar}>
            Buscar proyectos
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
