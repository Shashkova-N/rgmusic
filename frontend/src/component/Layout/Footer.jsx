import './Footer.scss';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__socials">
          <a href="https://wa.me/..." target="_blank" rel="noreferrer">
            <img src="/icons/whatsapp.svg" alt="WhatsApp" />
          </a>
          <a href="https://vk.com/..." target="_blank" rel="noreferrer">
            <img src="/icons/vk.svg" alt="VK" />
          </a>
          <a href="https://rutube.ru/..." target="_blank" rel="noreferrer">
            <img src="/icons/rutube.svg" alt="Rutube" />
          </a>
          <a href="https://youtube.com/..." target="_blank" rel="noreferrer">
            <img src="/icons/youtube.svg" alt="YouTube" />
          </a>
        </div>
      </div>

      <hr className="footer__line" />

      <div className="footer__bottom">
        <div className="footer__links">
          <a href="/contacts">Контакты</a>
          <a href="/sitemap">Карта сайта</a>
          <a href="/terms">Пользовательское соглашение</a>
          <a href="/privacy">Согласие на обработку персональных данных</a>
        </div>
        <div className="footer__copyright">
          © RGmusic 2025, All rights reserved
        </div>
      </div>
    </footer>
  );
}
