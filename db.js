const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  socketPath: process.env.INSTANCE_UNIX_SOCKET,
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
