// src/hooks/useTotales.js
import { useEffect, useState } from "react";
import axios from "../services/auth"; // usa token si aplica

const useTotales = () => {
  const [totales, setTotales] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/proyectos/publicos/totales")
      .then((res) => setTotales(res.data))
      .catch((err) => {
        console.error("Error al obtener totales:", err);
        setTotales(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { totales, loading };
};

export default useTotales;
