const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: [true, 'Tên ngân hàng là bắt buộc'],
        trim: true
    },
    accountNumber: {
        type: String,
        required: [true, 'Số tài khoản ngân hàng là bắt buộc'],
        trim: true
    },
    accountHolder: {
        type: String,
        required: [true, 'Tên người thụ hưởng là bắt buộc'],
        trim: true
    },
    bankLogo: {
        type: String,
        default: ''
    },
    qrCode: {
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

module.exports = mongoose.model('Bank', bankSchema);
