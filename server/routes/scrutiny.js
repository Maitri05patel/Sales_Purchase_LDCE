const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authorize } = require('../middleware/auth');

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
router.post('/bids', authorize('StoreOfficer'), async (req, res) => {
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

// Update scrutiny parameters for a bid
router.put('/bids/:id/params', authorize('ExpertMember', 'StoreOfficer', 'HOD'), async (req, res) => {
  const { scrutiny_params } = req.body;
  if (!Array.isArray(scrutiny_params)) {
    return res.status(400).json({ success: false, error: 'scrutiny_params must be an array of strings' });
  }
  try {
    const result = await db.query(
      `UPDATE bids SET scrutiny_params = $1 WHERE id = $2 RETURNING *`,
      [JSON.stringify(scrutiny_params), req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add bidder technical evaluation (FORM-08)
router.post('/evaluations', authorize('ExpertMember', 'StoreOfficer', 'HOD'), async (req, res) => {
  const {
    bid_id,
    bidder_name,
    bidder_address,
    param_turnover = 'Yes',
    param_experience = 'Yes',
    param_oem = 'Yes',
    param_specs = 'Yes',
    param_atc = 'Yes',
    param_emd = 'Yes',
    param_gst = 'Yes',
    param_datasheet = 'Yes',
    param_warranty = 'Yes',
    param_undertaking = 'Yes',
    param_evaluations = {},
    disqualify_reason
  } = req.body;

  if (!bid_id || !bidder_name) {
    return res.status(400).json({ success: false, error: 'Bid ID and Bidder Name required' });
  }

  // Strictly evaluate Yes / No values
  const isNo = (val) => val === 'No' || val === 'Disqualified' || val === 'false' || val === false;
  const toYesNo = (val) => isNo(val) ? 'No' : 'Yes';

  const tTurnover = toYesNo(param_turnover);
  const tExp = toYesNo(param_experience);
  const tOem = toYesNo(param_oem);
  const tSpecs = toYesNo(param_specs);
  const tAtc = toYesNo(param_atc);
  const tEmd = toYesNo(param_emd);
  const tGst = toYesNo(param_gst);
  const tData = toYesNo(param_datasheet);
  const tWar = toYesNo(param_warranty);
  const tUnd = toYesNo(param_undertaking);

  // Normalize dynamic param_evaluations
  const normalizedDynamic = {};
  if (typeof param_evaluations === 'object' && param_evaluations !== null) {
    for (const [k, v] of Object.entries(param_evaluations)) {
      normalizedDynamic[k] = toYesNo(v);
    }
  }

  // Check qualification
  const standardAllYes = [tTurnover, tExp, tOem, tSpecs, tAtc, tEmd, tGst, tData, tWar, tUnd].every(v => v === 'Yes');
  const dynamicHasNo = Object.values(normalizedDynamic).some(v => v === 'No');
  const final_tech_status = (Object.keys(normalizedDynamic).length > 0)
    ? (dynamicHasNo ? 'Disqualified' : 'Qualified')
    : (standardAllYes ? 'Qualified' : 'Disqualified');

  try {
    const result = await db.query(
      `INSERT INTO scrutiny_details 
      (bid_id, bidder_name, bidder_address,
       param_turnover, param_experience, param_oem, param_specs, param_atc,
       param_emd, param_gst, param_datasheet, param_warranty, param_undertaking,
       param_evaluations, final_tech_status, disqualify_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        bid_id, bidder_name, bidder_address || null,
        tTurnover, tExp, tOem, tSpecs, tAtc,
        tEmd, tGst, tData, tWar, tUnd,
        JSON.stringify(normalizedDynamic), final_tech_status, disqualify_reason || null
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete bidder evaluation
router.delete('/evaluations/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM scrutiny_details WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Evaluation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
