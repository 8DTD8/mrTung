let Wishlist = require('../models/Wishlist');
let Book = require('../models/Book');

module.exports = {
    getMyWishlist: async function (userId) {
        let wishlist = await Wishlist.findOne({ userId })
            .populate('bookIds', 'title author price image rating');

        if (!wishlist) {
            wishlist = new Wishlist({ userId, bookIds: [] });
            await wishlist.save();
        }

        return wishlist;
    },

    addToWishlist: async function (userId, bookId) {
        let book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, bookIds: [bookId] });
        } else {
            if (wishlist.bookIds.includes(bookId)) {
                throw new Error('Book already in wishlist');
            }
            wishlist.bookIds.push(bookId);
        }

        await wishlist.save();
        await wishlist.populate('bookIds', 'title author price image rating');

        return wishlist;
    },

    removeFromWishlist: async function (userId, bookId) {
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }

        let index = wishlist.bookIds.indexOf(bookId);
        if (index === -1) {
            throw new Error('Book not found in wishlist');
        }

        wishlist.bookIds.splice(index, 1);
        await wishlist.save();
        await wishlist.populate('bookIds', 'title author price image rating');

        return wishlist;
    },

    clearWishlist: async function (userId) {
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }

        wishlist.bookIds = [];
        await wishlist.save();

        return { message: 'Wishlist cleared successfully' };
    },

    checkInWishlist: async function (userId, bookId) {
        let wishlist = await Wishlist.findOne({ userId });
        let isInWishlist = wishlist ? wishlist.bookIds.includes(bookId) : false;
        return { isInWishlist };
    }
};
