import admin from 'firebase-admin';
import axios from 'axios';

class NotificationService {
    constructor() {
        // Initialize Firebase Admin if not already initialized
        /*
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        */
    }

    /**
     * Send a push notification to a specific device or devices
     * @param {string|string[]} tokens - FCM Registration Token(s) or Expo Push Token(s)
     * @param {string} title - Notification Title
     * @param {string} body - Notification Body
     * @param {object} data - Custom data payload (optional)
     */
    async sendNotification(tokens, title, body, data = {}) {
        if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
            console.log("NotificationService: No tokens provided");
            return;
        }

        const tokenList = Array.isArray(tokens) ? tokens : [tokens];

        // Separate Expo Tokens from FCM Tokens
        const expoTokens = tokenList.filter(t => t.startsWith('ExponentPushToken'));
        const fcmTokens = tokenList.filter(t => !t.startsWith('ExponentPushToken'));

        // Send to Expo Tokens
        if (expoTokens.length > 0) {
            await this.sendToExpo(expoTokens, title, body, data);
        }

        // Send to FCM Tokens
        if (fcmTokens.length > 0) {
            await this.sendToFCM(fcmTokens, title, body, data);
        }
    }

    async sendToExpo(tokens, title, body, data) {
        try {
            const messages = tokens.map(token => ({
                to: token,
                sound: 'default',
                title: title,
                body: body,
                data: data,
            }));

            // Expo allows batches of up to 100
            const chunks = [];
            for (let i = 0; i < messages.length; i += 100) {
                chunks.push(messages.slice(i, i + 100));
            }

            for (const chunk of chunks) {
                const response = await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Expo Notification Response:', response.data);
            }

        } catch (error) {
            console.error('Error sending Expo notification:', error.response ? error.response.data : error.message);
        }
    }

    async sendToFCM(tokens, title, body, data) {
        const message = {
            notification: {
                title,
                body
            },
            data: data,
        };

        try {
            // Check if admin is initialized (rudimentary check)
            if (admin.apps.length === 0) {
                console.warn("Firebase Admin not initialized, skipping FCM send.");
                return;
            }

            if (tokens.length > 1) {
                message.tokens = tokens;
                const response = await admin.messaging().sendMulticast(message);
                console.log(response.successCount + ' messages were sent successfully (FCM)');
                if (response.failureCount > 0) {
                    const failedTokens = [];
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            failedTokens.push(tokens[idx]);
                        }
                    });
                    console.log('List of tokens that caused failures (FCM): ' + failedTokens);
                }
            } else {
                message.token = tokens[0];
                const response = await admin.messaging().send(message);
                console.log('Successfully sent message (FCM):', response);
            }
        } catch (error) {
            console.error('Error sending FCM message:', error);
        }
    }
}

export default new NotificationService();
