const mongoose = require('mongoose');

const roomData = mongoose.Schema({
    roomName: { type: String, required: true },
    roomCode: { type: String, required: true, unique: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData', required: true },
    member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserData' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoomData', roomData);