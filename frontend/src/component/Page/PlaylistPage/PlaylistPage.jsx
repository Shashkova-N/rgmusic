import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { TrackList } from '../../Shared/TrackList/TrackList';
import { TrackFilters } from '../../Shared/TrackFilters/TrackFilters';

import '../../../scss/style.scss'

const TRACK_API = process.env.REACT_APP_TRACK_API;

export function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState('');

  const [showFilters, setShowFilters] = useState(false);

  // filters и setFilters изначально пусты — потом загрузим их с сервера
  const [filters, setFilters] = useState({});

  const [tracks, setTracks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 3;

  // Состояние для доступных опций фильтров (жанры, темпы и т.д.)
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    tempos: [],
    voices: [],
    languages: [],
    min_price: null,
    max_price: null,
  });

  // Загрузка фильтров с сервера
  const loadFilterOptions = useCallback(async () => {
    try {
      const res = await fetch(`${TRACK_API}/playlists/${id}/filters`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка загрузки фильтров');
        return;
      }

      setFilterOptions({
        genres: data.genres || [],
        tempos: data.tempos || [],
        voices: data.voices || [],
        languages: data.languages || [],
        min_price: data.min_price,
        max_price: data.max_price,
      });

      // Инициализируем фильтры пустыми значениями (или по желанию, можно с дефолтами)
      const initialFilters = {
        genre: '',
        tempo: '',
        voice: '',
        language: '',
      };

      setFilters((prev) => {
        const isSame = Object.entries(initialFilters).every(
          ([key, val]) => prev[key] === val
        );
        return isSame ? prev : initialFilters;
      });

      setError('');
    } catch (err) {
      setError('Ошибка соединения с сервером при загрузке фильтров');
      console.error(err);
    }
  }, [id]);

  // Загрузка плейлиста и треков
  const loadTracks = useCallback(async (pageToLoad = 1) => {
    const offset = (pageToLoad - 1) * limit;

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([k, v]) => v))
    });

    try {
      if (pageToLoad === 1) {
        const resPlaylist = await fetch(`${TRACK_API}/playlists/${id}`);
        const dataPlaylist = await resPlaylist.json();
        if (!resPlaylist.ok) {
          setError(dataPlaylist.error || 'Ошибка загрузки плейлиста');
          return;
        }
        setPlaylist(dataPlaylist);
      }

      const resTracks = await fetch(`${TRACK_API}/playlists/${id}/tracks?${queryParams}`);
      const dataTracks = await resTracks.json();

      if (!resTracks.ok) {
        setError('Ошибка загрузки треков');
        return;
      }

      setTracks(dataTracks.tracks || []);
      setTotalPages(Math.ceil(dataTracks.total / limit));
      setError('');
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error(err);
    }
  }, [filters, id]);

  // При загрузке страницы (id) — грузим фильтры
  useEffect(() => {
    loadFilterOptions();
  }, [id, loadFilterOptions]);

  // При изменении id, filters или page грузим треки
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadTracks(page);
    }
  }, [id, filters, page, loadTracks]);

  // При смене фильтров сбрасываем страницу на 1
  useEffect(() => {
    setPage(1);
  }, [filters]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!playlist) return <p>Загрузка плейлиста...</p>;

  // Рендер кнопок страниц
  const renderPagination = () => {
    let buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          disabled={i === page}
          style={{ marginRight: '4px', fontWeight: i === page ? 'bold' : 'normal' }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <>
      <div className="playlist-header">
        <img
          src={`${TRACK_API}/playlists/media/covers/${playlist.cover_image}`}
          alt="Обложка плейлиста"
          className="playlist-header__cover"
        />

        <div className="playlist-header__info">
          <div className="playlist-header__top">
            <h2 className="playlist-header__title">{playlist.name}</h2>

            <div className="playlist-header__meta">
              <div>треков в альбоме: <span>{playlist.track_count}</span></div>
              <div>просмотров: <span>{playlist.views}</span></div>
            </div>
          </div>

          <p className="playlist-header__description">{playlist.description}</p>
        </div>
      </div>

      <div className="tracks-section">

        <div className="tracks-section__list">
          <TrackList tracks={tracks} />

          {/* Пагинация теперь внутри списка */}
          {totalPages > 1 && (
            <div className="pagination">
              {renderPagination()}
            </div>
          )}
        </div>

        <div className="tracks-section__filters">
          <TrackFilters
            playlistId={id}
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions} // передаём доступные опции
          />
        </div>
      </div>
    </>
  );
}
