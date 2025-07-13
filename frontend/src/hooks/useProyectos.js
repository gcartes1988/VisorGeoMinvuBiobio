// src/hooks/useProyectos.js
import { useEffect, useState } from 'react';
import axios from '../services/api';

const useProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const res = await axios.get("/proyectos"); // usa tu API ya configurada
        setProyectos(res.data);
        console.log("📦 Proyectos cargados desde useProyectos:", res.data);
      } catch (err) {
        console.error("❌ Error cargando proyectos en useProyectos:", err);
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
