const mongoose = require('mongoose');


const ChatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Userdata',
        required: true
    },
    title: {
        type: String,
        default: 'New Chat',
    },
},

    {
        timestamps: true
    });


module.exports = mongoose.model('ChatSession', ChatSessionSchema);