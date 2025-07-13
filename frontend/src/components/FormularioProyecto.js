import { useState, useEffect } from 'react';
import api from '../services/api';
import FormularioPavimento from './FormularioPavimento';
import AdminLayout from '../layout/AdminLayout';
import '../css/formularios.css';

const FormularioProyecto = () => {
  const [proyectos, setProyectos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [proyectoExistente, setProyectoExistente] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    provincia_id: '',
    comuna_id: '',
    estado_proyecto: 'pendiente'
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data));
    api.get('/provincias').then(res => setProvincias(res.data));
    api.get('/comunas').then(res => setComunas(res.data));
    api.get('/proyectos').then(res => setProyectos(res.data));
    api.get('/me').then(res => setUsuario(res.data));
  }, []);

  const comunasFiltradas = comunas.filter(c => c.provincia_id === parseInt(formData.provincia_id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'provincia_id' ? { comuna_id: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      categoria_id: parseInt(formData.categoria_id),
      comuna_id: parseInt(formData.comuna_id),
      estado_proyecto: usuario?.rol === 'admin' ? formData.estado_proyecto : 'pendiente'
    };
    try {
      await api.post(usuario?.rol === 'editor' ? '/proyectos/editor' : '/proyectos', payload);
      setMensaje('✅ Proyecto creado exitosamente');
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        provincia_id: '',
        comuna_id: '',
        estado_proyecto: 'pendiente'
      });
    } catch {
      setMensaje('❌ Error al crear proyecto');
    }
  };

  const proyectoSeleccionado = proyectos.find(p => p.id === parseInt(proyectoExistente));

  return (
    <AdminLayout>
      <div className="formulario-container">
        <h3>Gestión de Proyecto</h3>

        <label>Seleccionar Proyecto Existente:</label><br />
        <select value={proyectoExistente} onChange={(e) => setProyectoExistente(e.target.value)}>
          <option value=''>Crear nuevo proyecto</option>
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        {!proyectoExistente && (
          <form onSubmit={handleSubmit}>
            <hr />
            <label>Nombre:</label><br />
            <input type='text' name='nombre' value={formData.nombre} onChange={handleChange} required /><br />

            <label>Descripción:</label><br />
            <textarea name='descripcion' value={formData.descripcion} onChange={handleChange} required /><br />

            <label>Categoría:</label><br />
            <select name='categoria_id' value={formData.categoria_id} onChange={handleChange} required>
              <option value=''>Seleccionar categoría</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select><br />

            <label>Provincia:</label><br />
            <select name='provincia_id' value={formData.provincia_id} onChange={handleChange} required>
              <option value=''>Seleccionar provincia</option>
              {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select><br />

            <label>Comuna:</label><br />
            <select name='comuna_id' value={formData.comuna_id} onChange={handleChange} required disabled={!formData.provincia_id}>
              <option value=''>Seleccionar comuna</option>
              {comunasFiltradas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select><br />

            {usuario?.rol === 'admin' && (
              <>
                <label>Estado del Proyecto:</label><br />
                <select name='estado_proyecto' value={formData.estado_proyecto} onChange={handleChange}>
                  <option value='pendiente'>Pendiente</option>
                  <option value='aprobado'>Aprobado</option>
                  <option value='rechazado'>Rechazado</option>
                </select><br />
              </>
            )}
            <button type='submit'>Guardar Proyecto</button>
          </form>
        )}

        {proyectoExistente && proyectoSeleccionado?.categoria === 'Pavimentos de vías locales' && (
          <FormularioPavimento
            proyectoId={proyectoSeleccionado.id}
            comunaId={proyectoSeleccionado.comuna_id} // ✅ PASAMOS EL COMUNA_ID AL COMPONENTE
          />
        )}

        {mensaje && <p>{mensaje}</p>}
      </div>
    </AdminLayout>
  );
};

export default FormularioProyecto;
