const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    s_name: {
        type: String,
        required: true,
        trim: true
    },
    Date:{
        type:Date,
        required:true,
    },
    Account: {
        type:[String],
        required:true
    },
    payment: {
        type: [String],
        required: true,
    },
    Mode: {
        type:[String],
        required: true,
    },
    Amount: {
        type:Number,
        required:true
    }
}, { timestamps: true })
const paymentmodel=mongoose.model('payment', paymentSchema)
module.exports = paymentmodel