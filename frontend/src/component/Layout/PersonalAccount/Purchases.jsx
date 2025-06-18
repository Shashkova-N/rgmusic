import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthProvider';

const USER_API = process.env.REACT_APP_USER_API;

export function Purchases() {
  const { userId, token } = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await fetch(
          `${USER_API}/users/${userId}/purchases`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Ошибка загрузки покупок');
          return;
        }
        setPurchases(data);
      } catch {
        setError('Ошибка соединения с сервером');
      }
    };

    if (userId && token) {
      fetchPurchases();
    }
  }, [userId, token]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>Покупки</h3>
      {purchases.length === 0 ? (
        <p>Пока нет покупок.</p>
      ) : (
        <ul>
          {purchases.map(p => (
            <li key={p.id}>
              Трек #{p.track_id}, цена: {p.price}₽, дата:{' '}
              {new Date(p.purchase_date).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
