const Category = require('../models/Category');

const categoryController = {
    getAll: async (req, res) => {
        try {
            const categories = await Category.find({ active: true }).sort({ name: 1 });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllAdmin: async (req, res) => {
        try {
            const categories = await Category.find().sort({ name: 1 });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json(category);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const category = new Category(req.body);
            await category.save();
            res.status(201).json(category);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const category = await Category.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json(category);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const category = await Category.findByIdAndDelete(req.params.id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = categoryController;
