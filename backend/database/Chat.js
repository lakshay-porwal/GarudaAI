const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Userdata',
        required: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true
    },
    role: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Chat', ChatSchema);