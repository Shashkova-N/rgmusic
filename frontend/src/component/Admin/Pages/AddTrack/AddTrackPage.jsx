import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import apiClient from '../../../../api/apiClient';
import { trackApi } from '../../../../api/apiClient';
import { TrackForm } from '../../Shared/TrackForm/TrackForm';

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

      await trackApi.post('/tracks/admin', data); // ❗️ НЕ указываем headers

      navigate('/admin/tracks');
    } catch (err) {
      console.error('Ошибка при добавлении трека:', err);
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TrackForm
      form={form}
      onFormChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
      title="Добавить новый трек"
    />
  );
}
