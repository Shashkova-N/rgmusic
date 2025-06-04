// frontend/src/component/Admin/Pages/Tracks/TracksPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import apiClient from '../../../../api/apiClient';
import { trackApi } from '../../../../api/apiClient';
import './TracksPage.scss';

export function TracksPage() {
  const [tracks, setTracks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTracks() {
      try {
        // запросим к Flask именно тот эндпоинт, который там есть
        const { data } = await trackApi.get('/tracks/admin');
        setTracks(data);
      } catch (err) {
        console.error('Ошибка при загрузке треков:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/tracks/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот трек?')) return;
    try {
      await trackApi.delete(`/tracks/admin/${id}`);
      setTracks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Не удалось удалить трек:', err);
      alert('Не удалось удалить трек');
    }
  };

  if (loading) {
    return <p className="tracks-page__status">Загрузка…</p>;
  }
  if (error) {
    return (
      <p className="tracks-page__status">
        Ошибка: {error.message}
      </p>
    );
  }

  return (
    <div className="tracks-page">
      <div className="tracks-page__header">
        <h1>Все треки</h1>
      </div>

      <table className="tracks-page__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Исполнитель</th>
            <th>Жанр</th>
            <th>Темп</th>
            <th>Длительность</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {tracks.length > 0 ? (
            tracks.map(track => (
              <tr key={track.id}>
                <td>{track.id}</td>
                <td>{track.title}</td>
                <td>{track.artist}</td>
                <td>{track.genre}</td>
                <td>{track.tempo}</td>
                <td>{new Date(track.duration * 1000).toISOString().substr(14, 5)}</td>
                <td>{track.price} ₽</td>
                <td>
                  <button
                    className="tracks-page__btn tracks-page__btn--edit"
                    onClick={() => handleEdit(track.id)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="tracks-page__btn tracks-page__btn--delete"
                    onClick={() => handleDelete(track.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Треков не найдено</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
