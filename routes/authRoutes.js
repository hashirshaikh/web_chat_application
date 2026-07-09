const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateUsername, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);


router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/update-username', protect, updateUsername);     // only these require user to be logged in 
router.post('/update-password', protect, updatePassword);

module.exports = router;
