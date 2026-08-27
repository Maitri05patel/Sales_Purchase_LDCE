const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all bids
router.get('/bids', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, i.item_name, i.total_cost as est_cost, d.name as dept_name 
      FROM bids b
      LEFT JOIN indents i ON b.indent_id = i.id
      LEFT JOIN departments d ON i.dept_id = d.id
      ORDER BY b.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new Bid
router.post('/bids', async (req, res) => {
  const { bid_no, indent_id, bid_publish_date, bid_end_date, bid_opening_date } = req.body;
  try {
    const result = await db.executeTransaction(async (client) => {
      const resBid = await client.query(
        `INSERT INTO bids (bid_no, indent_id, bid_publish_date, bid_end_date, bid_opening_date, status)
         VALUES ($1, $2, $3, $4, $5, 'Published') RETURNING *`,
        [bid_no, indent_id || null, bid_publish_date, bid_end_date, bid_opening_date]
      );
      if (indent_id) {
        await client.query("UPDATE indents SET status = 'Bid_Published' WHERE id = $1", [indent_id]);
      }
      return resBid.rows[0];
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get technical scrutiny evaluations for a bid
router.get('/evaluations/:bidId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM scrutiny_details WHERE bid_id = $1 ORDER BY id ASC',
      [req.params.bidId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add bidder technical evaluation (FORM-08)
router.post('/evaluations', async (req, res) => {
  const { bid_id, bidder_name, param_specs, param_turnover, param_atc, disqualify_reason } = req.body;
  if (!bid_id || !bidder_name) {
    return res.status(400).json({ success: false, error: 'Bid ID and Bidder Name required' });
  }

  const final_tech_status = (param_specs === 'Qualified' && param_turnover === 'Qualified' && param_atc === 'Qualified')
    ? 'Qualified'
    : 'Disqualified';

  try {
    const result = await db.query(
      `INSERT INTO scrutiny_details 
      (bid_id, bidder_name, param_specs, param_turnover, param_atc, final_tech_status, disqualify_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [bid_id, bidder_name, param_specs || 'Qualified', param_turnover || 'Qualified', param_atc || 'Qualified', final_tech_status, disqualify_reason || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
