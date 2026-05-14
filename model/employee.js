const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    s_name: {
        type: String,
        required: true,
        trim: true
    },
    Date: {
        type: Date,
        required: true,
    },
    Day: {
        type: String,
        required: true,
    },
    Month: {
        type: String,
        required: true,
    },
    Status: {
        type: String,
        required: true,
    },
}, { timestamps: true })

const employeeModel = mongoose.model('employee', employeeSchema)

module.exports = employeeModel