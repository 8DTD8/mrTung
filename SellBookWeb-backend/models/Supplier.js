const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email format']
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: 'Việt Nam'
    },
    contactPerson: {
        type: String,
        default: ''
    },
    bankAccount: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
