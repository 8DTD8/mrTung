const Book = require('../models/Book');

const bookController = {
    getAll: async (req, res) => {
        try {
            const { page = 0, size = 10, category, search, active } = req.query;
            const query = {};

            if (category) query.categoryId = category;
            if (active !== undefined) query.active = active === 'true';
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } }
                ];
            }

            const books = await Book.find(query)
                .populate('categoryId', 'name')
                .sort({ createdAt: -1 })
                .skip(page * size)
                .limit(parseInt(size));

            const total = await Book.countDocuments(query);

            res.json({
                books,
                pagination: {
                    page: parseInt(page),
                    size: parseInt(size),
                    total,
                    totalPages: Math.ceil(total / size)
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const book = await Book.findById(req.params.id).populate('categoryId', 'name');
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json(book);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            console.log('Creating book with data:', req.body);
            const book = new Book(req.body);
            await book.save();
            res.status(201).json(book);
        } catch (error) {
            console.error('Book creation error:', error);
            res.status(500).json({ message: error.message, details: error.errors });
        }
    },

    update: async (req, res) => {
        try {
            const book = await Book.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json(book);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const book = await Book.findByIdAndDelete(req.params.id);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    search: async (req, res) => {
        try {
            const { title } = req.query;
            const books = await Book.find({
                title: { $regex: title, $options: 'i' },
                active: true
            }).populate('categoryId', 'name');
            res.json(books);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getByCategory: async (req, res) => {
        try {
            const books = await Book.find({
                categoryId: req.params.categoryId,
                active: true
            }).populate('categoryId', 'name');
            res.json(books);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = bookController;
