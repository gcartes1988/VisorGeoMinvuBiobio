import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";
import Icono from "../../components/Icono";
import "../../css/listas.css";

function ListaParques() {
  const [parques, setParques] = useState([]);
  const [colapsado, setColapsado] = useState(true);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/parques/")
      .then((res) => {
        console.log("🧪 Parques desde backend:", res.data);
        setParques(res.data);
      })
      .catch((err) => {
        console.error("❌ Error al cargar parques:", err);
        if (err.response) {
          console.error("📨 Backend:", err.response.data);
        }
      });
  }, []);

  const handleEditar = (id) => {
    navigate(`/admin/editar-parque/${id}`);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro que deseas eliminar este parque?");
    if (!confirmar) return;

    try {
      const res = await api.delete(`/parques/${id}`);
      console.log("✅ Parque eliminado:", res.data);
      setParques((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("❌ Error al eliminar parque:", err);
    }
  };

  const renderEstado = (estado) => {
    if (!estado) return "Sin estado";

    const nombre = estado.toLowerCase();
    const icon =
      nombre === "terminada" ? "check_circle" :
      nombre === "en ejecución" ? "schedule" :
      "pending";

    const clase =
      nombre === "terminada" ? "estado aprobado" :
      nombre === "en ejecución" ? "estado pendiente" :
      "estado rechazado";

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
        <h2>Parques Urbanos</h2>
        <button className="btn-toggle">
          <Icono nombre={colapsado ? "expand_more" : "expand_less"} />
        </button>
      </div>

      {!colapsado && (
        <div className="tabla-scroll fade-in">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Comuna</th>
                <th>Estado</th>
                {perfil?.rol !== "visitante" && <th>Acciones</th>}
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
    <button
      className="btn-icono"
      onClick={() => p.editable && handleEditar(p.id)}
      disabled={!p.editable}
      title={p.editable ? "Editar parque" : "No tienes permisos para editar"}
    >
      <span className="material-symbols-outlined">edit</span>
    </button>

    {perfil.rol === "admin" && (
      <button
        className="btn-icono btn-eliminar"
        onClick={() => handleEliminar(p.id)}
        title="Eliminar parque"
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
}

export default ListaParques;
