import { useState } from "react";
import "../css/LeyendaMapa.css";

const leyenda = [
  { tipo: "Pavimento", color: "#007BFF", icono: "directions_car" },
  { tipo: "Ciclovía", color: "#2D717C", icono: "pedal_bike" },
  { tipo: "Parque", color: "#FFA11B", icono: "park" },
];

export default function LeyendaMapa({ sidebarMinimizada }) {
  const [abierto, setAbierto] = useState(true);

  const clases = `leyenda-mapa sombra-suave ${abierto ? "" : "leyenda-colapsada"} ${sidebarMinimizada ? "modo-movil" : "modo-sidebar"}`;

  return (
    <div className={clases}>
      <button className="btn-toggle " onClick={() => setAbierto(!abierto)}>
        <span className="material-symbols-outlined text-gray-b ">
          {abierto ? "expand_more" : "expand_less"}
        </span>
        <span className="font-level-8 ">Leyenda</span>
      </button>
      {abierto && (
        <ul className="lista-leyenda">
          {leyenda.map((item) => (
            <li key={item.tipo}>
              <span className="cuadro-color" style={{ backgroundColor: item.color }}></span>
              <span className="material-symbols-outlined">{item.icono}</span>
              <span>{item.tipo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
