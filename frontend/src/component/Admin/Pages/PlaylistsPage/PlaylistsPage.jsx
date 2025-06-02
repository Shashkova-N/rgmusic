import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../api/apiClient';
import { PlaylistCard } from '../../../Shared/PlaylistCard/PlaylistCard';

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [order, setOrder] = useState('manual_order');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const response = await apiClient.get('/playlists/admin', {
          params: { sort_by: order },
        });
        setPlaylists(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке плейлистов:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylists();
  }, [order]);

  return (
    <div className="playlists-page">
      <h1>Все плейлисты</h1>

      <div className="playlists-page__settings">
        <h2>Порядок отображения</h2>
        <div className="playlists-page__order-options">
          <label>
            <input
              type="radio"
              name="playlist-order"
              value="manual_order"
              checked={order === 'manual_order'}
              onChange={() => setOrder('manual_order')}
            />
            Ручной порядок
          </label>
          <label>
            <input
              type="radio"
              name="playlist-order"
              value="name"
              checked={order === 'name'}
              onChange={() => setOrder('name')}
            />
            По алфавиту
          </label>
          <label>
            <input
              type="radio"
              name="playlist-order"
              value="track_count"
              checked={order === 'track_count'}
              onChange={() => setOrder('track_count')}
            />
            По количеству треков
          </label>
          <label>
            <input
              type="radio"
              name="playlist-order"
              value="updated_at"
              checked={order === 'updated_at'}
              onChange={() => setOrder('updated_at')}
            />
            По дате обновления
          </label>
          <label>
            <input
              type="radio"
              name="playlist-order"
              value="views"
              checked={order === 'views'}
              onChange={() => setOrder('views')}
            />
            По просмотрам
          </label>
        </div>
      </div>

      <div className="playlists-page__grid">
        {loading && <p>Загрузка...</p>}
        {!loading && playlists.length === 0 && <p>Нет плейлистов</p>}
        {!loading &&
          playlists.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} showEdit={true} />
          ))}
      </div>

      <div className="playlists-page__actions">
        <button onClick={() => navigate('/admin/playlists/new')}>
          Добавить новый плейлист
        </button>
      </div>
    </div>
  );
}
