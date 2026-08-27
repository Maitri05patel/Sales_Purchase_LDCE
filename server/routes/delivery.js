const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get purchase orders
router.get('/orders', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT po.*, i.item_name, d.name as dept_name 
      FROM purchase_orders po
      LEFT JOIN indents i ON po.indent_id = i.id
      LEFT JOIN departments d ON i.dept_id = d.id
      ORDER BY po.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create Inspection (FORM-10)
router.post('/inspections', async (req, res) => {
  const {
    order_id, invoice_no_date, receipt_date, inspection_date,
    serial_numbers, specs_verified, accessories_ok, working_status, inspector_ids
  } = req.body;

  if (!order_id || !invoice_no_date || !serial_numbers) {
    return res.status(400).json({ success: false, error: 'Missing mandatory inspection fields' });
  }

  try {
    const result = await db.query(
      `INSERT INTO inspections 
      (order_id, invoice_no_date, receipt_date, inspection_date, serial_numbers, specs_verified, accessories_ok, working_status, inspector_ids)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        order_id, invoice_no_date, receipt_date || new Date(), inspection_date || new Date(),
        serial_numbers, specs_verified ?? true, accessories_ok ?? true,
        working_status || 'Fully Functional & Accepted', inspector_ids || []
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create Pass for Payment Voucher (FORM-11) with ACID calculation
router.post('/vouchers', async (req, res) => {
  const {
    inspection_id, sanction_ref, vendor_info, gross_amount,
    stock_folio_no, account_head, sd_retained, other_deductions, chk_de_verified
  } = req.body;

  if (!inspection_id || !sanction_ref || !gross_amount || !stock_folio_no || !account_head) {
    return res.status(400).json({ success: false, error: 'Missing mandatory payment voucher fields' });
  }

  const gross = parseFloat(gross_amount);
  const sd = parseFloat(sd_retained || 0);
  const ded = parseFloat(other_deductions || 0);
  const net_payable = gross - (sd + ded);
  const voucher_no = `VOUCH/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;

  try {
    const result = await db.executeTransaction(async (client) => {
      const resVoucher = await client.query(
        `INSERT INTO payment_vouchers 
        (voucher_no, inspection_id, sanction_ref, vendor_info, gross_amount, stock_folio_no, account_head, sd_retained, other_deductions, net_payable, chk_de_verified, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Passed for Payment')
        RETURNING *`,
        [
          voucher_no, inspection_id, sanction_ref, vendor_info || 'Vendor Info', gross,
          stock_folio_no, account_head, sd, ded, net_payable, chk_de_verified ?? true
        ]
      );

      // Update associated indent status to Completed
      const insRes = await client.query(
        `SELECT po.indent_id FROM inspections ins JOIN purchase_orders po ON ins.order_id = po.id WHERE ins.id = $1`,
        [inspection_id]
      );
      if (insRes.rows.length > 0 && insRes.rows[0].indent_id) {
        await client.query("UPDATE indents SET status = 'Completed' WHERE id = $1", [insRes.rows[0].indent_id]);
      }

      return resVoucher.rows[0];
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get payment vouchers list
router.get('/vouchers', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, ins.invoice_no_date, po.order_no 
      FROM payment_vouchers v
      JOIN inspections ins ON v.inspection_id = ins.id
      JOIN purchase_orders po ON ins.order_id = po.id
      ORDER BY v.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
