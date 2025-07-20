import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Icono from "../../components/Icono"; 
import "../../css/admin.css";

const DashboardResumen = () => {
  const [resumen, setResumen] = useState({
    proyectos_activos: 0,
    pavimentos: 0,
    ciclovias: 0,
    parques: 0
  });

  useEffect(() => {
    api.get("/proyectos/publicos/totales")
      .then((res) => setResumen(res.data))
      .catch((err) => console.error("❌ Error al cargar resumen", err));
  }, []);

  return (
    <div className="encabezado-admin">

      <div className="card border-blue">
        <Icono nombre="directions" size={32} color="#007bff" />
        <p>Pavimentos y vias locales</p>
        <h2>{resumen.pavimentos}</h2>
      </div>
      <div className="card border-orange">
        <Icono nombre="pedal_bike" size={32} color="#fd7e14" />
        <p>Ciclovías</p>
        <h2>{resumen.ciclovias}</h2>
      </div>
      <div className="card border-purple">
        <Icono nombre="park" size={32} color="#6f42c1" />
        <p>Parques Urbanos</p>
        <h2>{resumen.parques}</h2>
      </div>
      <div className="card border-green">
        <Icono nombre="assignment_turned_in" size={32} color="#28a745" />
        <p>Proyectos activos</p>
        <h2>{resumen.proyectos_activos}</h2>
      </div>
      
    </div>
  );
};

export default DashboardResumen;
