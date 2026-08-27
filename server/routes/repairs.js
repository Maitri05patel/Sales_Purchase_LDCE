const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get repair requests
router.get('/requests', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, d.name as dept_name 
      FROM repair_requests r
      JOIN departments d ON r.dept_id = d.id
      ORDER BY r.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create Repair Request (FORM-12)
router.post('/requests', async (req, res) => {
  const {
    dept_id, equipment_name, purchase_date, original_cost,
    breakdown_date, prev_repaired, last_repair_info, market_value, est_repair_cost, fault_desc
  } = req.body;

  if (!dept_id || !equipment_name || !purchase_date || !original_cost || !breakdown_date || !est_repair_cost || !fault_desc) {
    return res.status(400).json({ success: false, error: 'Missing mandatory repair fields' });
  }

  const req_no = `REP/${new Date().getFullYear()}/${dept_id}/${Date.now().toString().slice(-4)}`;

  try {
    const result = await db.query(
      `INSERT INTO repair_requests 
      (req_no, dept_id, equipment_name, purchase_date, original_cost, breakdown_date, prev_repaired, last_repair_info, market_value, est_repair_cost, fault_desc, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Submitted for Approval') RETURNING *`,
      [
        req_no, dept_id, equipment_name, purchase_date, original_cost, breakdown_date,
        prev_repaired ?? false, last_repair_info || '', market_value || 0, est_repair_cost, fault_desc
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
