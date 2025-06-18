import React, { useState, useEffect, useContext } from 'react';
import './CartPage.scss';
import { cartApi, trackApi } from '../../../api/apiClient';
import { useCart } from '../../../context/CartContext';
import { AuthContext } from '../../../context/AuthProvider';

export function CartPage({ session_id }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  const { userId } = useContext(AuthContext);
  const { refreshCartCount } = useCart();

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
      const total = validTracks.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
      setTotalPrice(total);
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
        <>
          <table className="cart-page__table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена</th>
                <th>Длительность</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(track => (
                <tr key={track.cart_item_id}>
                  <td>{track.vk_number}</td>
                  <td>{track.price} ₽</td>
                  <td>{track.duration || '—'} сек</td>
                  <td>
                    <button
                      className="cart-page__remove-btn"
                      onClick={() => handleRemoveFromCart(track.cart_item_id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-page__summary">
            <strong>Итого: {totalPrice.toFixed(2)} ₽</strong>
          </div>

          <button
            className="cart-page__clear-btn"
            onClick={handleClearCart}
          >
            Очистить корзину
          </button>
        </>
      )}
    </div>
  );
}