require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    console.log('🔧 Running complaint table migration...');

    // Add assigned_worker column if it doesn't exist
    await db.query(`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS assigned_worker VARCHAR(100) DEFAULT NULL
    `);
    console.log('✅ assigned_worker column added (or already exists)');

    // Ensure status uses correct ENUM values
    await db.query(`
      ALTER TABLE complaints 
      MODIFY COLUMN status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending'
    `);
    console.log('✅ Status ENUM updated to pending/in_progress/resolved');

    // Normalize any old status values
    await db.query(`UPDATE complaints SET status = 'pending' WHERE status NOT IN ('pending','in_progress','resolved')`);
    console.log('✅ Old status values normalized');

    console.log('🎉 Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  }
}

migrate();
