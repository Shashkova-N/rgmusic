import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // берёт из .env
  // headers: {
  //   'Content-Type': 'application/json',
  // },
  // // здесь можно задать таймаут, interceptors и т.п.
  // // timeout: 5000,
});

export default apiClient;
