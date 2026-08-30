/**
 * DOC-13: Purchase Indent – Non-Govt Fund
 * DOC-14: Specification Sheet
 * DOC-15: Additional Terms & Conditions (ATC)
 * DOC-16: General GeM Guidelines Sheet
 * DOC-18: Note for Purchase – Other Items (Non-Govt Fund)
 * DOC-19: Checklist A Verification
 * DOC-20: Checklist C Verification
 * (DOC-12 and DOC-17 are already in separate files, kept for consistency in DocumentGenerator)
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate } = require('./DOC-common');

class DOCIndentNonGovt {
  /** DOC-13: Purchase Indent Non-Govt Fund */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('PURCHASE INDENT', 'Non-Government Fund'),
      labelValue('Indent No', data.indent_no || ''),
      labelValue('Date', fmtDate(data.indent_date)),
      labelValue('Department', data.dept_name || ''),
      labelValue('Fund Head', data.budget_head || ''),
      labelValue('Item Name', data.item_name || ''),
      labelValue('Description', data.item_description || ''),
      labelValue('Quantity Required', data.quantity || ''),
      labelValue('Estimated Unit Cost', inr(data.unit_cost)),
      labelValue('Estimated Total Cost', inr(data.total_cost)),
      labelValue('GeM Product ID / Status', data.gem_details || 'Not available on GeM'),
      ...spacer(2),
      signatureBlock([
        { label: 'Indenter' },
        { label: 'HOD' },
        { label: 'Fund In-charge' },
        { label: 'Principal' }
      ])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCSpecificationSheet {
  /** DOC-14: Specification Sheet */
  static async generate(data = {}) {
    const consignees = data.consignees || [];
    const children = [
      ...ldceHeader('TECHNICAL SPECIFICATION SHEET', data.item_name || ''),
      labelValue('Indent No', data.indent_no || ''),
      labelValue('Date', fmtDate()),
      labelValue('Department', data.dept_name || ''),
      ...spacer(1),
      sectionHeading('Technical Specifications'),
      new Paragraph({ children: [new TextRun({ text: data.detailed_specs || '', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      ...(data.spec_notes ? [
        sectionHeading('Additional Notes'),
        new Paragraph({ children: [new TextRun({ text: data.spec_notes, font: 'Times New Roman', size: 22 })] }),
        ...spacer(1)
      ] : []),
      sectionHeading('Consignee Department-wise Allocation'),
      simpleTable([
        ['Sr.', 'Department', 'Quantity'],
        ...consignees.map((c, i) => [String(i + 1), c.dept_name || '', String(c.quantity || '')])
      ], [10, 60, 30]),
      ...spacer(2),
      signatureBlock([
        { label: 'Expert Member 1' },
        { label: 'Expert Member 2' },
        { label: 'Expert Member 3' },
        { label: 'HOD' }
      ])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCATC {
  /** DOC-15: Additional Terms & Conditions */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('ADDITIONAL TERMS & CONDITIONS (ATC)', data.item_name || ''),
      labelValue('Indent No', data.indent_no || ''),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      sectionHeading('Delivery & Installation'),
      labelValue('Delivery Location', data.delivery_location || 'Central Store / Dept, LDCE, Ahmedabad-380015'),
      labelValue('Installation Scope', data.installation_scope || 'Inclusive of all accessories, cabling, wiring, MCB, stand & drilling'),
      ...spacer(1),
      sectionHeading('Service Level Agreement (SLA)'),
      labelValue('Preventive Maintenance Interval', data.service_interval || 'Every 6 Months'),
      labelValue('Breakdown Response Time', data.response_time || 'Within 24 Hours'),
      labelValue('Maximum Allowable Downtime', data.max_downtime || '5 Days'),
      labelValue('Warranty Period', data.warranty_period || '3 Years Comprehensive On-site'),
      labelValue('Local Service Center', data.local_office_clause || 'Must be within 50 km of Ahmedabad'),
      ...spacer(1),
      sectionHeading('Financial Security Requirements'),
      labelValue('Earnest Money Deposit (EMD)', `3% of Bid Value  (Approx. ${inr(data.emd_amount)})`),
      labelValue('Security Deposit / e-PBG', `${data.epbg_percentage || 5}% of Contract Value`),
      ...spacer(1),
      sectionHeading('Standard GeM Bid Settings'),
      simpleTable([
        ['Parameter', 'Value'],
        ['Bid Duration', '21 Days (Minimum)'],
        ['Bid Validity', '120 Days from Bid End Date'],
        ['Turnover Criteria', '2× of Bid Value'],
        ['Reverse Auction (RA)', 'Applicable as per GeM policy'],
        ['Make-in-India', 'Class-1 / Class-2 Local Supplier as applicable'],
        ['Payment Terms', '100% within 30 days of acceptance of goods'],
      ]),
      ...spacer(2),
      signatureBlock([{ label: 'Expert Committee Chairman' }, { label: 'HOD' }, { label: 'Store Officer' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCGeMGuidelines {
  /** DOC-16: General GeM Guidelines Sheet */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('GENERAL GeM GUIDELINES & COMMON TERMS', 'For All GeM Bids / Direct Purchase / BOQ'),
      ...spacer(1),
      sectionHeading('A. Bid Publication Guidelines'),
      simpleTable([
        ['Sr.', 'Parameter', 'Guideline / Requirement'],
        ['1', 'Bid Duration', 'Minimum 21 calendar days from publication'],
        ['2', 'Financial Bid Validity', '120 days from bid end date'],
        ['3', 'EMD Requirement', '3% of estimated bid value via Demand Draft / e-bank guarantee'],
        ['4', 'Security Deposit (e-PBG)', '5% of total contract value (3% for MSME registered firms)'],
        ['5', 'Turnover Criteria', 'Minimum 2× of estimated value in preceding 3 years'],
        ['6', 'Reverse Auction', 'Mandatory for items > Rs 5 Lakhs unless exempted'],
        ['7', 'Splitting of Quantities', 'Not permitted without approval'],
        ['8', 'Negotiation', 'Not permitted; L1 rate is final'],
      ]),
      ...spacer(1),
      sectionHeading('B. Vendor Qualification Requirements'),
      simpleTable([
        ['Sr.', 'Criterion', 'Details'],
        ['1', 'GeM Registration', 'Vendor must be registered on GeM portal'],
        ['2', 'Make-in-India', 'Class-1 LCS preferred; Class-2 LCS otherwise; foreign allowed if not available in India'],
        ['3', 'MSME Preference', '25% price preference to MSMEs in eligible categories'],
        ['4', 'Startup Policy', 'GeM Startup Runway applicable for eligible products'],
      ]),
      ...spacer(1),
      sectionHeading('C. Payment Terms'),
      simpleTable([
        ['Sr.', 'Condition', 'Timeline'],
        ['1', 'Payment after delivery & inspection acceptance', 'Within 30 days of accepted delivery'],
        ['2', 'Payment on GeM portal (PFMS)', 'Mandatory through PFMS/GeM payment gateway'],
        ['3', 'SD retention if e-PBG not submitted', 'Deduct 5% from bill'],
      ]),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCNoteOtherItems {
  /** DOC-18: Note for Purchase – Other Items (Non-Govt / Contingency) */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('NOTE SHEET', 'Note for Purchase – Contingency / Non-Government Fund Items'),
      labelValue('Note No', data.note_no || ''),
      labelValue('Date', fmtDate()),
      labelValue('Department', data.dept_name || ''),
      labelValue('Fund Head', data.budget_head || ''),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `This is to bring to the notice of the Principal that the ${data.dept_name || 'Department'} requires purchase of ${data.item_name_guj || data.item_name || 'item'} (Qty: ${data.qty_str || ''}) at an estimated cost of ${inr(data.total_amount)} (${data.amount_words_guj || 'Rupees in words'}). The procurement is proposed to be carried out through ${data.procurement_mode || 'Non-GeM local purchase'} under ${data.budget_head || 'Contingency Fund'}.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'Checklist A verified: ' + (data.chk_a_verified ? 'Yes' : 'Pending'), bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(3),
      signatureBlock([{ label: 'HOD' }, { label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCChecklistA {
  /** DOC-19: Checklist A – Before Initiating GeM Direct Purchase / Bid */
  static async generate(data = {}) {
    const checks = [
      ['1', 'Item is listed in Annual CTE/NI approved list', data.chk_cte_approved ? '✓' : '○'],
      ['2', 'CTE / GR Sanction order received', data.chk_gr_received ? '✓' : '○'],
      ['3', 'Purchase Indent prepared and approved by HOD', data.chk_indent_approved ? '✓' : '○'],
      ['4', 'Technical Specification Sheet prepared & signed by Expert Committee', data.chk_specs_signed ? '✓' : '○'],
      ['5', 'Additional Terms & Conditions (ATC) prepared', data.chk_atc_done ? '✓' : '○'],
      ['6', 'GeM product search completed; Screenshot attached', data.chk_gem_search ? '✓' : '○'],
      ['7', 'Item availability checked on GeM portal', data.chk_gem_available ? '✓' : '○'],
      ['8', 'Budget availability confirmed by Accounts', data.chk_budget_confirmed ? '✓' : '○'],
      ['9', 'EMD amount calculated (3% of bid value)', data.chk_emd_calculated ? '✓' : '○'],
      ['10', 'Principal administrative approval received', data.chk_principal_approval ? '✓' : '○'],
    ];
    const children = [
      ...ldceHeader('CHECKLIST A', 'Verification Before Initiating GeM Bid / Direct Purchase'),
      labelValue('Indent No', data.indent_no || ''),
      labelValue('Item', data.item_name || ''),
      labelValue('Department', data.dept_name || ''),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      simpleTable([['Sr.', 'Check Point', 'Status'], ...checks], [8, 72, 20]),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: '✓ = Verified  |  ○ = Pending', italics: true, font: 'Times New Roman', size: 20 })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Dept Representative' }, { label: 'HOD' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCChecklistC {
  /** DOC-20: Checklist C – Before Publishing Custom Bid / BOQ on GeM */
  static async generate(data = {}) {
    const checks = [
      ['1', 'Custom Bid / BOQ template prepared as per item requirements', data.chk_template ? '✓' : '○'],
      ['2', 'Detailed BOQ with specifications attached', data.chk_boq ? '✓' : '○'],
      ['3', 'GeM category mapped correctly for custom bid', data.chk_category ? '✓' : '○'],
      ['4', 'Evaluation criteria defined (Technical + Financial)', data.chk_eval_criteria ? '✓' : '○'],
      ['5', 'EMD amount set (3% of estimated cost)', data.chk_emd ? '✓' : '○'],
      ['6', 'e-PBG clause included in bid terms', data.chk_epbg ? '✓' : '○'],
      ['7', 'Bid duration set to minimum 21 days', data.chk_duration ? '✓' : '○'],
      ['8', 'Bid validity set to 120 days', data.chk_validity ? '✓' : '○'],
      ['9', 'Reverse Auction enabled (for > Rs 5L)', data.chk_ra ? '✓' : 'N/A'],
      ['10', 'Principal approval note submitted before publishing', data.chk_approval ? '✓' : '○'],
    ];
    const children = [
      ...ldceHeader('CHECKLIST C', 'Verification Before Publishing Custom Bid / BOQ on GeM'),
      labelValue('Bid Reference', data.bid_no || ''),
      labelValue('Item', data.item_name || ''),
      labelValue('Estimated Cost', inr(data.estimated_cost)),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      simpleTable([['Sr.', 'Check Point', 'Status'], ...checks], [8, 72, 20]),
      ...spacer(2),
      signatureBlock([{ label: 'Dept Representative' }, { label: 'HOD' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCIndentNonGovt, DOCSpecificationSheet, DOCATC, DOCGeMGuidelines, DOCNoteOtherItems, DOCChecklistA, DOCChecklistC };
