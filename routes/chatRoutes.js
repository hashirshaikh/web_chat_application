const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getRoomMessages, leaveRoom } = require('../controllers/chatController');


router.use(protect);

router.post('/broadcast', sendMessage);
router.get('/room/:roomId/messages', getRoomMessages);
router.post('/leave-room/:roomId', leaveRoom);

module.exports = router;