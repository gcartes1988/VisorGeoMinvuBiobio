import AdminLayout from "../layout/AdminLayout";
import FormularioParque from "./FormularioParque";
import { useParams } from "react-router-dom";

const EditarParque = () => {
  const { id } = useParams();

  return (
    <AdminLayout>
      <FormularioParque modoEdicion={true} parqueId={id} />
    </AdminLayout>
  );
};

export default EditarParque;
