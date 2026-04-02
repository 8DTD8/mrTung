let Supplier = require('../models/Supplier');

module.exports = {
    getAll: async function (page, size, active, search) {
        let query = {};

        if (active !== undefined) query.active = active === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } }
            ];
        }

        let suppliers = await Supplier.find(query)
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await Supplier.countDocuments(query);

        return {
            suppliers,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    getById: async function (id) {
        return await Supplier.findById(id);
    },

    create: async function (supplierData) {
        let supplier = new Supplier(supplierData);
        await supplier.save();
        return supplier;
    },

    update: async function (id, supplierData) {
        return await Supplier.findByIdAndUpdate(
            id,
            supplierData,
            { new: true, runValidators: true }
        );
    },

    delete: async function (id) {
        return await Supplier.findByIdAndDelete(id);
    },

    toggleActive: async function (id) {
        let supplier = await Supplier.findById(id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        supplier.active = !supplier.active;
        await supplier.save();

        return supplier;
    }
};
