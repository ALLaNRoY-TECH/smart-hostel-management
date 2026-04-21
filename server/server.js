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

// ✏️ Update complaint status
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query(
      'UPDATE complaints SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Update Complaint Error:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ================= SERVER START =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});