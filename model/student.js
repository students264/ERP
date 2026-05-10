const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String
    },
    s_name: {
        type: String,
        required: true,
        trim: true
    },
    Date: {
        type: Date,
        required: true,
    },
    Address: {
        type: String,
        required: true,
    },
    Mobile: {
        type: String,
        required: true
    },
    type: {
        type:[String],
        required: true,
    },
    board: {
        type:[String],
    },
    Educational_Service: {
        type: [String],
        required: true,
    },

    Month: {
        type: [String],
        required: true,
    }

}, { timestamps: true })

const studentmodel = mongoose.model('student', studentSchema)

module.exports = studentmodel