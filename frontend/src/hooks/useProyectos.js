import { useEffect, useState } from 'react';
import api from '../services/api';

const useProyectos = () => {
  const [proyectos, setProyectos] = useState([]); // ahora es un array de features
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/proyectos/publicos');
        setProyectos(res.data.features); // 👈 solo usamos el array de features
      } catch (e) {
        console.error("❌ Error al obtener proyectos:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return { proyectos, loading, error };
};
export default useProyectos;
