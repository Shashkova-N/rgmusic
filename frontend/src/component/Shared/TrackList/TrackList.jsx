import './TrackList.scss';

export function TrackList({ tracks }) {
  console.log('TrackList tracks:', tracks);
  if (!tracks || tracks.length === 0) {
    return <p>Нет треков для отображения</p>;
  }

  return (
    <div className="track-list">
      {tracks.map(track => (
        <div className="track-row" key={track.id}>
          <div className="track-play">
            <button>▶</button>
          </div>
          <div className="track-vk">{track.vk_number}</div>
          <div className="track-duration">{track.duration} сек</div>
          <div className="track-price">{track.price} ₽</div>
          <div className="track-buttons">
            <button>📥</button>
            <button>🛒</button>
          </div>
        </div>
      ))}
    </div>
  );
}
