import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import apiClient from '../../../../api/apiClient';
import { trackApi } from '../../../../api/apiClient';
import { PlaylistForm } from '../../Shared/PlaylistForm/PlaylistForm';

export function AddPlaylist() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

const handleSubmit = async (form) => {
  try {
    setSubmitting(true);

    const formData = new FormData();
    
    // Добавляем поля из формы
    if (form.name) formData.append('name', form.name);
    if (form.description) formData.append('description', form.description || '');
    if (form.is_visible !== undefined) {
      formData.append('is_visible', form.is_visible ? 'true' : 'false');
    }

    // Добавляем изображение, если оно выбрано
    if (form.cover_image) {
      formData.append('cover_image', form.cover_image); // ← именно так ожидает бэкенд
    }

    // Отправляем через apiClient с обновлением заголовков
    const response = await trackApi.post('/playlists/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    navigate(`/admin/playlists/${response.data.playlist.id}/edit`);
  } catch (err) {
    console.error('Ошибка при добавлении плейлиста:', err);
    setError(err);
    alert('Не удалось сохранить плейлист');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="add-playlist-page">
      <PlaylistForm
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        title="Добавить новый плейлист"
      />
    </div>
  );
}