const { protect } = require('../middleware/authMiddleware');
const roomController = require('../controllers/roomController');
const express = require('express');
const router = express.Router();

router.use(protect);    // to confirm that user is logged in 


router.post('/generateCode', roomController.sendRoomCode);
router.post('/create-room', roomController.createRoom);
router.post('/accept-code', roomController.joinRoom);
router.get('/', roomController.getUserRooms);

module.exports = router;