import { Outlet, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import './AdminPanel.scss';

export function AdminPanel() {
  const { signOut } = useContext(AuthContext);

  return (
    <div className="admin-panel">
      <aside className="admin-panel__sidebar">
        <div className="admin-panel__logo">
          {/* Здесь можно подставить свой логотип */}
          <span className="admin-panel__logo-text">rgmusic</span>
        </div>

        <nav className="admin-panel__menu">
          <NavLink to="/admin/tracks" className="admin-panel__menu-item">
            <i className="icon-tracks" />
            <span>Треки</span>
          </NavLink>
          <NavLink to="/admin/tracks/new" className="admin-panel__menu-item">
            <i className="icon-add-track" />
            <span>Добавить трек</span>
          </NavLink>
          <NavLink to="/admin/albums" className="admin-panel__menu-item">
            <i className="icon-albums" />
            <span>Альбомы</span>
          </NavLink>
          <NavLink to="/admin/users" className="admin-panel__menu-item">
            <i className="icon-users" />
            <span>Пользователи</span>
          </NavLink>
          <NavLink to="/admin/statistics" className="admin-panel__menu-item">
            <i className="icon-statistics" />
            <span>Статистика</span>
          </NavLink>
          <NavLink to="/admin/settings" className="admin-panel__menu-item">
            <i className="icon-settings" />
            <span>Настройки учётной записи</span>
          </NavLink>
        </nav>

        <button className="admin-panel__logout" onClick={signOut}>
          <i className="icon-logout" />
          <span>Выйти из учётной записи администратора</span>
        </button>
      </aside>

      <main className="admin-panel__content">
        {/* Здесь будут рендериться дочерние админские страницы */}
        <Outlet />
      </main>
    </div>
  );
}
