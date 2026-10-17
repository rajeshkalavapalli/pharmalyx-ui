import axios from 'axios'

import { clearSession, getToken } from './session'

const api = axios.create({
    baseURL:import.meta.env.VITE_CONFIG_API
});

// Every request carries the session token; the server derives the user from it.
api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// An expired or invalid session sends the user back to sign in.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLogin = String(error.config?.url || '').endsWith('/login');

        if (error.response?.status === 401 && !isLogin) {
            clearSession();

            if (window.location.pathname !== '/') {
                window.location.assign('/');
            }
        }

        return Promise.reject(error);
    }
);

export default api
