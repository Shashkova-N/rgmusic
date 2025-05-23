import { useEffect, useState } from 'react';
import './TrackFilters.scss';

export function TrackFilters({ playlistId, filters, setFilters }) {
  const [available, setAvailable] = useState({
    genres: [],
    tempos: [],
    voices: [],
    languages: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailableFilters = async () => {
      try {
        // Если playlistId есть, берём фильтры для плейлиста
        // Иначе — фильтры для всех треков
        const url = playlistId
          ? `http://localhost:5001/playlists/${playlistId}/filters`
          : `http://localhost:5001/tracks/filters`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Ошибка загрузки фильтров');
          return;
        }

        setAvailable(data);
        setError('');
      } catch (err) {
        setError('Ошибка соединения с сервером');
      }
    };

    fetchAvailableFilters();
  }, [playlistId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="track-filters">
      <label>
        Жанр:
        <select name="genre" value={filters.genre} onChange={handleChange}>
          <option value="">Все</option>
          {available.genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      <label>
        Темп:
        <select name="tempo" value={filters.tempo} onChange={handleChange}>
          <option value="">Все</option>
          {available.tempos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label>
        Голос:
        <select name="voice" value={filters.voice} onChange={handleChange}>
          <option value="">Все</option>
          {available.voices.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>

      <label>
        Язык:
        <select name="language" value={filters.language} onChange={handleChange}>
          <option value="">Все</option>
          {available.languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
