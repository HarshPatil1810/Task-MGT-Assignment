const { poolPromise, sql } = require('../config/db');




// Core Global Notification Engine Utility Helper
const createNotification = async (pool, userId, message) => {
    try {
        await pool.request()
            .input('UserId', sql.Int, parseInt(userId, 10))
            .input('Message', sql.NVarChar, message)
            .query(`
                INSERT INTO Notifications (UserId, Message, IsRead, CreatedAt) 
                VALUES (@UserId, @Message, 0, GETDATE())
            `);
        console.log(`[Notification Engine] Row written successfully for User ID: ${userId}`);
    } catch (err) {
        console.error('[Notification Engine Failure]:', err.message);
    }
};

// 1. Fetch Dashboard Analytics Matrix
exports.getDashboard = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id, role } = req.user;

        if (role === 'Admin') {
            const stats = await pool.request().query(`
                SELECT 
                    (SELECT COUNT(*) FROM Users WHERE Role = 'Employee') as totalEmployees,
                    (SELECT COUNT(*) FROM Tasks) as totalTasks,
                    (SELECT COUNT(*) FROM Tasks WHERE Status = 'Completed') as completedTasks,
                    (SELECT COUNT(*) FROM Tasks WHERE Status = 'Pending') as pendingTasks
            `);
            return res.json(stats.recordset[0]);
        } else {
            const currentDate = new Date().toISOString().split('T')[0];
            const stats = await pool.request()
                .input('EmployeeId', sql.Int, parseInt(id, 10))
                .input('CurrentDate', sql.VarChar, currentDate)
                .query(`
                    SELECT 
                        COUNT(*) as myTasks,
                        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as completed,
                        SUM(CASE WHEN Status = 'Pending' AND DueDate >= @CurrentDate THEN 1 ELSE 0 END) as pending,
                        SUM(CASE WHEN Status = 'Pending' AND DueDate < @CurrentDate THEN 1 ELSE 0 END) as overdue
                    FROM Tasks 
                    WHERE AssignedTo = @EmployeeId
                `);
            return res.json(stats.recordset[0] || { myTasks: 0, completed: 0, pending: 0, overdue: 0 });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Fetch Tasks Lists Safely
exports.getTasks = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id, role } = req.user;
        
        let query = 'SELECT t.*, u.FullName as employeeName FROM Tasks t LEFT JOIN Users u ON t.AssignedTo = u.Id';
        const request = pool.request();
        
        if (role !== 'Admin') {
            query += ' WHERE t.AssignedTo = @EmployeeId';
            request.input('EmployeeId', sql.Int, parseInt(id, 10));
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Admin Deploying a Task -> Notifies the Employee
// Updated createTask Controller Method
exports.createTask = async (req, res) => {
    const body = req.body || {};
    const { title, description, priority, startDate, dueDate, assignedEmployeeId } = body;
    
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Debug logging to help you see exactly what's arriving in the terminal
    console.log("Parsed Form Fields (req.body):", req.body);
    console.log("Parsed File (req.file):", req.file);

    if (!title) {
        return res.status(400).json({ error: "Validation failed: 'title' field was not received by the server." });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .input('Priority', sql.NVarChar, priority)
            .input('StartDate', sql.VarChar, startDate)
            .input('DueDate', sql.VarChar, dueDate)
            .input('AssignedTo', sql.Int, parseInt(assignedEmployeeId, 10))
            .input('AttachmentUrl', sql.NVarChar, fileUrl) // Bound variable map parameter
            .query(`
                INSERT INTO Tasks (Title, Description, Priority, StartDate, DueDate, AssignedTo, Status, AttachmentUrl)
                VALUES (@Title, @Description, @Priority, @StartDate, @DueDate, @AssignedTo, 'Pending', @AttachmentUrl)
            `);

        // Trigger Notification Logic downstream...
        res.status(201).json({ message: 'Task created successfully with attachments!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Employee Finalizing a Task -> Notifies All Administrators
exports.updateStatus = async (req, res) => {

    //console.log(req);
    const { id } = req.params;
    const { status } = req.body; 
    const workerName = req.user?.fullName || req.user?.fullname || 'An Employee';// Captured from validated token decoding middleware profile logs

    try {
        const pool = await poolPromise;
        
        const currentTask = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT Status, Title, AssignedTo FROM Tasks WHERE Id = @Id');

        if (currentTask.recordset.length === 0) {
            return res.status(404).json({ error: 'Task profile not found.' });
        }

        if (currentTask.recordset[0].Status === 'Completed') {
            return res.status(400).json({ error: 'Completed tasks are finalized and locked.' });
        }

        // Commit status change updates
        await pool.request()
            .input('Id', sql.Int, id)
            .input('Status', sql.NVarChar, status)
            .query('UPDATE Tasks SET Status = @Status WHERE Id = @Id');

        // NOTIFICATION RULE: Query Admin nodes and submit cross-role alerts
        if (status === 'Completed') {
            const adminLookup = await pool.request().query("SELECT Id FROM Users WHERE Role = 'Admin'");
            const taskTitle = currentTask.recordset[0].Title;
            
            // Send alerts to every designated administrator profile concurrently
            const notificationPromises = adminLookup.recordset.map(admin => 
                createNotification(pool, admin.Id, `Task "${taskTitle}" has been marked Complete by ${workerName}.`)
            );
            await Promise.all(notificationPromises);
        }

        res.json({ message: 'Task status updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};