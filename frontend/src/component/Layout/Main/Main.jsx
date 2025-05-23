import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthProvider';
import { PlaylistSlider } from './PlaylistSlider';
import { TrackFilters } from '../../Shared/TrackFilters/TrackFilters';
import { TrackList } from '../../Shared/TrackList/TrackList';

export function Main() {
  const { user, role, signOut } = useContext(AuthContext);

  const [tracks, setTracks] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    tempo: '',
    voice: '',
    language: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 3;

  const loadTracks = useCallback(async (page = 1) => {
    let offset = (page - 1) * limit;

    let queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([k,v]) => v))
    });

    try {
      const res = await fetch(`http://localhost:5001/tracks?${queryParams}`);
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || 'Ошибка загрузки треков');
        setTracks([]);
        setTotalPages(1);
        return;
      }

      const newTracks = data.tracks || [];

      setTracks(newTracks);

      // Рассчитаем общее количество страниц, если сервер возвращает total count
      // Например, если сервер в data.total_count:
      if (typeof data.total_count === 'number') {
        setTotalPages(Math.ceil(data.total_count / limit));
      } else {
        // Если total_count не приходит, ставим хотя бы 1 страницу
        setTotalPages(1);
      }

      setCurrentPage(page);

    } catch (err) {
      console.error('Ошибка соединения с сервером', err);
      setTracks([]);
      setTotalPages(1);
    }
  }, [filters]);

  useEffect(() => {
    loadTracks(1); // загружаем первую страницу при изменении фильтров
  }, [filters, loadTracks]);

  // Рендерим кнопки страниц
  const renderPagination = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => loadTracks(i)}
          disabled={i === currentPage}
          style={{ margin: '0 5px', fontWeight: i === currentPage ? 'bold' : 'normal' }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div>
      <h2>Main page</h2>

      {user ? (
        <div>
          <p>Привет, {user}! Роль: {role}</p>
          <button onClick={signOut}>Выйти</button>
        </div>
      ) : (
        <p>Вы не вошли</p>
      )}

      <PlaylistSlider />

      <TrackFilters filters={filters} setFilters={setFilters} />

      <TrackList tracks={tracks} />

      <div style={{ marginTop: '20px' }}>
        {renderPagination()}
      </div>
    </div>
  );
}
