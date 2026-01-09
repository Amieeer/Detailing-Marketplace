const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

class NotificationService {
    /**
     * Send push notifications to multiple tokens
     * @param {string[]} tokens - Array of Expo push tokens
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {object} data - Optional data payload
     */
    async sendPushNotifications(tokens, title, body, data = {}) {
        const messages = [];

        for (let pushToken of tokens) {
            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                continue;
            }

            messages.push({
                to: pushToken,
                sound: 'default',
                title: title,
                body: body,
                data: data
            });
        }

        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (let chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending notification chunk:', error);
            }
        }

        // Handle receipts logic could go here if needed
        return tickets;
    }

    /**
     * Send a single notification
     */
    async sendNotification(token, title, body, data = {}) {
        return this.sendPushNotifications([token], title, body, data);
    }
}

module.exports = new NotificationService();
