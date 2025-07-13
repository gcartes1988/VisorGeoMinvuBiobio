import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import FormularioPavimento from "../components/FormularioPavimento";

const EditarPavimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pavimento, setPavimento] = useState(null);

  useEffect(() => {
    const fetchPavimento = async () => {
      try {
        const res = await api.get(`/pavimentos/${id}`);
        setPavimento(res.data);
      } catch (err) {
        console.error("Error al cargar pavimento", err);
      }
    };

    fetchPavimento();
  }, [id]);

  const handleSubmit = async (datosActualizados) => {
    try {
      await api.put(`/pavimentos/${id}`, datosActualizados);
      navigate("/admin");
    } catch (err) {
      console.error("Error al actualizar pavimento", err);
    }
  };

  if (!pavimento) return <p>Cargando pavimento...</p>;

  return <FormularioPavimento modo="editar" pavimento={pavimento} onSubmit={handleSubmit} />;
};

export default EditarPavimento;
