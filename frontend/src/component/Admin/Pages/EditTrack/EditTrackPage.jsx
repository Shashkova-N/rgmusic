import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../../api/apiClient';
import { TrackForm } from '../../Shared/TrackForm/TrackForm';

export function EditTrackPage() {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await apiClient.get(`/tracks/admin/${id}`);
        setForm(response.data);
      } catch (err) {
        setError(err);
        alert('Не удалось загрузить данные трека');
        navigate('/admin/tracks');
      }
    };
    fetchTrack();
  }, [id, navigate]);

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
      if (name === 'file_clean') {
        setFileClean(files[0]);
      } else if (name === 'file_watermarked') {
        setFileWatermarked(files[0]);
      }
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

      await apiClient.put(`/tracks/admin/${id}`, data); // не указываем Content-Type

      navigate('/admin/tracks');
    } catch (err) {
      console.error('Ошибка при обновлении трека:', err);
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
      title={`Редактировать трек "${form.title}"`}
    />
  );
}
