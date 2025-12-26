import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function toggleFavorite(poolId) {
  const favorites = await api.get('/favorites');
  const isFavorited = favorites.data.some(p => p.id === poolId);
  
  if (isFavorited) {
    await api.delete(`/favorites/${poolId}`);
  } else {
    await api.post(`/favorites/${poolId}`);
  }
}

export async function getFavorites() {
  const response = await api.get('/favorites');
  return response.data;
}

export default api;
