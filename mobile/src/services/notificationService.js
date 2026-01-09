import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

class NotificationService {
    /**
     * Register for push notifications
     * Returns the push token if successful
     */
    async registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }

            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    console.log('Project ID not found, skipping push token registration (dev mode)');
                    return null;
                }
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                console.log('Push Token:', token);
            } catch (e) {
                console.error('Error getting push token:', e);
                // Don't crash, just return null
                return null;
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    /**
     * Send token to backend
     */
    async updateBackendToken(token) {
        if (!token) return;
        try {
            await api.put('/users/push-token', { push_token: token });
        } catch (error) {
            console.error('Error updating backend token:', error);
        }
    }

    /**
     * Add notification listener
     */
    addNotificationListener(callback) {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Add response listener (when user taps notification)
     */
    addResponseListener(callback) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }
}

export default new NotificationService();
