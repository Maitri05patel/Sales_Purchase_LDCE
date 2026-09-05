const express = require('express');
const router = express.Router();
const documentGenerator = require('../services/DocumentGenerator');
const TemplateEngine = require('../services/TemplateEngine');

/**
 * GET /api/documents
 * Returns the full catalog of all 47 supported document IDs with metadata.
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    total: 47,
    catalog: [
      { docId: 'DOC-01', name: 'Statement 1 – Non-IT Equipment', phase: 2, entityParam: 'fin_year (query)' },
      { docId: 'DOC-02', name: 'Statement 2 – IT Equipment', phase: 2, entityParam: 'fin_year (query)' },
      { docId: 'DOC-03', name: 'Statement 3 – Furniture', phase: 2, entityParam: 'fin_year (query)' },
      { docId: 'DOC-04', name: 'Statement 4 – Books & Periodicals', phase: 2, entityParam: 'fin_year (query)' },
      { docId: 'DOC-05', name: 'Statement 5 – Maintenance & AMC', phase: 2, entityParam: 'fin_year (query)' },
      { docId: 'DOC-06', name: 'Summary of IT Items', phase: 2, entityParam: 'fin_year (query)' },
      { docId: 'DOC-07', name: 'CTE Consolidated Summary', phase: 2, entityParam: 'fin_year (query)' },
      { docId: 'DOC-08', name: 'Order – Dept. Representatives', phase: 1, entityParam: 'fin_year (query)' },
      { docId: 'DOC-09', name: 'Order – Expert Committees', phase: 1, entityParam: 'fin_year (query)' },
      { docId: 'DOC-10', name: 'Order – Special Committees', phase: 1, entityParam: 'committee_type (query)' },
      { docId: 'DOC-11', name: 'Note for Change in Committee', phase: 1, entityParam: 'N/A (pass data via query)' },
      { docId: 'DOC-12', name: 'Purchase Indent (Govt. Fund)', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-13', name: 'Purchase Indent (Non-Govt. Fund)', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-14', name: 'Specification Sheet', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-15', name: 'Additional Terms & Conditions (ATC)', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-16', name: 'General GeM Guidelines Sheet', phase: 3, entityParam: 'N/A' },
      { docId: 'DOC-17', name: 'Note for Purchase – New Item (Gujarati)', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-18', name: 'Note for Purchase – Other Items', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-19', name: 'Checklist A Verification', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-20', name: 'Checklist C Verification', phase: 3, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-21', name: 'EMD Refund Letter', phase: 4, entityParam: 'entityId = financial_instrument_id' },
      { docId: 'DOC-22', name: 'Note for Security Deposit (e-PBG)', phase: 4, entityParam: 'entityId = financial_instrument_id' },
      { docId: 'DOC-23', name: 'Bid Scrutiny Report', phase: 5, entityParam: 'entityId = bid_id' },
      { docId: 'DOC-24', name: 'Reasons for Disqualification', phase: 5, entityParam: 'entityId = bid_id' },
      { docId: 'DOC-25', name: 'DLPC Agenda & Proposal', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-26', name: 'DLPC Rate Reasonability Certificate', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-27', name: 'DLPC Minutes of Meeting (MOM)', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-28', name: 'Checklist B (DLPC Final Approval)', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-29', name: 'Note – Direct Purchase Against Bid', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-30', name: 'DPC Proposal Index', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-31', name: 'DPC Forwarding Letter', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-32', name: 'GeM Agenda Format – DPC', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-33', name: 'Institute BID Certificate', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-34', name: 'L1 INFO Sheet for DPC', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-35', name: 'DPC Minutes of Meeting (MOM)', phase: 5, entityParam: 'entityId = meeting_id' },
      { docId: 'DOC-36', name: 'Department Material Receipt Note', phase: 6, entityParam: 'entityId = order_id' },
      { docId: 'DOC-37', name: 'Technical Inspection Report', phase: 6, entityParam: 'entityId = inspection_id' },
      { docId: 'DOC-38', name: 'Pass for Payment Voucher', phase: 6, entityParam: 'entityId = voucher_id' },
      { docId: 'DOC-39', name: 'Checklist D & E Bill Verification', phase: 6, entityParam: 'entityId = voucher_id' },
      { docId: 'DOC-40', name: 'Procurement Progress Status Report', phase: 8, entityParam: 'fin_year (query)' },
      { docId: 'DOC-41', name: 'Inquiry Letter (Non-GeM)', phase: 7, entityParam: 'entityId = indent_id' },
      { docId: 'DOC-42', name: 'Comparative Statement', phase: 7, entityParam: 'pass data via query' },
      { docId: 'DOC-43', name: 'Purchase Order (PO – Non-GeM)', phase: 7, entityParam: 'entityId = order_id' },
      { docId: 'DOC-44', name: 'Repairable Equipment Register', phase: 7, entityParam: 'dept_id (query, optional)' },
      { docId: 'DOC-45', name: 'Note for Approval of Repairing', phase: 7, entityParam: 'entityId = repair_id' },
      { docId: 'DOC-46', name: 'Work Order (WO – Repairing)', phase: 7, entityParam: 'entityId = repair_id' },
      { docId: 'DOC-47', name: 'Pass for Payment (Non-GeM & Repair)', phase: 7, entityParam: 'pass data via query' },
    ]
  });
});

/**
 * GET /api/documents/template
 * Expects 'path' query parameter pointing to the .docx template file inside Format-Purchase-2026-27.
 * Any other query params are passed as template data.
 */
router.get('/template', async (req, res) => {
  try {
    const templatePath = req.query.path;
    if (!templatePath) {
      return res.status(400).json({ success: false, error: "'path' query parameter is required" });
    }
    const { path: _path, ...data } = req.query;
    const buffer = await TemplateEngine.generateDocument(templatePath, data);
    const filename = templatePath.replace(/\\/g, '/').split('/').pop() || 'GeneratedDocument.docx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);
  } catch (error) {
    console.error('Template Generation Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate template: ' + error.message });
  }
});

const DOC_FILE_NAMES = {
  'DOC-01': '1. Statement 1_Non-IT Equipments',
  'DOC-02': '2. Statement 2_IT Equipment',
  'DOC-03': '3. Statement 3_Furniture',
  'DOC-04': '4. Statement 4_Books',
  'DOC-05': '5. Statement 5_Maintenance',
  'DOC-06': '6. Summary_IT Items',
  'DOC-07': '7. Summary',
  'DOC-08': 'Order - Dept. Representatives',
  'DOC-09': 'Order - Expert Committees',
  'DOC-10': 'Order - Special Committees',
  'DOC-11': 'Note for Change in Committee',
  'DOC-12': 'Purchase Indent (Govt. Fund)',
  'DOC-13': 'Purchase Indent (Non-Govt. Fund)',
  'DOC-14': 'Technical Specification Sheet',
  'DOC-15': 'Additional Terms and Conditions (ATC)',
  'DOC-16': 'General GeM Guidelines Sheet',
  'DOC-17': 'Note for Purchase - New Item',
  'DOC-18': 'Note for Purchase - Other Items',
  'DOC-19': 'Checklist A - Pre-Bid Verification',
  'DOC-20': 'Checklist C - Custom Bid or BOQ',
  'DOC-21': 'EMD Refund Letter',
  'DOC-22': 'Note for Security Deposit (e-PBG)',
  'DOC-23': 'Bid Scrutiny Evaluation Report',
  'DOC-24': 'Reasons for Disqualification Sheet',
  'DOC-25': 'DLPC Agenda & Proposal',
  'DOC-26': 'DLPC Rate Reasonability Certificate',
  'DOC-27': 'DLPC Minutes of Meeting (MOM)',
  'DOC-28': 'Checklist B - Final Approval',
  'DOC-29': 'Note - Direct Purchase Against Bid',
  'DOC-30': 'DPC Proposal Document Index',
  'DOC-31': 'DPC Forwarding Letter to Principal',
  'DOC-32': 'GeM Agenda Format - DPC',
  'DOC-33': 'Institute BID Certificate',
  'DOC-34': 'L1 INFO Sheet for DPC',
  'DOC-35': 'DPC Minutes of Meeting (MOM)',
  'DOC-36': 'Department Material Receipt Note',
  'DOC-37': 'Technical Inspection Report',
  'DOC-38': 'Pass for Payment Voucher',
  'DOC-39': 'Checklist D & E - Bill Verification',
  'DOC-40': 'Procurement Progress Status Report',
  'DOC-41': 'Inquiry Letter (Non-GeM)',
  'DOC-42': 'Comparative Statement',
  'DOC-43': 'Purchase Order (Non-GeM)',
  'DOC-44': 'Repairable Equipment Register',
  'DOC-45': 'Note for Approval of Repairing',
  'DOC-46': 'Work Order (Repairing)',
  'DOC-47': 'Pass for Payment (Repairing)',
};

/**
 * GET /api/documents/:docId
 * Generates and downloads the specified document.
 */
router.get('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const { entityId, format, ...extra } = req.query;

    const isExcel = format === 'xlsx' || (!format && (docId === 'DOC-01' || docId === 'DOC-02' || docId === 'DOC-03' || docId === 'DOC-04' || docId === 'DOC-05' || docId === 'DOC-06' || docId === 'DOC-07'));
    const targetFormat = isExcel ? 'xlsx' : 'docx';

    const buffer = await documentGenerator.generateDocument(docId, entityId || '0', { ...extra, format: targetFormat });

    const baseName = DOC_FILE_NAMES[docId] || `Document_${docId}`;
    let suffix = '';
    if (extra.fin_year && ['DOC-01', 'DOC-02', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-06', 'DOC-07', 'DOC-08', 'DOC-09', 'DOC-10'].includes(docId)) {
      suffix = `_${extra.fin_year}`;
    } else if (entityId && entityId !== '0') {
      suffix = `_${entityId}`;
    }

    const filename = `${baseName}${suffix}.${targetFormat}`;

    res.setHeader('Content-Type', isExcel
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);
  } catch (error) {
    console.error(`Document Generation Error [${req.params.docId}]:`, error);
    res.status(500).json({ success: false, error: 'Failed to generate document: ' + error.message });
  }
});

module.exports = router;

