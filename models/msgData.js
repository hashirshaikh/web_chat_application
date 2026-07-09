const mongoose = require('mongoose');

const msgData = mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData', required: true },
    senderUsername: { type: String, required: true },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomData', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MsgData', msgData);