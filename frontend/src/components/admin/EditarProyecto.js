import { useParams } from "react-router-dom";
import FormularioProyecto from "../FormularioProyecto";
import AdminLayout from "../../layout/AdminLayout";

const EditarProyecto = () => {
  const { id } = useParams();

  return (
    <AdminLayout>
      <div className="formulario-container">
        <h2 className="font-level-2 text-primary">
          <span className="material-symbols-outlined">edit</span> Editar Proyecto
        </h2>
        <FormularioProyecto modoEdicion={true} proyectoId={id} />
      </div>
    </AdminLayout>
  );
};

export default EditarProyecto;
