// src/component/Layout/Header.jsx
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { useCart } from '../../context/CartContext';
import { Login } from '../Authorization/Login';
import { Register } from '../Authorization/Register';
import { Link } from 'react-router-dom';
import './Header.scss';

export function Header() {
  const { user, role, signOut } = useContext(AuthContext);
  const { cartCount, refreshCartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const menuRef = useRef(null);

  // обновляем корзину при логине/логауте
  useEffect(() => {
    refreshCartCount();
  }, [user, refreshCartCount]);

  // закрытие дропдауна по клику вне него
  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const openRegisterFromLogin = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  return (
    <>
      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <Login onSuccess={closeModals} onRegister={openRegisterFromLogin} />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <Register onSuccess={closeModals} />
          </div>
        </div>
      )}

      <header className="header">
        <nav className="header__container">
          <Link to="/" className="header__logo">
            <img src="/rglogo.svg" alt="Логотип rgmusic" className="header__logo-icon" />
            <img src="/rglogo_text.svg" alt="Текст rgmusic" className="header__logo-text-img" />
          </Link>

          <div className="header__links">
            <Link to="/services" className="header__link">Услуги</Link>
            <Link to="/offer" className="header__link">Оферта</Link>
            <Link to="/contacts" className="header__link">Контакты</Link>
            <Link to="/performances" className="header__link">Выступления</Link>
          </div>

          <div className="header__actions">
            <Link to="/cart" className="header__icon-btn header__cart" aria-label="Корзина">
              <img src="/icons/cart.svg" alt="Корзина" className="header__icon-img" />
              {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
            </Link>
            {role === 'admin' && (
              <Link to="/admin/tracks" className="header__icon-btn" aria-label="Админ-панель">
                <img src="/icons/admin.svg" alt="Админ-панель" className="header__icon-img" />
              </Link>
            )}

            <div className="header__user" ref={menuRef}>
              <button
                className="header__icon-btn"
                onClick={() => setMenuOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label={user ? 'Меню пользователя' : 'Вход и регистрация'}
                title={user || 'Гость'}
              >
                <img src="/icons/user.svg" alt="Пользователь" className="header__icon-img" />
              </button>

              {menuOpen && (
                <ul className="header__dropdown">
                  {user ? (
                    <>
                      <li className="header__dropdown-item">
                        <Link to="/profile">Личный кабинет</Link>
                      </li>
                      <li className="header__dropdown-item">
                        <button onClick={() => { signOut(); setMenuOpen(false); }}>
                          Выйти
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="header__dropdown-item">
                        <button onClick={() => { setShowLogin(true); setMenuOpen(false); }}>
                          Войти
                        </button>
                      </li>
                      <li className="header__dropdown-item">
                        <button onClick={() => { setShowRegister(true); setMenuOpen(false); }}>
                          Регистрация
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
