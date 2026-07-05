const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { fullName, email, password, role, department, designation } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const pool = await poolPromise;
        await pool.request()
            .input('FullName', sql.VarChar, fullName)
            .input('Email', sql.VarChar, email)
            .input('PasswordHash', sql.VarChar, passwordHash)
            .input('Role', sql.VarChar, role)
            .input('Department', sql.VarChar, department || null)
            .input('Designation', sql.VarChar, designation || null)
            .execute('sp_RegisterUser');

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .execute('sp_GetUserByEmail');

        const user = result.recordset[0];
        if (!user) return res.status(400).json({ message: 'Invalid Email or Password.' });

        const validPassword = await bcrypt.compare(password, user.PasswordHash);
        if (!validPassword) return res.status(400).json({ message: 'Invalid Email or Password.' });

        const token = jwt.sign({ id: user.Id, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.Id, fullName: user.FullName, email: user.Email, role: user.Role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};