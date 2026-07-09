const RoomData = require('../models/roomData');
const UserData = require('../models/userData');
const generateRoomCode = require('../utils/generateRoomCode');

const sendRoomCode = (req, res) => {
    // ye bas backend function se code generate krke frotnend ko bhejega 
    const code = generateRoomCode();
    res.json({ code:code });
};

const createRoom = async (req, res) => {
    const { roomName, roomCode } = req.body;
    // yaha db me data save krna hai 
    const userId = req.user.id;
    const user = await UserData.findById(userId);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }
    // save data to db
    const roomcheck = await RoomData.findOne({ roomCode: roomCode });
    if (roomcheck) {
        return res.status(400).json({ message: 'Room code already exists' });
    }
    try {
    const room = await RoomData.create({ roomName:roomName,roomCode:roomCode,admin_id:userId,member:[userId] });
    user.createdRooms.push(room.id);
    await user.save();
    res.status(201).json({ success:true, room });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }


};

const joinRoom = async (req, res) => {
    const { roomCode } = req.body;
    const userId = req.user.id;
    const user = await UserData.findById(userId);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }
    const room = await RoomData.findOne({ roomCode: roomCode });
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }
    if (room.member.includes(userId)) {
        return res.status(400).json({ message: 'User already in room' });
    }
    try{
    room.member.push(userId);
    await room.save();
    user.joinedRooms.push(room.id);
    await user.save();
     res.status(200).json({ success:true, room });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }

   
};

const getUserRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const rooms = await RoomData.find({ member: userId });
        res.status(200).json({ success: true, rooms });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    sendRoomCode,
    createRoom,
    joinRoom,
    getUserRooms
};