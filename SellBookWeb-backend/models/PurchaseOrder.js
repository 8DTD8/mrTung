const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book ID is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative']
    }
}, { _id: true });

const purchaseOrderSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: [true, 'Supplier ID is required']
    },
    items: {
        type: [orderItemSchema],
        required: [true, 'Items are required'],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one item is required'
        }
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['PENDING', 'RECEIVED', 'CANCELLED'],
        default: 'PENDING'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    expectedDate: {
        type: Date,
        default: null
    },
    receivedDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
