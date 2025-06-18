// src/component/Authorization/Login.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.scss';

export function Login({ onSuccess, onRegister }) {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(
        `${process.env.REACT_APP_USER_API}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка входа');
        return;
      }

      const { access_token, user_id, role } = data;
      signIn({
        user: email,
        role: role.toLowerCase(),
        token: access_token,
        userId: user_id,
      });

      // закрываем модалку
      onSuccess?.();

      // редирект после входа
      navigate(from, { replace: true });
    } catch (err) {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="login-form__wrapper" style={{ position: 'relative' }}>
      <button className="modal-close" onClick={() => onSuccess?.()}>×</button>
      <h2>Вход</h2>

      <form className="login-form" onSubmit={handleLogin}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <label>
          E-mail
          <input
            type="email"
            placeholder="Введите e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        <div className="login-form__actions">
          <button type="button" className="btn btn--secondary" onClick={onRegister}>
            Регистрация
          </button>
          <button type="submit" className="btn btn--primary">
            Войти
          </button>
        </div>

        <div className="login-form__footer">
          <span className="forgot-link">Забыли пароль?</span>
        </div>
      </form>
    </div>
  );
}
