import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Header.scss';

export function Header() {
  const { user, role, signOut } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const menuRef = useRef(null);
  const CART_API_URL = process.env.REACT_APP_CART_API;

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const sessionId = localStorage.getItem('guest_session_id');

    const fetchCartCount = async () => {
      try {
        const response = await axios.get(`${CART_API_URL}/cart/count`, {
          params: !userId ? { session_id: sessionId } : {},
          headers: userId ? { 'X-User-ID': userId } : {}
        });
        setCartCount(response.data.count);
      } catch (err) {
        console.error('Ошибка при получении количества товаров в корзине:', err);
      }
    };

    fetchCartCount();
  }, []);

  return (
    <header className="header">
      <nav className="header__container">
        {/* Логотип */}
        <Link to="/" className="header__logo">
          <img src="/rglogo.svg" alt="Логотип rgmusic" className="header__logo-icon" />
          <img src="/rglogo_text.svg" alt="Текст rgmusic" className="header__logo-text-img" />
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
          {/* Смена языка (заглушка)
          <button
            className="header__icon-btn"
            aria-label="Сменить язык"
            title="Сменить язык"
          >
            🌐
          </button> */}

          {/* Корзина */}
          <Link to="/cart" className="header__icon-btn header__cart" aria-label="Корзина" title="Корзина">
            <img
              src={cartCount > 0 ? '/icons/cart_with_badge.svg' : '/icons/cart.svg'}
              alt="Корзина"
              className="header__icon-img"
            />
          </Link>

          {/* Панель администратора */}
          {role === 'admin' && (
            <Link to="/admin/tracks" className="header__icon-btn" aria-label="Админ-панель" title="Админ-панель">
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