import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";
import "../css/admin.css";

const SideBarAdmin = () => {
  const { perfil, loading } = useUser();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(true);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setOpen(!mobile); // abierto por defecto en escritorio, cerrado en móvil
    };
    handleResize(); // inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <>
      {isMobile && (
        <button
          className="toggle-sidebar"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}

      <aside className={`sidebar-admin ${open ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <h2>VisorGeo<br /><span className="sub-logo">Minvu Biobío</span></h2>
        </div>

        <nav className="sidebar-nav">
  <NavLink to="/admin" className="link">
    <span className="material-symbols-outlined">dashboard</span>
    Panel
  </NavLink>

  <NavLink to="/admin/crear-proyecto" className="link">
    <span className="material-symbols-outlined">add_circle</span>
    Crear proyecto
  </NavLink>

  <NavLink to="/admin/gestion-proyectos" className="link">
    <span className="material-symbols-outlined">folder</span>
    Gestión de proyectos
  </NavLink>

  <NavLink to="/admin/gestion-pavimentos" className="link">
    <span className="material-symbols-outlined">construction</span>
    Pavimentos y vías locales
  </NavLink>

  <NavLink to="/admin/gestion-parques" className="link">
    <span className="material-symbols-outlined">park</span>
    Parques urbanos
  </NavLink>

  {perfil?.rol === "admin" && (
    <NavLink to="/admin/log-cambios" className="link">
      <span className="material-symbols-outlined">history</span>
      Cambios
    </NavLink>
  )}
</nav>


        <footer>
  <div className="usuario">
    <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#555" }}>
      account_circle
    </span>
    <div>
      <strong>{perfil?.nombre_usuario}</strong><br />
      <small>{perfil?.rol}</small>
    </div>
  </div>
  <button className="btn-cerrar-sesion" onClick={handleLogout}>
    <span className="material-symbols-outlined">logout</span>
    Cerrar sesión
  </button>
</footer>

      </aside>
    </>
  );
};

export default SideBarAdmin;
