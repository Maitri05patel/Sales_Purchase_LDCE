const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authorize } = require('../middleware/auth');
const ExcelJS = require('exceljs');


// Get all financial instruments
router.get('/instruments', authorize('StoreOfficer', 'Principal', 'AccountsOfficer'), async (req, res) => {
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

// Export EMD / e-PBG Ledger to Excel matching LDCE Excel Register format
router.get('/export-excel', authorize('StoreOfficer', 'Principal', 'AccountsOfficer'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM financial_instruments ORDER BY id ASC');
    const records = result.rows;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LDCE Store & Purchase Management System';
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Sr.No.', key: 'sr_no', width: 10 },
      { header: 'Email Address', key: 'email_address', width: 28 },
      { header: 'Department', key: 'department', width: 24 },
      { header: 'Name of Item/ Service', key: 'item_service_name', width: 35 },
      { header: 'Bid Number', key: 'bid_order_no', width: 24 },
      { header: 'Bid Start Date', key: 'bid_start_date', width: 15 },
      { header: 'Bid End Date', key: 'bid_end_date', width: 15 },
      { header: 'Bid Estimated Value', key: 'bid_estimated_value', width: 18 },
      { header: 'EMD / e-PBG number', key: 'dd_number', width: 18 },
      { header: 'EMD/e-PBG dt', key: 'dd_date', width: 15 },
      { header: 'Amount of EMD/ e-PBG submitted by the Party', key: 'amount', width: 25 },
      { header: 'Name of Bank', key: 'bank_name', width: 20 },
      { header: 'If other bank then Specify', key: 'other_bank_specify', width: 22 },
      { header: 'Details of Party with Complete Address', key: 'vendor_details', width: 45 },
      { header: 'Nature of document', key: 'instrument_type', width: 18 },
      { header: 'Date of inward Original Hard Copy( ie EMD must be before end date )', key: 'inward_date', width: 28 },
      { header: 'Remarks', key: 'remarks', width: 20 },
      { header: 'Amount in Rupees', key: 'amount_in_rupees', width: 28 },
      { header: 'Remarks-2', key: 'remarks_2', width: 20 }
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E7145' } // Excel Green
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });

    // Populate data
    records.forEach((r, idx) => {
      const vendorDetails = r.vendor_address 
        ? `${r.vendor_name || ''}, ${r.vendor_address}`
        : (r.vendor_name || '');

      const row = worksheet.addRow({
        timestamp: r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '',
        sr_no: r.sr_no || (idx + 1).toString(),
        email_address: r.email_address || '',
        department: r.department || '',
        item_service_name: r.item_service_name || '',
        bid_order_no: r.bid_order_no || '',
        bid_start_date: r.bid_start_date ? new Date(r.bid_start_date).toLocaleDateString('en-GB') : '',
        bid_end_date: r.bid_end_date ? new Date(r.bid_end_date).toLocaleDateString('en-GB') : '',
        bid_estimated_value: r.bid_estimated_value ? parseFloat(r.bid_estimated_value) : '',
        dd_number: r.dd_number || '',
        dd_date: r.dd_date ? new Date(r.dd_date).toLocaleDateString('en-GB') : '',
        amount: r.amount ? parseFloat(r.amount) : '',
        bank_name: r.bank_name || '',
        other_bank_specify: r.other_bank_specify || '',
        vendor_details: vendorDetails,
        instrument_type: r.instrument_type || 'EMD',
        inward_date: r.inward_date ? new Date(r.inward_date).toLocaleDateString('en-GB') : '',
        remarks: r.remarks || '',
        amount_in_rupees: r.amount_in_rupees || '',
        remarks_2: r.remarks_2 || ''
      });

      row.height = 22;
      row.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
    });

    const filename = `LDCE-Bid_EMD_e-PBG_details_${new Date().getFullYear()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exporting EMD excel:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create financial instrument (FORM-07 / Excel Row)
router.post('/instruments', authorize('StoreOfficer', 'AccountsOfficer', 'Principal'), async (req, res) => {

  const {
    sr_no,
    email_address,
    department,
    item_service_name,
    bid_order_no,
    bid_start_date,
    bid_end_date,
    bid_estimated_value,
    dd_number,
    dd_date,
    amount,
    bank_name,
    other_bank_specify,
    vendor_name,
    vendor_address,
    instrument_type,
    inward_date,
    remarks,
    amount_in_rupees,
    remarks_2,
    status
  } = req.body;

  if (!bid_order_no || !vendor_name || !dd_number || !dd_date || !amount || !bank_name) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: Bid Number, Vendor Name, D.D./e-PBG Number, Date, Amount, and Bank Name are required.' 
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO financial_instruments 
      (sr_no, email_address, department, item_service_name, bid_order_no, 
       bid_start_date, bid_end_date, bid_estimated_value, dd_number, dd_date, 
       amount, bank_name, other_bank_specify, vendor_name, vendor_address, 
       instrument_type, inward_date, remarks, amount_in_rupees, remarks_2, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        sr_no || null,
        email_address || null,
        department || null,
        item_service_name || null,
        bid_order_no,
        bid_start_date || null,
        bid_end_date || null,
        bid_estimated_value ? parseFloat(bid_estimated_value) : null,
        dd_number,
        dd_date,
        parseFloat(amount),
        bank_name,
        other_bank_specify || null,
        vendor_name,
        vendor_address || '',
        instrument_type || 'EMD',
        inward_date || null,
        remarks || null,
        amount_in_rupees || null,
        remarks_2 || null,
        status || 'Held in Store'
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error inserting financial instrument:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update status (e.g. Refunded to Vendor, Deposited in Account)
router.put('/instruments/:id/status', authorize('StoreOfficer', 'AccountsOfficer'), async (req, res) => {
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

