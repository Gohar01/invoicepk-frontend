import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7001/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Redirect to login on 401 — but NOT if the 401 came from the login/register
// request itself (that just means wrong credentials, not an expired session).
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const isAuthEndpoint =
            err.config?.url?.includes('/auth/login') ||
            err.config?.url?.includes('/auth/register');

        if (err.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;