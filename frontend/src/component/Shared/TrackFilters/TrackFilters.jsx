import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import React from 'react';
import 'rc-slider/assets/index.css';
import './TrackFilters.scss';

function TrackFiltersComponent({ playlistId, filters, setFilters }) {
  const [available, setAvailable] = useState({
    genres: [],
    tempos: [],
    voices: [],
    languages: []
  });
  const [error, setError] = useState('');

  const resetFilters = () => {
    setFilters({
      genre: [],
      tempo: [],
      voice: [],
      language: [],
      duration: [],
      min_price: null,
      max_price: null
    });
  };

  // const priceRange = [
  //   available.min_price ?? 0,
  //   available.max_price ?? 3000
  // ];

  const availableDurations = available.durations || [];

  const shouldHideLanguage =
    Array.isArray(filters.voice) &&
    filters.voice.some((v) => ['нет', 'вокализ'].includes(v.toLowerCase())) &&
    !filters.voice.some((v) => v.toLowerCase() === 'есть');

  useEffect(() => {
    const fetchAvailableFilters = async () => {
      try {
        const TRACK_API = process.env.REACT_APP_TRACK_API;
        const url = playlistId
          ? `${TRACK_API}/playlists/${playlistId}/filters`
          : `${TRACK_API}/tracks/filters`;

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

  useEffect(() => {
    if (shouldHideLanguage && filters.language.length > 0) {
      setFilters((prev) => {
        if (prev.language.length === 0) return prev;
        return { ...prev, language: [] };
      });
    }
  }, [filters.voice, filters.language.length, setFilters, shouldHideLanguage]);

  const handleCheckbox = (e) => {
    const { name, value, checked } = e.target;
    setFilters((prev) => {
      const current = new Set(prev[name] || []);
      checked ? current.add(value) : current.delete(value);
      return { ...prev, [name]: Array.from(current) };
    });
  };

  const handlePriceInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value ? parseFloat(value) : null
    }));
  };

  // const handleSliderChange = (name, [min, max]) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     [`min_${name}`]: min,
  //     [`max_${name}`]: max
  //   }));
  // };

  function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // console.log('filters.voice:', filters.voice);
  // console.log('shouldHideLanguage:', shouldHideLanguage);

  return (
    <div className="track-filters">
      <h3>Фильтры</h3>

      <div className="filter-group two-column">
        <span>Жанр:</span>
        <div className="column-wrap">
          {available.genres
            .filter((g) => g?.trim())
            .map((g) => (
              <label key={g}>
                <input
                  type="checkbox"
                  name="genre"
                  value={g}
                  checked={filters.genre?.includes(g)}
                  onChange={handleCheckbox}
                />
                {g}
              </label>
            ))}
        </div>
      </div>

      <div className="filter-columns">
        <div className="filter-group half">
          <span>Темп:</span>
          {available.tempos.map((t) => (
            <label key={t}>
              <input
                type="checkbox"
                name="tempo"
                value={t}
                checked={filters.tempo?.includes(t)}
                onChange={handleCheckbox}
              />
              {t}
            </label>
          ))}
        </div>

        <div className="filter-group half">
          <span>Голос:</span>
          {available.voices.map((v) => (
            <label key={v}>
              <input
                type="checkbox"
                name="voice"
                value={v}
                checked={filters.voice?.includes(v)}
                onChange={handleCheckbox}
              />
              {v}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span>Цена:</span>

        <div className="price-inputs">
          <label>
            от&nbsp;
            <input
              type="number"
              name="min_price"
              value={filters.min_price ?? available.min_price ?? ''}
              min={available.min_price ?? 0}
              max={filters.max_price ?? available.max_price ?? 9999}
              onChange={handlePriceInputChange}
            />
          </label>

          <label>
            до&nbsp;
            <input
              type="number"
              name="max_price"
              value={filters.max_price ?? available.max_price ?? ''}
              min={filters.min_price ?? available.min_price ?? 0}
              max={available.max_price ?? 9999}
              onChange={handlePriceInputChange}
            />
          </label>
        </div>

        <Slider
          range
          min={available.min_price ?? 0}
          max={available.max_price ?? 3000}
          value={[
            filters.min_price ?? available.min_price ?? 0,
            filters.max_price ?? available.max_price ?? 3000
          ]}
          onChange={(val) => {
            setFilters((prev) => {
              if (prev.min_price === val[0] && prev.max_price === val[1]) return prev;
              return {
                ...prev,
                min_price: val[0],
                max_price: val[1]
              };
            });
          }}

        />
      </div>

      <div className="filter-group two-column">
        <span>Длительность:</span>
        <div className="column-wrap">
          {availableDurations.map((d) => (
            <label key={d}>
              <input
                type="checkbox"
                name="duration"
                value={d}
                checked={filters.duration?.includes(String(d))}
                onChange={handleCheckbox}
              />
              {formatDuration(d)}
            </label>
          ))}
        </div>
      </div>

      {!shouldHideLanguage && (
        <div className="filter-group two-column">
          <span>Язык:</span>
          <div className="column-wrap">
            {available.languages
              .filter((l) => l?.trim())
              .map((l) => (
                <label key={l}>
                  <input
                    type="checkbox"
                    name="language"
                    value={l}
                    checked={filters.language?.includes(l)}
                    onChange={handleCheckbox}
                  />
                  {l}
                </label>
              ))}
          </div>
        </div>
      )}

      <div className="filter-actions">
        <button onClick={resetFilters} className="reset-button">
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
}

export const TrackFilters = React.memo(TrackFiltersComponent);
