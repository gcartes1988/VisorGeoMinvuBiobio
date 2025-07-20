import SideBarAdmin from "../components/SideBarAdmin";

const AdminLayout = ({ children }) => {
  return (
    <>
      <SideBarAdmin />
      <main className="admin-panel-content">
        {children}
      </main>
    </>
  );
};

export default AdminLayout;
