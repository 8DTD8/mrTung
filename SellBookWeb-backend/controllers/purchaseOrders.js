let PurchaseOrder = require('../models/PurchaseOrder');
let Book = require('../models/Book');

module.exports = {
    getAll: async function (page, size, status, supplierId) {
        let query = {};

        if (status) query.status = status;
        if (supplierId) query.supplierId = supplierId;

        let purchaseOrders = await PurchaseOrder.find(query)
            .populate('supplierId', 'name email phone')
            .populate('items.bookId', 'title author')
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await PurchaseOrder.countDocuments(query);

        return {
            purchaseOrders,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    getById: async function (id) {
        return await PurchaseOrder.findById(id)
            .populate('supplierId', 'name email phone address')
            .populate('items.bookId', 'title author price');
    },

    create: async function (supplierId, items, expectedDate, notes) {
        let totalAmount = 0;
        let processedItems = items.map(item => {
            let totalPrice = item.quantity * item.unitPrice;
            totalAmount += totalPrice;
            return {
                bookId: item.bookId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice
            };
        });

        let purchaseOrder = new PurchaseOrder({
            supplierId,
            items: processedItems,
            totalAmount,
            expectedDate,
            notes
        });

        await purchaseOrder.save();
        await purchaseOrder.populate('supplierId', 'name email phone');
        await purchaseOrder.populate('items.bookId', 'title author');

        return purchaseOrder;
    },

    update: async function (id, updateData) {
        return await PurchaseOrder.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    },

    receiveOrder: async function (id) {
        let purchaseOrder = await PurchaseOrder.findById(id);
        if (!purchaseOrder) {
            throw new Error('Purchase order not found');
        }

        if (purchaseOrder.status === 'RECEIVED') {
            throw new Error('Order already received');
        }

        if (purchaseOrder.status === 'CANCELLED') {
            throw new Error('Cannot receive cancelled order');
        }

        purchaseOrder.status = 'RECEIVED';
        purchaseOrder.receivedDate = new Date();
        await purchaseOrder.save();

        for (let item of purchaseOrder.items) {
            await Book.findByIdAndUpdate(
                item.bookId,
                { $inc: { quantity: item.quantity } }
            );
        }

        return purchaseOrder;
    },

    cancelOrder: async function (id) {
        let purchaseOrder = await PurchaseOrder.findById(id);
        if (!purchaseOrder) {
            throw new Error('Purchase order not found');
        }

        if (purchaseOrder.status === 'RECEIVED') {
            throw new Error('Cannot cancel received order');
        }

        if (purchaseOrder.status === 'CANCELLED') {
            throw new Error('Order already cancelled');
        }

        purchaseOrder.status = 'CANCELLED';
        await purchaseOrder.save();

        return purchaseOrder;
    },

    delete: async function (id) {
        let purchaseOrder = await PurchaseOrder.findById(id);
        if (!purchaseOrder) {
            throw new Error('Purchase order not found');
        }

        if (purchaseOrder.status === 'RECEIVED') {
            throw new Error('Cannot delete received order');
        }

        await PurchaseOrder.findByIdAndDelete(id);
        return { message: 'Purchase order deleted successfully' };
    }
};
