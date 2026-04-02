let Cart = require('../models/Cart');
let Book = require('../models/Book');

module.exports = {
    getMyCart: async function (userId) {
        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            cart = new Cart({ userId: userId, items: [], totalPrice: 0 });
            await cart.save();
        }
        return cart;
    },

    addItem: async function (userId, bookId, quantity) {
        quantity = quantity || 1;

        let book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        if (book.quantity < quantity) {
            throw new Error('Not enough stock');
        }

        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            cart = new Cart({ userId: userId, items: [], totalPrice: 0 });
        }

        let price = book.discount > 0
            ? book.price * (1 - book.discount / 100)
            : book.price;

        let existingItem = cart.items.find(item =>
            item.bookId.toString() === bookId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                bookId: book._id,
                title: book.title,
                price: price,
                quantity: quantity
            });
        }

        cart.totalPrice = cart.items.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
        );

        await cart.save();
        return { message: 'Item added to cart', cart };
    },

    updateItem: async function (userId, bookId, quantity) {
        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        let item = cart.items.find(item =>
            item.bookId.toString() === bookId
        );

        if (!item) {
            throw new Error('Item not found in cart');
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(item =>
                item.bookId.toString() !== bookId
            );
        } else {
            item.quantity = quantity;
        }

        cart.totalPrice = cart.items.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
        );

        await cart.save();
        return { message: 'Cart updated', cart };
    },

    removeItem: async function (userId, bookId) {
        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.items = cart.items.filter(item =>
            item.bookId.toString() !== bookId
        );

        cart.totalPrice = cart.items.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
        );

        await cart.save();
        return { message: 'Item removed from cart', cart };
    },

    clearCart: async function (userId) {
        let cart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $set: { items: [], totalPrice: 0 } },
            { new: true }
        );
        return { message: 'Cart cleared', cart };
    }
};
