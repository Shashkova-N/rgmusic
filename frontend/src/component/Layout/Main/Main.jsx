import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthProvider';
import { PlaylistSlider } from './PlaylistSlider';
import { TrackFilters } from '../../Shared/TrackFilters/TrackFilters';
import { TrackList } from '../../Shared/TrackList/TrackList';

import '../../../scss/style.scss'

const TRACK_API = process.env.REACT_APP_TRACK_API;

export function Main() {
  const { user, role, signOut } = useContext(AuthContext);

  const [tracks, setTracks] = useState([]);
  const [filters, setFilters] = useState({
    genre: [],
    tempo: [],
    voice: [],
    language: [],
    duration: [],
    min_price: null,
    max_price: null
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 3;

  const [searchVkNumber, setSearchVkNumber] = useState('');

  const loadTracks = useCallback(async (page = 1) => {
    let offset = (page - 1) * limit;
    const params = new URLSearchParams();

    // массивные фильтры
    ['genre', 'tempo', 'voice', 'language', 'duration'].forEach((key) => {
      (filters[key] || []).forEach((val) => {
        if (val !== '') params.append(key, val);
      });
    });

    // числовые фильтры
    if (filters.min_price != null) params.append('min_price', filters.min_price);
    if (filters.max_price != null) params.append('max_price', filters.max_price);

    if (searchVkNumber) {
      params.append('vk_number', searchVkNumber);
    }

    // пагинация
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    try {
      const res = await fetch(`${TRACK_API}/tracks?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || 'Ошибка загрузки треков');
        setTracks([]);
        setTotalPages(1);
        return;
      }

      setTracks(data.tracks || []);

      if (typeof data.total_count === 'number') {
        setTotalPages(Math.ceil(data.total_count / limit));
      } else {
        setTotalPages(1);
      }

      setCurrentPage(page);
    } catch (err) {
      console.error('Ошибка соединения с сервером', err);
      setTracks([]);
      setTotalPages(1);
    }
  }, [filters, searchVkNumber]);

  useEffect(() => {
    loadTracks(1);
  }, [filters, searchVkNumber, loadTracks]);

  const renderPagination = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => loadTracks(i)}
          disabled={i === currentPage}
          className={`pagination__button ${i === currentPage ? 'pagination__button--active' : ''}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };


  return (
    <div className="main__container">
      <PlaylistSlider />

      <div className="track-search">
        <input
          type="text"
          placeholder="Поиск по номеру трека"
          value={searchVkNumber}
          onChange={(e) => {
            const val = e.target.value;
            setSearchVkNumber(val);
            if (val) {
              setFilters({
                genre: [],
                tempo: [],
                voice: [],
                language: [],
                duration: [],
                min_price: null,
                max_price: null
              });
            }
          }}
          className="track-search__input"
        />
        {searchVkNumber && (
          <button
            type="button"
            className="track-search__clear"
            onClick={() => setSearchVkNumber('')}
          >
            ✕
          </button>
        )}
      </div>

      <div className="tracks-section">

        <div className="tracks-section__list">
          <TrackList tracks={tracks} />

          {/* Пагинация теперь внутри списка */}
          <div className="pagination">
            {renderPagination()}
          </div>
        </div>

        <div className="tracks-section__filters">
          <TrackFilters filters={filters} setFilters={setFilters} />
        </div>
      </div>


    </div>
  );
}
