import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useUser } from "../../context/UserContext";
import Icono from "../../components/Icono";
import "../../css/listas.css";

function ListaPavimentos() {
  const [pavimentos, setPavimentos] = useState([]);
  const [colapsado, setColapsado] = useState(true);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/pavimentos/")
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
      const res = await axios.delete(`/pavimentos/${id}`);
      console.log("✅ Eliminado:", res.data);
      setPavimentos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("❌ Error al eliminar pavimento:", err);
      if (err.response) {
        console.error("➡️ Respuesta del servidor:", err.response.data);
      }
    }
  };

  const renderEstado = (nombre) => {
    const estado = nombre?.toLowerCase();
    const icon =
      estado === "terminada" ? "check_circle" :
      estado === "en ejecución" ? "schedule" :
      "pending";
    const clase =
      estado === "terminada" ? "estado aprobado" :
      estado === "en ejecución" ? "estado pendiente" :
      "estado rechazado";

    return (
      <span className={clase}>
        <Icono nombre={icon} size={18} />
        {nombre || "N/A"}
      </span>
    );
  };

  return (
    <div className="lista">
      <div className="titulo-colapsable" onClick={() => setColapsado(!colapsado)}>
        <h2>Pavimentos y Vías Locales</h2>
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
                <th>Sector</th>
                <th>Comuna</th>
                <th>Estado</th>
                {perfil?.rol !== "visitante" && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {pavimentos.length > 0 ? (
                pavimentos.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" /></td>
                    <td>{p.sector}</td>
                    <td>{p.comuna?.nombre || "N/A"}</td>
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
                <tr>
                  <td colSpan="5">No hay pavimentos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListaPavimentos;
