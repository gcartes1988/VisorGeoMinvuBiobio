import { useEffect, useState } from 'react';
import axios from '../services/api';


const useProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const res = await axios.get("/proyectos"); // auth ya incluye el /api
        setProyectos(res.data);
      } catch (err) {
        console.error("Error al obtener proyectos:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, []);

  return { proyectos, loading, error };
};

export default useProyectos;
