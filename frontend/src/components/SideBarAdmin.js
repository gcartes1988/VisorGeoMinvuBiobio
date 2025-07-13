import { NavLink, useNavigate } from "react-router-dom";
import { FaMap, FaFolder,  FaHistory, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useUser } from "../context/UserContext";

const SideBarAdmin = () => {
  const { perfil, loading } = useUser(); // 🔥 firebaseUser eliminado
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <aside className="sidebar-admin">
      <h2>
        VisorGeo<br />MinvuBiobío
      </h2>

      <nav>
        <NavLink to="/admin" className="link">
          <FaMap /> Panel de administración
        </NavLink>

        <NavLink to="/admin/proyectos" className="link">
          <FaFolder /> Proyectos
        </NavLink>

        {perfil?.rol === "admin" && (
          <>
            {/* 
            <NavLink to="/admin/solicitudes" className="link">
              <FaClipboardList /> Solicitudes
            </NavLink>
            */}
            <NavLink to="/admin/log-cambios" className="link">
              <FaHistory /> Historial de cambios
            </NavLink>
              {/* 
            <NavLink to="/admin/documentos" className="link">
              <FaFileAlt /> Documentos
            </NavLink> 
            */}
          </>
        )}
      </nav>

      <footer>
        {perfil && (
          <div className="usuario">
            <img src="/usuario.jpg" alt="Usuario" />
            <p>
              <strong>{perfil.nombre_usuario}</strong><br />
              <span>{perfil.rol}</span>
            </p>
          </div>
        )}

        <button className="btn-cerrar-sesion" onClick={handleLogout}>
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </footer>
    </aside>
  );
};

export default SideBarAdmin;
