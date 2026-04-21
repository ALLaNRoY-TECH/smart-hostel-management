const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// AUTH - Student Login
app.post('/api/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM students WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AUTH - Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// COMPLAINTS - Get all or by student
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
    res.status(500).json({ error: error.message });
  }
});

// COMPLAINTS - Create (with transaction example)
app.post('/api/complaints', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { student_id, title, category, description } = req.body;
    
    const [result] = await connection.query(
      'INSERT INTO complaints (student_id, title, category, description, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, title, category, description, 'pending']
    );

    // Activity Log
    await connection.query(
      'INSERT INTO activity_logs (action, user_role) VALUES (?, ?)',
      [`Complaint created: ${title}`, 'student']
    );

    await connection.commit();
    res.json({ success: true, insertId: result.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// COMPLAINTS - Update Status and Concurrency Lock
app.put('/api/complaints/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { status, locked_by } = req.body;

    let updateFields = [];
    let params = [];

    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    if (locked_by !== undefined) {
      updateFields.push('locked_by = ?');
      params.push(locked_by);
    }
    
    if (updateFields.length > 0) {
      params.push(id);
      await connection.query(`UPDATE complaints SET ${updateFields.join(', ')} WHERE id = ?`, params);
    }

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ROOMS - Get all
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
