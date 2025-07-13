import React, { useEffect, useState } from 'react';
import api from '../services/auth';

const UsuarioActual = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await api.get('/me');
        setUsuario(res.data);
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      }
    };

    fetchUsuario();
  }, []);

  if (!usuario) return null;

  return (
    <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
      <strong>👤</strong> {usuario.nombre_usuario} | {usuario.rol}
    </div>
  );
};

export default UsuarioActual;
