require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkComplaints() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [complaints] = await db.query('SELECT id, title, status, locked_by FROM complaints');
    console.log("Complaints in DB:", complaints);
  } catch (err) {
    console.error("Error checking complaints:", err);
  } finally {
    process.exit();
  }
}

checkComplaints();
