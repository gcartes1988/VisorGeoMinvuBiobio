import FormularioProyecto from "../FormularioProyecto";
import AdminLayout from "../../layout/AdminLayout";

const CrearProyecto = () => {
  return (
    <AdminLayout>
      <div className="formulario-container">
        <h2 className="font-level-2 text-primary">
          <span className="material-symbols-outlined">add_circle</span> Crear nuevo proyecto
        </h2>
        <FormularioProyecto modoEdicion={false} />
      </div>
    </AdminLayout>
  );
};

export default CrearProyecto;
