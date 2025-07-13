// src/components/admin/ListaLogCambios.js
import React from "react";
import useLogCambios from "../hooks/useLogCambios";
import "../css/listas.css";

const ListaLogCambios = () => {
  const logs = useLogCambios();

  return (
    <div className="contenedor-lista">
      <h2>Historial de Cambios</h2>

      {logs.length === 0 ? (
        <p style={{ padding: "1rem", fontStyle: "italic" }}>
          ⚠️ No se encontraron registros de cambios.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proyecto ID</th>
              <th>Usuario ID</th>
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
                <td>{log.proyecto_id ?? "-"}</td>
                <td>{log.usuario_id ?? "-"}</td>
                <td>{log.accion}</td>
                <td>{log.campo_modificado}</td>
                <td>{log.valor_anterior}</td>
                <td>{log.valor_nuevo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListaLogCambios;
