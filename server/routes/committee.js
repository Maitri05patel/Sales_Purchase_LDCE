const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get committee meetings
router.get('/meetings', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, i.item_name, i.fund_type, d.name as dept_name 
      FROM committee_meetings m
      LEFT JOIN indents i ON m.indent_id = i.id
      LEFT JOIN departments d ON i.dept_id = d.id
      ORDER BY m.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create DLPC / DPC Sanction (FORM-09)
router.post('/meetings', async (req, res) => {
  const {
    committee_type, meeting_ref, meeting_date, indent_id, bid_id,
    l1_vendor, l1_amount, rate_reasonability, recommendation, attendee_ids, chk_b_verified
  } = req.body;

  if (!committee_type || !meeting_ref || !l1_vendor || !l1_amount) {
    return res.status(400).json({ success: false, error: 'Missing mandatory committee sanction fields' });
  }

  try {
    const result = await db.executeTransaction(async (client) => {
      const resMeet = await client.query(
        `INSERT INTO committee_meetings 
        (committee_type, meeting_ref, meeting_date, indent_id, bid_id, l1_vendor, l1_amount, rate_reasonability, recommendation, attendee_ids, chk_b_verified, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Sanctioned')
        RETURNING *`,
        [
          committee_type, meeting_ref, meeting_date || new Date(), indent_id || null, bid_id || null,
          l1_vendor, l1_amount, rate_reasonability || '', recommendation || '', attendee_ids || [], chk_b_verified ?? true
        ]
      );

      // Auto-generate Purchase Order record
      const poNo = `PO/${new Date().getFullYear()}/${resMeet.rows[0].id}`;
      await client.query(
        `INSERT INTO purchase_orders (order_no, indent_id, meeting_id, supplier_name, supplier_address, total_value, order_date)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)`,
        [poNo, indent_id || null, resMeet.rows[0].id, l1_vendor, 'Vendor Address', l1_amount]
      );

      if (indent_id) {
        await client.query("UPDATE indents SET status = 'Sanctioned' WHERE id = $1", [indent_id]);
      }

      return resMeet.rows[0];
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
