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
    const filename = templatePath.split('/').pop() || 'GeneratedDocument.docx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Template Generation Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate template: ' + error.message });
  }
});

const DOC_FILE_NAMES = {
  'DOC-01': 'LDCE_CTE_Statement_1_Non_IT_Equipment',
  'DOC-02': 'LDCE_CTE_Statement_2_IT_Equipment',
  'DOC-03': 'LDCE_CTE_Statement_3_Furniture',
  'DOC-04': 'LDCE_CTE_Statement_4_Books_Periodicals',
  'DOC-05': 'LDCE_CTE_Statement_5_Maintenance_AMC',
  'DOC-06': 'LDCE_IT_Equipment_Summary_Sheet',
  'DOC-07': 'LDCE_CTE_Consolidated_Summary',
  'DOC-08': 'LDCE_Office_Order_Dept_Representatives',
  'DOC-09': 'LDCE_Office_Order_Expert_Committees',
  'DOC-10': 'LDCE_Office_Order_Special_Committees',
  'DOC-11': 'LDCE_Note_for_Change_in_Committee',
  'DOC-12': 'LDCE_Purchase_Indent_Govt_Fund',
  'DOC-13': 'LDCE_Purchase_Indent_Non_Govt_Fund',
  'DOC-14': 'LDCE_Technical_Specification_Sheet',
  'DOC-15': 'LDCE_Additional_Terms_And_Conditions_ATC',
  'DOC-16': 'LDCE_General_GeM_Guidelines_Sheet',
  'DOC-17': 'LDCE_Gujarati_Note_Sheet_Purchase',
  'DOC-18': 'LDCE_Note_for_Purchase_Other_Items',
  'DOC-19': 'LDCE_Checklist_A_Pre_Bid_Verification',
  'DOC-20': 'LDCE_Checklist_C_Custom_Bid_BOQ',
  'DOC-21': 'LDCE_EMD_Refund_Letter',
  'DOC-22': 'LDCE_Security_Deposit_Submission_Note',
  'DOC-23': 'LDCE_Bid_Scrutiny_Evaluation_Report',
  'DOC-24': 'LDCE_Reasons_for_Disqualification_Sheet',
  'DOC-25': 'LDCE_DLPC_Agenda_And_Proposal',
  'DOC-26': 'LDCE_DLPC_Rate_Reasonability_Certificate',
  'DOC-27': 'LDCE_DLPC_Minutes_of_Meeting_MOM',
  'DOC-28': 'LDCE_Checklist_B_Final_Approval',
  'DOC-29': 'LDCE_Note_Direct_Purchase_Against_Bid',
  'DOC-30': 'LDCE_DPC_Proposal_Document_Index',
  'DOC-31': 'LDCE_DPC_Forwarding_Letter_to_Principal',
  'DOC-32': 'LDCE_DPC_GeM_Agenda',
  'DOC-33': 'LDCE_Institute_BID_Certificate',
  'DOC-34': 'LDCE_DPC_L1_Information_Sheet',
  'DOC-35': 'LDCE_DPC_Minutes_of_Meeting_MOM',
  'DOC-36': 'LDCE_Department_Material_Receipt_Note',
  'DOC-37': 'LDCE_Technical_Inspection_Report',
  'DOC-38': 'LDCE_Pass_for_Payment_Voucher',
  'DOC-39': 'LDCE_Checklist_D_and_E_Bill_Verification',
  'DOC-40': 'LDCE_Procurement_Progress_Status_Report',
  'DOC-41': 'LDCE_Inquiry_Letter_Non_GeM',
  'DOC-42': 'LDCE_Comparative_Statement_Quotation',
  'DOC-43': 'LDCE_Purchase_Order_Non_GeM',
  'DOC-44': 'LDCE_Repairable_Equipment_Register',
  'DOC-45': 'LDCE_Note_for_Approval_of_Repairing',
  'DOC-46': 'LDCE_Work_Order_Equipment_Repair',
  'DOC-47': 'LDCE_Pass_for_Payment_Repair',
};

/**
 * GET /api/documents/:docId
 * Generates and downloads the specified document as a .docx file.
 */
router.get('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const { entityId, ...extra } = req.query;

    const buffer = await documentGenerator.generateDocument(docId, entityId || '0', extra);

    const baseName = DOC_FILE_NAMES[docId] || `LDCE_Document_${docId}`;
    const filename = `${baseName}${entityId && entityId !== '0' ? `_${entityId}` : ''}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error(`Document Generation Error [${req.params.docId}]:`, error);
    res.status(500).json({ success: false, error: 'Failed to generate document: ' + error.message });
  }
});

module.exports = router;

