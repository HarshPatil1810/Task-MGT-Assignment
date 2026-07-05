const { poolPromise, sql } = require('../config/db');
const ExcelJS = require('exceljs');

exports.generateTaskReport = async (req, res) => {
    const { status, employeeId, format } = req.query; // status: 'Completed' / 'Pending', format: 'excel' / 'csv'
    
    try {
        const pool = await poolPromise;
        let query = `
            SELECT 
                t.Id AS [Task ID], 
                t.Title AS [Task Title], 
                t.Description AS [Description], 
                t.Priority AS [Priority], 
                t.Status AS [Status], 
                CONVERT(VARCHAR(10), t.StartDate, 120) AS [Start Date], 
                CONVERT(VARCHAR(10), t.DueDate, 120) AS [Due Date], 
                u.FullName AS [Assigned Employee],
                u.Email AS [Employee Email]
            FROM Tasks t
            LEFT JOIN Users u ON t.AssignedTo = u.Id
            WHERE 1=1
        `;

        // Apply filters dynamically
        if (status) {
            query += ` AND t.Status = '${status === 'Completed' ? 'Completed' : 'Pending'}'`;
        }
        if (employeeId) {
            query += ` AND t.AssignedTo = ${parseInt(employeeId, 10)}`;
        }

        query += ` ORDER BY t.DueDate ASC`;

        const result = await pool.request().query(query);
        const data = result.recordset;

        // Build Report Filename
        let reportName = 'Task_Report';
        if (status) reportName = `${status}_Tasks_Report`;
        if (employeeId && data.length > 0) reportName = `Employee_${data[0]['Assigned Employee'].replace(/\s+/g, '_')}_Report`;

        // --- FORMAT EXPORT HANDLING ROUTINES ---
        if (format === 'csv') {
            // Generate clean CSV payload
            if (data.length === 0) {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${reportName}.csv`);
                return res.send('No records found matching current filter matrix.');
            }
            
            const headers = Object.keys(data[0]);
            const csvRows = [headers.join(',')];

            for (const row of data) {
                const values = headers.map(header => {
                    const val = row[header] ? row[header].toString().replace(/"/g, '""') : '';
                    return `"${val}"`; // Wrap everything inside quotes to avoid broken column structures
                });
                csvRows.push(values.join(','));
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${reportName}.csv`);
            return res.send(csvRows.join('\n'));

        } else {
            // Generate structured Excel Workbook utilizing exceljs
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Task Ledger Log');

            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                worksheet.columns = headers.map(header => ({ header: header, key: header, width: 22 }));
                
                // Style Header row to look sharp
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF212529' } }; // Dark slate banner
                
                // Add Dataset rows
                worksheet.addRows(data);
            } else {
                worksheet.addRow(['No operational matrix records found matching data parameters']);
            }

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${reportName}.xlsx`);
            
            await workbook.xlsx.write(res);
            return res.end();
        }

    } catch (err) {
        console.error("Reporting Stream Failure:", err);
        res.status(500).json({ error: err.message });
    }
};