import { useState } from "react";
import "../css/LeyendaMapa.css";

const leyenda = [
  { tipo: "Pavimento", color: "#007BFF", icono: "directions_car" },
  { tipo: "Ciclovía", color: "#2D717C", icono: "pedal_bike" },
  { tipo: "Parque", color: "#FFA11B", icono: "park" },
];

export default function LeyendaMapa({ sidebarVisible }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div
      className={`leyenda-mapa sombra-suave ${abierto ? "" : "leyenda-colapsada"}`}
      style={{
        left: sidebarVisible ? "300px" : "16px", // 👈 mueve la leyenda
      }}
    >
      <button className="btn-toggle" onClick={() => setAbierto(!abierto)}>
        <span className="material-symbols-outlined text-gray-b">
          {abierto ? "expand_more" : "expand_less"}
        </span>
        <span className="font-level-8">Leyenda</span>
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
