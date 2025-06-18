import React, { useState, useEffect, useContext } from 'react';
import './CartPage.scss';
import { TrackList } from '../../Shared/TrackList/TrackList';
import { cartApi, trackApi, userApi } from '../../../api/apiClient';
import { useCart } from '../../../context/CartContext';
import { AuthContext } from '../../../context/AuthProvider';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

export function CartPage({ session_id }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  // Profile for authorized user
  const [userEmail, setUserEmail] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [userRegion, setUserRegion] = useState('');

  // Guest form state
  const [showModal, setShowModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [guestRegion, setGuestRegion] = useState('');
  const [formError, setFormError] = useState('');

  const { userId, token } = useContext(AuthContext);
  const { refreshCartCount } = useCart();

  // Load user profile if authorized
  useEffect(() => {
    if (!userId || !token) return;
    (async () => {
      try {
        const res = await userApi.get(`/auth/users/${userId}`);
        const { email, country, region } = res.data;
        setUserEmail(email);
        setUserCountry(country);
        setUserRegion(region);
      } catch (e) {
        console.error('Ошибка загрузки профиля пользователя:', e);
      }
    })();
  }, [userId, token]);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const isGuest = !userId;
        if (isGuest && !session_id) {
          setCartItems([]);
          return;
        }
        const res = await cartApi.get('/cart/', {
          params: isGuest ? { session_id } : {},
          headers: isGuest ? {} : { 'X-User-ID': userId },
        });
        const items = Array.isArray(res.data.items) ? res.data.items : [];
        const tracks = await Promise.all(
          items.map(async (item) => {
            try {
              const trackRes = await trackApi.get(`/tracks/${item.track_id}`);
              return { ...trackRes.data, cart_item_id: item.id };
            } catch (err) {
              console.error(`Ошибка загрузки трека ${item.track_id}:`, err);
              return null;
            }
          })
        );
        const valid = tracks.filter(Boolean);
        setCartItems(valid);
        setSelected(valid.map(t => t.id));
        setTotalPrice(valid.reduce((sum, t) => sum + parseFloat(t.price || 0), 0));
      } catch (e) {
        console.error('Ошибка загрузки корзины:', e);
        alert('Не удалось загрузить корзину. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [session_id, userId]);

  // Recalculate total on selection change
  useEffect(() => {
    setTotalPrice(
      cartItems
        .filter(track => selected.includes(track.id))
        .reduce((sum, track) => sum + parseFloat(track.price || 0), 0)
    );
  }, [cartItems, selected]);

  // Удаление одного элемента
  const handleRemoveFromCart = async (cartItemId) => {
    if (!window.confirm('Вы действительно хотите удалить этот трек из корзины?')) return;

    try {
      await cartApi.delete(`/cart/${cartItemId}`);

      // Обновляем локальное состояние
      const updated = cartItems.filter(item => item.cart_item_id !== cartItemId);
      setCartItems(updated);

      // Пересчитываем цену
      const newTotal = updated.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
      setTotalPrice(newTotal);

      // Обновляем счётчик в хэдере
      await refreshCartCount();

    } catch (error) {
      console.error('Ошибка при удалении из корзины:', error);
      alert('Не удалось удалить трек из корзины');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Очистить всю корзину?')) return;
    try {
      const isGuest = !userId;
      await cartApi.delete('/cart/clear', {
        params: isGuest ? { session_id } : {},
        headers: isGuest ? {} : { 'X-User-ID': userId },
      });
      await refreshCartCount();
      setCartItems([]);
      setSelected([]);
      setTotalPrice(0);
    } catch (e) {
      console.error('Ошибка при очистке корзины:', e);
      alert('Не удалось очистить корзину');
    }
  };

  const handleCheckout = async (payload) => {
    try {
      const res = await cartApi.post(
        '/payment/checkout',
        payload,
        { headers: userId ? { 'X-User-ID': userId } : {} }
      );
      window.location.href = res.data.confirmation_url;
    } catch (err) {
      console.error('Ошибка при создании платежа:', err);
      alert('Не удалось перейти к оплате. Попробуйте позже.');
    }
  };

  const handlePayClick = () => {
    if (userId) {
      // authorized: include profile fields
      handleCheckout({
        order_track_ids: selected,
        email: userEmail,
        country: userCountry,
        region: userRegion,
        session_id,
      });
    } else {
      setFormError('');
      setShowModal(true);
    }
  };

  const handleGuestSubmit = () => {
    setFormError('');
    if (!guestEmail || !guestCountry || !guestRegion) {
      setFormError('Пожалуйста, заполните все поля формы');
      return;
    }
    handleCheckout({
      order_track_ids: selected,
      email: guestEmail,
      country: guestCountry,
      region: guestRegion,
      session_id,
    });
  };

  if (loading) return <p>Загрузка корзины...</p>;
  if (!session_id && !userId) return <p>Нужно перезагрузить страницу</p>;

  return (
    <div className="cart-page">
      <h1>Корзина</h1>

      {cartItems.length === 0 ? (
        <p>Ваша корзина пуста</p>
      ) : (
        <>
          <div className="cart-page__body">
            <div className="cart-page__tracks">
              <TrackList
                tracks={cartItems}
                selectable
                selectedIds={selected}
                onSelectionChange={setSelected}
                actionTitle="Удалить из корзины"
                actionIcon="delete"
                onAction={track => handleRemoveFromCart(track.cart_item_id)}
              />
              <button
                className="cart-page__clear-btn"
                onClick={handleClearCart}
              >
                Очистить корзину
              </button>
            </div>

            <div className="cart-page__summary-box">
              <div className="cart-summary__title">Итого</div>
              <div className="cart-summary__divider" />

              <div className="cart-summary__row">
                <span>Трек</span>
                <span>{selected.length} шт.</span>
              </div>

              <div className="cart-summary__row">
                <span>К оплате</span>
                <span className="cart-summary__amount">
                  {totalPrice.toFixed(2)} ₽
                </span>
              </div>

              <button
                className="cart-summary__button"
                onClick={handlePayClick}
              >
                Оплатить
              </button>
            </div>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-window">
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                <h2>Данные для оплаты</h2>
                {formError && <p className="error">{formError}</p>}
                <label>
                  E-mail
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="Введите e-mail"
                  />
                </label>
                <label>
                  Страна
                  <CountryDropdown
                    value={guestCountry}
                    onChange={val => { setGuestCountry(val); setGuestRegion(''); }}
                    defaultOptionLabel="-- Выберите страну --"
                  />
                </label>
                <label>
                  Регион
                  <RegionDropdown
                    country={guestCountry}
                    value={guestRegion}
                    onChange={val => setGuestRegion(val)}
                    defaultOptionLabel="-- Выберите регион --"
                  />
                </label>
                <div className="modal-actions">
                  <button onClick={handleGuestSubmit}>Перейти к оплате</button>
                  <button onClick={() => setShowModal(false)}>Отмена</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
