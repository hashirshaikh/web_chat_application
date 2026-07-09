const UserData = require('../models/userData');
const MsgData = require('../models/msgData');
const RoomData = require('../models/roomData');





const leaveRoom = async (req,res) =>{
    const roomId = req.params.roomId;
    const userId = req.user.id;
    const user = await UserData.findById(userId);
    const room = await RoomData.findById(roomId);
    if (!room) {
        return res.status(401).json({ message: 'Room not found' });
    }
    if(!room.member.includes(userId)){
        return res.status(401).json({ message: 'User not in room' });
    }
    if(room.admin_id.toString() === userId.toString()){
        return res.status(401).json({ message: 'Admin cannot leave the room' });
    }
    room.member.pull(userId);
    await room.save();

    user.joinedRooms.pull(roomId);
    await user.save();
    return res.status(200).json({ success:true, room, user });
}


const getRoomMessages = async (req,res) =>{
    const roomId = req.params.roomId;
    const msg = await MsgData.find({ room_id: roomId });
    return res.status(200).json({ success:true, msg });

}


const sendMessage = async (req, res) => {
    const { senderId,sender,roomId, message, } = req.body;
    const user = await UserData.findById(senderId);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }
    const room = await RoomData.findById(roomId);
    if (!room) {
        return res.status(401).json({ message: 'Room not found' });
    }
    if(message===null || message==="" || message===undefined){
        return res.status(400).json({ message: 'Message is required' });
    }
    if(!room.member.includes(senderId)){
        return res.status(401).json({ message: 'User not in room' });
    }

    try {
        const msg = await MsgData.create({ sender_id: senderId, senderUsername: sender, room_id: roomId, message: message });
        res.status(201).json({ success:true, msg });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    sendMessage,
    getRoomMessages,
    leaveRoom
}
