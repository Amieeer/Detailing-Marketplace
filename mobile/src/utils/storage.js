import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const storage = {
    async getItem(key) {
        if (Platform.OS === 'web') {
            try {
                if (typeof localStorage !== 'undefined') {
                    return localStorage.getItem(key);
                }
            } catch (e) {
                console.error('Local storage is not available:', e);
            }
            return null;
        }
        return await SecureStore.getItemAsync(key);
    },

    async setItem(key, value) {
        if (Platform.OS === 'web') {
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(key, value);
                }
            } catch (e) {
                console.error('Local storage is not available:', e);
            }
            return;
        }
        return await SecureStore.setItemAsync(key, value);
    },

    async removeItem(key) {
        if (Platform.OS === 'web') {
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                console.error('Local storage is not available:', e);
            }
            return;
        }
        return await SecureStore.deleteItemAsync(key);
    }
};
