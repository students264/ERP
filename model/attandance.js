const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    s_name: {
        type: String,
        required: true,
        trim: true
    },
    Date: {
        type: Date,
        required: true,
    },
    status: {
        type: [String],
        required: true,
    },
    Month: {
        type: [String],
        required: true,
    }
}, { timestamps: true })

const attendanceModel = mongoose.model('attendance', attendanceSchema)

module.exports = attendanceModel