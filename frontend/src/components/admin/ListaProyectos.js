import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";
import Icono from "../Icono";
import "../../css/listas.css";

const ListaProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [colapsado, setColapsado] = useState(false);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/proyectos/aprobados")
      .then(res => setProyectos(res.data))
      .catch(err => console.error("❌ Error al cargar proyectos:", err));
  }, []);

  const handleEditar = (id) => navigate(`/admin/editar-proyecto/${id}`);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este proyecto?")) return;
    try {
      await api.delete(`/proyectos/${id}`);
      setProyectos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
    }
  };

  const renderEstado = (estado) => {
    const icon = estado === "aprobado" ? "check_circle"
               : estado === "pendiente" ? "schedule"
               : "cancel";

    const clase = estado === "aprobado"
      ? "estado aprobado"
      : estado === "pendiente"
      ? "estado pendiente"
      : "estado rechazado";

    return (
      <span className={clase}>
        <Icono nombre={icon} size={18} />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  return (
    <div className="lista">
      <div className="titulo-colapsable" onClick={() => setColapsado(!colapsado)}>
        <h2 className="font-level-2 text-primary">
          <span className="material-symbols-outlined">folder</span> Gestión de proyectos
        </h2>
        <button className="btn-toggle">
          <Icono nombre={colapsado ? "expand_more" : "expand_less"} />
        </button>
      </div>

      {!colapsado && (
        <div className="tabla-scroll fade-in">
          <table className="tabla-lista">
            <thead>
              <tr>
                <th><Icono nombre="check_box_outline_blank" /></th>
                <th>Nombre</th>
                <th>Estado</th>
                {perfil?.rol !== "visitante" && <th className="acciones-columna">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {proyectos.length > 0 ? (
                proyectos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input type="checkbox" disabled={perfil?.rol === "editor"} />
                    </td>
                    <td>{p.nombre}</td>
                    <td>{renderEstado(p.estado_proyecto)}</td>
                    {perfil?.rol !== "visitante" && (
                      <td>
                        <div className="btn-acciones">
                          <button
                            className={`btn-icono ${!p.editable ? "btn-disabled" : ""}`}
                            onClick={() => p.editable && handleEditar(p.id)}
                            disabled={!p.editable}
                            title={p.editable ? "Editar proyecto" : "No tiene permisos para editar"}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>

                          {perfil.rol === "admin" && (
                            <button
                              className="btn-icono btn-eliminar"
                              onClick={() => handleEliminar(p.id)}
                              title="Eliminar proyecto"
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
                  <td colSpan={perfil?.rol !== "visitante" ? 4 : 3}>
                    No hay proyectos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaProyectos;
