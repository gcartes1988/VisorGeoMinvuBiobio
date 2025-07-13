// src/components/ProjectForm.js
import React from "react";

function ProjectForm() {
  return (
    <div>
      <h2>Formulario de Proyecto</h2>
      <form>
        <input type="text" placeholder="Nombre del proyecto" />
        <textarea placeholder="Descripción del proyecto" />
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

export default ProjectForm;
