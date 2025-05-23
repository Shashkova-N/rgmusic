import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';

export function RequireAuth({ allowedRoles }) {
  const { role } = useContext(AuthContext);
  const location = useLocation();

  if (!role) {
    // если не авторизован, перенаправляем на /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return allowedRoles.includes(role)
    ? <Outlet /> // доступ разрешён
    : <Navigate to="/" replace />; // доступ запрещён
}
