// server/api/sendNotification.js
import { prisma } from '@/prisma/utils'
import webPush from 'web-push'


export default defineEventHandler(async (event) => {

    webPush.setVapidDetails(
        'mailto:abdelrhmanm525@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    try {
        const message = await readBody(event);
        const subscriptions = await prisma.subscription.findMany();

        let notificationsSent = 0;
        for (const subscription of subscriptions) {
            try {
                await webPush.sendNotification(subscription, JSON.stringify(message));
                notificationsSent++;
            } catch (error) {
                console.error('Error sending notification:', error);
                // Handle subscription cleanup if needed
            }
        }

        return { success: true, message: `Notifications sent: ${notificationsSent}` };
    } catch (error) {
        console.error('Failed to send notifications:', error);
        return createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
});
