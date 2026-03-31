const Cart = require('../models/Cart');
const Book = require('../models/Book');

const cartController = {
    getMyCart: async (req, res) => {
        try {
            let cart = await Cart.findOne({ userId: req.userId });
            if (!cart) {
                cart = new Cart({ userId: req.userId, items: [], totalPrice: 0 });
                await cart.save();
            }
            res.json(cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addItem: async (req, res) => {
        try {
            const { bookId, quantity = 1 } = req.body;

            const book = await Book.findById(bookId);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }

            if (book.quantity < quantity) {
                return res.status(400).json({ message: 'Not enough stock' });
            }

            let cart = await Cart.findOne({ userId: req.userId });
            if (!cart) {
                cart = new Cart({ userId: req.userId, items: [], totalPrice: 0 });
            }

            const price = book.discount > 0
                ? book.price * (1 - book.discount / 100)
                : book.price;

            const existingItem = cart.items.find(item =>
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
            res.json({ message: 'Item added to cart', cart });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateItem: async (req, res) => {
        try {
            const { quantity } = req.body;
            const { bookId } = req.params;

            const cart = await Cart.findOne({ userId: req.userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const item = cart.items.find(item =>
                item.bookId.toString() === bookId
            );

            if (!item) {
                return res.status(404).json({ message: 'Item not found in cart' });
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
            res.json({ message: 'Cart updated', cart });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    removeItem: async (req, res) => {
        try {
            const { bookId } = req.params;

            const cart = await Cart.findOne({ userId: req.userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            cart.items = cart.items.filter(item =>
                item.bookId.toString() !== bookId
            );

            cart.totalPrice = cart.items.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );

            await cart.save();
            res.json({ message: 'Item removed from cart', cart });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    clearCart: async (req, res) => {
        try {
            const cart = await Cart.findOneAndUpdate(
                { userId: req.userId },
                { $set: { items: [], totalPrice: 0 } },
                { new: true }
            );
            res.json({ message: 'Cart cleared', cart });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = cartController;
