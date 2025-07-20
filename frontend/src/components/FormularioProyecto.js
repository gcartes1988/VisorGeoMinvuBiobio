import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import FormularioPavimento from './FormularioPavimento';
import FormularioCiclovia from './FormularioCiclovia';
import FormularioParque from './FormularioParque';
import '../css/formularios.css';

const FormularioProyecto = ({ modoEdicion = false, proyectoId = null, onSuccess = null }) => {
  const { id: idUrl } = useParams();
  const [proyectos, setProyectos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [proyectoExistente, setProyectoExistente] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    estado_proyecto: 'pendiente'
  });
  const [mensaje, setMensaje] = useState('');

  const idFinal = proyectoId || idUrl;

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data));
    api.get('/proyectos').then(res => setProyectos(res.data));
    api.get('/me').then(res => setUsuario(res.data));
  }, []);

  useEffect(() => {
    if (modoEdicion && idFinal && usuario && categorias.length > 0) {
      api.get(`/proyectos/${idFinal}`).then(res => {
        const data = res.data;
        setFormData({
          nombre: data.nombre,
          descripcion: data.descripcion,
          categoria_id: data.categoria?.id || data.categoria_id,
          estado_proyecto: data.estado_proyecto || 'pendiente'
        });
        setProyectoExistente(String(data.id));
      });
    }
  }, [modoEdicion, idFinal, usuario, categorias]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      categoria_id: parseInt(formData.categoria_id),
      estado_proyecto: usuario?.rol === 'admin' ? formData.estado_proyecto : 'pendiente'
    };

    try {
      if (modoEdicion && idFinal) {
        const res = await api.put(`/proyectos/${idFinal}`, payload);
        setMensaje(res.data?.mensaje || "✏️ Proyecto actualizado correctamente");
        if (res.data?.mensaje?.startsWith("✅") && onSuccess) {
          setTimeout(onSuccess, 3000);
        }
      } else {
        const res = await api.post('/proyectos', payload);
        setMensaje(res.data?.mensaje || "✅ Proyecto creado exitosamente");
        setFormData({ nombre: '', descripcion: '', categoria_id: '', estado_proyecto: 'pendiente' });
        setProyectoExistente('');
        if (onSuccess) {
          setTimeout(onSuccess, 3000);
        }
      }

      const resProyectos = await api.get('/proyectos');
      setProyectos(resProyectos.data);
    } catch {
      setMensaje("❌ Error al guardar el proyecto");
    }
  };

  const proyectoSeleccionado = proyectos.find(p => p.id === parseInt(proyectoExistente));
  const categoriaIdSeleccionada = proyectoSeleccionado?.categoria_id;

  if (!usuario || categorias.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando datos del proyecto...</p>
      </div>
    );  }

  return (
      <div className="formulario-container">


        {/* SECCIÓN 1: Selección */}
        {!modoEdicion && (
          <div>
            <h3>
              Seleccionar o Crear Proyecto
            </h3>
            <label className="font-level-7">Proyecto:</label>
            <Select
              options={[
                { label: 'Crear nuevo proyecto', value: '' },
                {
                  label: 'Proyectos existentes',
                  options: proyectos.map(p => ({
                    label: p.nombre,
                    value: String(p.id)
                  }))
                }
              ]}
              value={proyectoExistente
                ? { label: proyectoSeleccionado?.nombre || '', value: proyectoExistente }
                : { label: 'Crear nuevo proyecto', value: '' }}
              onChange={(option) => setProyectoExistente(option.value)}
            />
          </div>
        )}

        {/* SECCIÓN 2: Formulario principal */}
        {(!proyectoExistente || modoEdicion) && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-b mb-6">
  

            <label className="font-level-7">Nombre:</label>
            <input className="input-text" type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />

            <label className="font-level-7">Descripción:</label>
            <textarea className="input-text" name="descripcion" value={formData.descripcion} onChange={handleInputChange} required />

            <label className="font-level-7">Categoría:</label>
            <Select
              options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
              value={categorias.find(c => c.id === parseInt(formData.categoria_id)) ?
                { value: formData.categoria_id, label: categorias.find(c => c.id === parseInt(formData.categoria_id)).nombre }
                : null}
              onChange={opt => handleSelectChange('categoria_id', opt)}
              placeholder="Seleccionar categoría"
            />

            {usuario?.rol === 'admin' && (
              <>
                <label className="font-level-7">Estado del Proyecto:</label>
                <Select
                  options={[
                    { value: 'pendiente', label: 'Pendiente' },
                    { value: 'aprobado', label: 'Aprobado' },
                    { value: 'rechazado', label: 'Rechazado' }
                  ]}
                  value={{
                    value: formData.estado_proyecto,
                    label: formData.estado_proyecto.charAt(0).toUpperCase() + formData.estado_proyecto.slice(1)
                  }}
                  onChange={opt => handleSelectChange('estado_proyecto', opt)}
                />
              </>
            )}

            <button type="submit" className="btn btn-primary btn-default-size mt-4">
              {modoEdicion ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
            </button>
          </form>
        )}

        {/* SECCIÓN 3: Formulario hijo */}
        {proyectoExistente && !modoEdicion && (
          <div><br></br>
            <div className="text-gray-b mb-3">
              <p><strong>Nombre:</strong> {proyectoSeleccionado?.nombre}</p>
              <p><strong>Categoría:</strong> {categorias.find(c => c.id === categoriaIdSeleccionada)?.nombre}</p>
              <p><strong>Estado:</strong> {proyectoSeleccionado?.estado_proyecto}</p>
            </div>

            {categoriaIdSeleccionada === 1 && (
              <FormularioPavimento proyectoId={proyectoSeleccionado.id} />
            )}
            {categoriaIdSeleccionada === 2 && (
              <FormularioCiclovia proyectoId={proyectoSeleccionado.id} />
            )}
            {categoriaIdSeleccionada === 3 && (
              <FormularioParque proyectoId={proyectoSeleccionado.id} />
            )}
          </div>
        )}

        {/* MENSAJE */}
        {mensaje && (
          <p
            className={`mt-4 p-3 rounded text-sm ${
              mensaje.startsWith("✅")
                ? "bg-green text-white"
                : mensaje.startsWith("❌")
                ? "bg-secondary text-white"
                : "bg-orange-light text-white"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
  );
};

export default FormularioProyecto;
