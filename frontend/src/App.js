import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './css/styles.css';

// Páginas y componentes
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import CrearProyecto from "./pages/CrearProyecto";
import Login from "./pages/Login";
import FormularioProyecto from "./components/FormularioProyecto";
import FormularioPavimento from "./components/FormularioPavimento";
import ListaLogCambios from "./components/ListaLogCambios";
import AdminLayout from "./layout/AdminLayout";

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
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.5rem"
      }}>
        ⏳ Cargando sistema...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={firebaseUser && perfil?.rol ? <Admin /> : <Navigate to="/login" replace />} />
      <Route path="/admin/proyectos/nuevo" element={firebaseUser && perfil?.rol === "admin" ? <CrearProyecto /> : <Navigate to="/login" replace />} />
      <Route path="/admin/proyectos" element={firebaseUser && perfil?.rol ? <FormularioProyecto /> : <Navigate to="/login" replace />} />
      <Route path="/admin/editar-pavimento/:id" element={firebaseUser && perfil?.rol !== "visitante" ? <FormularioPavimento modoEdicion={true} /> : <Navigate to="/login" replace />} />
      <Route path="/admin/log-cambios" element={firebaseUser && perfil?.rol ? (<AdminLayout><ListaLogCambios /></AdminLayout>) : <Navigate to="/login" replace />} />
      <Route path="/login" element={firebaseUser ? <Navigate to="/admin" replace /> : <Login />} />
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
