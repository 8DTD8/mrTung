let Book = require('../models/Book');

module.exports = {
    getAll: async function (page, size, category, search, active) {
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

        return {
            books,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    getById: async function (id) {
        return await Book.findById(id).populate('categoryId', 'name');
    },

    create: async function (bookData) {
        let book = new Book(bookData);
        await book.save();
        return book;
    },

    update: async function (id, bookData) {
        return await Book.findByIdAndUpdate(
            id,
            bookData,
            { new: true, runValidators: true }
        );
    },

    delete: async function (id) {
        return await Book.findByIdAndDelete(id);
    },

    search: async function (title) {
        return await Book.find({
            title: { $regex: title, $options: 'i' },
            active: true
        }).populate('categoryId', 'name');
    },

    getByCategory: async function (categoryId) {
        return await Book.find({
            categoryId: categoryId,
            active: true
        }).populate('categoryId', 'name');
    }
};
