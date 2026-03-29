let mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: false // Java data doesn't have slug
    },
    description: {
        type: String,
        default: ""
    },
    icon: {
        type: String,
        default: ""
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: false
    },
    active: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('category', categorySchema)