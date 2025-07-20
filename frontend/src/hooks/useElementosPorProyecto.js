// src/hooks/useElementosPorProyecto.js
import { useEffect, useState } from "react";
import axios from "../services/auth";

const useElementosPorProyecto = (proyectoId) => {
  const [datos, setDatos] = useState({ pavimentos: [], ciclovias: [], parques: [] });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!proyectoId) return;

    setCargando(true);
    axios
      .get(`/elementos/por_proyecto/${proyectoId}`)
      .then((res) => setDatos(res.data))
      .catch((err) => {
        console.error("Error al obtener elementos:", err);
        setDatos({ pavimentos: [], ciclovias: [], parques: [] });
      })
      .finally(() => setCargando(false));
  }, [proyectoId]);

  return { ...datos, cargando };
};

export default useElementosPorProyecto;
