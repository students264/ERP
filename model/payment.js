const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    s_name: {
        type: String,
        required: true,
        trim: true
    },
    mr: {
        type:Number,
        required:true,
    },
    Date:{
        type:Date,
        required:true,
    },
    Month: {
        type:[String],
        required:true
    },
    Year: {
        type: Number,
        required:true
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
    rn:{
        type:Number,
    },
    Amount: {
        type:Number,
        required:true
    }
}, { timestamps: true })
const paymentmodel=mongoose.model('payment', paymentSchema)
module.exports = paymentmodel