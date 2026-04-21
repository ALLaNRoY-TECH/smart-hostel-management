require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixSchema() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Adding 'locked_by' column to complaints table...");
    await db.query(`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS locked_by INT DEFAULT NULL,
      ADD CONSTRAINT fk_locked_by FOREIGN KEY (locked_by) REFERENCES admins(id)
    `);
    console.log("✅ Column added successfully.");
  } catch (err) {
    console.error("❌ Error fixing schema:", err.message);
    // If it already exists or foreign key fails, try adding just the column
    try {
        await db.query("ALTER TABLE complaints ADD COLUMN locked_by INT DEFAULT NULL");
        console.log("✅ Column added (without constraint).");
    } catch (e) {
        console.error("Final fallback error:", e.message);
    }
  } finally {
    process.exit();
  }
}

fixSchema();
