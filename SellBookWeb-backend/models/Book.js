const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    image: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    supplierName: {
        type: String,
        default: ''
    },
    coverType: {
        type: String,
        enum: ['Bìa cứng', 'Bìa mềm', ''],
        default: ''
    },
    translator: {
        type: String,
        default: ''
    },
    publisher: {
        type: String,
        default: ''
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100']
    },
    discountCode: {
        type: String,
        default: ''
    },
    salesCount: {
        type: Number,
        default: 0,
        min: [0, 'Sales count cannot be negative']
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
