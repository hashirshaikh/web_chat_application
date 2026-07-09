const express = require('express');
const router = express.Router();
const { protectWeb } = require('../middleware/authMiddleware');
const path = require('path');

// in this we protected all routes except auth routes i.e login and register so that users can login/register and generate a token

router.get('/', protectWeb, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


router.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


router.get('/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

router.get('/auth/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Serve React app for all other pages ... also protected
router.get(/.*/, protectWeb, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = router;
