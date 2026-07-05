const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Check standard headers first, then check URL query parameters for file downloads
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.query.token) {
        token = req.query.token; //  Fallback to query param token if headers are empty
    }

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No Token Provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
        req.user = verified; // Append decoded payload (Id, Role, etc.) to the request
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or Expired Security Token." });
    }
};