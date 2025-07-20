import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";


function ListaProyectosPendientes() {
  const [proyectos, setProyectos] = useState([]);
  const { perfil } = useUser();

  useEffect(() => {
    if (perfil.rol === "admin") {
      axios
        .get("/api/proyectos/pendientes")
        .then((res) => setProyectos(res.data))
        .catch(() => toast.error("Error al cargar proyectos pendientes"));
    }
  }, [perfil]);

  const manejarAccion = (id, accion) => {
    const url = `/api/proyectos/${id}/${accion}`;
    axios
      .put(url)
      .then((res) => {
        toast.success(res.data.mensaje || "Acción realizada");
        setProyectos(proyectos.filter((p) => p.id !== id));
      })
      .catch(() => toast.error("Error al actualizar estado del proyecto"));
  };

  return (
    <div>
      <h2 className="font-level-2 text-primary">Proyectos pendientes</h2>
      {proyectos.length === 0 ? (
        <p>No hay proyectos pendientes.</p>
      ) : (
        <table className="table table-sm mt-3">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((proyecto) => (
              <tr key={proyecto.id}>
                <td>{proyecto.nombre}</td>
                <td>{proyecto.categoria?.nombre || "-"}</td>
                <td>
                  <button
                    onClick={() => manejarAccion(proyecto.id, "aprobar")}
                    className="btn btn-green btn-sm mr-2"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => manejarAccion(proyecto.id, "rechazar")}
                    className="btn btn-secondary btn-sm"
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ListaProyectosPendientes;
