const express = require('express');
const cors = require('cors');
require('dotenv').config();

const multer = require('multer');
const path = require('path');

const authController = require('./controllers/authController');
const taskController = require('./controllers/taskController');
const verifyToken = require('./middelware/authMiddleware');
const employeeController = require('./controllers/employeeController');
const reportController = require('./controllers/reportController');
// 1. IMPORT THE NOTIFICATION CONTROLLER
const notificationController = require('./controllers/notificationController'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true })); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: "Access Denied: Admin Clearance Required." });
    }
}

// Auth Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Protected Task & Dashboard Routes
app.get('/api/dashboard', verifyToken, taskController.getDashboard);
app.get('/api/tasks', verifyToken, taskController.getTasks);
app.post('/api/tasks', verifyToken, upload.single('file'), taskController.createTask);//app.post('/api/tasks', verifyToken, taskController.uploadMiddleware, taskController.createTask);
app.put('/api/tasks/:id/status', verifyToken, taskController.updateStatus);

// Admin Specific Employee Routes
app.get('/api/employees', verifyToken, isAdmin, employeeController.getEmployees);
app.put('/api/employees/:id', verifyToken, isAdmin, employeeController.updateEmployee);
app.delete('/api/employees/:id', verifyToken, isAdmin, employeeController.deleteEmployee);
app.post('/api/employees', verifyToken, isAdmin, employeeController.createEmployee);

// 2. DIRECT NOTIFICATION SYSTEM ROUTE MOUNTS
// Maps perfectly to the frontend Navbar long polling requests
app.get('/api/notifications', verifyToken, notificationController.getUnreadNotifications);
app.put('/api/notifications/read', verifyToken, notificationController.markNotificationsAsRead);

app.get('/api/reports/tasks', verifyToken, isAdmin, reportController.generateTaskReport);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing safely on port ${PORT}`));