// src/hooks/usePavimentosPorProyecto.js
import { useEffect, useState } from "react";
import axios from "../services/auth"; // usa instancia con token si es necesario

const usePavimentosPorProyecto = (proyectoId) => {
  const [pavimentos, setPavimentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!proyectoId) return;

    setCargando(true);
    axios
      .get(`/pavimentos/por_proyecto/${proyectoId}`)
      .then((res) => setPavimentos(res.data))
      .catch((err) => console.error("Error al obtener pavimentos:", err))
      .finally(() => setCargando(false));
  }, [proyectoId]);

  return { pavimentos, cargando };
};

export default usePavimentosPorProyecto;
