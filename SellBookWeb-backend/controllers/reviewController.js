const Review = require('../models/Review');
const Book = require('../models/Book');

const reviewController = {
    getByBook: async (req, res) => {
        try {
            const reviews = await Review.find({
                bookId: req.params.bookId,
                approved: true
            })
                .populate('userId', 'name')
                .sort({ createdAt: -1 });
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getByUser: async (req, res) => {
        try {
            const reviews = await Review.find({ userId: req.params.userId })
                .populate('bookId', 'title image')
                .sort({ createdAt: -1 });
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getPending: async (req, res) => {
        try {
            const reviews = await Review.find({ approved: false })
                .populate('bookId', 'title')
                .populate('userId', 'name')
                .sort({ createdAt: -1 });
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { bookId, rating, comment } = req.body;

            const book = await Book.findById(bookId);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }

            const existingReview = await Review.findOne({
                bookId,
                userId: req.userId
            });
            if (existingReview) {
                return res.status(409).json({ message: 'You have already reviewed this book' });
            }

            const review = new Review({
                bookId,
                userId: req.userId,
                userName: req.user.name,
                rating,
                comment,
                approved: false
            });

            await review.save();
            res.status(201).json({ message: 'Review submitted for approval', review });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    approve: async (req, res) => {
        try {
            const review = await Review.findByIdAndUpdate(
                req.params.id,
                { approved: true },
                { new: true }
            );

            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            const reviews = await Review.find({
                bookId: review.bookId,
                approved: true
            });
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

            await Book.findByIdAndUpdate(review.bookId, { rating: avgRating });

            res.json({ message: 'Review approved', review });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (review.userId.toString() !== req.userId.toString() &&
                req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ message: 'Not authorized' });
            }

            await review.deleteOne();
            res.json({ message: 'Review deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = reviewController;
