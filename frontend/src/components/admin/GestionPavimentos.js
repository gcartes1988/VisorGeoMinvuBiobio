// src/components/admin/GestionPavimentos.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useUser } from "../../context/UserContext";
import AdminLayout from "../../layout/AdminLayout";
import Icono from "../Icono";
import "../../css/listas.css";

const GestionPavimentos = () => {
  const [pavimentos, setPavimentos] = useState([]);
  const [colapsado, setColapsado] = useState(false);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/pavimentos/")
      .then(res => setPavimentos(res.data))
      .catch(err => console.error("❌ Error al cargar pavimentos:", err));
  }, []);

  const handleEditar = (id) => {
    navigate(`/admin/editar-pavimento/${id}`);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este pavimento?")) return;
    try {
      await axios.delete(`/pavimentos/${id}`);
      setPavimentos(prev => prev.filter(p => p.id !== id));
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
            <span className="material-symbols-outlined">construction</span> Pavimentos y Vías Locales
          </h2>
          <button className="btn-toggle"><Icono nombre={colapsado ? "expand_more" : "expand_less"} /></button>
        </div>

        {!colapsado && (
          <div className="tabla-scroll fade-in">
            <table className="tabla-lista">
              <thead>
                <tr>
                  <th></th>
                  <th>Sector</th>
                  <th>Comuna</th>
                  <th>Estado</th>
                  {perfil?.rol !== "visitante" && <th className="acciones-columna">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {pavimentos.length > 0 ? (
                  pavimentos.map((p) => (
                    <tr key={p.id}>
                      <td><input type="checkbox" /></td>
                      <td>{p.sector}</td>
                      <td>{p.comuna?.nombre || "Sin comuna"}</td>
                      <td>{renderEstado(p.estado_avance?.nombre)}</td>
                      {perfil?.rol !== "visitante" && (
                        <td>
                     <div className="btn-acciones">
  <button
    className={`btn-icono ${!p.editable ? "btn-disabled" : ""}`}
    onClick={() => p.editable && handleEditar(p.id)}
    disabled={!p.editable}
    title={p.editable ? "Editar pavimento" : "Solo editable por su creador o un administrador"}
  >
    <span className="material-symbols-outlined">edit</span>
  </button>

  {perfil.rol === "admin" && (
    <button
      className="btn-icono btn-eliminar"
      onClick={() => handleEliminar(p.id)}
      title="Eliminar pavimento"
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
                  <tr><td colSpan="5">No hay pavimentos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GestionPavimentos;
