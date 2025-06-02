import React, { useState } from 'react';

export function PlaylistForm({ playlist, onSubmit, submitting, error, title = "Форма" }) {
  const [form, setForm] = useState({
    name: playlist?.name || '',
    description: playlist?.description || '',
    cover_image: playlist?.cover_image || null,
    is_visible: playlist?.is_visible ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setForm(prev => ({
        ...prev,
        [name]: files[0], // Сохраняем сам файл
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="playlist-form">
      <h1>{title}</h1>
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        {/* Название */}
        <div className="playlist-form__row">
          <label>
            Название
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {/* Описание */}
        <div className="playlist-form__row">
          <label>
            Описание
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* Видимость */}
        <div className="playlist-form__row">
          <label>
            <input
              type="checkbox"
              name="is_visible"
              checked={form.is_visible}
              onChange={handleChange}
            />
            Отображать на сайте
          </label>
        </div>

        {/* Обложка */}
        <div className="playlist-form__row">
          <label>
            Изображение для плейлиста
            <input
              type="file"
              name="cover_image"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <button
          type="submit"
          className="playlist-form__submit"
          disabled={submitting}
        >
          {submitting ? 'Сохраняю...' : 'Сохранить'}
        </button>

        {error && (
          <p className="playlist-form__error">Ошибка: {error.message}</p>
        )}
      </form>
    </div>
  );
}