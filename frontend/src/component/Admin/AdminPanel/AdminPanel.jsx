import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthProvider';
import { AdminSidebar } from '../AdminSidebar/AdminSidebar';
import './AdminPanel.scss';

export function AdminPanel() {
  const { signOut } = useContext(AuthContext);

  return (
    <div className="admin-panel">
      <AdminSidebar onLogout={signOut} />
      <main className="admin-panel__content">
        <Outlet />
      </main>
    </div>
  );
}
