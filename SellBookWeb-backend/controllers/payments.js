let Payment = require('../models/Payment');

module.exports = {
    getAll: async function (page, size, status, orderId) {
        let query = {};

        if (status) query.paymentStatus = status;
        if (orderId) query.orderId = orderId;

        let payments = await Payment.find(query)
            .populate('orderId', 'orderNumber totalAmount')
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await Payment.countDocuments(query);

        return {
            payments,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    getById: async function (id) {
        return await Payment.findById(id)
            .populate('orderId', 'orderNumber totalAmount status');
    },

    getByOrderId: async function (orderId) {
        return await Payment.find({ orderId: orderId })
            .sort({ createdAt: -1 });
    },

    create: async function (paymentData) {
        let payment = new Payment(paymentData);
        await payment.save();
        return payment;
    },

    updateStatus: async function (id, paymentStatus, transactionId) {
        let updateData = { paymentStatus };

        if (paymentStatus === 'COMPLETED') {
            updateData.paymentDate = new Date();
        }
        if (transactionId) {
            updateData.transactionId = transactionId;
        }

        return await Payment.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    },

    processRefund: async function (id) {
        return await Payment.findByIdAndUpdate(
            id,
            { paymentStatus: 'REFUNDED' },
            { new: true }
        );
    },

    delete: async function (id) {
        return await Payment.findByIdAndDelete(id);
    }
};
