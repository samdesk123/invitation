const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW()');
    console.log('✅ Connected to MySQL Cloud SQL. Time:', rows[0]['NOW()']);
  } catch (err) {
    console.error('❌ Error connecting to the database:', err);
  }
})();

module.exports = pool;
