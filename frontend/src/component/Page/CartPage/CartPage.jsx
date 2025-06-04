import React, { useState, useEffect } from 'react';
import './CartPage.scss';
import { cartApi, trackApi } from '../../../api/apiClient';


export function CartPage({ session_id }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // Функция для загрузки корзины
  const fetchCart = async () => {
    try {
      if (!session_id) {
        console.warn('Гость: session_id не найден');
        return;
      }

      const res = await cartApi.get(`/cart/?session_id=${session_id}`);
      const items = res.data.items || [];

      const tracks = await Promise.all(
        items.map(async (item) => {
          try {
            const trackRes = await trackApi.get(`/tracks/${item.track_id}`);
            return {
              cart_item_id: item.id,
              track_id: item.track_id,
              ...trackRes.data
            };
          } catch (err) {
            console.error(`Ошибка при загрузке трека ${item.track_id}:`, err.message);
            return null;
          }
        })
      );

      const validTracks = tracks.filter(Boolean); // убираем null
      setCartItems(validTracks);
      const total = validTracks.reduce((sum, item) => sum + parseFloat(item.price), 0);
      setTotalPrice(total);
    } catch (err) {
      console.error('Ошибка при загрузке корзины:', err.response?.data || err.message);
      alert('Не удалось загрузить корзину. Попробуйте перезагрузить страницу.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session_id) {
      fetchCart();
    }
  }, [session_id]);

  // Удаление одного элемента
  const handleRemoveFromCart = async (cartItemId) => {
    if (!window.confirm('Вы действительно хотите удалить этот трек из корзины?')) return;

    try {
      await cartApi.delete(`/cart/${cartItemId}`);
      const updatedCart = cartItems.filter(item => item.cart_item_id !== cartItemId);
      setCartItems(updatedCart);
      const total = updatedCart.reduce((sum, item) => sum + parseFloat(item.price), 0);
      setTotalPrice(total);
    } catch (error) {
      console.error('Ошибка при удалении трека из корзины:', error);
      alert('Не удалось удалить трек из корзины');
    }
  };

  // Очистка всей корзины
  const handleClearCart = async () => {
    if (!window.confirm('Очистить всю корзину?')) return;

    try {
      await cartApi.delete(`/cart/clear?session_id=${session_id}`);
      setCartItems([]);
      setTotalPrice(0);
    } catch (error) {
      console.error('Ошибка при очистке корзины:', error);
      alert('Не удалось очистить корзину');
    }
  };

  if (loading) return <p>Загрузка корзины...</p>;
  if (!session_id) return <p>Нужно перезагрузить страницу</p>;

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