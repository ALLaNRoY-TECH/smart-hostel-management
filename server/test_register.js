require('dotenv').config();
const mysql = require('mysql2/promise');

async function testRegister() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const name = "Test User";
    const email = "test" + Date.now() + "@test.com";
    const password = "password";

    const [result] = await db.query(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    console.log("Registration Success, ID:", result.insertId);
  } catch (err) {
    console.error("Registration FAILED:", err);
  } finally {
    process.exit();
  }
}

testRegister();
