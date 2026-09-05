/**
 * DocumentGenerator.js
 * Central dispatcher — fetches live DB data and routes to the correct generator.
 * Supports all 47 documents (DOC-01 through DOC-47).
 */
const db = require('../config/db');

// Existing generators (unchanged)
const doc12Indent = require('./generators/DOC-12-Indent');
const doc17NoteSheet = require('./generators/DOC-17-NoteSheet');

// New generators — all 47 documents
const { DOCCTEStatements, DOCITSummary, DOCCTESummary } = require('./generators/DOC-01-07-CTE');
const DOCCommitteeOrders = require('./generators/DOC-08-11-Committee');
const { DOCIndentNonGovt, DOCSpecificationSheet, DOCATC, DOCGeMGuidelines, DOCNoteOtherItems, DOCChecklistA, DOCChecklistC } = require('./generators/DOC-13-20-Indent');
const { DOCEMDRefund, DOCSecurityDepositNote } = require('./generators/DOC-21-22-EMD');
const { DOCScrutinyReport, DOCDisqualificationSheet, DOCDLPCAgenda, DOCRateReasonability, DOCDLPCMOM, DOCChecklistB, DOCDirectPurchaseNote } = require('./generators/DOC-23-29-DLPC');
const { DOCDPCIndex, DOCDPCForwardingLetter, DOCDPCAgenda, DOCInstituteBIDCertificate, DOCL1InfoSheet, DOCDPCMOM } = require('./generators/DOC-30-35-DPC');
const { DOCReceiptNote, DOCInspectionReport, DOCPassForPayment, DOCChecklistDE, DOCProcurementStatus } = require('./generators/DOC-36-40-Delivery');
const { DOCInquiryLetter, DOCComparativeStatement, DOCPurchaseOrderNonGeM, DOCRepairableEquipment, DOCRepairApprovalNote, DOCWorkOrder, DOCPassForPaymentRepair } = require('./generators/DOC-41-47-Services');
const { generateGujaratiNoteSheetDocx } = require('./docxGenerator');

// ─── DB Fetch Helpers ──────────────────────────────────────────────────────────

async function fetchCTEData(fin_year, category) {
  const res = await db.query(`
    SELECT c.*, d.name as dept_name, d.code as dept_code
    FROM cte_demands c JOIN departments d ON c.dept_id = d.id
    WHERE ($1::text IS NULL OR c.fin_year = $1)
      AND ($2::text IS NULL OR c.category = $2)
    ORDER BY d.name, c.item_name
  `, [fin_year || null, category || null]);
  return res.rows;
}

async function fetchIndent(id) {
  const res = await db.query(`
    SELECT i.*, d.name as dept_name, d.code as dept_code, u.name as indenter_name
    FROM indents i
    JOIN departments d ON i.dept_id = d.id
    LEFT JOIN users u ON i.indenter_user_id = u.id
    WHERE i.id = $1`, [id]);
  return res.rows[0];
}

async function fetchSpecsWithConsignees(indent_id) {
  const specRes = await db.query(`
    SELECT s.*, i.indent_no, i.fund_type, d.name as dept_name
    FROM specifications s
    JOIN indents i ON s.indent_id = i.id
    JOIN departments d ON i.dept_id = d.id
    WHERE s.indent_id = $1`, [indent_id]);
  const spec = specRes.rows[0];
  if (!spec) return null;
  const conRes = await db.query(`
    SELECT ca.*, d.name as dept_name FROM consignee_allocations ca
    JOIN departments d ON ca.dept_id = d.id
    WHERE ca.spec_id = $1`, [spec.id]);
  spec.consignees = conRes.rows;
  return spec;
}

async function fetchATC(indent_id) {
  const indent = await fetchIndent(indent_id);
  const res = await db.query('SELECT * FROM atc_terms WHERE indent_id = $1', [indent_id]);
  return { ...res.rows[0], item_name: indent?.item_name, indent_no: indent?.indent_no };
}

async function fetchNoteSheet(indent_id) {
  const res = await db.query(`
    SELECT n.*, d.name as dept_name FROM note_sheets n
    JOIN departments d ON n.dept_id = d.id
    WHERE n.indent_id = $1 ORDER BY n.id DESC LIMIT 1`, [indent_id]);
  return res.rows[0];
}

async function fetchFinancialInstrument(id) {
  const res = await db.query('SELECT * FROM financial_instruments WHERE id = $1', [id]);
  const fi = res.rows[0];
  if (!fi) return null;
  // Try to get item name from bid
  const bidRes = await db.query(`
    SELECT b.*, i.item_name FROM bids b
    LEFT JOIN indents i ON b.indent_id = i.id
    WHERE b.bid_no = $1`, [fi.bid_order_no]);
  fi.item_name = bidRes.rows[0]?.item_name || '';
  return fi;
}

async function fetchBidWithScrutiny(bid_id) {
  const bidRes = await db.query(`
    SELECT b.*, i.item_name, i.total_cost as est_cost, d.name as dept_name
    FROM bids b LEFT JOIN indents i ON b.indent_id = i.id
    LEFT JOIN departments d ON i.dept_id = d.id
    WHERE b.id = $1`, [bid_id]);
  const bid = bidRes.rows[0];
  if (!bid) return null;
  const scrRes = await db.query('SELECT * FROM scrutiny_details WHERE bid_id = $1 ORDER BY id ASC', [bid_id]);
  bid.bidders = scrRes.rows;
  return bid;
}

async function fetchMeeting(meeting_id) {
  const res = await db.query(`
    SELECT m.*, i.item_name, i.total_cost as est_cost, i.budget_head, d.name as dept_name,
           b.bid_no, b.bid_publish_date, b.bid_end_date
    FROM committee_meetings m
    LEFT JOIN indents i ON m.indent_id = i.id
    LEFT JOIN departments d ON i.dept_id = d.id
    LEFT JOIN bids b ON m.bid_id = b.id
    WHERE m.id = $1`, [meeting_id]);
  const meeting = res.rows[0];
  if (!meeting) return null;
  // Fetch attendees
  if (meeting.attendee_ids && meeting.attendee_ids.length > 0) {
    const attRes = await db.query(
      `SELECT u.*, d.name as dept_name FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ANY($1)`,
      [meeting.attendee_ids]
    );
    meeting.attendees = attRes.rows;
  } else {
    meeting.attendees = [];
  }
  return meeting;
}

async function fetchOrder(order_id) {
  const res = await db.query(`
    SELECT po.*, i.item_name, d.name as dept_name
    FROM purchase_orders po
    LEFT JOIN indents i ON po.indent_id = i.id
    LEFT JOIN departments d ON i.dept_id = d.id
    WHERE po.id = $1`, [order_id]);
  return res.rows[0];
}

async function fetchInspection(inspection_id) {
  const res = await db.query(`
    SELECT ins.*, po.order_no, po.supplier_name, po.supplier_address, po.total_value,
           i.item_name, d.name as dept_name
    FROM inspections ins
    JOIN purchase_orders po ON ins.order_id = po.id
    LEFT JOIN indents i ON po.indent_id = i.id
    LEFT JOIN departments d ON i.dept_id = d.id
    WHERE ins.id = $1`, [inspection_id]);
  return res.rows[0];
}

async function fetchVoucher(voucher_id) {
  const res = await db.query(`
    SELECT v.*, ins.invoice_no_date, ins.receipt_date, ins.inspection_date,
           ins.serial_numbers, ins.specs_verified, ins.accessories_ok, ins.working_status,
           po.order_no, po.supplier_name, po.total_value,
           i.item_name, d.name as dept_name
    FROM payment_vouchers v
    JOIN inspections ins ON v.inspection_id = ins.id
    JOIN purchase_orders po ON ins.order_id = po.id
    LEFT JOIN indents i ON po.indent_id = i.id
    LEFT JOIN departments d ON i.dept_id = d.id
    WHERE v.id = $1`, [voucher_id]);
  return res.rows[0];
}

async function fetchRepair(repair_id) {
  const res = await db.query(`
    SELECT r.*, d.name as dept_name FROM repair_requests r
    JOIN departments d ON r.dept_id = d.id
    WHERE r.id = $1`, [repair_id]);
  return res.rows[0];
}

async function fetchCommitteesForOrder(committee_type) {
  const res = await db.query(`
    SELECT c.*, d.name as dept_name FROM committees c
    LEFT JOIN departments d ON c.dept_id = d.id
    WHERE c.committee_type = $1 AND c.is_active = TRUE
    ORDER BY c.id DESC LIMIT 1`, [committee_type]);
  const comm = res.rows[0];
  if (!comm || !comm.member_ids?.length) return comm;
  const membRes = await db.query(
    `SELECT u.*, d.name as dept_name FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ANY($1)`,
    [comm.member_ids]
  );
  comm.members = membRes.rows;
  return comm;
}

// ─── Main Dispatcher ───────────────────────────────────────────────────────────

class DocumentGenerator {
  /**
   * @param {string} docId  - e.g. 'DOC-12'
   * @param {string} entityId - Primary key of the entity (indent_id, meeting_id, etc.)
   * @param {Object} extra  - Optional extra params passed via query string
   */
  static async generateDocument(docId, entityId, extra = {}) {
    const id = entityId;

    switch (docId) {

      // ── Phase 2: CTE Statements ─────────────────────────────────────────
      case 'DOC-01': {
        const items = await fetchCTEData(extra.fin_year, 'Non-IT Equipment');
        if (extra.format === 'xlsx') {
          return DOCCTEStatements.generateExcel('DOC-01', { fin_year: extra.fin_year, items });
        }
        return DOCCTEStatements.generate('DOC-01', { fin_year: extra.fin_year, items });
      }
      case 'DOC-02': {
        const items = await fetchCTEData(extra.fin_year, 'IT Equipment');
        if (extra.format === 'xlsx') {
          return DOCCTEStatements.generateExcel('DOC-02', { fin_year: extra.fin_year, items });
        }
        return DOCCTEStatements.generate('DOC-02', { fin_year: extra.fin_year, items });
      }
      case 'DOC-03': {
        const items = await fetchCTEData(extra.fin_year, 'Furniture');
        if (extra.format === 'xlsx') {
          return DOCCTEStatements.generateExcel('DOC-03', { fin_year: extra.fin_year, items });
        }
        return DOCCTEStatements.generate('DOC-03', { fin_year: extra.fin_year, items });
      }
      case 'DOC-04': {
        const items = await fetchCTEData(extra.fin_year, 'Books');
        if (extra.format === 'xlsx') {
          return DOCCTEStatements.generateExcel('DOC-04', { fin_year: extra.fin_year, items });
        }
        return DOCCTEStatements.generate('DOC-04', { fin_year: extra.fin_year, items });
      }
      case 'DOC-05': {
        const items = await fetchCTEData(extra.fin_year, 'Maintenance');
        if (extra.format === 'xlsx') {
          return DOCCTEStatements.generateExcel('DOC-05', { fin_year: extra.fin_year, items });
        }
        return DOCCTEStatements.generate('DOC-05', { fin_year: extra.fin_year, items });
      }
      case 'DOC-06': {
        const items = await fetchCTEData(extra.fin_year, 'IT Equipment');
        if (extra.format === 'xlsx') {
          return DOCITSummary.generateExcel({ fin_year: extra.fin_year, items });
        }
        return DOCITSummary.generate({ fin_year: extra.fin_year, items });
      }
      case 'DOC-07': {
        const items = await fetchCTEData(extra.fin_year, null);
        if (extra.format === 'xlsx') {
          return DOCCTESummary.generateExcel({ fin_year: extra.fin_year, items });
        }
        return DOCCTESummary.generate({ fin_year: extra.fin_year, items });
      }

      // ── Phase 1: Committee Orders ───────────────────────────────────────
      case 'DOC-08': {
        const deptRes = await db.query(`SELECT d.*, u.name as rep1_name, u.designation as rep1_desig FROM departments d LEFT JOIN users u ON u.dept_id = d.id AND u.role = 'DeptRep' WHERE d.is_active = TRUE ORDER BY d.name`);
        return DOCCommitteeOrders.generateDeptRepsOrder({ fin_year: extra.fin_year, reps: deptRes.rows });
      }
      case 'DOC-09': {
        const comm = await fetchCommitteesForOrder('DisciplineExpert');
        return DOCCommitteeOrders.generateExpertCommitteeOrder({ fin_year: extra.fin_year, committees: comm ? [comm] : [] });
      }
      case 'DOC-10': {
        const comm = await fetchCommitteesForOrder(extra.committee_type || 'DLPC');
        return DOCCommitteeOrders.generateSpecialCommitteeOrder({
          fin_year: extra.fin_year,
          committee_name: comm?.committee_name,
          members: comm?.members || []
        });
      }
      case 'DOC-11': {
        return DOCCommitteeOrders.generateChangeNote(extra);
      }

      // ── Phase 3: Indent & Pre-Bid ───────────────────────────────────────
      case 'DOC-12': {
        return doc12Indent.generate(id);
      }
      case 'DOC-13': {
        const indent = await fetchIndent(id);
        return DOCIndentNonGovt.generate(indent || {});
      }
      case 'DOC-14': {
        const spec = await fetchSpecsWithConsignees(id);
        return DOCSpecificationSheet.generate(spec || {});
      }
      case 'DOC-15': {
        const atc = await fetchATC(id);
        return DOCATC.generate(atc || {});
      }
      case 'DOC-16': {
        return DOCGeMGuidelines.generate({});
      }
      case 'DOC-17': {
        const note = await fetchNoteSheet(id);
        if (note) return generateGujaratiNoteSheetDocx(note);
        return doc17NoteSheet.generate(id);
      }
      case 'DOC-18': {
        const note = await fetchNoteSheet(id);
        return DOCNoteOtherItems.generate(note || {});
      }
      case 'DOC-19': {
        const indent = await fetchIndent(id);
        return DOCChecklistA.generate(indent || {});
      }
      case 'DOC-20': {
        const indent = await fetchIndent(id);
        return DOCChecklistC.generate(indent || {});
      }

      // ── Phase 4: EMD & Security Deposit ────────────────────────────────
      case 'DOC-21': {
        const fi = await fetchFinancialInstrument(id);
        return DOCEMDRefund.generate(fi || {});
      }
      case 'DOC-22': {
        const fi = await fetchFinancialInstrument(id);
        return DOCSecurityDepositNote.generate(fi || {});
      }

      // ── Phase 5: Scrutiny & Committee ──────────────────────────────────
      case 'DOC-23': {
        const bid = await fetchBidWithScrutiny(id);
        return DOCScrutinyReport.generate(bid || {});
      }
      case 'DOC-24': {
        const bid = await fetchBidWithScrutiny(id);
        return DOCDisqualificationSheet.generate(bid || {});
      }
      case 'DOC-25': {
        const meeting = await fetchMeeting(id);
        return DOCDLPCAgenda.generate(meeting || {});
      }
      case 'DOC-26': {
        const meeting = await fetchMeeting(id);
        return DOCRateReasonability.generate({ ...meeting, committee_type: meeting?.committee_type || 'DLPC', ...extra });
      }
      case 'DOC-27': {
        const meeting = await fetchMeeting(id);
        return DOCDLPCMOM.generate(meeting || {});
      }
      case 'DOC-28': {
        const meeting = await fetchMeeting(id);
        return DOCChecklistB.generate(meeting || {});
      }
      case 'DOC-29': {
        const meeting = await fetchMeeting(id);
        return DOCDirectPurchaseNote.generate(meeting || {});
      }

      // ── Phase 5: DPC ───────────────────────────────────────────────────
      case 'DOC-30': {
        const meeting = await fetchMeeting(id);
        return DOCDPCIndex.generate(meeting || {});
      }
      case 'DOC-31': {
        const meeting = await fetchMeeting(id);
        return DOCDPCForwardingLetter.generate(meeting || {});
      }
      case 'DOC-32': {
        const meeting = await fetchMeeting(id);
        return DOCDPCAgenda.generate(meeting || {});
      }
      case 'DOC-33': {
        const meeting = await fetchMeeting(id);
        return DOCInstituteBIDCertificate.generate({ ...meeting, ...extra });
      }
      case 'DOC-34': {
        const meeting = await fetchMeeting(id);
        // Get order for vendor details
        const orderRes = await db.query('SELECT * FROM purchase_orders WHERE meeting_id = $1 LIMIT 1', [id]);
        const order = orderRes.rows[0] || {};
        return DOCL1InfoSheet.generate({ ...meeting, vendor_address: order.supplier_address, ...extra });
      }
      case 'DOC-35': {
        const meeting = await fetchMeeting(id);
        return DOCDPCMOM.generate(meeting || {});
      }

      // ── Phase 6: Delivery, Inspection, Payment ─────────────────────────
      case 'DOC-36': {
        const order = await fetchOrder(id);
        if (order) {
          // Add items from indent
          order.items = [{ item_name: order.item_name, qty_ordered: 1, qty_received: 1 }];
        }
        return DOCReceiptNote.generate(order || {});
      }
      case 'DOC-37': {
        const insp = await fetchInspection(id);
        return DOCInspectionReport.generate(insp || {});
      }
      case 'DOC-38': {
        const voucher = await fetchVoucher(id);
        return DOCPassForPayment.generate(voucher || {});
      }
      case 'DOC-39': {
        const voucher = await fetchVoucher(id);
        return DOCChecklistDE.generate(voucher || {});
      }
      case 'DOC-40': {
        const fin_year = extra.fin_year;
        const indRes = await db.query(`
          SELECT i.*, d.name as dept_name FROM indents i
          JOIN departments d ON i.dept_id = d.id
          ORDER BY i.updated_at DESC`);
        return DOCProcurementStatus.generate({ fin_year, indents: indRes.rows });
      }

      // ── Phase 7: Non-GeM & Repairs ─────────────────────────────────────
      case 'DOC-41': {
        const indent = await fetchIndent(id);
        return DOCInquiryLetter.generate({ ...indent, ...extra });
      }
      case 'DOC-42': {
        return DOCComparativeStatement.generate({ ...extra });
      }
      case 'DOC-43': {
        const order = await fetchOrder(id);
        return DOCPurchaseOrderNonGeM.generate(order || {});
      }
      case 'DOC-44': {
        const dept_id = extra.dept_id;
        const repRes = await db.query(`
          SELECT r.*, d.name as dept_name FROM repair_requests r
          JOIN departments d ON r.dept_id = d.id
          ${dept_id ? 'WHERE r.dept_id = $1' : ''} ORDER BY r.id DESC`,
          dept_id ? [dept_id] : []);
        return DOCRepairableEquipment.generate({ repairs: repRes.rows, dept_name: extra.dept_name, fin_year: extra.fin_year });
      }
      case 'DOC-45': {
        const repair = await fetchRepair(id);
        return DOCRepairApprovalNote.generate(repair || {});
      }
      case 'DOC-46': {
        const repair = await fetchRepair(id);
        return DOCWorkOrder.generate({ ...repair, ...extra });
      }
      case 'DOC-47': {
        return DOCPassForPaymentRepair.generate({ ...extra });
      }

      default:
        throw new Error(`Generator for document ID "${docId}" is not implemented.`);
    }
  }
}

module.exports = DocumentGenerator;
