const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all financial instruments
router.get('/instruments', async (req, res) => {
  const { type, status } = req.query;
  let queryText = 'SELECT * FROM financial_instruments WHERE 1=1';
  const params = [];

  if (type) {
    params.push(type);
    queryText += ` AND instrument_type = $${params.length}`;
  }
  if (status) {
    params.push(status);
    queryText += ` AND status = $${params.length}`;
  }

  queryText += ' ORDER BY id DESC';

  try {
    const result = await db.query(queryText, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create financial instrument (FORM-07)
router.post('/instruments', async (req, res) => {
  const {
    instrument_type, bid_order_no, vendor_name, vendor_address,
    dd_number, dd_date, amount, bank_name, status
  } = req.body;

  if (!instrument_type || !bid_order_no || !vendor_name || !dd_number || !dd_date || !amount || !bank_name) {
    return res.status(400).json({ success: false, error: 'Missing required financial instrument fields' });
  }

  try {
    const result = await db.query(
      `INSERT INTO financial_instruments 
      (instrument_type, bid_order_no, vendor_name, vendor_address, dd_number, dd_date, amount, bank_name, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [instrument_type, bid_order_no, vendor_name, vendor_address || '', dd_number, dd_date, amount, bank_name, status || 'Held in Store']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update status (e.g. Refunded to Vendor, Deposited in Account)
router.put('/instruments/:id/status', async (req, res) => {
  const id = req.params.id;
  const { status, refund_ref } = req.body;
  try {
    const result = await db.query(
      `UPDATE financial_instruments 
       SET status = $1, refund_ref = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [status, refund_ref || null, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
