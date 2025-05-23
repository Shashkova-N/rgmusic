import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

export function Login() {
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
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Ответ от /auth/login:', data);

      if (!res.ok) {
        setError(data.error || 'Ошибка входа');
        return;
      }

      // извлекаем роль из ответа
      const { access_token, user_id, role } = data;

      signIn({
        user: email,
        role: role.toLowerCase(),              // теперь именно та роль, что пришла с бэка
        token: access_token,
        userId: user_id,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleLogin}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
