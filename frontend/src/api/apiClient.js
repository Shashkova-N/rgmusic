import axios from 'axios';

const addAuthInterceptors = (instance) => {
  instance.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (userId) {
      config.headers['X-User-ID'] = userId;
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  });

  return instance;
};

// Основные клиенты с авторизацией
export const trackApi = addAuthInterceptors(
  axios.create({ baseURL: process.env.REACT_APP_TRACK_API })
);

export const userApi = addAuthInterceptors(
  axios.create({ baseURL: process.env.REACT_APP_USER_API })
);

export const cartApi = addAuthInterceptors(
  axios.create({ baseURL: process.env.REACT_APP_CART_API })
);

// Гостевой клиент без интерсептора авторизации
export const guestCartApi = axios.create({
  baseURL: process.env.REACT_APP_CART_API
});