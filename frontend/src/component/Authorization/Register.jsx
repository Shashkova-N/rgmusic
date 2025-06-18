// src/component/Authorization/Register.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import './Login.scss';

const USER_API = process.env.REACT_APP_USER_API;

export function Register({ onSuccess }) {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    country: '',
    region: '',
    birth_date: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.country || !form.region) {
      setError('Пожалуйста, выберите страну и регион');
      return;
    }
    try {
      const res = await fetch(
        `${USER_API}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        return;
      }
      const loginRes = await fetch(
        `${USER_API}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setError(loginData.error || 'Не удалось автоматически войти');
        return;
      }
      signIn({
        user: form.full_name,
        role: (loginData.role || 'user').toLowerCase(),
        token: loginData.access_token,
        userId: loginData.user_id
      });
      onSuccess?.();
      navigate(from, { replace: true });
    } catch {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="login-form__wrapper">
      <button className="modal-close" onClick={() => onSuccess?.()}>×</button>
      <h2>Регистрация</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <p className="login-form__error">{error}</p>}

        <label>
          Имя
          <input
            name="full_name"
            placeholder="Введите имя"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          E-mail
          <input
            name="email"
            type="email"
            placeholder="Введите e-mail"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Страна
          <CountryDropdown
            classes="login-form__select"
            value={form.country}
            onChange={val => setForm(f => ({ ...f, country: val, region: '' }))}
            blankOptionLabel="-- Выберите страну --"
          />
        </label>

        <label>
          Регион
          <RegionDropdown
            classes="login-form__select"
            country={form.country}
            value={form.region}
            onChange={val => setForm(f => ({ ...f, region: val }))}
            blankOptionLabel="-- Выберите регион --"
          />
        </label>

        <label>
          Дата рождения
          <input
            name="birth_date"
            type="date"
            value={form.birth_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Пароль
          <input
            name="password"
            type="password"
            placeholder="Введите пароль"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <div className="login-form__actions">
          <button type="submit" className="btn btn--primary">
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
}
