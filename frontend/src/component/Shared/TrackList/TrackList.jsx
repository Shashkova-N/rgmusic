// src/component/Shared/TrackList/TrackList.jsx

import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthProvider';
import './TrackList.scss';
import { cartApi } from '../../../api/apiClient';
import { useCart } from '../../../context/CartContext';

const API_URL = process.env.REACT_APP_TRACK_API;

export function TrackList({ tracks }) {
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(new Audio());

  const { userId } = useContext(AuthContext);
  const { refreshCartCount } = useCart();
  const sessionId = localStorage.getItem('guest_session_id');

  const handleAddToCart = async (track) => {
    try {
      const isGuest = !userId || userId === 'null' || userId === '';
      await cartApi.post(
        '/cart/add',
        { track_id: track.id, session_id: isGuest ? sessionId : null },
        { headers: !isGuest ? { 'X-User-ID': userId } : {} }
      );
      await refreshCartCount();
      alert('Трек добавлен в корзину');
    } catch (error) {
      console.error(error);
      alert('Не удалось добавить трек в корзину');
    }
  };

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
    <div className="track-list">
      {tracks.map((track) => {
        const isCurrent = currentTrackId === track.id;

        return (
          <div className="track-row" key={track.id}>
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
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>
            )}

            {/* Duration, Price, Buttons aligned right */}
            <div className="track-duration">{formatTime(track.duration)}</div>
            <div className="track-price">{track.price} ₽</div>

            {/* Download & Add to cart */}
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
                onClick={() => handleAddToCart(track)}
                title="В корзину"
              >
                <img
                  src="/icons/addtocart.svg"
                  alt="В корзину"
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
