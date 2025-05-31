import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../api/apiClient';
import './AddTrackPage.scss';

export function AddTrackPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    artist: '',
    genre: '',
    tempo: '',
    voice: '',
    duration: '',
    language: '',
    composer: '',
    poet: '',
    studio: '',
    price: '',
    vk_number: '',
    is_visible: true,
  });
  const [fileClean, setFileClean] = useState(null);
  const [fileWatermarked, setFileWatermarked] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    if (files.length) {
      if (name === 'file_clean') setFileClean(files[0]);
      else if (name === 'file_watermarked') setFileWatermarked(files[0]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        data.append(key, val);
      });
      if (fileClean) data.append('file_clean', fileClean);
      if (fileWatermarked) data.append('file_watermarked', fileWatermarked);

      await apiClient.post('/tracks/admin', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/admin/tracks');
    } catch (err) {
      console.error('Ошибка при добавлении трека:', err);
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-track-page">
      <h1>Добавить новый трек</h1>
      <form
        className="add-track-page__form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="add-track-page__row">
          <label>Название
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>Исполнитель
            <input
              name="artist"
              value={form.artist}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="add-track-page__row">
          <label>Жанр
            <input name="genre" value={form.genre} onChange={handleChange} />
          </label>
          <label>Темп
            <select name="tempo" value={form.tempo} onChange={handleChange}>
              <option value="">—</option>
              <option value="Быстро">Быстро</option>
              <option value="Умеренно">Умеренно</option>
              <option value="Медленно">Медленно</option>
            </select>
          </label>
          <label>Вокал
            <select name="voice" value={form.voice} onChange={handleChange}>
              <option value="">—</option>
              <option value="Есть">Есть</option>
              <option value="Нет">Нет</option>
              <option value="Вокализ">Вокализ</option>
            </select>
          </label>
        </div>

        <div className="add-track-page__row">
          <label>Длительность (сек)
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
            />
          </label>
          <label>Цена (₽)
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="add-track-page__row">
          <label>Язык
            <input name="language" value={form.language} onChange={handleChange} />
          </label>
          <label>Композитор
            <input name="composer" value={form.composer} onChange={handleChange} />
          </label>
          <label>Поэт
            <input name="poet" value={form.poet} onChange={handleChange} />
          </label>
        </div>

        <div className="add-track-page__row">
          <label>Студия
            <input name="studio" value={form.studio} onChange={handleChange} />
          </label>
          <label>VK Number
            <input name="vk_number" value={form.vk_number} onChange={handleChange} />
          </label>
          <label>
            Отображать
            <input
              type="checkbox"
              name="is_visible"
              checked={form.is_visible}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="add-track-page__row">
          <label>Файл (чистый)
            <input type="file" name="file_clean" onChange={handleFileChange} />
          </label>
          <label>Файл (водяной знак)
            <input type="file" name="file_watermarked" onChange={handleFileChange} />
          </label>
        </div>

        <button
          type="submit"
          className="add-track-page__btn"
          disabled={submitting}
        >
          {submitting ? 'Сохраняем…' : 'Добавить трек'}
        </button>

        {error && (
          <p className="add-track-page__error">
            Ошибка: {error.message}
          </p>
        )}
      </form>
    </div>
);
}
