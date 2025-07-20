import { useState } from 'react';
import api from '../services/api';
import '../css/formularios.css';

function FormularioCiclovia({ proyectoId, comunaId }) {
  const [form, setForm] = useState({
    nombre_tramo: '',
    estado_avance_id: '',
    tipo_ciclovia_id: '',
    longitud_km: '',
    geometria: ''
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      proyecto_id: proyectoId,
      comuna_id: comunaId,
      longitud_km: parseFloat(form.longitud_km)
    };
    try {
      await api.post('/ciclovias', payload);
      setMensaje('✅ Ciclovía creada con éxito');
      setForm({
        nombre_tramo: '',
        estado_avance_id: '',
        tipo_ciclovia_id: '',
        longitud_km: '',
        geometria: ''
      });
    } catch {
      setMensaje('❌ Error al crear ciclovía');
    }
  };

  return (
    <div className="formulario-categoria">
      <h4>➕ Añadir Ciclovía</h4>
      <form onSubmit={handleSubmit}>
        <label>Nombre del tramo:</label><br />
        <input name="nombre_tramo" value={form.nombre_tramo} onChange={handleChange} required /><br />

        <label>Estado de avance ID:</label><br />
        <input name="estado_avance_id" value={form.estado_avance_id} onChange={handleChange} required /><br />

        <label>Tipo de ciclovía ID:</label><br />
        <input name="tipo_ciclovia_id" value={form.tipo_ciclovia_id} onChange={handleChange} required /><br />

        <label>Longitud (km):</label><br />
        <input name="longitud_km" value={form.longitud_km} onChange={handleChange} required /><br />

        <label>Geometría (GeoJSON):</label><br />
        <textarea name="geometria" value={form.geometria} onChange={handleChange} required /><br />

        <button type="submit">Guardar Ciclovía</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default FormularioCiclovia;
