import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

// Platform-specific API URLs
const getApiUrl = () => {
    // Priority: Environment Variable -> Platform Default
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    if (Platform.OS === 'web') {
        return 'http://localhost:5000/api';
    } else if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api';
    } else {
        // iOS Simulator works with localhost, but physical devices don't.
        const url = 'http://localhost:5000/api';
        if (__DEV__) { // eslint-disable-line no-undef
            console.log(`[API] iOS detected. Using ${url}. If you are on a physical device, ensure EXPO_PUBLIC_API_URL is set to your machine's IP.`);
        }
        return url;
    }
};

const api = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.API_URL = getApiUrl();

// Helper to handle forced logout from outside React components
let onUnauthorizedCallback = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.setOnUnauthorized = (callback) => {
    onUnauthorizedCallback = callback;
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await storage.getItem('userRefreshToken');
                if (!refreshToken) {
                    // Fail silently to the screen but trigger logout
                    throw { isSilent: true, message: 'Session expired' };
                }

                // Call refresh endpoint directly using axios to avoid interceptor recursion
                const response = await axios.post(`${api.API_URL}/auth/refresh`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                await storage.setItem('userToken', accessToken);
                await storage.setItem('userRefreshToken', newRefreshToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                if (onUnauthorizedCallback) {
                    onUnauthorizedCallback();
                }

                // Reject with silent flag if it's a known session expiry
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 429) {
            console.error('Too many requests. Please slow down.');
        }

        return Promise.reject(error);
    }
);

export default api;
