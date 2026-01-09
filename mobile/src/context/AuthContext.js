import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import api from '../services/api';

import notificationService from '../services/notificationService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const registerNotifications = async () => {
        const pushToken = await notificationService.registerForPushNotificationsAsync();
        if (pushToken) {
            await notificationService.updateBackendToken(pushToken);
        }
    };

    useEffect(() => {
        // Check for stored token on app launch
        const loadUser = async () => {
            try {
                const storedToken = await storage.getItem('userToken');
                const storedUser = await storage.getItem('userData');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    // Set default header for future requests
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                    // Register for notifications in background
                    registerNotifications();
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();

        // Register for global logout on 401 failure
        api.setOnUnauthorized(() => {
            clearSession();
        });
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, ...userData } = response.data;

            // Set header IMMEDIATELY before anything else
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            setToken(accessToken);
            setUser(userData);

            // Store securely
            await storage.setItem('userToken', accessToken);
            await storage.setItem('userRefreshToken', refreshToken);
            await storage.setItem('userData', JSON.stringify(userData));

            // Register for notifications
            registerNotifications();

            return userData;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const clearSession = async () => {
        setToken(null);
        setUser(null);
        await storage.removeItem('userToken');
        await storage.removeItem('userRefreshToken');
        await storage.removeItem('userData');
        delete api.defaults.headers.common['Authorization'];
    };

    const logout = async () => {
        try {
            const refreshToken = await storage.getItem('userRefreshToken');
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Logout failed on backend:', error);
        } finally {
            await clearSession();
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
