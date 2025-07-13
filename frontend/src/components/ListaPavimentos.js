// src/components/ListaPavimentos.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import { useUser } from "../context/UserContext";
import "../css/listas.css";

function ListaPavimentos() {
  const [pavimentos, setPavimentos] = useState([]);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/pavimentos")
      .then((res) => setPavimentos(res.data))
      .catch((err) => console.error("Error al cargar pavimentos:", err));
  }, []);

  const handleEditar = (id) => {
    navigate(`/admin/editar-pavimento/${id}`);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro que deseas eliminar este pavimento?");
    if (!confirmar) return;

    try {
      await axios.delete(`/pavimentos/${id}`);
      setPavimentos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar pavimento:", err);
    }
  };

  return (
    <div className="lista">
      <h2>🛣️ Lista de Pavimentos</h2>
      <table>
        <thead>
          <tr>
            <th>✔️</th>
            <th>Sector</th>
            <th>Comuna</th>
            <th>Estado</th>
            {perfil?.rol !== "visitante" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {pavimentos.length > 0 ? (
            pavimentos.map((p, idx) => (
              <tr key={p.id || idx}>
                <td><input type="checkbox" /></td>
                <td>{p.sector}</td>
                <td>{p.comuna?.nombre || "N/A"}</td>
                <td>{p.estado_avance?.nombre || "N/A"}</td>
                {perfil?.rol !== "visitante" && (
                  <td>
                    <div className="btn-acciones">
                      <button className="btn-editar" onClick={() => handleEditar(p.id)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => handleEliminar(p.id)}>Eliminar</button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr><td colSpan="5">No hay pavimentos registrados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ListaPavimentos;
