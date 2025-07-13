import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { useUser } from "../context/UserContext";
import "../css/listas.css";

function ListaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const { perfil } = useUser();

  useEffect(() => {
    axios.get("/proyectos")
      .then((res) => setProyectos(res.data))
      .catch((err) => console.error("Error cargando proyectos:", err));
  }, []);

  return (
    <div className="lista">
      <h2>📁 Gestión de proyectos</h2>
      <table>
        <thead>
          <tr>
            <th>✔️</th>
            <th>Nombre</th>
            <th>Estado</th>
            {perfil?.rol !== "visitante" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {proyectos.length > 0 ? (
            proyectos.map((p, index) => (
              <tr key={p.proyecto_id || `p-${index}`}>
                <td><input type="checkbox" /></td>
                <td>{p.nombre}</td>
                <td>{p.estado || "N/A"}</td>
                {perfil?.rol !== "visitante" && (
                  <td>
                    <div className="btn-acciones">
                      <button className="btn-editar">Editar</button>
                      <button className="btn-eliminar">Eliminar</button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr><td colSpan={perfil?.rol !== "visitante" ? 5 : 4}>No hay proyectos disponibles</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ListaProyectos;
