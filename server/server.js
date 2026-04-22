require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// ✅ AUTO-MIGRATE SCHEMA
async function initDB() {
  try {
    console.log('🔧 Checking Database Schema...');
    
    // Check if column exists
    const [cols] = await db.query("SHOW COLUMNS FROM complaints LIKE 'assigned_worker'");
    if (cols.length === 0) {
      console.log('➕ Adding assigned_worker column...');
      await db.query("ALTER TABLE complaints ADD COLUMN assigned_worker VARCHAR(100) DEFAULT NULL");
    }
    
    // Check if status ENUM needs update
    // We just try to modify it; MySQL will handle it if it's already the same or needs change.
    // If there's an error (e.g. data conflict), it will be caught.
    await db.query(`
      ALTER TABLE complaints 
      MODIFY COLUMN status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending'
    `);
    
    console.log('✅ Database Schema is Synchronized');
  } catch (err) {
    console.error('⚠️ Schema Sync Warning:', err.message);
  }
}


// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ================= AUTH =================

// 🔐 Student Login
app.post('/api/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const [rows] = await db.query(
      'SELECT * FROM students WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📝 Student Register
app.post('/api/student/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const [existing] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    const [result] = await db.query(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔐 Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= COMPLAINTS =================

// 📊 Get all complaints (admin) or student-specific complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const { studentId } = req.query;
    let query, params;

    if (studentId) {
      query = `
        SELECT c.*, s.name AS student_name
        FROM complaints c
        LEFT JOIN students s ON c.student_id = s.id
        WHERE c.student_id = ?
        ORDER BY c.created_at DESC
      `;
      params = [studentId];
    } else {
      query = `
        SELECT c.*, s.name AS student_name
        FROM complaints c
        LEFT JOIN students s ON c.student_id = s.id
        ORDER BY c.created_at DESC
      `;
      params = [];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Fetch Complaints Error:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ➕ Create complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const { student_id, title, description } = req.body;
    if (!student_id || !title || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const [result] = await db.query(
      'INSERT INTO complaints (student_id, title, description, status) VALUES (?, ?, ?, ?)',
      [student_id, title, description, 'pending']
    );
    res.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error("Create Complaint Error:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ✏️ Update complaint — full workflow with locking protection
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_worker, locked_by } = req.body;

    // ── Fetch current complaint state ──
    const [existing] = await db.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }
    const complaint = existing[0];

    // ── Concurrency lock protection ──
    // If another admin owns the lock and the requesting admin is different, reject.
    if (
      complaint.locked_by !== null &&
      locked_by !== undefined &&
      locked_by !== null &&
      complaint.locked_by !== locked_by
    ) {
      return res.status(409).json({
        success: false,
        message: "This complaint is currently locked by another admin."
      });
    }

    // ── Build dynamic UPDATE ──
    const updates = [];
    const params = [];

    if (status !== undefined) {
      const validStatuses = ['pending', 'in_progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (assigned_worker !== undefined) {
      updates.push('assigned_worker = ?');
      params.push(assigned_worker);
    }

    if (locked_by !== undefined) {
      updates.push('locked_by = ?');
      params.push(locked_by);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    params.push(id);
    const query = `UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, params);

    // Return updated complaint
    const [updated] = await db.query(`
      SELECT c.*, s.name AS student_name
      FROM complaints c
      LEFT JOIN students s ON c.student_id = s.id
      WHERE c.id = ?
    `, [id]);

    res.json({ success: true, complaint: updated[0] });
  } catch (error) {
    console.error("Update Complaint Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database Update Failed",
      error: error.message 
    });
  }
});

// ================= SERVER START =================

const PORT = process.env.PORT || 5000;

// Initialize DB before starting server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});