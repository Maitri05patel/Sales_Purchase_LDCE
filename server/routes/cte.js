const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all CTE demands with filtering
router.get('/demands', async (req, res) => {
  const { fin_year, category, dept_id } = req.query;
  let queryText = `
    SELECT c.*, d.name as dept_name, d.code as dept_code 
    FROM cte_demands c
    JOIN departments d ON c.dept_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (fin_year) {
    params.push(fin_year);
    queryText += ` AND c.fin_year = $${params.length}`;
  }
  if (category) {
    params.push(category);
    queryText += ` AND c.category = $${params.length}`;
  }
  if (dept_id) {
    params.push(dept_id);
    queryText += ` AND c.dept_id = $${params.length}`;
  }

  queryText += ' ORDER BY c.id DESC';

  try {
    const result = await db.query(queryText, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create CTE demand (Statement 1 to 5)
router.post('/demands', async (req, res) => {
  const {
    fin_year, category, dept_id, item_name, qty, unit_rate,
    gem_available, gem_id, grant_head, against_condemn, norm_qty,
    available_qty, stock_condition, lifespan, maint_plan, justification
  } = req.body;

  if (!fin_year || !category || !dept_id || !item_name || !qty || !unit_rate) {
    return res.status(400).json({ success: false, error: 'Missing mandatory fields' });
  }

  const total_cost = parseFloat(qty) * parseFloat(unit_rate);

  try {
    const result = await db.query(
      `INSERT INTO cte_demands 
      (fin_year, category, dept_id, item_name, qty, unit_rate, total_cost, gem_available, gem_id, grant_head, against_condemn, norm_qty, available_qty, stock_condition, lifespan, maint_plan, justification)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        fin_year, category, dept_id, item_name, qty, unit_rate, total_cost,
        gem_available ?? true, gem_id || null, grant_head || 'State Grant (TED-5)',
        against_condemn ?? false, norm_qty || 0, available_qty || 0,
        stock_condition || 'Working', lifespan || '', maint_plan || '', justification
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CTE Consolidated Summary
router.get('/summary', async (req, res) => {
  try {
    const categorySummary = await db.query(`
      SELECT category, COUNT(*) as item_count, SUM(total_cost) as total_amount
      FROM cte_demands
      GROUP BY category
    `);

    const grantSummary = await db.query(`
      SELECT grant_head, COUNT(*) as item_count, SUM(total_cost) as total_amount
      FROM cte_demands
      GROUP BY grant_head
    `);

    res.json({
      success: true,
      byCategory: categorySummary.rows,
      byGrant: grantSummary.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
