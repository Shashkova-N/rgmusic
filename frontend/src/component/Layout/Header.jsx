// src/component/Layout/Header/Header.jsx
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { Link } from 'react-router-dom';
import './Header.scss';

export function Header() {
  const { user, role, signOut } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <nav className="header__container">
        {/* Логотип */}
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">🎵</span>
          <span className="header__logo-text">rgmusic</span>
        </Link>

        {/* Меню */}
        <div className="header__links">
          <Link to="/services" className="header__link">Услуги</Link>
          <Link to="/offer" className="header__link">Оферта</Link>
          <Link to="/contacts" className="header__link">Контакты</Link>
          <Link to="/performances" className="header__link">Выступления</Link>
        </div>

        {/* Действия */}
        <div className="header__actions">
          {/* Смена языка (заглушка) */}
          <button
            className="header__icon-btn"
            aria-label="Сменить язык"
            title="Сменить язык"
          >
            🌐
          </button>

          {/* Корзина */}
          <Link to="/cart" className="header__icon-btn" aria-label="Корзина" title="Корзина">
            🛒
            {/* Можно заменить на реальную логику подсчёта */}
            <span className="header__badge">2</span>
          </Link>

          {/* Панель администратора */}
          {role === 'admin' && (
            <Link to="/admin" className="header__icon-btn" aria-label="Админ-панель" title="Админ-панель">
              ⚙️
            </Link>
          )}

          {/* Пользовательское меню */}
          <div className="header__user" ref={menuRef}>
            <button
              className="header__icon-btn"
              onClick={() => setMenuOpen(open => !open)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label={user ? 'Меню пользователя' : 'Вход и регистрация'}
              title={user || 'Гость'}
            >
              👤
            </button>

            {menuOpen && (
              <ul className="header__dropdown">
                {user ? (
                  <>
                    <li className="header__dropdown-item">
                      <Link to="/profile">Личный кабинет</Link>
                    </li>
                    <li className="header__dropdown-item">
                      <button
                        onClick={() => {
                          signOut();
                          setMenuOpen(false);
                        }}
                      >
                        Выйти
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="header__dropdown-item">
                      <Link to="/login">Войти</Link>
                    </li>
                    <li className="header__dropdown-item">
                      <Link to="/register">Регистрация</Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
