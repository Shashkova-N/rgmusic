import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthProvider';
import './EditProfile.scss';

const USER_API = process.env.REACT_APP_USER_API;

export function EditProfile() {
  const { userId, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    country: '',
    region: '',
    birth_date: '',
    password: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Загружаем текущие данные профиля
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${USER_API}/auth/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Ошибка загрузки профиля');
          return;
        }

        setForm({
          full_name: data.full_name || '',
          email: data.email || '',
          country: data.country || '',
          region: data.region || '',
          birth_date: data.birth_date || '',
          password: ''
        });
      } catch {
        setError('Ошибка соединения с сервером');
      }
    };

    if (userId && token) {
      fetchProfile();
    }
  }, [userId, token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `${USER_API}/auth/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка при обновлении');
      } else {
        setSuccess('Данные успешно обновлены');
        // Через секунду возвращаем пользователя на страницу профиля
        setTimeout(() => navigate('/profile'), 1000);
      }
    } catch {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Редактировать профиль</h2>

      {success && <p className="edit-success">{success}</p>}
      {error && <p className="edit-error">{error}</p>}

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <label>
          Имя:
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />
        </label>

        <label>
          Email:
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Страна:
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
          />
        </label>

        <label>
          Область:
          <input
            name="region"
            value={form.region}
            onChange={handleChange}
          />
        </label>

        <label>
          Дата рождения:
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
          />
        </label>

        <label>
          Новый пароль:
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
}
