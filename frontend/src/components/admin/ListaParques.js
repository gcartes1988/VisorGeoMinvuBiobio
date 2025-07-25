import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";
import Icono from "../Icono";
import "../../css/listas.css";

const ListaParques = () => {
  const [parques, setParques] = useState([]);
  const [colapsado, setColapsado] = useState(false);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/parques/")
      .then(res => {
        console.log("📦 Parques cargados:", res.data);
        setParques(res.data);
      })
      .catch(err => console.error("❌ Error al cargar parques:", err));
  }, []);

  const handleEditar = (id) => navigate(`/admin/editar-parque/${id}`);

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
    if (!estado) return (
      <span className="estado sin-estado">
        <Icono nombre="help_outline" size={18} />
        Sin estado
      </span>
    );

    const nombre = estado.toLowerCase();
    const icon = nombre === "aprobado" ? "mood" : nombre === "pendiente" ? "pending" : "cancel";
    const clase = nombre === "aprobado" ? "estado aprobado" : nombre === "pendiente" ? "estado pendiente" : "estado rechazado";

    return (
      <span className={clase}>
        <Icono nombre={icon} size={18} />
        {estado}
      </span>
    );
  };

  return (
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
                    <td><input type="checkbox" disabled={perfil?.rol === "editor"} /></td>
                    <td>{p.nombre || "Sin nombre"}</td>
                    <td>{p.comuna?.nombre || "Sin comuna"}</td>
                    <td>{renderEstado(p.proyecto?.estado_proyecto)}</td>
                    {perfil?.rol !== "visitante" && (
                      <td>
                        <div className="btn-acciones">
                          <button
                            className={`btn-icono ${!p.editable ? "btn-disabled" : ""}`}
                            onClick={() => p.editable && handleEditar(p.id)}
                            disabled={!p.editable}
                            title={p.editable ? "Editar parque" : "Solo puede editar el creador"}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>

                          {(perfil.rol === "admin" || perfil.rol === "editor") && (
                            <button
                              className={`btn-icono btn-eliminar ${!p.editable ? "btn-disabled" : ""}`}
                              onClick={() => p.editable && handleEliminar(p.id)}
                              disabled={!p.editable}
                              title={p.editable ? "Eliminar parque" : "Solo puede eliminar el creador"}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No hay parques registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaParques;
