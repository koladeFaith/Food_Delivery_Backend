const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    fullName: {
        type: String, required: true
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: true
    },
    cart: [{
        name: String,
        productImg: String,
        description: String,
        price: Number,
        quantity: {
            type: Number,
            default: 1
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }

},
    { timestamps: true }

)
const userModel = mongoose.model('User', userSchema)
module.exports = (userModel)
