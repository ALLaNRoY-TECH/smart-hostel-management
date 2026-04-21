require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDB() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [students] = await db.query('SELECT * FROM students');
    console.log("Students in DB:", students);
    
    const [admins] = await db.query('SELECT * FROM admins');
    console.log("Admins in DB:", admins);
  } catch (err) {
    console.error("Error checking DB:", err);
  } finally {
    process.exit();
  }
}

checkDB();
