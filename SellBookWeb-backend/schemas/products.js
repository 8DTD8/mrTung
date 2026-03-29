let mongoose = require('mongoose')

let productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: ""
    },
    slug: {
        type: String,
        required: false // Java data doesn't have slug
    },
    price: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: false
    },
    image: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8N7qdG-B9FW47yJaKEKCDpidao3fC1raDbpgldxW-Vr47N8vOGMdT6NrFib3y_QGyLZICFQdatPcNA2TDKw&s&ec=121516180"
    },
    images: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8N7qdG-B9FW47yJaKEKCDpidao3fC1raDbpgldxW-Vr47N8vOGMdT6NrFib3y_QGyLZICFQdatPcNA2TDKw&s&ec=121516180"
    },
    rating: {
        type: Number,
        default: 0
    },
    supplierName: {
        type: String,
        default: ""
    },
    coverType: {
        type: String,
        default: "Bìa mềm"
    },
    translator: {
        type: String,
        default: "None"
    },
    publisher: {
        type: String,
        default: ""
    },
    discountCode: {
        type: String,
        default: "None"
    },
    salesCount: {
        type: Number,
        default: 0
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
module.exports = mongoose.model('book', productSchema)