import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__social">
        <a
          href="https://wa.me/your-number"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="footer__icon"
        >
          <i className="icon-whatsapp" />
        </a>
        <a
          href="https://vk.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="VK"
          className="footer__icon"
        >
          <i className="icon-vk" />
        </a>
        <a
          href="https://ok.ru/yourpage"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Odnoklassniki"
          className="footer__icon"
        >
          <i className="icon-odnoklassniki" />
        </a>
        <a
          href="https://www.youtube.com/channel/yourchannel"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          className="footer__icon"
        >
          <i className="icon-youtube" />
        </a>
      </div>

      <div className="footer__nav">
        <Link to="/contacts" className="footer__link">Контакты</Link>
        <Link to="/sitemap" className="footer__link">Карта сайта</Link>
        <Link to="/terms" className="footer__link">Пользовательское соглашение</Link>
        <Link to="/privacy" className="footer__link">Согласие на обработку персональных данных</Link>
      </div>

      <div className="footer__copy">
        © RGmusic {new Date().getFullYear()}, All rights reserved
      </div>
    </footer>
  );
}
