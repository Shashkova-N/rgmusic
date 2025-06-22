import React from 'react';
import './ContactsPage.scss';

const ContactsPage = () => {
  return (
    <div className="contacts-page">
      <h1>Контакты</h1>

      <p>
        📩 По любым вопросам, предложениям или заказам вы можете связаться с нами:
      </p>

      <ul>
        <li>
          💬 Группа ВКонтакте:{" "}
          <a href="https://vk.com/rgmusicbest" target="_blank" rel="noopener noreferrer">
            https://vk.com/rgmusicbest
          </a>
        </li>
        <li>
          ✉️ Email:{" "}
          <a href="mailto:reliable@mail.ru">reliable@mail.ru</a> &nbsp;/&nbsp;
          <a href="mailto:rgmusic-shop@yandex.com">rgmusic-shop@yandex.com</a>
        </li>
      </ul>
    </div>
  );
};

export { ContactsPage };
