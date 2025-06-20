import React from 'react';
import './ServicePage.scss';

const ServicePage = () => {
  return (
    <div className="service-page container">
      <h1>Услуги</h1>

      <p>
        Мы предлагаем музыкальное оформление выступлений для художественной гимнастики, спортивной гимнастики, фигурного катания и других видов спорта. В нашей коллекции — более 10 000 треков, удобно распределённых по жанру, темпу и возрасту.
      </p>

      <div className="service-item">
        <h2>🎵 Компановка трека</h2>
        <p>Создание музыкальной композиции нужной длины на основе предоставленного файла.</p>
        <p><strong>Стоимость:</strong> 1000 ₽</p>
      </div>

      <div className="service-item">
        <h2>🎼 Готовая композиция</h2>
        <p>Полноценный трек без помех из уже существующего списка (<a href="https://vk.com/audios-58774072" target="_blank" rel="noopener noreferrer">смотреть список</a>).</p>
        <p><strong>Стоимость:</strong> 600 ₽</p>
      </div>

      <div className="service-item">
        <h2>✂️ Редактирование трека</h2>
        <p>Редактирование ранее скомпонованного трека из нашей коллекции.</p>
        <p><strong>Стоимость:</strong> 400 ₽</p>
      </div>

      <div className="service-item">
        <h2>🔓 Подписка</h2>
        <p>Бесплатный доступ к специальной подборке треков предоставляется по платной подписке.</p>
        <p><a href="https://vk.com/rgmusicbest?source=description&w=d.." target="_blank" rel="noopener noreferrer">Подробнее о подписке</a></p>
      </div>

      <p>📩 По всем вопросам — пишите в личные сообщения <a href="https://vk.com/rgmusicbest" target="_blank" rel="noopener noreferrer">ВКонтакте</a> или на email: <a href="mailto:reliable@mail.ru">reliable@mail.ru</a></p>
    </div>
  );
};

export { ServicePage }
