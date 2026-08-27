const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { generateGujaratiNoteSheetDocx } = require('../services/docxGenerator');

// Get all indents
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.*, d.name as dept_name, d.code as dept_code, u.name as indenter_name
      FROM indents i
      JOIN departments d ON i.dept_id = d.id
      LEFT JOIN users u ON i.indenter_user_id = u.id
      ORDER BY i.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new Purchase Indent (FORM-03) with ACID Transaction
router.post('/', async (req, res) => {
  const {
    fund_type, budget_head, dept_id, indenter_user_id,
    item_name, item_description, quantity, unit_cost, gem_details
  } = req.body;

  if (!fund_type || !budget_head || !dept_id || !item_name || !quantity || !unit_cost) {
    return res.status(400).json({ success: false, error: 'Missing mandatory fields' });
  }

  const total_cost = parseFloat(quantity) * parseFloat(unit_cost);
  const indent_no = `IND/${new Date().getFullYear()}/${dept_id}/${Date.now().toString().slice(-4)}`;

  try {
    const result = await db.executeTransaction(async (client) => {
      const resIndent = await client.query(
        `INSERT INTO indents 
        (indent_no, fund_type, budget_head, dept_id, indenter_user_id, indent_date, item_name, item_description, quantity, unit_cost, total_cost, gem_details, status)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9, $10, $11, 'Initiated')
        RETURNING *`,
        [indent_no, fund_type, budget_head, dept_id, indenter_user_id || null, item_name, item_description, quantity, unit_cost, total_cost, gem_details || '']
      );
      return resIndent.rows[0];
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get full details of an Indent (Specs, ATC, Note Sheets)
router.get('/:id/full', async (req, res) => {
  const indentId = req.params.id;
  try {
    const indent = await db.query(
      `SELECT i.*, d.name as dept_name, d.code as dept_code FROM indents i JOIN departments d ON i.dept_id = d.id WHERE i.id = $1`,
      [indentId]
    );
    if (indent.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Indent not found' });
    }

    const specs = await db.query(`SELECT * FROM specifications WHERE indent_id = $1`, [indentId]);
    const atc = await db.query(`SELECT * FROM atc_terms WHERE indent_id = $1`, [indentId]);
    const noteSheet = await db.query(`SELECT * FROM note_sheets WHERE indent_id = $1 ORDER BY id DESC LIMIT 1`, [indentId]);

    res.json({
      success: true,
      data: {
        indent: indent.rows[0],
        specs: specs.rows[0] || null,
        atc: atc.rows[0] || null,
        noteSheet: noteSheet.rows[0] || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create/Update Specifications (FORM-04)
router.post('/:id/specs', async (req, res) => {
  const indentId = req.params.id;
  const { detailed_specs, spec_notes, expert_signatures, consignees } = req.body;

  try {
    const result = await db.executeTransaction(async (client) => {
      // Get item name from indent
      const indRes = await client.query('SELECT item_name FROM indents WHERE id = $1', [indentId]);
      if (indRes.rows.length === 0) throw new Error('Indent not found');
      const itemName = indRes.rows[0].item_name;

      const specRes = await client.query(
        `INSERT INTO specifications (indent_id, item_name, detailed_specs, notes, expert_signatures)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (indent_id) DO UPDATE SET
           detailed_specs = EXCLUDED.detailed_specs,
           notes = EXCLUDED.notes,
           expert_signatures = EXCLUDED.expert_signatures,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [indentId, itemName, detailed_specs, spec_notes || '', expert_signatures || []]
      );

      // Save Consignees if provided
      if (consignees && Array.isArray(consignees)) {
        await client.query('DELETE FROM consignee_allocations WHERE spec_id = $1', [specRes.rows[0].id]);
        for (const c of consignees) {
          if (c.dept_id && c.quantity) {
            await client.query(
              'INSERT INTO consignee_allocations (spec_id, dept_id, quantity) VALUES ($1, $2, $3)',
              [specRes.rows[0].id, c.dept_id, c.quantity]
            );
          }
        }
      }

      await client.query("UPDATE indents SET status = 'Specs_Defined' WHERE id = $1", [indentId]);
      return specRes.rows[0];
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create/Update ATC Terms (FORM-05)
router.post('/:id/atc', async (req, res) => {
  const indentId = req.params.id;
  const {
    delivery_location, installation_scope, service_interval,
    response_time, max_downtime, warranty_period, local_office_clause,
    epbg_percentage, emd_amount
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO atc_terms 
      (indent_id, delivery_location, installation_scope, service_interval, response_time, max_downtime, warranty_period, local_office_clause, epbg_percentage, emd_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (indent_id) DO UPDATE SET
        delivery_location = EXCLUDED.delivery_location,
        installation_scope = EXCLUDED.installation_scope,
        service_interval = EXCLUDED.service_interval,
        response_time = EXCLUDED.response_time,
        max_downtime = EXCLUDED.max_downtime,
        warranty_period = EXCLUDED.warranty_period,
        local_office_clause = EXCLUDED.local_office_clause,
        epbg_percentage = EXCLUDED.epbg_percentage,
        emd_amount = EXCLUDED.emd_amount
      RETURNING *`,
      [
        indentId, delivery_location, installation_scope, service_interval,
        response_time, max_downtime, warranty_period, local_office_clause,
        epbg_percentage || 5.00, emd_amount || 0.00
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create/Update Gujarati Note Sheet (FORM-06)
router.post('/:id/note-sheet', async (req, res) => {
  const indentId = req.params.id;
  const {
    dept_id, scheme_year, item_name_guj, qty_str, total_amount,
    amount_words_guj, procurement_mode, budget_head, chk_a_verified, chk_c_verified, content_guj
  } = req.body;

  const note_no = `NOTE/${new Date().getFullYear()}/${indentId}`;

  try {
    const result = await db.executeTransaction(async (client) => {
      const resNote = await client.query(
        `INSERT INTO note_sheets 
        (note_no, indent_id, dept_id, scheme_year, item_name_guj, qty_str, total_amount, amount_words_guj, procurement_mode, budget_head, chk_a_verified, chk_c_verified, content_guj, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending Principal Sanction')
        RETURNING *`,
        [
          note_no, indentId, dept_id, scheme_year, item_name_guj, qty_str, total_amount,
          amount_words_guj, procurement_mode, budget_head, chk_a_verified ?? true, chk_c_verified ?? false, content_guj
        ]
      );

      await client.query("UPDATE indents SET status = 'Admin_Approved' WHERE id = $1", [indentId]);
      return resNote.rows[0];
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export Editable Gujarati Note Sheet as Microsoft Word (.docx) Document!
router.get('/:id/docx-note', async (req, res) => {
  const indentId = req.params.id;
  try {
    const noteRes = await db.query(
      `SELECT n.*, d.name as dept_name, d.code as dept_code 
       FROM note_sheets n 
       JOIN departments d ON n.dept_id = d.id 
       WHERE n.indent_id = $1 
       ORDER BY n.id DESC LIMIT 1`,
      [indentId]
    );

    if (noteRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Note sheet not found for this indent.' });
    }

    const docxBuffer = await generateGujaratiNoteSheetDocx(noteRes.rows[0]);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=Gujarati_Note_Sheet_Indent_${indentId}.docx`);
    res.send(docxBuffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
