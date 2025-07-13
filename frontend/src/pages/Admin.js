import useProyectos from "../hooks/useProyectos"; // ✅ Hook personalizado
import ListaProyectos from "../components/ListaProyectos";
import ListaPavimentos from "../components/ListaPavimentos";
import AdminLayout from "../layout/AdminLayout"; // ✅ Layout compartido
import "../css/admin.css";

const Admin = () => {
  const { proyectos, loading, error } = useProyectos(); // ⬅️ obtenemos los proyectos desde el hook

  if (loading) return <p>Cargando proyectos...</p>;
  if (error) return <p>Error al cargar proyectos.</p>;

  const proyectosActivos = proyectos.filter((p) =>
    p.estado?.toLowerCase() === "aprobado"
  ).length;
  


  return (
    <AdminLayout>
      <div className="admin-panel-content">
        <header className="encabezado-admin">
          <div className="card resumen">
            <p>Proyectos activos</p>
            <h2>{proyectosActivos}</h2>
          </div>

          <div className="card resumen">
            <p>Últimas modificaciones</p>
            <h2>-</h2>
          </div>

          
        </header>

        {/* Listado de proyectos y pavimentos */}
        <ListaProyectos />
        <ListaPavimentos />

      </div>
    </AdminLayout>
  );
};

export default Admin;
