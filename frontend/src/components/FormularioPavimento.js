import { useState, useEffect } from 'react';
import api from '../services/api';
import { validarLineString } from '../utils/validarGeoJSON';
import { useParams } from "react-router-dom";
import VistaPreviaGeojson from '../components/VistaPreviaGeojson';

const FormularioPavimento = ({ proyectoId, modoEdicion = false }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    comuna_id: '',
    sector: '',
    longitud_metros: '',
    tipo_calzada_id: '',
    tipo_pavimento_id: '',
    estado_avance_id: '',
    geometria: JSON.stringify({
      type: "LineString",
      coordinates: [
        [-73.0508, -36.828],
        [-73.0495, -36.8285],
        [-73.0483, -36.8288]
      ]
    }, null, 2)
  });

  const [geoValido, setGeoValido] = useState(true);
  const [tiposCalzada, setTiposCalzada] = useState([]);
  const [tiposPavimento, setTiposPavimento] = useState([]);
  const [estadosAvance, setEstadosAvance] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api.get('/tipo-calzada').then(res => setTiposCalzada(res.data));
    api.get('/tipo-pavimento').then(res => setTiposPavimento(res.data));
    api.get('/estado-avance').then(res => setEstadosAvance(res.data));
    api.get('/comunas').then(res => setComunas(res.data));
  }, []);

  useEffect(() => {
    if (modoEdicion && id) {
      api.get(`/pavimentos/${id}`)
        .then(res => {
          const pav = res.data;
          setFormData({
            comuna_id: pav.comuna?.id?.toString() || '',
            sector: pav.sector || '',
            longitud_metros: pav.longitud_metros?.toString() || '',
            tipo_calzada_id: pav.tipo_calzada_id?.toString() || '',
            tipo_pavimento_id: pav.tipo_pavimento_id?.toString() || '',
            estado_avance_id: pav.estado_avance?.id?.toString() || '',
            geometria: JSON.stringify(pav.geometria, null, 2)
          });
          setGeoValido(true);
        })
        .catch(err => {
          console.error("Error al cargar pavimento:", err);
          setMensaje("❌ Error al cargar los datos del pavimento.");
        });
    }
  }, [modoEdicion, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'geometria') {
      setGeoValido(validarLineString(value));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!geoValido) {
      setMensaje("❌ Geometría inválida: debe ser un GeoJSON válido de tipo LineString.");
      return;
    }

    let geoObjeto;
    try {
      geoObjeto = JSON.parse(formData.geometria);
    } catch {
      setMensaje("❌ Error al interpretar el GeoJSON.");
      return;
    }

    const payload = {
      comuna_id: parseInt(formData.comuna_id),
      sector: formData.sector,
      longitud_metros: parseFloat(formData.longitud_metros),
      tipo_calzada_id: parseInt(formData.tipo_calzada_id),
      tipo_pavimento_id: parseInt(formData.tipo_pavimento_id),
      estado_avance_id: parseInt(formData.estado_avance_id),
      geometria: geoObjeto
    };

    try {
      if (modoEdicion && id) {
        payload.proyecto_id = proyectoId; // 👈 Agrega esto
        await api.put(`/pavimentos/${id}`, payload);
        setMensaje("✏️ Pavimento actualizado con éxito.");
      } else {
        payload.proyecto_id = proyectoId;
        await api.post('/pavimentos', payload);
        setMensaje("✅ Pavimento creado con éxito.");
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar pavimento.");
    }
  };

  return (
    <div className="formulario-container">
      <h3>{modoEdicion ? 'Editar Pavimento' : 'Agregar Pavimento'}</h3>
      <form onSubmit={handleSubmit}>
        <label>Comuna:</label><br />
        <select name='comuna_id' value={formData.comuna_id} onChange={handleChange} required>
          <option value=''>Seleccionar comuna</option>
          {comunas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select><br />

        <label>Sector:</label><br />
        <input type="text" name="sector" value={formData.sector} onChange={handleChange} required /><br />

        <label>Longitud (m):</label><br />
        <input type="number" name="longitud_metros" value={formData.longitud_metros} onChange={handleChange} required /><br />

        <label>Tipo de Calzada:</label><br />
        <select name='tipo_calzada_id' value={formData.tipo_calzada_id} onChange={handleChange} required>
          <option value=''>Seleccionar tipo</option>
          {tiposCalzada.map(tc => <option key={tc.id} value={tc.id}>{tc.nombre}</option>)}
        </select><br />

        <label>Tipo de Pavimento:</label><br />
        <select name='tipo_pavimento_id' value={formData.tipo_pavimento_id} onChange={handleChange} required>
          <option value=''>Seleccionar tipo</option>
          {tiposPavimento.map(tp => <option key={tp.id} value={tp.id}>{tp.nombre}</option>)}
        </select><br />

        <label>Estado de Avance:</label><br />
        <select name='estado_avance_id' value={formData.estado_avance_id} onChange={handleChange} required>
          <option value=''>Seleccionar estado</option>
          {estadosAvance.map(ea => <option key={ea.id} value={ea.id}>{ea.nombre}</option>)}
        </select><br />

        <label htmlFor="geometria">Geometría (GeoJSON - LineString):</label>
        <textarea
          id="geometria"
          name="geometria"
          rows={6}
          value={formData.geometria}
          onChange={handleChange}
          style={{
            border: `2px solid ${geoValido ? 'green' : 'red'}`,
            width: '100%',
            fontFamily: 'monospace',
            padding: '8px'
          }}
        />
        <small style={{ color: geoValido ? '#666' : 'red' }}>
          {geoValido
            ? '✅ GeoJSON válido de tipo LineString'
            : '❌ Verifica el formato del GeoJSON.'}
        </small>

        <br />
        <VistaPreviaGeojson geojsonStr={formData.geometria} />

        <button type="submit">{modoEdicion ? 'Actualizar' : 'Guardar'} Pavimento</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default FormularioPavimento;
