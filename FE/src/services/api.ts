import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let authToken: string | null = localStorage.getItem('accessToken');

if (authToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

apiClient.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            if (!navigator.onLine) {
                return Promise.reject(new Error('No internet connection. Please check your network.'));
            }
            return Promise.reject(new Error('Network error. Please try again.'));
        }

        const status = error.response.status;
        const message = error.response.data?.error || 'An error occurred';

        if (status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('persist:root');
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        if (status === 403) {
            return Promise.reject(new Error(message || 'Access denied. You do not have permission.'));
        }

        if (status === 404) {
            return Promise.reject(new Error(message || 'Resource not found.'));
        }

        if (status >= 500) {
            return Promise.reject(new Error('Server error. Please try again later.'));
        }

        return Promise.reject(new Error(message));
    }
);

export default apiClient;
