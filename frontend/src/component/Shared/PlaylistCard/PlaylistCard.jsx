import React from 'react';
import './PlaylistCard.scss';
import { useNavigate } from 'react-router-dom';

export function PlaylistCard({ playlist, showEdit = false, isClickable = true }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isClickable) return;
    if (showEdit) {
      navigate(`/admin/playlists/${playlist.id}/edit`);
    } else {
      navigate(`/playlist/${playlist.id}`);
    }
  };

  return (
    <div className="playlist-card" onClick={handleClick} role="button" tabIndex={isClickable ? 0 : -1}>
      <div className="playlist-card__image-container">
        <img
          src={`${process.env.REACT_APP_TRACK_API}/playlists/media/covers/${playlist.cover_image}`}
          alt={playlist.name}
          className="playlist-card__image"
        />
        <div className="playlist-card__overlay">
          <p>Треков: {playlist.track_count || 0}</p>
          <p>Просмотров: {playlist.views || 0}</p>
          {showEdit && (
            <button
              className="playlist-card__edit-btn"
              title="Редактировать"
              onClick={(e) => {
                e.stopPropagation(); // чтобы не сработал onClick на всей карточке
                navigate(`/admin/playlists/${playlist.id}/edit`);
              }}
            >
              ✏️
            </button>
          )}
        </div>
      </div>
      <div className="playlist-card__name">{playlist.name}</div>
    </div>
  );
}