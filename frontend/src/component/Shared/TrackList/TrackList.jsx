// src/component/Shared/TrackList/TrackList.jsx

import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthProvider';
import './TrackList.scss';
import { cartApi } from '../../../api/apiClient';
import { useCart } from '../../../context/CartContext';

const API_URL = process.env.REACT_APP_TRACK_API;

export function TrackList({
 tracks,
  actionTitle         = 'В корзину',
  actionIcon          = 'addtocart',
  onAction            = null,
  // новые пропсы для чекбоксов
  selectable          = false,
  selectedIds         = [],
  onSelectionChange   = () => {},
}) {
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(new Audio());

  const { userId } = useContext(AuthContext);
  const { refreshCartCount } = useCart();
  const sessionId = localStorage.getItem('session_id');

  const handleAddToCart = async (track) => {
    try {
      const isGuest = !userId || userId === 'null' || userId === '';
      const payload = {
        track_id: track.id,
      };

      if (isGuest && sessionId) {
        payload.session_id = sessionId;
      }

      // Отправляем как JSON, а не multipart
      await cartApi.post('/cart/add', payload);

      await refreshCartCount();
      alert('Трек добавлен в корзину');
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      alert('Не удалось добавить трек в корзину');
    }
  };

  const actionHandler = onAction || handleAddToCart;

  useEffect(() => {
    const audio = audioRef.current;

    function onEnded() {
      setIsPlaying(false);
      setCurrentTrackId(null);
      setProgress(0);
    }
    function onTimeUpdate() {
      const dur = audio.duration || 1;
      const cur = audio.currentTime;
      if (!isNaN(cur) && dur > 0) {
        setProgress(cur / dur);
      }
    }

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const getFileUrl = (track) =>
    track.file_watermarked
      ? `${API_URL}/tracks/media/watermarked/${track.file_watermarked}`
      : '';

  const handlePlayPause = (track) => {
    const audio = audioRef.current;
    const src = getFileUrl(track);
    if (!src) return;

    if (currentTrackId === track.id) {
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      audio.src = src;
      audio.load();
      audio.play();
      setCurrentTrackId(track.id);
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    audioRef.current.currentTime =
      (offsetX / rect.width) * audioRef.current.duration;
  };

  const handleDownload = (track) => {
    const src = getFileUrl(track);
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `${track.title || 'track'}.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!tracks || tracks.length === 0) {
    return <p>Нет треков для отображения</p>;
  }

  return (
    <div className={`track-list${selectable ? ' track-list--selectable' : ''}`}>
      {selectable && (
        <div className="track-list__header">
          <label>
            <input
              type="checkbox"
              checked={selectedIds.length === tracks.length}
              onChange={e => {
                const all = e.target.checked ? tracks.map(t => t.id) : [];
                onSelectionChange(all);
              }}
            />
            Выбрать всё ({tracks.length})
          </label>
        </div>
      )}

      {tracks.map(track => {
        const isCurrent = currentTrackId === track.id;
        return (
          <div className="track-row" key={track.id}>
            {selectable && (
              <div className="track-select">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(track.id)}
                  onChange={e => {
                    const next = e.target.checked
                      ? [...selectedIds, track.id]
                      : selectedIds.filter(id => id !== track.id);
                    onSelectionChange(next);
                  }}
                />
              </div>
            )}

            {/* Play/Pause */}
            <div className="track-play">
              <button onClick={() => handlePlayPause(track)}>
                <img
                  src={`/icons/${isCurrent && isPlaying ? 'pause' : 'play'}.svg`}
                  alt={isCurrent && isPlaying ? 'Pause' : 'Play'}
                  width={16}
                  height={16}
                />
              </button>
            </div>

            {/* Track number */}
            <div className="track-vk">{track.vk_number}</div>

            {/* Volume controls */}
            {isCurrent && (
              <div className="track-volume-controls">
                <img
                  src="/icons/volume.svg"
                  alt="Volume"
                  width={16}
                  height={16}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                />
              </div>
            )}

            {/* Duration */}
            <div className="track-duration">{formatTime(track.duration)}</div>

            {/* Price */}
            <div className="track-price">{track.price} ₽</div>

            {/* Download & Action */}
            <div className="track-buttons">
              <button onClick={() => handleDownload(track)} title="Скачать">
                <img
                  src="/icons/download.svg"
                  alt="Скачать"
                  width={24}
                  height={24}
                />
              </button>
              <button
                onClick={() => actionHandler(track)}
                title={actionTitle}
              >
                <img
                  src={`/icons/${actionIcon}.svg`}
                  alt={actionTitle}
                  width={24}
                  height={24}
                />
              </button>
            </div>

            {/* Progress bar */}
            {isCurrent && (
              <div
                className="track-progress-controls"
                onClick={handleProgressClick}
              >
                <div
                  className="track-progress-bar"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}