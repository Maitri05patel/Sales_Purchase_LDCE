/**
 * DOC-23: Bid Scrutiny Report (Technical Evaluation Matrix)
 * DOC-24: Reasons for Disqualification Sheet
 * DOC-25: DLPC Agenda & Proposal
 * DOC-26: DLPC Rate Reasonability Certificate
 * DOC-27: DLPC Minutes of Meeting (MOM)
 * DOC-28: Checklist B – Final Approval
 * DOC-29: Note – Direct Purchase Against Bid
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate } = require('./DOC-common');

class DOCScrutinyReport {
  /** DOC-23: Technical Scrutiny / Evaluation Matrix */
  static async generate(data = {}) {
    const bidders = data.bidders || [];

    const tableRows = [
      ['Sr.', 'Bidder Name', 'Specs Compliance', 'Turnover Criteria', 'ATC / EMD Compliance', 'Overall Status', 'Remarks'],
      ...bidders.map((b, i) => [
        String(i + 1), b.bidder_name || '',
        b.param_specs || '', b.param_turnover || '', b.param_atc || '',
        b.final_tech_status || '',
        b.final_tech_status === 'Disqualified' ? (b.disqualify_reason || '') : 'Eligible for financial bid'
      ])
    ];

    const qualified = bidders.filter(b => b.final_tech_status === 'Qualified');
    const l1 = qualified.sort((a, b) => parseFloat(a.financial_bid || 0) - parseFloat(b.financial_bid || 0))[0];

    const children = [
      ...ldceHeader('BID SCRUTINY REPORT', 'Technical Evaluation Matrix'),
      labelValue('GeM Bid No', data.bid_no || ''),
      labelValue('Bid End Date', fmtDate(data.bid_end_date)),
      labelValue('Bid Opening Date', fmtDate(data.bid_opening_date)),
      labelValue('Item Name', data.item_name || ''),
      labelValue('Department', data.dept_name || ''),
      labelValue('Estimated Value', inr(data.est_cost)),
      labelValue('Scrutiny Date', fmtDate()),
      ...spacer(1),
      sectionHeading('Technical Evaluation Matrix'),
      simpleTable(tableRows, [5, 18, 12, 12, 12, 12, 29]),
      ...spacer(1),
      sectionHeading('Evaluation Summary'),
      labelValue('Total Bidders', String(bidders.length)),
      labelValue('Technically Qualified', String(qualified.length)),
      labelValue('Disqualified', String(bidders.length - qualified.length)),
      ...(l1 ? [labelValue('Identified L1 Bidder', l1.bidder_name)] : []),
      ...spacer(2),
      signatureBlock([{ label: 'Expert Member 1' }, { label: 'Expert Member 2' }, { label: 'Expert Member 3' }, { label: 'HOD' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCDisqualificationSheet {
  /** DOC-24: Reasons for Disqualification */
  static async generate(data = {}) {
    const disqualified = (data.bidders || []).filter(b => b.final_tech_status === 'Disqualified');

    const children = [
      ...ldceHeader('REASONS FOR DISQUALIFICATION OF BIDDERS', `GeM Bid No: ${data.bid_no || ''}`),
      labelValue('Item', data.item_name || ''),
      labelValue('Bid End Date', fmtDate(data.bid_end_date)),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      simpleTable([
        ['Sr.', 'Bidder Name', 'Specifications', 'Turnover Criteria', 'ATC/EMD', 'Reason for Disqualification'],
        ...disqualified.map((b, i) => [
          String(i + 1), b.bidder_name || '',
          b.param_specs || '', b.param_turnover || '', b.param_atc || '',
          b.disqualify_reason || ''
        ])
      ], [5, 20, 12, 12, 12, 39]),
      ...spacer(2),
      signatureBlock([{ label: 'Expert Committee Chairman' }, { label: 'HOD' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCDLPCAgenda {
  /** DOC-25: DLPC Agenda & Proposal */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('DEPARTMENTAL LOCAL PURCHASE COMMITTEE (DLPC)', `AGENDA – ${data.meeting_ref || 'LDCE/DLPC/2026-27/___'}`),
      labelValue('Meeting Date', fmtDate(data.meeting_date)),
      labelValue('Venue', data.venue || 'Principal\'s Chamber, LDCE, Ahmedabad'),
      labelValue('GeM Bid No', data.bid_no || ''),
      labelValue('Item Name', data.item_name || ''),
      labelValue('Department', data.dept_name || ''),
      labelValue('Grant Head', data.budget_head || ''),
      labelValue('Estimated Cost', inr(data.est_cost)),
      ...spacer(1),
      sectionHeading('Bid Evaluation Summary'),
      labelValue('Total Bidders', String(data.total_bidders || '')),
      labelValue('Technically Qualified Bidders', String(data.qualified_bidders || '')),
      labelValue('L1 Bidder', data.l1_vendor || ''),
      labelValue('L1 Total Amount (incl. GST)', inr(data.l1_amount)),
      ...spacer(1),
      sectionHeading('Documents Enclosed'),
      simpleTable([
        ['Sr.', 'Document', 'Status'],
        ['1', 'Purchase Indent', 'Attached'],
        ['2', 'Specification Sheet', 'Attached'],
        ['3', 'ATC', 'Attached'],
        ['4', 'GeM Bid Screenshot', 'Attached'],
        ['5', 'Bid Scrutiny Report', 'Attached'],
        ['6', 'L1 Rate Reasonability Certificate', 'Attached'],
        ['7', 'Checklist B', 'Attached'],
      ]),
      ...spacer(1),
      sectionHeading('Agenda Items for Discussion'),
      new Paragraph({ children: [new TextRun({ text: '1. Review of L1 bid and reasonability of rate.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. Recommendation for purchase order placement with L1 vendor.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. Any other matter with permission of the Chair.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer (Secretary)' }, { label: 'DLPC Member 1' }, { label: 'DLPC Member 2' }, { label: 'DLPC Chairman' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCRateReasonability {
  /** DOC-26: Rate Reasonability Certificate (DLPC) */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('CERTIFICATE OF REASONABILITY OF RATE', `GeM Bid No: ${data.bid_no || ''}`),
      labelValue('Date', fmtDate()),
      labelValue('Item Name', data.item_name || ''),
      labelValue('Quantity', String(data.quantity || '')),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `We, the undersigned members of the ${data.committee_type || 'DLPC'}, hereby certify that the L1 rate quoted by ${data.l1_vendor || 'the L1 firm'} for the above item at ${inr(data.l1_amount)} is reasonable and comparable to prevailing market rates. This is based on:`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      labelValue('1. Market Survey Rate (Approx)', inr(data.market_rate)),
      labelValue('2. GeM Last Transaction Price (if available)', inr(data.gem_last_price)),
      labelValue('3. L1 Rate', inr(data.l1_amount)),
      labelValue('4. Savings compared to Estimated Cost', inr((parseFloat(data.est_cost || 0) - parseFloat(data.l1_amount || 0)))),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: data.rate_reasonability || 'Based on the above comparison, the L1 rate is certified as reasonable and value for money.',
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(3),
      signatureBlock([{ label: 'HOD' }, { label: 'DLPC Member 1' }, { label: 'DLPC Member 2' }, { label: 'DLPC Chairman' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCDLPCMOM {
  /** DOC-27: DLPC Minutes of Meeting */
  static async generate(data = {}) {
    const attendees = data.attendees || [];
    const children = [
      ...ldceHeader('MINUTES OF MEETING – DLPC', data.meeting_ref || 'LDCE/DLPC/2026-27/___'),
      labelValue('Meeting Date & Time', fmtDate(data.meeting_date) + ' | ' + (data.meeting_time || '___')),
      labelValue('Venue', data.venue || 'Principal\'s Chamber, LDCE'),
      ...spacer(1),
      sectionHeading('Members Present'),
      simpleTable([
        ['Sr.', 'Name', 'Designation', 'Department', 'Role'],
        ...attendees.map((a, i) => [String(i + 1), a.name || '', a.designation || '', a.dept_name || '', i === 0 ? 'Chairman' : 'Member'])
      ]),
      ...spacer(1),
      sectionHeading('Item Under Consideration'),
      labelValue('GeM Bid No', data.bid_no || ''),
      labelValue('Item', data.item_name || ''),
      labelValue('Department', data.dept_name || ''),
      labelValue('L1 Bidder', data.l1_vendor || ''),
      labelValue('L1 Amount', inr(data.l1_amount)),
      ...spacer(1),
      sectionHeading('Discussions & Deliberations'),
      new Paragraph({ children: [new TextRun({ text: data.recommendation || 'The Committee reviewed the bid scrutiny report and the rate reasonability certificate. After deliberations, the L1 rate was found to be reasonable. The Committee unanimously resolved to recommend placement of Purchase Order with the L1 vendor.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      sectionHeading('Resolution'),
      new Paragraph({ children: [new TextRun({ text: `RESOLVED: That purchase order be placed with ${data.l1_vendor || '___'} for the supply of ${data.item_name || '___'} at the L1 rate of ${inr(data.l1_amount)}, subject to approval of the Principal / Director.`, bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(3),
      signatureBlock([...attendees.map((a, i) => ({ label: i === 0 ? 'DLPC Chairman' : `DLPC Member ${i}`, name: a.name })), { label: 'Store Officer (Secretary)' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCChecklistB {
  /** DOC-28: Checklist B – Final Approval Package Verification */
  static async generate(data = {}) {
    const checks = [
      ['1', 'Purchase Indent with HOD & Principal approval', data.chk_indent ? '✓' : '○'],
      ['2', 'CTE/GR Sanction Order copy', data.chk_gr ? '✓' : '○'],
      ['3', 'Technical Specification Sheet signed by Expert Committee', data.chk_specs ? '✓' : '○'],
      ['4', 'ATC (Additional Terms & Conditions)', data.chk_atc ? '✓' : '○'],
      ['5', 'GeM Bid Publication Screenshot', data.chk_bid_screenshot ? '✓' : '○'],
      ['6', 'Bid Scrutiny / Technical Evaluation Report', data.chk_scrutiny ? '✓' : '○'],
      ['7', 'Disqualification Note (if any bidder disqualified)', data.chk_disqualify_note ? '✓' : 'N/A'],
      ['8', 'L1 Financial Bid Screenshot', data.chk_l1_screenshot ? '✓' : '○'],
      ['9', 'Rate Reasonability Certificate', data.chk_reasonability ? '✓' : '○'],
      ['10', 'Admin Approval Note Sheet (Gujarati)', data.chk_note_sheet ? '✓' : '○'],
      ['11', 'Budget availability certificate from Accounts', data.chk_budget ? '✓' : '○'],
    ];
    const children = [
      ...ldceHeader('CHECKLIST B', 'Final Approval Package – Before DLPC / DPC Meeting'),
      labelValue('GeM Bid No', data.bid_no || ''),
      labelValue('Item', data.item_name || ''),
      labelValue('L1 Amount', inr(data.l1_amount)),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      simpleTable([['Sr.', 'Document / Check Point', 'Status'], ...checks], [8, 72, 20]),
      ...spacer(2),
      signatureBlock([{ label: 'Dept Representative' }, { label: 'Store Officer' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCDirectPurchaseNote {
  /** DOC-29: Note – Direct Purchase Against Bid (Gujarati/English) */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('NOTE SHEET', 'Note for Direct Purchase / L1 Sanction Under DLPC'),
      labelValue('Note No', data.note_no || 'LDCE/S&P/DLPC-NOTE/2026-27/___'),
      labelValue('Date', fmtDate()),
      labelValue('Department', data.dept_name || ''),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `With reference to GeM Bid No. ${data.bid_no || '___'} for ${data.item_name || '___'}, the DLPC Meeting held on ${fmtDate(data.meeting_date)} (Meeting Ref: ${data.meeting_ref || '___'}) has recommended placement of Purchase Order with L1 vendor ${data.l1_vendor || '___'} at a total value of ${inr(data.l1_amount)}.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: 'It is requested to kindly grant approval for placement of Purchase Order (GeM order) with the L1 vendor on the GeM portal.',
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      sectionHeading('Key Details'),
      labelValue('L1 Vendor', data.l1_vendor || ''),
      labelValue('Total Order Value', inr(data.l1_amount)),
      labelValue('Grant Head / Budget', data.budget_head || ''),
      labelValue('DLPC Meeting Ref', data.meeting_ref || ''),
      labelValue('DLPC Meeting Date', fmtDate(data.meeting_date)),
      ...spacer(3),
      signatureBlock([{ label: 'Store Officer' }, { label: 'DLPC Chairman' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCScrutinyReport, DOCDisqualificationSheet, DOCDLPCAgenda, DOCRateReasonability, DOCDLPCMOM, DOCChecklistB, DOCDirectPurchaseNote };
