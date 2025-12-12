const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    // 1. Get token from header
    const authHeader = req.header('Authorization');
    // 2. Check if not token
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if header format is "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token format is incorrect, authorization denied' });
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 4. Add user from payload to request object
        req.user = decoded.user;
        next(); // Move to the next middleware/controller
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
