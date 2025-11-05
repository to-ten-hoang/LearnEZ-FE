import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor để xử lý lỗi (ví dụ: token hết hạn)
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const { data } = await api.get('/api/v1/auth/refresh');
//         const newToken = data.data.token;
//         useAuthStore.getState().setToken(newToken);
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         useAuthStore.getState().logout();
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   },
// );

export default api;
