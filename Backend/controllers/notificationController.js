const { poolPromise, sql } = require('../config/db');

// @route   GET /api/notifications
// @desc    Fetch all unread notifications for the logged-in user
exports.getUnreadNotifications = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id } = req.user; // Set securely by your authMiddleware

        const result = await pool.request()
            .input('UserId', sql.Int, parseInt(id, 10))
            .query(`
                SELECT Id, Message, IsRead, CreatedAt 
                FROM Notifications 
                WHERE UserId = @UserId AND IsRead = 0 
                ORDER BY CreatedAt DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching notifications:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// @route   PUT /api/notifications/read
// @desc    Mark all unread notifications as read for the logged-in user
exports.markNotificationsAsRead = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id } = req.user;

        await pool.request()
            .input('UserId', sql.Int, parseInt(id, 10))
            .query(`
                UPDATE Notifications 
                SET IsRead = 1 
                WHERE UserId = @UserId AND IsRead = 0
            `);

        res.json({ message: 'All operational flags updated to Read status.' });
    } catch (err) {
        console.error('Error modifying notification flags:', err.message);
        res.status(500).json({ error: err.message });
    }
};