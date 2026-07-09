const jwt = require('jsonwebtoken');
const UserData = require('../models/userData');

exports.protect = async (req, res, next) => {
    let token;

    // Check if token is in cookie
    if (req.cookies && req.cookies.token) {
        try {
            // Get token from cookie
            token = req.cookies.token;

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from DB excluding password
            req.user = await UserData.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token validation failed', error: error.message });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Web auth middleware - redirects instead of JSON responses
exports.protectWeb = async (req, res, next) => {
    let token;

    // Check if token is in cookie
    if (req.cookies && req.cookies.token) {
        try {
            // Get token from cookie
            token = req.cookies.token;

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from DB excluding password
            req.user = await UserData.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.redirect('/auth');
            }

            return next();
        } catch (error) {
            return res.redirect('/auth');
        }
    }

    if (!token) {
        return res.redirect('/auth');
    }
};
