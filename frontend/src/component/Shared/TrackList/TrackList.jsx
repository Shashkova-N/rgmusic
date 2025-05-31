// frontend/src/component/Shared/TrackList/TrackList.jsx
import { useState, useRef, useEffect } from 'react';
import './TrackList.scss';

const API_URL = process.env.REACT_APP_API_URL;

export function TrackList({ tracks }) {
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // Задаём обработчик окончания трека
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

  // Функция для получения корректного URL к файлу
  const getFileUrl = (track) => {
    // если backend отдаёт file_url (относительный или абсолютный) — берём его
    // if (track.file_url) {
    //   return track.file_url.startsWith('http')
    //     ? track.file_url
    //     : `${API_URL}${track.file_url}`;
    // }

    // иначе используем имя файла из file_watermarked
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

    // переключаем трек
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
    // можно использовать title или vk_number для имени файла
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
              onClick={() => {/* ваша логика */}}
            >
              🛒
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
