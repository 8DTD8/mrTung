let Category = require('../models/Category');

module.exports = {
    getAll: async function () {
        return await Category.find({ active: true }).sort({ name: 1 });
    },

    getAllAdmin: async function () {
        return await Category.find().sort({ name: 1 });
    },

    getById: async function (id) {
        return await Category.findById(id);
    },

    create: async function (categoryData) {
        let category = new Category(categoryData);
        await category.save();
        return category;
    },

    update: async function (id, categoryData) {
        return await Category.findByIdAndUpdate(
            id,
            categoryData,
            { new: true, runValidators: true }
        );
    },

    delete: async function (id) {
        return await Category.findByIdAndDelete(id);
    }
};
