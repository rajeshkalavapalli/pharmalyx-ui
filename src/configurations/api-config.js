import axios from 'axios'

import { clearSession, getToken, setMustChangePassword } from './session'

// Tabs share one session: signing in or out in another tab replaces it here too, so reload
// to show the person whose session this now is (name, menu and data all match again).
window.addEventListener('storage', (event) => {
    if (event.key === 'authToken' || event.key === null) window.location.reload();
});

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

        // The server only allows choosing a new password until that is done.
        if (error.response?.status === 403 && error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED') {
            setMustChangePassword(true);

            if (window.location.pathname !== '/change-password') {
                window.location.assign('/change-password');
            }
        }

        return Promise.reject(error);
    }
);

export default api
