import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaylistSlider.scss';

export function PlaylistSlider() {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch('http://localhost:5001/playlists');
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Ошибка загрузки плейлистов');
          return;
        }

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
      <button className="scroll-button left">◀</button>

      <div className="playlist-container">
        {playlists.map(playlist => (
          <div
            className="playlist-tile"
            key={playlist.id}
            onClick={() => goToPlaylist(playlist.id)}
          >
            <div className="playlist-cover">
              <span>{playlist.name}</span>
            </div>
            <div className="playlist-count">{playlist.track_count} треков</div>
          </div>
        ))}
      </div>

      <button className="scroll-button right">▶</button>
    </div>
  );
}
