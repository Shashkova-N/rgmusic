import React, { useState, useEffect, useContext } from 'react';
import './CartPage.scss';
import { TrackList } from '../../Shared/TrackList/TrackList';
import { cartApi, trackApi } from '../../../api/apiClient';
import { useCart } from '../../../context/CartContext';
import { AuthContext } from '../../../context/AuthProvider';

export function CartPage({ session_id }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  const { userId } = useContext(AuthContext);
  const { refreshCartCount } = useCart();

  const [selected, setSelected] = useState([]);

  // Функция загрузки корзины
  const fetchCart = async () => {
    console.log('→ fetchCart start', { userId, session_id });
    try {
      const isGuest = !userId;

      if (isGuest && !session_id) {
        console.warn('Гость: session_id не найден');
        setCartItems([]);
        setLoading(false);
        return;
      }

      const endpoint = '/cart/';
      const res = await cartApi.get(endpoint, {
        params: isGuest ? { session_id } : {},
        headers: isGuest ? {} : { 'X-User-ID': userId },
      });

      console.log('← fetchCart response', res.status, res.data);

      const items = Array.isArray(res.data.items) ? res.data.items : [];

      console.log('← items', items);

      // Получаем полные данные о треках
      const tracks = await Promise.all(
        items.map(async (item) => {
          try {
            const trackRes = await trackApi.get(`/tracks/${item.track_id}`);
            return {
              cart_item_id: item.id,
              track_id: item.track_id,
              ...trackRes.data,
            };
          } catch (err) {
            console.error(`Ошибка загрузки трека ${item.track_id}:`, err.message);
            return null;
          }
        })
      );

      const validTracks = tracks.filter(Boolean);
      console.log('← validTracks', validTracks);

      setCartItems(validTracks);
      // setSelected(validTracks.map(t => t.id));

      const allIds = validTracks.map(t => t.id);
      setSelected(allIds);

      // const total = validTracks.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
      // setTotalPrice(total);

      const initialTotal = validTracks.reduce(
        (sum, t) => sum + parseFloat(t.price || 0),
        0
      );
      setTotalPrice(initialTotal);


    } catch (e) {
      console.error('✖ Ошибка загрузки корзины:', e.message);
      alert('Не удалось загрузить корзину. Попробуйте перезагрузить страницу.');
    } finally {
      setLoading(false);
    }
  };



  // Загружаем корзину только при монтировании или изменении session_id / userId
  useEffect(() => {
    if (session_id || userId) {
      fetchCart();
    }
  }, [session_id, userId]);

  // Пересчитываем итоговую цену каждый раз, когда меняются cartItems или selected
  useEffect(() => {
    const newTotal = cartItems
      // учитываем только те треки, id которых есть в selected
      .filter(track => selected.includes(track.id))
      // складываем их цены
      .reduce((sum, track) => sum + parseFloat(track.price || 0), 0);
    setTotalPrice(newTotal);
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

  // Очистка всей корзины
  const handleClearCart = async () => {
    if (!window.confirm('Очистить всю корзину?')) return;

    try {
      const isGuest = !userId;
      const params = isGuest ? { session_id } : {};
      const headers = isGuest ? {} : { 'X-User-ID': userId };

      await cartApi.delete('/cart/clear', { params, headers });
      setCartItems([]);
      setTotalPrice(0);
      await refreshCartCount();
      alert('Корзина очищена');
    } catch (e) {
      console.error('Ошибка при очистке корзины:', e.message);
      alert('Не удалось очистить корзину');
    }
  };

  if (loading) return <p>Загрузка корзины...</p>;
  if (!session_id && !userId) return <p>Нужно перезагрузить страницу</p>;

  return (
    <div className="cart-page">
      <h1>Корзина</h1>

      {cartItems.length === 0 ? (
        <p>Ваша корзина пуста</p>
      ) : (
        <div className="cart-page__body">
          {/* Левая колонка — список треков и очистка */}
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

          {/* Правая колонка — панель «Итого» */}
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
              onClick={() => {
                /* Ваша логика оплаты */
              }}
            >
              Оплатить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}