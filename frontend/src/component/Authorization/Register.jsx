import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    country: '',
    region: '',
    birth_date: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        return;
      }

      // сразу логинимся
      const loginRes = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setError(loginData.error || 'Не удалось автоматически войти');
        return;
      }

      signIn({
        user: form.full_name,
        role: 'user',                // если вернулась реальная роль, используйте её
        token: loginData.access_token,
        userId: loginData.user_id,
      });

      navigate('/profile', { replace: true });
    } catch (err) {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input name="full_name" placeholder="Имя" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
        <input name="country" placeholder="Страна" required onChange={handleChange} />
        <input name="region" placeholder="Область" required onChange={handleChange} />
        <input name="birth_date" type="date" required onChange={handleChange} />
        <input name="password" type="password" placeholder="Пароль" required onChange={handleChange} />
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}
