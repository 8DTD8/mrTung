let Review = require('../models/Review');
let Book = require('../models/Book');

module.exports = {
    getByBook: async function (bookId) {
        return await Review.find({
            bookId: bookId,
            approved: true
        })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
    },

    getByUser: async function (userId) {
        return await Review.find({ userId: userId })
            .populate('bookId', 'title image')
            .sort({ createdAt: -1 });
    },

    getPending: async function () {
        return await Review.find({ approved: false })
            .populate('bookId', 'title')
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
    },

    create: async function (userId, userName, bookId, rating, comment) {
        let book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        let existingReview = await Review.findOne({
            bookId,
            userId
        });
        if (existingReview) {
            throw new Error('You have already reviewed this book');
        }

        let review = new Review({
            bookId,
            userId,
            userName,
            rating,
            comment,
            approved: false
        });

        await review.save();
        return { message: 'Review submitted for approval', review };
    },

    approve: async function (id) {
        let review = await Review.findByIdAndUpdate(
            id,
            { approved: true },
            { new: true }
        );

        if (!review) {
            throw new Error('Review not found');
        }

        let reviews = await Review.find({
            bookId: review.bookId,
            approved: true
        });
        let avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await Book.findByIdAndUpdate(review.bookId, { rating: avgRating });

        return { message: 'Review approved', review };
    },

    delete: async function (id) {
        let review = await Review.findById(id);
        if (!review) {
            throw new Error('Review not found');
        }
        await review.deleteOne();
        return { message: 'Review deleted' };
    }
};
