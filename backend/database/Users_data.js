const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    emailID: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Userdata', UserDataSchema);