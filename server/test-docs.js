/**
 * test-docs.js
 * ============
 * LDCE Document Generation Test Runner
 *
 * Automatically seeds all required test data in the DB,
 * then calls every DocumentGenerator for all 47 documents,
 * saves outputs to ./test-output/, and prints a color-coded summary.
 *
 * Usage:
 *   node test-docs.js            → test all 47 docs
 *   node test-docs.js DOC-12     → test only DOC-12
 *   node test-docs.js --seed-only → only seed DB, skip doc generation
 *   node test-docs.js --no-seed  → skip seeding, test only
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const DocumentGenerator = require('./services/DocumentGenerator');

// ── Color helpers (ANSI terminal) ─────────────────────────────────────────────
const G = (t) => `\x1b[32m${t}\x1b[0m`;  // green
const R = (t) => `\x1b[31m${t}\x1b[0m`;  // red
const Y = (t) => `\x1b[33m${t}\x1b[0m`;  // yellow
const B = (t) => `\x1b[34m${t}\x1b[0m`;  // blue
const W = (t) => `\x1b[1m${t}\x1b[0m`;   // bold

// ── Output directory ──────────────────────────────────────────────────────────
const OUT_DIR = path.join(__dirname, 'test-output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Document catalog: docId → { entityId, extra, description } ───────────────
// entityId/extra refer to the seeded test rows (IDs assigned after seeding)
// We use a lazy resolver: IDs are filled in after the seed step.
let IDS = {}; // populated by seedTestData()

function getTestCases() {
  return [
    // Phase 2 — CTE
    { docId: 'DOC-01', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Statement 1 – Non-IT Equipment' },
    { docId: 'DOC-02', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Statement 2 – IT Equipment' },
    { docId: 'DOC-03', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Statement 3 – Furniture' },
    { docId: 'DOC-04', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Statement 4 – Books' },
    { docId: 'DOC-05', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Statement 5 – Maintenance' },
    { docId: 'DOC-06', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'IT Items Summary' },
    { docId: 'DOC-07', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'CTE Consolidated Summary' },
    // Phase 1 — Committees
    { docId: 'DOC-08', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Dept Representatives Order' },
    { docId: 'DOC-09', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Expert Committee Order' },
    { docId: 'DOC-10', entityId: null,        extra: { fin_year: '2026-27', committee_type: 'DLPC' }, desc: 'Special Committee Order (DLPC)' },
    { docId: 'DOC-11', entityId: null,        extra: { outgoing_name: 'Dr. Old Faculty', outgoing_desig: 'Assoc. Prof', incoming_name: 'Dr. New Faculty', incoming_desig: 'Asst. Prof', committee_name: 'Computer Expert Committee', dept_name: 'Computer Engineering', reason: 'Transfer' }, desc: 'Note for Change in Committee' },
    // Phase 3 — Indent
    { docId: 'DOC-12', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Purchase Indent (Govt Fund)' },
    { docId: 'DOC-13', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Purchase Indent (Non-Govt Fund)' },
    { docId: 'DOC-14', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Specification Sheet' },
    { docId: 'DOC-15', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Additional Terms & Conditions' },
    { docId: 'DOC-16', entityId: null,        extra: {}, desc: 'General GeM Guidelines' },
    { docId: 'DOC-17', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Note for Purchase – New Item (Gujarati)' },
    { docId: 'DOC-18', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Note for Purchase – Other Items' },
    { docId: 'DOC-19', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Checklist A' },
    { docId: 'DOC-20', entityId: () => String(IDS.indent_id), extra: {}, desc: 'Checklist C' },
    // Phase 4 — EMD
    { docId: 'DOC-21', entityId: () => String(IDS.fi_id),     extra: {}, desc: 'EMD Refund Letter' },
    { docId: 'DOC-22', entityId: () => String(IDS.fi_id),     extra: {}, desc: 'Security Deposit Note' },
    // Phase 5 — Scrutiny
    { docId: 'DOC-23', entityId: () => String(IDS.bid_id),    extra: {}, desc: 'Bid Scrutiny Report' },
    { docId: 'DOC-24', entityId: () => String(IDS.bid_id),    extra: {}, desc: 'Disqualification Sheet' },
    { docId: 'DOC-25', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'DLPC Agenda' },
    { docId: 'DOC-26', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'DLPC Rate Reasonability Certificate' },
    { docId: 'DOC-27', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'DLPC MOM' },
    { docId: 'DOC-28', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'Checklist B' },
    { docId: 'DOC-29', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'Direct Purchase Note' },
    // Phase 5 — DPC
    { docId: 'DOC-30', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'DPC Proposal Index' },
    { docId: 'DOC-31', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'DPC Forwarding Letter' },
    { docId: 'DOC-32', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'DPC GeM Agenda' },
    { docId: 'DOC-33', entityId: () => String(IDS.meeting_id),extra: { ra_conducted: true }, desc: 'Institute BID Certificate' },
    { docId: 'DOC-34', entityId: () => String(IDS.meeting_id),extra: { gst_no: '24ABCDE1234F1Z5', pan_no: 'ABCDE1234F', basic_price: 700000, gst_amount: 126000, l1_amount: 826000, est_cost: 900000 }, desc: 'L1 INFO Sheet' },
    { docId: 'DOC-35', entityId: () => String(IDS.meeting_id),extra: {}, desc: 'DPC MOM' },
    // Phase 6 — Delivery
    { docId: 'DOC-36', entityId: () => String(IDS.order_id),  extra: {}, desc: 'Dept Receipt Note' },
    { docId: 'DOC-37', entityId: () => String(IDS.insp_id),   extra: {}, desc: 'Technical Inspection Report' },
    { docId: 'DOC-38', entityId: () => String(IDS.voucher_id),extra: {}, desc: 'Pass for Payment Voucher' },
    { docId: 'DOC-39', entityId: () => String(IDS.voucher_id),extra: {}, desc: 'Checklist D & E' },
    { docId: 'DOC-40', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Procurement Status Report' },
    // Phase 7 — Services & Repairs
    { docId: 'DOC-41', entityId: () => String(IDS.indent_id), extra: { last_date: new Date(Date.now() + 14*86400000).toISOString() }, desc: 'Inquiry Letter' },
    { docId: 'DOC-42', entityId: null,        extra: { dept_name: 'Computer Engineering', fund_type: 'Govt Fund', l1_vendor: 'M/s ABC Traders', l1_total: 45000, vendors: [{ name: 'ABC Traders', rates: [15000] }, { name: 'XYZ Suppliers', rates: [16500] }], items: [{ item_name: 'UPS 1KVA', qty: 3 }] }, desc: 'Comparative Statement' },
    { docId: 'DOC-43', entityId: () => String(IDS.order_id),  extra: {}, desc: 'Purchase Order (Non-GeM)' },
    { docId: 'DOC-44', entityId: null,        extra: { fin_year: '2026-27' }, desc: 'Repairable Equipment Register' },
    { docId: 'DOC-45', entityId: () => String(IDS.repair_id), extra: {}, desc: 'Note for Repair Approval' },
    { docId: 'DOC-46', entityId: () => String(IDS.repair_id), extra: { agency_name: 'M/s Electronics Repair Co.', agency_address: '45 Ring Road, Ahmedabad', agreed_cost: 25000, completion_timeline: '10 working days', approval_note_no: 'LDCE/S&P/REP-NOTE/2026-27/001' }, desc: 'Work Order (Repair)' },
    { docId: 'DOC-47', entityId: null,        extra: { dept_name: 'Computer Engineering', nature_of_work: 'Repair of Projector', vendor_name: 'M/s Electronics Repair Co.', invoice_no_date: 'INV/1001 dt. ' + new Date().toLocaleDateString('en-GB'), gross_amount: 25000, deductions: 0, net_payable_words: 'Twenty Five Thousand Only', voucher_no: 'VOUCH/2026/001' }, desc: 'Pass for Payment (Repair)' },
  ];
}

// ── Seed all test data into DB ────────────────────────────────────────────────
async function seedTestData(client) {
  console.log(B('\n📦 Seeding test data into database...\n'));

  // 1. Get seeded dept & user IDs
  const deptRes = await client.query("SELECT id FROM departments WHERE code = 'COMP' LIMIT 1");
  const dept_id = deptRes.rows[0]?.id;
  if (!dept_id) throw new Error("Department COMP not found. Run: node db/initDb.js first.");

  const userRes = await client.query("SELECT id FROM users WHERE role = 'HOD' AND dept_id = $1 LIMIT 1", [dept_id]);
  const hod_id = userRes.rows[0]?.id || null;

  // 2. Purchase Indent
  const indRes = await client.query(`
    INSERT INTO indents (indent_no, fund_type, budget_head, dept_id, indenter_user_id, indent_date, item_name, item_description, quantity, unit_cost, total_cost, gem_details, status)
    VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (indent_no) DO UPDATE SET status = EXCLUDED.status
    RETURNING id`,
    ['IND/TEST/2026/0001', 'Govt Fund', 'State Grant (TED-5)', dept_id, hod_id,
     'TEST: High End AI Workstation', 'Intel Core i9, 64GB RAM, RTX 4090, 27" 4K Monitor', 5, 150000, 750000, 'GEM/TEST/001', 'Initiated']
  );
  IDS.indent_id = indRes.rows[0].id;
  console.log(G(`  ✓ Indent seeded → ID: ${IDS.indent_id}`));

  // 3. Specifications
  const specRes = await client.query(`
    INSERT INTO specifications (indent_id, item_name, detailed_specs, notes, expert_signatures)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (indent_id) DO UPDATE SET detailed_specs = EXCLUDED.detailed_specs
    RETURNING id`,
    [IDS.indent_id, 'High End AI Workstation',
     '1. Processor: Intel Core i9 14th Gen\n2. RAM: 64GB DDR5\n3. Storage: 2TB NVMe SSD\n4. GPU: NVIDIA RTX 4090 24GB\n5. Display: 27" 4K IPS Monitor\n6. Warranty: 3 Years Comprehensive On-site',
     'All workstations to be installed with latest Ubuntu 22.04 LTS.', [hod_id]]
  );
  const spec_id = specRes.rows[0].id;
  await client.query(`DELETE FROM consignee_allocations WHERE spec_id = $1`, [spec_id]);
  await client.query(`INSERT INTO consignee_allocations (spec_id, dept_id, quantity) VALUES ($1, $2, $3)`, [spec_id, dept_id, 5]);
  console.log(G(`  ✓ Specifications seeded → Spec ID: ${spec_id}`));

  // 4. ATC Terms
  await client.query(`
    INSERT INTO atc_terms (indent_id, delivery_location, installation_scope, service_interval, response_time, max_downtime, warranty_period, local_office_clause, epbg_percentage, emd_amount)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (indent_id) DO NOTHING`,
    [IDS.indent_id, 'Computer Lab, LDCE, Ahmedabad-380015',
     'Inclusive of all accessories, power cables, KVM, and installation',
     'Every 6 Months', 'Within 24 Hours', '5 Days',
     '3 Years Comprehensive On-site', 'Must be within 50 km of Ahmedabad', 5.00, 22500]
  );
  console.log(G(`  ✓ ATC Terms seeded`));

  // 5. Note Sheet
  const noteRes = await client.query(`
    INSERT INTO note_sheets (note_no, indent_id, dept_id, scheme_year, item_name_guj, qty_str, total_amount, amount_words_guj, procurement_mode, budget_head, chk_a_verified, chk_c_verified, content_guj, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (note_no) DO UPDATE SET status = EXCLUDED.status
    RETURNING id`,
    [`NOTE/TEST/2026/${IDS.indent_id}`, IDS.indent_id, dept_id,
     'વિકાસ યોજના ૨૦૨૬-૨૭ ની નવી બાબત', 'AI વર્કસ્ટેશન', '05 નંગ',
     750000, 'સાત લાખ પચાસ હજાર પૂરા', 'GeM Bid', 'State Grant (TED-5)', true, false,
     'ઉપરોક્ત વિષય અન્વયે, AI પ્રયોગશાળા માટે ૦૫ AI વર્કસ્ટેશન ખરીદ કરવા GeM Bid પ્રકાશિત કરવા મંજૂરી આપવા વિનંતી.',
     'Pending Principal Sanction']
  );
  console.log(G(`  ✓ Note Sheet seeded → ID: ${noteRes.rows[0].id}`));

  // 6. Financial Instrument (EMD)
  const fiRes = await client.query(`
    INSERT INTO financial_instruments (instrument_type, bid_order_no, vendor_name, vendor_address, dd_number, dd_date, amount, bank_name, status)
    VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8)
    RETURNING id`,
    ['EMD', 'GEM/2026/B/TEST001', 'M/s Demo Tech Solutions Pvt. Ltd.',
     '12, Sarkhej-Gandhinagar Highway, Ahmedabad - 380054, Gujarat',
     'DD/SBI/2026/00123', 22500, 'State Bank of India, Navrangpura Branch', 'Held in Store']
  );
  IDS.fi_id = fiRes.rows[0].id;
  console.log(G(`  ✓ Financial Instrument (EMD) seeded → ID: ${IDS.fi_id}`));

  // 7. Bid
  const bidRes = await client.query(`
    INSERT INTO bids (bid_no, indent_id, bid_publish_date, bid_end_date, bid_opening_date, status)
    VALUES ($1, $2, CURRENT_DATE - 30, CURRENT_DATE - 10, CURRENT_DATE - 9, 'Evaluation_Phase')
    ON CONFLICT (bid_no) DO UPDATE SET status = EXCLUDED.status
    RETURNING id`,
    ['GEM/2026/B/TEST001', IDS.indent_id]
  );
  IDS.bid_id = bidRes.rows[0].id;
  console.log(G(`  ✓ Bid seeded → ID: ${IDS.bid_id}`));

  // 8. Scrutiny Entries (3 bidders: 2 qualified, 1 disqualified)
  await client.query(`DELETE FROM scrutiny_details WHERE bid_id = $1`, [IDS.bid_id]);
  await client.query(`INSERT INTO scrutiny_details (bid_id, bidder_name, param_specs, param_turnover, param_atc, final_tech_status) VALUES ($1, $2, $3, $4, $5, $6)`,
    [IDS.bid_id, 'M/s Demo Tech Solutions Pvt. Ltd.', 'Qualified', 'Qualified', 'Qualified', 'Qualified']);
  await client.query(`INSERT INTO scrutiny_details (bid_id, bidder_name, param_specs, param_turnover, param_atc, final_tech_status) VALUES ($1, $2, $3, $4, $5, $6)`,
    [IDS.bid_id, 'M/s Alpha Computers Pvt. Ltd.', 'Qualified', 'Qualified', 'Qualified', 'Qualified']);
  await client.query(`INSERT INTO scrutiny_details (bid_id, bidder_name, param_specs, param_turnover, param_atc, final_tech_status, disqualify_reason) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [IDS.bid_id, 'M/s Beta Systems Ltd.', 'Disqualified', 'Qualified', 'Qualified', 'Disqualified', 'GPU spec does not meet NVIDIA RTX 4090 requirement; offered RTX 3080 which is inadequate.']);
  console.log(G(`  ✓ Scrutiny Details seeded (3 bidders)`));

  // 9. Committee Meeting (DLPC)
  const meetRes = await client.query(`
    INSERT INTO committee_meetings (committee_type, meeting_ref, meeting_date, indent_id, bid_id, l1_vendor, l1_amount, rate_reasonability, recommendation, attendee_ids, chk_b_verified, status)
    VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (meeting_ref) DO UPDATE SET l1_amount = EXCLUDED.l1_amount
    RETURNING id`,
    ['DLPC', 'LDCE/DLPC/2026-27/TEST/01', IDS.indent_id, IDS.bid_id,
     'M/s Demo Tech Solutions Pvt. Ltd.', 726000.00,
     'L1 rate of Rs 7,26,000 is reasonable and comparable to market prices for similar configuration.',
     'Committee recommends placement of GeM Purchase Order with L1 vendor at quoted price.',
     [hod_id], true, 'Sanctioned']
  );
  IDS.meeting_id = meetRes.rows[0].id;
  console.log(G(`  ✓ Committee Meeting (DLPC) seeded → ID: ${IDS.meeting_id}`));

  // 10. Purchase Order (auto-created by committee route, but also ensure one exists)
  const poRes = await client.query(`
    INSERT INTO purchase_orders (order_no, indent_id, meeting_id, supplier_name, supplier_address, total_value, order_date)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
    ON CONFLICT (order_no) DO UPDATE SET total_value = EXCLUDED.total_value
    RETURNING id`,
    [`PO/TEST/2026/${IDS.meeting_id}`, IDS.indent_id, IDS.meeting_id,
     'M/s Demo Tech Solutions Pvt. Ltd.',
     '12, Sarkhej-Gandhinagar Highway, Ahmedabad - 380054', 726000.00]
  );
  IDS.order_id = poRes.rows[0].id;
  console.log(G(`  ✓ Purchase Order seeded → ID: ${IDS.order_id}`));

  // 11. Inspection
  const inspRes = await client.query(`
    INSERT INTO inspections (order_id, invoice_no_date, receipt_date, inspection_date, serial_numbers, specs_verified, accessories_ok, working_status, inspector_ids)
    VALUES ($1, $2, CURRENT_DATE - 5, CURRENT_DATE - 3, $3, $4, $5, $6, $7)
    RETURNING id`,
    [IDS.order_id, 'INV/DEMO-TECH/2026/00456 dt. ' + new Date().toLocaleDateString('en-GB'),
     'WS-001: SN#DTS2026WS001\nWS-002: SN#DTS2026WS002\nWS-003: SN#DTS2026WS003\nWS-004: SN#DTS2026WS004\nWS-005: SN#DTS2026WS005',
     true, true, 'Fully Functional & Accepted', [hod_id]]
  );
  IDS.insp_id = inspRes.rows[0].id;
  console.log(G(`  ✓ Inspection seeded → ID: ${IDS.insp_id}`));

  // 12. Payment Voucher
  const voucherRes = await client.query(`
    INSERT INTO payment_vouchers (voucher_no, inspection_id, sanction_ref, vendor_info, gross_amount, stock_folio_no, account_head, sd_retained, other_deductions, net_payable, chk_de_verified, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (voucher_no) DO UPDATE SET gross_amount = EXCLUDED.gross_amount
    RETURNING id`,
    [`VOUCH/TEST/2026/0001`, IDS.insp_id,
     'LDCE/DLPC/2026-27/TEST/01 dtd. ' + new Date().toLocaleDateString('en-GB'),
     'M/s Demo Tech Solutions Pvt. Ltd., 12 SG Highway, Ahmedabad - 380054',
     726000, 'Vol-3 Pg-142', 'State Grant (TED-5)', 36300, 0, 689700, true, 'Passed for Payment']
  );
  IDS.voucher_id = voucherRes.rows[0].id;
  console.log(G(`  ✓ Payment Voucher seeded → ID: ${IDS.voucher_id}`));

  // 13. Repair Request
  const repRes = await client.query(`
    INSERT INTO repair_requests (req_no, dept_id, equipment_name, purchase_date, original_cost, breakdown_date, prev_repaired, last_repair_info, market_value, est_repair_cost, fault_desc, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (req_no) DO UPDATE SET est_repair_cost = EXCLUDED.est_repair_cost
    RETURNING id`,
    [`REP/TEST/2026/${dept_id}/001`, dept_id,
     'BenQ DLP Projector CP220c', '2018-06-15', 95000,
     '2026-08-01', true, '2022-05-10, Rs. 8,500 (Lamp Replacement)',
     25000, 18000, 'Projector lamp has failed again. No display output. Light engine may also need replacement.', 'Submitted for Approval']
  );
  IDS.repair_id = repRes.rows[0].id;
  console.log(G(`  ✓ Repair Request seeded → ID: ${IDS.repair_id}`));

  // 14. Update indent status to reflect full pipeline
  await client.query(`UPDATE indents SET status = 'Completed' WHERE id = $1`, [IDS.indent_id]);

  console.log(B(`\n  IDs summary: ${JSON.stringify(IDS, null, 2)}\n`));
}

// ── Run a single document test ────────────────────────────────────────────────
async function testDoc(tc) {
  const docId = tc.docId;
  const entityId = typeof tc.entityId === 'function' ? tc.entityId() : (tc.entityId || '0');
  const extra = tc.extra || {};
  const start = Date.now();

  try {
    const buffer = await DocumentGenerator.generateDocument(docId, entityId, extra);
    const ms = Date.now() - start;
    const filePath = path.join(OUT_DIR, `${docId}.docx`);
    fs.writeFileSync(filePath, buffer);
    const sizeKb = (buffer.length / 1024).toFixed(1);
    console.log(G(`  ✓ ${W(docId)}`), `${tc.desc} → ${sizeKb}KB [${ms}ms]  → ${path.basename(filePath)}`);
    return { docId, ok: true, sizeKb, ms, filePath };
  } catch (err) {
    const ms = Date.now() - start;
    console.log(R(`  ✗ ${W(docId)}`), `${tc.desc} → ERROR: ${err.message} [${ms}ms]`);
    return { docId, ok: false, error: err.message, ms };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const specificDoc = args.find(a => a.startsWith('DOC-'));
  const seedOnly = args.includes('--seed-only');
  const noSeed = args.includes('--no-seed');

  console.log(W('\n═══════════════════════════════════════════════════════════'));
  console.log(W('  LDCE Store & Purchase – Document Generation Test Runner'));
  console.log(W('═══════════════════════════════════════════════════════════\n'));

  // Connect to DB
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ldce_purchase_sales',
    password: process.env.DB_PASSWORD || 'root',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    await client.connect();
    console.log(G('✓ Connected to PostgreSQL: ' + (process.env.DB_NAME || 'ldce_purchase_sales')));
  } catch (err) {
    console.log(R('✗ DB Connection failed: ' + err.message));
    console.log(Y('  → Make sure PostgreSQL is running and .env is correctly configured.'));
    console.log(Y('  → Run: node db/initDb.js  to create the database first.'));
    process.exit(1);
  }

  // Seed
  if (!noSeed) {
    try {
      await seedTestData(client);
    } catch (err) {
      console.log(R('\n✗ Seeding failed: ' + err.message));
      console.log(Y('  → Run `node db/initDb.js` first to set up schema and base seed data.\n'));
      await client.end();
      process.exit(1);
    }
  } else {
    // If --no-seed, try to resolve existing IDs from DB
    console.log(Y('⚠ Skipping seed. Resolving existing test IDs from DB...'));
    const r = await client.query(`SELECT id FROM indents WHERE indent_no = 'IND/TEST/2026/0001' LIMIT 1`);
    if (r.rows[0]) {
      IDS.indent_id = r.rows[0].id;
      const fi = await client.query(`SELECT id FROM financial_instruments WHERE bid_order_no = 'GEM/2026/B/TEST001' LIMIT 1`);
      IDS.fi_id = fi.rows[0]?.id;
      const bid = await client.query(`SELECT id FROM bids WHERE bid_no = 'GEM/2026/B/TEST001' LIMIT 1`);
      IDS.bid_id = bid.rows[0]?.id;
      const meet = await client.query(`SELECT id FROM committee_meetings WHERE meeting_ref = 'LDCE/DLPC/2026-27/TEST/01' LIMIT 1`);
      IDS.meeting_id = meet.rows[0]?.id;
      const po = await client.query(`SELECT id FROM purchase_orders WHERE indent_id = $1 LIMIT 1`, [IDS.indent_id]);
      IDS.order_id = po.rows[0]?.id;
      const insp = await client.query(`SELECT id FROM inspections WHERE order_id = $1 LIMIT 1`, [IDS.order_id]);
      IDS.insp_id = insp.rows[0]?.id;
      const vouch = await client.query(`SELECT id FROM payment_vouchers WHERE voucher_no LIKE 'VOUCH/TEST%' LIMIT 1`);
      IDS.voucher_id = vouch.rows[0]?.id;
      const rep = await client.query(`SELECT id FROM repair_requests WHERE req_no LIKE 'REP/TEST%' LIMIT 1`);
      IDS.repair_id = rep.rows[0]?.id;
      console.log(G(`  Resolved IDs: ${JSON.stringify(IDS)}`));
    } else {
      console.log(R('  ✗ No test data found. Remove --no-seed flag to seed first.'));
      process.exit(1);
    }
  }

  await client.end();

  if (seedOnly) {
    console.log(Y('\n--seed-only flag set. Skipping document generation.\n'));
    process.exit(0);
  }

  // Run tests
  const testCases = getTestCases();
  const toTest = specificDoc ? testCases.filter(tc => tc.docId === specificDoc) : testCases;

  if (toTest.length === 0) {
    console.log(R(`\n✗ No test case found for: ${specificDoc}`));
    process.exit(1);
  }

  console.log(B(`\n📄 Generating ${toTest.length} document(s)... (output → ./test-output/)\n`));
  const results = [];
  for (const tc of toTest) {
    results.push(await testDoc(tc));
  }

  // Summary
  const passed = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);
  const totalMs = results.reduce((s, r) => s + r.ms, 0);

  console.log(W('\n═══════════════════════════════════════════════════════════'));
  console.log(W('  TEST RESULTS SUMMARY'));
  console.log(W('═══════════════════════════════════════════════════════════'));
  console.log(G(`  ✓ Passed : ${passed.length} / ${results.length}`));
  if (failed.length > 0) {
    console.log(R(`  ✗ Failed : ${failed.length} / ${results.length}`));
    console.log(R('\n  Failed documents:'));
    failed.forEach(f => console.log(R(`    • ${f.docId}: ${f.error}`)));
  }
  console.log(`  ⏱ Total time: ${totalMs}ms`);
  console.log(`  📁 Output files: ${OUT_DIR}`);
  console.log(W('═══════════════════════════════════════════════════════════\n'));

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(R('\nFatal Error: ' + err.message));
  process.exit(1);
});
