const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const dbConfig = {
    connectionString: process.env.DB_CONNECTION_STRING,
    options: {
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log("Connected!");
        return pool;
    })
    .catch(err => {
        console.error(err);
    });

module.exports = { sql, poolPromise };