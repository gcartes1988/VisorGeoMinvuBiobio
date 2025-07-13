import SideBarAdmin from "../components/SideBarAdmin";

const AdminLayout = ({ children }) => {
  return (
    <>
      <SideBarAdmin />
      <main className="contenido-admin">
        {children}
      </main>
    </>
  );
};

export default AdminLayout;
