import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistCard } from '../../Shared/PlaylistCard/PlaylistCard';
import { useRef } from 'react';
import './PlaylistSlider.scss';

const TRACK_API = process.env.REACT_APP_TRACK_API;

export function PlaylistSlider() {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const containerRef = useRef(null);

  const scrollLeft = () => {
    containerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };


  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`${TRACK_API}/playlists`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Ошибка загрузки плейлистов');
          return;
        }

        const data = await res.json();
        setPlaylists(data);
      } catch (err) {
        setError('Ошибка соединения с сервером');
      }
    };

    fetchPlaylists();
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const goToPlaylist = (id) => {
    navigate(`/playlist/${id}`);
  };

  return (
    <div className="playlist-slider">
      <button className="scroll-button left" onClick={scrollLeft}>◀</button>

      <div className="playlist-container" ref={containerRef}>
        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.id}
            playlist={{
              ...playlist,
              track_count: playlist.track_count || 0,
              views: playlist.views || 0
            }}
            showEdit={false}
            onClick={() => goToPlaylist(playlist.id)}
          />
        ))}
      </div>

      <button className="scroll-button right" onClick={scrollRight}>▶</button>
    </div>
  );
}