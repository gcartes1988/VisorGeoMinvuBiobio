import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen"; // al inicio

import './css/styles.css';

// Páginas y componentes
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import FormularioProyecto from "./components/FormularioProyecto";
import ListaLogCambios from "./components/admin/ListaLogCambios";
import EditarProyecto from "./components/admin/EditarProyecto";
import EditarPavimento from "./components/EditarPavimento";
import EditarParque from "./components/EditarParque";
import AdminLayout from "./layout/AdminLayout";
import FormularioParque from "./components/FormularioParque";
import GestionProyectos from "./components/admin/GestionProyectos";
import GestionPavimentos from "./components/admin/GestionPavimentos";
import GestionParques from "./components/admin/GestionParques";
import CrearProyecto from "./components/admin/CrearProyecto";




// Contexto de usuario
import { useUser } from "./context/UserContext";

function AppRoutes() {
  const { firebaseUser, perfil, loading } = useUser();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading || (firebaseUser && !perfil)) {
        window.location.reload();
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [loading, firebaseUser, perfil]);

  if (loading || (firebaseUser && !perfil)) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={firebaseUser && perfil?.rol ? <Admin /> : <Navigate to="/login" replace />} />
      <Route path="/admin/crear-proyecto" element={firebaseUser && perfil?.rol ? <CrearProyecto /> : <Navigate to="/login" replace /> }/>
      <Route path="/admin/gestion-proyectos" element={<GestionProyectos />} />


<Route
  path="/admin/gestion-pavimentos"
  element={
    firebaseUser && perfil?.rol !== "visitante"
      ? <GestionPavimentos />
      : <Navigate to="/login" replace />
  }
/>

<Route
  path="/admin/gestion-parques"
  element={
    firebaseUser && perfil?.rol !== "visitante"
      ? <GestionParques />
      : <Navigate to="/login" replace />
  }
/>

      <Route path="/admin/editar-proyecto/:id" element={ firebaseUser && perfil?.rol ? <EditarProyecto />: <Navigate to="/login" replace />}/>
      <Route path="/admin/editar-proyecto/:id" element={<FormularioProyecto modoEdicion={true} />} />
      <Route path="/admin/editar-parque/:id" element={<EditarParque />} />
      <Route path="/admin/log-cambios" element={firebaseUser && perfil?.rol ? (<AdminLayout><ListaLogCambios /></AdminLayout>) : <Navigate to="/login" replace />} />
      <Route path="/admin/editar-pavimento/:id" element={<EditarPavimento />} />
      <Route path="/login" element={firebaseUser ? <Navigate to="/admin" replace /> : <Login />} />
      <Route path="/admin/crear-parque" element={<FormularioParque />} />
<Route path="/admin/editar-parque/:id" element={<FormularioParque modoEdicion={true} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
