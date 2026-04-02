const User = require('../models/User');

module.exports = {
    getAll: async function () {
        return await User.find().select('-password').sort({ createdAt: -1 });
    },

    getById: async function (id) {
        return await User.findById(id).select('-password');
    },

    findByEmail: async function (email) {
        return await User.findOne({ email });
    },

    create: async function (name, email, password, phone, role, active) {
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const user = new User({
            name,
            email,
            password,
            phone: phone || '',
            role: role || 'CUSTOMER',
            active: active !== undefined ? active : true
        });

        await user.save();
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            active: user.active
        };
    },

    update: async function (id, updates) {
        delete updates.password;
        return await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
    },

    delete: async function (id) {
        return await User.findByIdAndDelete(id);
    },

    updateProfile: async function (userId, name, phone, avatar) {
        return await User.findByIdAndUpdate(
            userId,
            { name, phone, avatar },
            { new: true, runValidators: true }
        ).select('-password');
    }
};
