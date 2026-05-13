const mongoose = require('mongoose')

const expenceSchema = new mongoose.Schema({
    Date:{
        type:Date,
        required:true,
    },
    Month:{
        type:[String],
        required:true,
    },
    Pay: {
        type:String,
        required:true,
    },
    Mode: {
        type:[String],
        required: true,
    },
    Reciept: {
        type: String,
        required: true,
    },
    Amount: {
        type:Number,
        required:true
    }
}, { timestamps: true })
const expencemodel=mongoose.model('expence', expenceSchema)
module.exports = expencemodel