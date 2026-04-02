let Order = require('../models/Order');
let Cart = require('../models/Cart');
let Book = require('../models/Book');

module.exports = {
    getAll: async function (page, size, status) {
        let query = {};
        if (status) query.status = status;

        let orders = await Order.find(query)
            .populate('userId', 'name email')
            .populate('items.bookId', 'title image')
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await Order.countDocuments(query);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    getById: async function (id) {
        return await Order.findById(id)
            .populate('userId', 'name email phone')
            .populate('items.bookId', 'title image author');
    },

    getMyOrders: async function (userId, page, size) {
        let orders = await Order.find({ userId: userId })
            .populate('items.bookId', 'title image')
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await Order.countDocuments({ userId: userId });

        return {
            orders,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    create: async function (userId, items, shippingAddress, phone, paymentMethod) {
        let totalPrice = 0;
        let orderItems = [];

        for (let item of items) {
            let book = await Book.findById(item.bookId);
            if (!book) {
                throw new Error(`Book ${item.bookId} not found`);
            }
            if (book.quantity < item.quantity) {
                throw new Error(`Not enough stock for ${book.title}`);
            }

            let price = book.discount > 0
                ? book.price * (1 - book.discount / 100)
                : book.price;

            orderItems.push({
                bookId: book._id,
                title: book.title,
                price: price,
                quantity: item.quantity
            });

            totalPrice += price * item.quantity;

            book.quantity -= item.quantity;
            book.salesCount += item.quantity;
            await book.save();
        }

        let order = new Order({
            userId: userId,
            items: orderItems,
            totalPrice,
            shippingAddress,
            phone,
            paymentMethod: paymentMethod || 'COD',
            status: 'PENDING'
        });

        await order.save();

        await Cart.findOneAndUpdate(
            { userId: userId },
            { $set: { items: [], totalPrice: 0 } }
        );

        return {
            message: 'Order placed successfully',
            order
        };
    },

    updateStatus: async function (id, status) {
        let order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        return { message: 'Order status updated', order };
    },

    cancel: async function (id, userId) {
        let order = await Order.findOne({ _id: id, userId: userId });
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'PENDING') {
            throw new Error('Cannot cancel order that is not pending');
        }

        for (let item of order.items) {
            let book = await Book.findById(item.bookId);
            if (book) {
                book.quantity += item.quantity;
                book.salesCount -= item.quantity;
                await book.save();
            }
        }

        order.status = 'CANCELLED';
        await order.save();

        return { message: 'Order cancelled successfully', order };
    }
};
