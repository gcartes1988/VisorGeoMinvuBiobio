// src/components/EditarPavimento.jsx
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import FormularioPavimento from "./FormularioPavimento";
console.log("🧪 Se cargó EditarPavimento.jsx");

const EditarPavimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/admin");
  };

  return (
    <AdminLayout> 
       <FormularioPavimento pavimentoId={id} modoEdicion={true} onSuccess={handleSuccess} />

    </AdminLayout>
  
  );
};

export default EditarPavimento;
