const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Executive Dashboard Metrics API
router.get('/metrics', async (req, res) => {
  try {
    const totalIndentsRes = await db.query('SELECT COUNT(*) as count, COALESCE(SUM(total_cost), 0) as total_val FROM indents');
    const totalCteRes = await db.query('SELECT COUNT(*) as count, COALESCE(SUM(total_cost), 0) as total_val FROM cte_demands');
    const pendingSanctionsRes = await db.query("SELECT COUNT(*) as count FROM note_sheets WHERE status = 'Pending Principal Sanction'");
    const passedVouchersRes = await db.query("SELECT COUNT(*) as count, COALESCE(SUM(net_payable), 0) as total_val FROM payment_vouchers");

    const statusPipelineRes = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM indents 
      GROUP BY status
    `);

    const grantBudgetsRes = await db.query(`
      SELECT budget_head, COUNT(*) as count, COALESCE(SUM(total_cost), 0) as total_allocated 
      FROM indents 
      GROUP BY budget_head
    `);

    const recentActivityRes = await db.query(`
      SELECT 'Indent' as type, indent_no as ref, item_name, total_cost as amount, status, created_at 
      FROM indents
      UNION ALL
      SELECT 'Pass for Payment' as type, voucher_no as ref, vendor_info as item_name, net_payable as amount, status, created_at 
      FROM payment_vouchers
      ORDER BY created_at DESC LIMIT 8
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalIndents: parseInt(totalIndentsRes.rows[0].count, 10),
          indentVal: parseFloat(totalIndentsRes.rows[0].total_val),
          totalCte: parseInt(totalCteRes.rows[0].count, 10),
          cteVal: parseFloat(totalCteRes.rows[0].total_val),
          pendingSanctions: parseInt(pendingSanctionsRes.rows[0].count, 10),
          vouchersPaid: parseInt(passedVouchersRes.rows[0].count, 10),
          paidVal: parseFloat(passedVouchersRes.rows[0].total_val)
        },
        pipeline: statusPipelineRes.rows,
        grantBudgets: grantBudgetsRes.rows,
        recentActivity: recentActivityRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
