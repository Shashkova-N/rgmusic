import React, { useState } from 'react';
import apiClient from '../../../../api/apiClient';
import './PriceUpdate.scss';

export function PriceUpdate() {
  const [fromPrice, setFromPrice] = useState('');
  const [toPrice, setToPrice] = useState('');
  // const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка треков по цене
  const handlePreview = async () => {
    if (!fromPrice || isNaN(fromPrice)) {
      alert('Введите корректную старую цену');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/tracks/admin', {
        params: { price: fromPrice }
      });
      // setTracks(response.data);
      setFilteredTracks(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке треков:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Удаляем трек из списка
  const handleRemoveTrack = (id) => {
    setFilteredTracks((prev) => prev.filter((track) => track.id !== id));
  };

  // Обновляем цены у оставшихся треков
  const handleUpdatePrices = async () => {
    if (!toPrice || isNaN(toPrice)) {
      alert('Введите корректную новую цену');
      return;
    }

    const trackIds = filteredTracks.map(track => track.id);

    try {
      const response = await apiClient.put('/tracks/admin/update-price', {
        track_ids: trackIds,
        new_price: toPrice
      });

      alert(`Цены успешно обновлены для ${response.data.updated_count} треков`);
      setFilteredTracks([]);
      setFromPrice('');
      setToPrice('');
    } catch (err) {
      console.error('Ошибка при массовом обновлении:', err);
      setError(err);
      alert('Не удалось обновить цены');
    }
  };

  return (
    <div className="price-update">
      <h1>Массовое изменение цен</h1>

      <div className="price-update__form">
        <label>
          Треки с ценой:
          <input
            type="number"
            step="0.01"
            name="fromPrice"
            value={fromPrice}
            onChange={(e) => setFromPrice(e.target.value ? parseFloat(e.target.value) : '')}
          />
        </label>

        <label>
          Теперь будут стоить:
          <input
            type="number"
            step="0.01"
            name="toPrice"
            value={toPrice}
            onChange={(e) => setToPrice(e.target.value ? parseFloat(e.target.value) : '')}
          />
        </label>

        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Вывести список'}
        </button>
      </div>

      {error && (
        <p className="price-update__error">
          Ошибка: {error.message}
        </p>
      )}

      {/* Таблица треков */}
      {filteredTracks.length > 0 && (
        <div className="price-update__table">
          <h2>Список треков (можно удалить из обновления)</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Старая цена</th>
                <th>Новая цена</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map(track => (
                <tr key={track.id}>
                  <td>{track.id}</td>
                  <td>{track.title}</td>
                  <td>{track.price} ₽</td>
                  <td>{toPrice} ₽</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(track.id)}
                    >
                      Удалить из списка
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Кнопка обновления цен */}
      {filteredTracks.length > 0 && (
        <button
          className="price-update__apply"
          onClick={handleUpdatePrices}
        >
          Обновить список цен для {filteredTracks.length} треков
        </button>
      )}
    </div>
  );
}