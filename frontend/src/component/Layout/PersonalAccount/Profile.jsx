import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthProvider';
import { Purchases } from './Purchases';
import { useNavigate } from 'react-router-dom';
import './Profile.scss';

export function Profile() {
  const { userId, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Ошибка загрузки профиля');
          return;
        }

        setProfile(data);
      } catch {
        setError('Ошибка соединения с сервером');
      }
    };

    if (userId && token) fetchProfile();
  }, [userId, token]);

  if (error) return <p className="profile-error">{error}</p>;
  if (!profile) return <p>Загрузка профиля...</p>;

  return (
    <div className="profile-container">
      <h2>Личный кабинет</h2>
      <div className="profile-info">
        <p><strong>Имя:</strong> {profile.full_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Страна:</strong> {profile.country}</p>
        <p><strong>Область:</strong> {profile.region}</p>
        <p><strong>Дата рождения:</strong> {profile.birth_date}</p>
      </div>

      <button
        className="edit-profile-btn"
        onClick={() => navigate('/profile/edit')}
      >
        Редактировать профиль
      </button>

      <Purchases />
    </div>
  );
}
