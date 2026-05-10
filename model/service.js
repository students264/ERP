const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
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
const servicemodel=mongoose.model('service', serviceSchema)
module.exports = servicemodel