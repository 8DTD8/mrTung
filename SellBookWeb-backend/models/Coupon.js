const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        default: ''
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative']
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED'],
        required: [true, 'Discount type is required']
    },
    minimumAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum amount cannot be negative']
    },
    maxUsage: {
        type: Number,
        default: null
    },
    currentUsage: {
        type: Number,
        default: 0,
        min: [0, 'Current usage cannot be negative']
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    active: {
        type: Boolean,
        default: true
    },
    scope: {
        type: String,
        enum: ['ALL', 'ONLY_BOOKS', 'EXCEPT_BOOKS'],
        default: 'ALL'
    },
    bookIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
