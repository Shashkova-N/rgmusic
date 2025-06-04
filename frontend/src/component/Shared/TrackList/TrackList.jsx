import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthProvider';
import './TrackList.scss';
import { v4 as uuidv4 } from 'uuid';
import { cartApi } from '../../../api/apiClient'; // ✅ импорт cartApi

const API_URL = process.env.REACT_APP_TRACK_API; // 🔄 используем трек-сервис явно

export function TrackList({ tracks }) {
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const { userId } = useContext(AuthContext);

  // const [sessionId, setSessionId] = useState(() => {
  //   const existing = localStorage.getItem('guest_session_id'); // ✅ заменили
  //   if (existing) return existing;
  //   const newId = uuidv4();
  //   localStorage.setItem('guest_session_id', newId); // ✅ заменили
  //   return newId;
  // });
  const sessionId = localStorage.getItem('guest_session_id');

  const handleAddToCart = async (track) => {
    try {
      const response = await cartApi.post('/cart/add', {
        track_id: track.id,
        session_id: !userId ? sessionId : null,
      }, {
        headers: userId ? { 'X-User-ID': userId } : {},
      });
      alert(response.data.message || 'Трек добавлен в корзину');
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      alert('Не удалось добавить трек в корзину');
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTrackId(null);
    };
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const getFileUrl = (track) => {
    if (track.file_watermarked) {
      return `${API_URL}/tracks/media/watermarked/${track.file_watermarked}`;
    }
    return '';
  };

  const handlePlayPause = (track) => {
    const audio = audioRef.current;
    const src = getFileUrl(track);
    if (!src) {
      console.error('No audio source for track', track);
      return;
    }

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

  if (!tracks || tracks.length === 0) {
    return <p>Нет треков для отображения</p>;
  }

  return (
    <div className="track-list">
      {tracks.map(track => (
        <div className="track-row" key={track.id}>
          <div className="track-play">
            <button onClick={() => handlePlayPause(track)}>
              {currentTrackId === track.id && isPlaying ? '⏸' : '▶'}
            </button>
          </div>
          <div className="track-vk">{track.vk_number}</div>
          <div className="track-duration">{track.duration} сек</div>
          <div className="track-price">{track.price} ₽</div>
          <div className="track-buttons">
            <button
              title="Скачать трек"
              onClick={() => handleDownload(track)}
            >
              📥
            </button>
            <button
              title="Добавить в корзину"
              onClick={() => handleAddToCart(track)}
            >
              🛒
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
