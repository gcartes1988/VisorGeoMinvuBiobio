// src/components/admin/GestionParques.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";
import AdminLayout from "../../layout/AdminLayout";
import Icono from "../Icono";
import "../../css/listas.css";

const GestionParques = () => {
  const [parques, setParques] = useState([]);
  const [colapsado, setColapsado] = useState(false);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/parques/")
      .then(res => setParques(res.data))
      .catch(err => console.error("❌ Error al cargar parques:", err));
  }, []);

  const handleEditar = (id) => {
    navigate(`/admin/editar-parque/${id}`);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este parque?")) return;
    try {
      await api.delete(`/parques/${id}`);
      setParques(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
    }
  };

  const renderEstado = (estado) => {
    const nombre = estado?.toLowerCase();
    const icon = nombre === "terminada" ? "check_circle" : nombre === "en ejecución" ? "schedule" : "pending";
    const clase = nombre === "terminada" ? "estado aprobado" : nombre === "en ejecución" ? "estado pendiente" : "estado rechazado";

    return (
      <span className={clase}>
        <Icono nombre={icon} size={18} />
        {estado || "Sin estado"}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="lista">
        <div className="titulo-colapsable" onClick={() => setColapsado(!colapsado)}>
          <h2 className="font-level-2 text-primary">
            <span className="material-symbols-outlined">park</span> Parques urbanos
          </h2>
          <button className="btn-toggle" title="Colapsar/Expandir">
            <Icono nombre={colapsado ? "expand_more" : "expand_less"} />
          </button>
        </div>

        {!colapsado && (
          <div className="tabla-scroll fade-in">
            <table className="tabla-lista">
              <thead>
                <tr>
                  <th></th>
                  <th>Nombre</th>
                  <th>Comuna</th>
                  <th>Estado</th>
                  {perfil?.rol !== "visitante" && <th className="acciones-columna">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {parques.length > 0 ? (
                  parques.map((p) => (
                    <tr key={p.id}>
                      <td><input type="checkbox" /></td>
                      <td>{p.nombre || "Sin nombre"}</td>
                      <td>{p.comuna?.nombre || "Sin comuna"}</td>
                      <td>{renderEstado(p.proyecto?.estado_proyecto)}</td>
                      {perfil?.rol !== "visitante" && (
                        <td>
                          <div className="btn-acciones">
                            <button className="btn-icono" onClick={() => handleEditar(p.id)}>
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="btn-icono btn-eliminar" onClick={() => handleEliminar(p.id)}>
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5">No hay parques registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GestionParques;
