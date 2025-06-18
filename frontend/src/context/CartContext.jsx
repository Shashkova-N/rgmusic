// src/context/CartContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const CART_API_URL = process.env.REACT_APP_CART_API;

  const fetchCartCount = async () => {
    const userId = localStorage.getItem('userId');
    const sessionId = localStorage.getItem('session_id');

    if (!userId && !sessionId) return;

    try {
      const response = await axios.get(`${CART_API_URL}/cart/count`, {
        params: userId ? {} : { session_id: sessionId },
        headers: userId ? { 'X-User-ID': userId } : {},
      });

      setCartCount(response.data.count || 0);
    } catch (err) {
      console.error('Ошибка получения количества товаров:', err.message);
      setCartCount(0);
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    const checkInit = () => {
      const storedSession = localStorage.getItem('session_id');
      const storedUser = localStorage.getItem('userId');
      if (storedSession || storedUser) {
        fetchCartCount();
      } else {
        setTimeout(checkInit, 100);
      }
    };
    checkInit();
  }, []);

  // Обновление при изменении localStorage (логин/логаут)
  useEffect(() => {
    const handleStorageChange = e => {
      if (e.key === 'session_id' || e.key === 'userId') {
        fetchCartCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount: fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
