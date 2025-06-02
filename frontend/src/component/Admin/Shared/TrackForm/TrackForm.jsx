import React from 'react';

import './TrackForm.scss';

export function TrackForm({
  form,
  onFormChange,
  onFileChange,
  onSubmit,
  submitting,
  error,
  title = "Форма",
  showFileInputs = true, // показывать ли поля для загрузки файлов
}) {
  return (
    <div className="track-form">
      <h1>{title}</h1>
      <form
        className="track-form__form"
        onSubmit={onSubmit}
        encType="multipart/form-data"
      >
        {/* Основные поля */}
        <div className="track-form__row">
          <label>Название
            <input
              name="title"
              value={form.title}
              onChange={onFormChange}
              required
            />
          </label>
          <label>Исполнитель
            <input
              name="artist"
              value={form.artist}
              onChange={onFormChange}
              required
            />
          </label>
        </div>

        <div className="track-form__row">
          <label>Жанр
            <input name="genre" value={form.genre} onChange={onFormChange} />
          </label>
          <label>Темп
            <select name="tempo" value={form.tempo} onChange={onFormChange}>
              <option value="">—</option>
              <option value="Быстро">Быстро</option>
              <option value="Умеренно">Умеренно</option>
              <option value="Медленно">Медленно</option>
            </select>
          </label>
          <label>Вокал
            <select name="voice" value={form.voice} onChange={onFormChange}>
              <option value="">—</option>
              <option value="Есть">Есть</option>
              <option value="Нет">Нет</option>
              <option value="Вокализ">Вокализ</option>
            </select>
          </label>
        </div>

        <div className="track-form__row">
          <label>Длительность (сек)
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={onFormChange}
            />
          </label>
          <label>Цена (₽)
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={onFormChange}
              required
            />
          </label>
        </div>

        <div className="track-form__row">
          <label>Язык
            <input name="language" value={form.language} onChange={onFormChange} />
          </label>
          <label>Композитор
            <input name="composer" value={form.composer} onChange={onFormChange} />
          </label>
          <label>Поэт
            <input name="poet" value={form.poet} onChange={onFormChange} />
          </label>
        </div>

        <div className="track-form__row">
          <label>Студия
            <input name="studio" value={form.studio} onChange={onFormChange} />
          </label>
          <label>VK Number
            <input name="vk_number" value={form.vk_number} onChange={onFormChange} />
          </label>
          <label>
            Отображать
            <input
              type="checkbox"
              name="is_visible"
              checked={form.is_visible}
              onChange={onFormChange}
            />
          </label>
        </div>

        {/* Поля для загрузки файлов — отображаются при showFileInputs={true} */}
        {showFileInputs && (
          <div className="track-form__row">
            <label>Файл (чистый)
              <input type="file" name="file_clean" onChange={onFileChange} />
            </label>
            <label>Файл (водяной знак)
              <input type="file" name="file_watermarked" onChange={onFileChange} />
            </label>
          </div>
        )}

        <button
          type="submit"
          className="track-form__btn"
          disabled={submitting}
        >
          {submitting ? 'Сохраняем…' : 'Сохранить'}
        </button>

        {error && (
          <p className="track-form__error">
            Ошибка: {error.message}
          </p>
        )}
      </form>
    </div>
  );
}