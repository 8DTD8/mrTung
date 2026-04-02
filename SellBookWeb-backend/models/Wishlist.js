const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true
    },
    bookIds: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
