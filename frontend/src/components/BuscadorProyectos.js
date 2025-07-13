// src/components/BuscadorProyectos.js
import { useState } from "react";

function BuscadorProyectos({ proyectos, onFiltrar }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const valor = e.target.value.toLowerCase();
    setQuery(valor);

    const filtrados = proyectos.filter((p) => {
      const nombre = p.nombre?.toLowerCase() || "";
      const comuna = p.comuna?.nombre?.toLowerCase() || "";
      const categoria = p.categoria?.nombre?.toLowerCase() || "";

      return (
        nombre.includes(valor) ||
        comuna.includes(valor) ||
        categoria.includes(valor)
      );
    });

    onFiltrar(filtrados);
  };

  return (
    <div className="buscador-proyectos">
      <input
        type="text"
        placeholder="Buscar por nombre, comuna o categoría"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}

export default BuscadorProyectos;
