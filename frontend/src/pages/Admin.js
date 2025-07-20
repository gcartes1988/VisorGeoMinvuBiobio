import ListaProyectos from "../components/admin/ListaProyectos";
import ListaPavimentos from "../components/admin/ListaPavimentos";
import ListaParques from "../components/admin/ListaParque";
import DashboardResumen from "../components/admin/DashboardResumen";
import AdminLayout from "../layout/AdminLayout";
import Icono from "../components/Icono";
import "../css/admin.css";

const Admin = () => {
  return (
    <AdminLayout>
      <div className="encabezado-admin">
        <div>
          <h2 className="font-level-2 text-primary mb-3">Panel de administración</h2>
        </div>
        <button className="icon-button" title="Notificaciones">
          <Icono nombre="notifications" />
        </button>
      </div>

      <DashboardResumen />

      <div className="seccion-admin">
        <ListaProyectos limite={5} />
      </div>

      <div className="seccion-admin">
        <ListaPavimentos limite={5} />
      </div>

      <div className="seccion-admin">
        <ListaParques limite={5} />
      </div>
    </AdminLayout>
  );
};

export default Admin;
