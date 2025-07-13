// src/hooks/useLogCambios.js
import { useEffect, useState } from "react";
import axios from "../services/api";

const useLogCambios = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("/log_cambios/");
        setLogs(response.data);
      } catch (error) {
        console.error("Error al cargar log de cambios:", error);
      }
    };

    fetchLogs();
  }, []);

  return logs;
};

export default useLogCambios;
