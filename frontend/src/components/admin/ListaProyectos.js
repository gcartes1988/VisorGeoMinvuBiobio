import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import Icono from "../../components/Icono";
import "../../css/listas.css";

function ListaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [colapsado, setColapsado] = useState(true);
  const { perfil } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = () => {
    axios.get("/proyectos/")
      .then((res) => setProyectos(res.data))
      .catch((err) => console.error("Error cargando proyectos:", err));
  };

  const handleEditar = (id) => {
    navigate(`/admin/editar-proyecto/${id}`);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro que deseas eliminar este proyecto?");
    if (!confirmar) return;

    try {
      await axios.delete(`/proyectos/${id}`);
      cargarProyectos();
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert("❌ No se pudo eliminar el proyecto.");
    }
  };

  const renderEstado = (estado) => {
    const icon =
      estado === "aprobado" ? "check_circle" :
      estado === "pendiente" ? "schedule" :
      "cancel";

    const clase =
      estado === "aprobado" ? "estado aprobado" :
      estado === "pendiente" ? "estado pendiente" :
      "estado rechazado";

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
        <h2>Gestión de proyectos</h2><br></br>
        <button className="btn-toggle">
          <Icono nombre={colapsado ? "expand_more" : "expand_less"} />
        </button>
      </div>

      {!colapsado && (
        <div className="tabla-scroll fade-in">
          <table>
            <thead>
              <tr>
                <th><Icono nombre="check_box_outline_blank" /></th>
                <th>Nombre</th>
                <th>Estado</th>
                {perfil?.rol !== "visitante" && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {proyectos.length > 0 ? (
                proyectos.map((p, index) => (
                  <tr key={p.id || `p-${index}`}>
                    <td><input type="checkbox" /></td>
                    <td>{p.nombre}</td>
                    <td>{p.estado_proyecto ? renderEstado(p.estado_proyecto) : "N/A"}</td>
                    {perfil?.rol !== "visitante" && (
                      <td>
                        <div className="btn-acciones">
                          <button className="btn-editar" onClick={() => handleEditar(p.id)}>
                            Editar
                          </button>
                          <button className="btn-eliminar" onClick={() => handleEliminar(p.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={perfil?.rol !== "visitante" ? 4 : 3}>
                    No hay proyectos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListaProyectos;
