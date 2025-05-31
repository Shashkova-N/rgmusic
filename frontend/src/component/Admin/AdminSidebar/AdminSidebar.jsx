import { NavLink } from 'react-router-dom';
import './AdminSidebar.scss';

export function AdminSidebar({ onLogout }) {
  return (
    <aside className="admin-panel__sidebar">
      <NavLink to="/" className="admin-panel__logo">
        <span className="admin-panel__logo-text">rgmusic</span>
      </NavLink>

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

      <button className="admin-panel__logout" onClick={onLogout}>
        <i className="icon-logout" />
        <span>Выйти из учётной записи администратора</span>
      </button>
    </aside>
);
}
