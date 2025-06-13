import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [ready, setReady] = useState(false);

  const CART_API_URL = process.env.REACT_APP_CART_API;

  const fetchCartCount = async () => {
    const userId = localStorage.getItem('user_id');
    const sessionId = localStorage.getItem('guest_session_id');

    if (!userId && !sessionId) {
      console.warn('Нет user_id и session_id, корзина не загружается');
      return;
    }

    try {
      const response = await axios.get(`${CART_API_URL}/cart/count`, {
        params: !userId ? { session_id: sessionId } : {},
        headers: userId ? { 'X-User-ID': userId } : {},
      });
      setCartCount(response.data.count);
    } catch (err) {
      console.error('Ошибка при получении количества товаров в корзине:', err);
    }
  };

  useEffect(() => {
    const checkInit = () => {
      const sessionId = localStorage.getItem('guest_session_id');
      if (sessionId || localStorage.getItem('user_id')) {
        setReady(true);
      } else {
        setTimeout(checkInit, 100); // ждём появления guest_session_id
      }
    };
    checkInit();
  }, []);

  useEffect(() => {
    if (ready) fetchCartCount();
  }, [ready]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount: fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
