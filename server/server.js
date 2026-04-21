require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

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

    // Check if user exists
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

// 📊 Get complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const { studentId } = req.query;
    let query = 'SELECT * FROM complaints ORDER BY created_at DESC';
    let params = [];

    if (studentId) {
      query = 'SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC';
      params = [studentId];
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
    const [result] = await db.query(
      'INSERT INTO complaints (student_id, title, description, status) VALUES (?, ?, ?, ?)',
      [student_id, title, description, 'Pending']
    );
    res.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error("Create Complaint Error:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ✏️ Update complaint status or lock
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, locked_by } = req.body;

    // Build dynamic query
    let updates = [];
    let params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
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
    res.json({ success: true });
  } catch (error) {
    console.error("Update Complaint Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= SERVER START =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});