const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
const Admin = mongoose.model('admin', schema);

module.exports = Admin;