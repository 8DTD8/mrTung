let Notification = require('../models/Notification');

module.exports = {
    getAll: async function (page, size, userId, read) {
        let query = {};

        if (userId) query.userId = userId;
        if (read !== undefined) query.read = read === 'true';

        let notifications = await Notification.find(query)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber status')
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await Notification.countDocuments(query);

        return {
            notifications,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    getById: async function (id) {
        return await Notification.findById(id)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber status');
    },

    getMyNotifications: async function (userId, page, size, read) {
        let query = { userId };

        if (read !== undefined) query.read = read === 'true';

        let notifications = await Notification.find(query)
            .populate('orderId', 'orderNumber status')
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await Notification.countDocuments(query);
        let unreadCount = await Notification.countDocuments({ userId, read: false });

        return {
            notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    create: async function (notificationData) {
        let notification = new Notification(notificationData);
        await notification.save();
        return notification;
    },

    markAsRead: async function (id) {
        return await Notification.findByIdAndUpdate(
            id,
            { read: true, readAt: new Date() },
            { new: true }
        );
    },

    markAllAsRead: async function (userId) {
        await Notification.updateMany(
            { userId, read: false },
            { read: true, readAt: new Date() }
        );
        return { message: 'All notifications marked as read' };
    },

    delete: async function (id) {
        return await Notification.findByIdAndDelete(id);
    },

    deleteAllRead: async function (userId) {
        await Notification.deleteMany({ userId, read: true });
        return { message: 'All read notifications deleted successfully' };
    }
};
