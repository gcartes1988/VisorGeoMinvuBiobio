import React from "react";
import useLogCambios from "../../hooks/useLogCambios";
import "../../css/listas.css";

const ListaLogCambios = () => {
  const logs = useLogCambios();

  return (
    <div className="lista">
      <h2 className="font-level-2">
        Historial de Cambios
      </h2>

      {logs.length === 0 ? (
        <p style={{ padding: "1rem", fontStyle: "italic" }}>
          No se encontraron registros de cambios.
        </p>
      ) : (
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proyecto</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Campo</th>
                <th>Antes</th>
                <th>Después</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.fecha).toLocaleString()}</td>
                  <td>{log.nombre_proyecto ?? `ID ${log.proyecto_id}`}</td>
                  <td>{log.nombre_usuario ?? `ID ${log.usuario_id}`}</td>
                  <td>{formatearAccion(log.accion)}</td>
                  <td>{formatearCampo(log.campo_modificado)}</td>
                  <td>{formatearValor(log.valor_anterior)}</td>
                  <td>{formatearValor(log.valor_nuevo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 🔧 Íconos con color según tipo de acción
function formatearAccion(accion) {
  switch (accion) {
    case "create":
      return (
        <span className="estado aprobado">
          <span className="material-symbols-outlined">add_circle</span> Creación
        </span>
      );
    case "update":
      return (
        <span className="estado pendiente">
          <span className="material-symbols-outlined">edit</span> Edición
        </span>
      );
    case "delete":
      return (
        <span className="estado rechazado">
          <span className="material-symbols-outlined">delete</span> Eliminación
        </span>
      );
    default:
      return accion;
  }
}

// 🔧 Traducción de campos técnicos
function formatearCampo(campo) {
  const map = {
    estado_avance_id: "Estado de Avance",
    longitud_metros: "Longitud (m)",
    sector: "Sector",
    tipo_calzada_id: "Tipo de Calzada",
    geometria: "Geometría",
    nombre: "Nombre",
    descripcion: "Descripción",
    categoria_id: "Categoría",
    estado_proyecto: "Estado del Proyecto",
  };
  return map[campo] ?? campo;
}

// 🔧 Formateo de valores
function formatearValor(valor) {
  if (valor === null || valor === undefined || valor === "") return "—";

  if (typeof valor === "object") {
    return (
      <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem", maxWidth: "250px" }}>
        {JSON.stringify(valor, null, 2)}
      </pre>
    );
  }

  if (String(valor).startsWith("0102")) {
    return (
      <span style={{ color: "#666" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "16px", verticalAlign: "middle" }}>
          route
        </span>{" "}
        Geometría modificada
      </span>
    );
  }

  return valor;
}

export default ListaLogCambios;
