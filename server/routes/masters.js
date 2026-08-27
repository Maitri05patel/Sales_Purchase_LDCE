const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all active departments
router.get('/departments', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM departments WHERE is_active = TRUE ORDER BY name ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all active users
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.*, d.name as dept_name, d.code as dept_code 
      FROM users u
      LEFT JOIN departments d ON u.dept_id = d.id
      WHERE u.is_active = TRUE 
      ORDER BY u.name ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get committees
router.get('/committees', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM committees WHERE is_active = TRUE ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create department
router.post('/departments', async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) {
    return res.status(400).json({ success: false, error: 'Code and Name are required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO departments (code, name) VALUES ($1, $2) RETURNING *',
      [code.toUpperCase(), name]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
