const { poolPromise, sql } = require('../config/db');

exports.getEmployees = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Extract query filters with standard defaults
        const search = req.query.search ? `%${req.query.search}%` : '%';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'fullName';
        const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

        // Direct pagination query for SQL Server
        const result = await pool.request()
            .input('Search', sql.NVarChar, search)
            .input('Offset', sql.Int, offset)
            .input('Limit', sql.Int, limit)
            .query(`
                SELECT Id, FullName, Email, Department, Designation, Role 
                FROM Users 
                WHERE Role = 'Employee' AND (FullName LIKE @Search OR email LIKE @Search)
                ORDER BY ${sortBy === 'Email' ? 'Email' : 'FullName'} ${order}
                OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

                SELECT COUNT(*) as total FROM Users WHERE Role = 'Employee' AND (fullName LIKE @Search OR email LIKE @Search);
            `);

        res.json({
            employees: result.recordsets[0],
            totalCount: result.recordsets[1][0].total,
            page,
            totalPages: Math.ceil(result.recordsets[1][0].total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, department, designation } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, id)
            .input('Name', sql.NVarChar, fullName)
            .input('Email', sql.NVarChar, email)
            .input('Dept', sql.NVarChar, department)
            .input('Desig', sql.NVarChar, designation)
            .query(`
                UPDATE Users 
                SET fullName = @Name, email = @Email, department = @Dept, designation = @Desig 
                WHERE Id = @Id AND Role = 'Employee'
            `);
        res.json({ message: 'Employee file updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. POST /api/employees (Updated to insert Department and Designation)
exports.createEmployee = async (req, res) => {
    const { fullName, email, password, department, designation } = req.body;
    try {
        const pool = await poolPromise;
        
        const emailCheck = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT Id FROM Users WHERE Email = @Email');
            
        if (emailCheck.recordset.length > 0) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        await pool.request()
            .input('FullName', sql.NVarChar, fullName)
            .input('Email', sql.NVarChar, email)
            .input('Password', sql.NVarChar, password)
            .input('Department', sql.NVarChar, department || null)
            .input('Designation', sql.NVarChar, designation || null)
            .query(`
                INSERT INTO Users (FullName, Email, Password, Role, Department, Designation) 
                VALUES (@FullName, @Email, @Password, 'Employee', @Department, @Designation)
            `);

        res.status(201).json({ message: 'Employee added successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, id)
            .query("DELETE FROM Users WHERE Id = @Id AND Role = 'Employee'");
        res.json({ message: 'Employee deleted from record system.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};