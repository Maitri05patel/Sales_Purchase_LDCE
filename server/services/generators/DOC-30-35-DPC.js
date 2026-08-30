/**
 * DOC-30: DPC Proposal Index
 * DOC-31: DPC Forwarding Letter
 * DOC-32: GeM Agenda Format – DPC
 * DOC-33: Institute BID Certificate
 * DOC-34: L1 INFO Sheet for DPC
 * DOC-35: DPC Minutes of Meeting (MOM)
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate, INST_NAME } = require('./DOC-common');

class DOCDPCIndex {
  /** DOC-30: DPC Proposal Index */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('DPC PROPOSAL – DOCUMENT INDEX', `GeM Bid No: ${data.bid_no || ''}`),
      labelValue('Item', data.item_name || ''),
      labelValue('Department', data.dept_name || ''),
      labelValue('Estimated Cost', inr(data.est_cost)),
      labelValue('L1 Amount', inr(data.l1_amount)),
      labelValue('Prepared By', data.prepared_by || 'Store Officer'),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      sectionHeading('Index of Documents in DPC Proposal'),
      simpleTable([
        ['Sr.', 'Document Name', 'Annexure', 'Pages', 'Status'],
        ['1', 'DPC Forwarding Letter', 'Annexure A', '01', 'Attached'],
        ['2', 'GeM Agenda for DPC', 'Annexure B', '02', 'Attached'],
        ['3', 'Institute BID Certificate', 'Annexure C', '01', 'Attached'],
        ['4', 'L1 INFO Sheet', 'Annexure D', '01', 'Attached'],
        ['5', 'Bid Scrutiny Report', 'Annexure E', '02', 'Attached'],
        ['6', 'Rate Reasonability Certificate', 'Annexure F', '01', 'Attached'],
        ['7', 'Purchase Indent', 'Annexure G', '01', 'Attached'],
        ['8', 'Specification Sheet signed by Expert Committee', 'Annexure H', '02', 'Attached'],
        ['9', 'ATC', 'Annexure I', '02', 'Attached'],
        ['10', 'GeM Bid Screenshots (Publication & L1 rate)', 'Annexure J', '03', 'Attached'],
        ['11', 'Disqualification Note (if applicable)', 'Annexure K', '01', 'As applicable'],
        ['12', 'Admin Approval Note (Gujarati)', 'Annexure L', '01', 'Attached'],
      ]),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCDPCForwardingLetter {
  /** DOC-31: DPC Forwarding Letter to Principal */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('FORWARDING LETTER TO PRINCIPAL', 'DPC Proposal for High-Value Procurement'),
      labelValue('Ref No', data.ref_no || `LDCE/S&P/DPC-FWD/2026-27/___`),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'To,', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: 'The Principal / Director,', bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: INST_NAME, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `Sub: DPC Proposal for Approval of Purchase – ${data.item_name || '___'} – Regarding`, bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: `Ref: GeM Bid No. ${data.bid_no || '___'}`, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `With reference to the above-cited GeM bid, we submit the complete DPC proposal for your kind approval and sanction. The bid was published on GeM portal on ${fmtDate(data.bid_publish_date)} and closed on ${fmtDate(data.bid_end_date)}.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      sectionHeading('Summary'),
      labelValue('Item Name', data.item_name || ''),
      labelValue('Department / Consignee', data.dept_name || ''),
      labelValue('Estimated Cost', inr(data.est_cost)),
      labelValue('Total Bidders', String(data.total_bidders || '')),
      labelValue('Technically Qualified', String(data.qualified_bidders || '')),
      labelValue('L1 Vendor', data.l1_vendor || ''),
      labelValue('L1 Total Amount (incl. GST)', inr(data.l1_amount)),
      labelValue('Grant Head', data.budget_head || ''),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: 'The DPC Committee recommends placement of Purchase Order with the L1 vendor. All documents as per the DPC index are attached herewith for your perusal and approval.',
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(3),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal (Approval)' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCDPCAgenda {
  /** DOC-32: GeM Agenda Format – DPC */
  static async generate(data = {}) {
    const attendees = data.attendees || [];
    const children = [
      ...ldceHeader('DEPARTMENTAL PURCHASE COMMITTEE (DPC)', `AGENDA – ${data.meeting_ref || 'LDCE/DPC/2026-27/___'}`),
      labelValue('Meeting Date', fmtDate(data.meeting_date)),
      labelValue('Venue', data.venue || 'Conference Room, LDCE'),
      ...spacer(1),
      sectionHeading('DPC Members'),
      simpleTable([
        ['Sr.', 'Name', 'Designation', 'Department', 'Role'],
        ...attendees.map((a, i) => [String(i + 1), a.name || '', a.designation || '', a.dept_name || '', i === 0 ? 'Chairman' : 'Member'])
      ]),
      ...spacer(1),
      sectionHeading('Item Under Consideration'),
      labelValue('GeM Bid No', data.bid_no || ''),
      labelValue('Item Name & Description', data.item_name || ''),
      labelValue('Consignee Department(s)', data.dept_name || ''),
      labelValue('Grant Head', data.budget_head || ''),
      labelValue('Estimated Cost', inr(data.est_cost)),
      labelValue('Total Bidders', String(data.total_bidders || '')),
      labelValue('Technically Qualified', String(data.qualified_bidders || '')),
      labelValue('L1 Vendor', data.l1_vendor || ''),
      labelValue('L1 Amount', inr(data.l1_amount)),
      ...spacer(1),
      sectionHeading('Agenda Items'),
      new Paragraph({ children: [new TextRun({ text: '1. Confirmation of quorum.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. Review of GeM bid process and scrutiny report.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. Verification of L1 rate and reasonability certificate.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. Recommendation for purchase order placement with L1 vendor.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '5. Any other matter with permission of the Chairman.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer (Secretary)' }, { label: 'DPC Chairman' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCInstituteBIDCertificate {
  /** DOC-33: Institute BID Certificate */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('INSTITUTE BID CERTIFICATE', `GeM Bid No: ${data.bid_no || ''}`),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `This is to certify that the GeM Bid bearing No. ${data.bid_no || '___'} published on ${fmtDate(data.bid_publish_date)} and closed on ${fmtDate(data.bid_end_date)} for ${data.item_name || '___'} has been conducted in strict compliance with the following:`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      simpleTable([
        ['Sr.', 'Compliance Point', 'Status'],
        ['1', 'Gujarat State Procurement Policy 2024', '✓ Complied'],
        ['2', 'GFR 2017 Rules applicable to State procurement', '✓ Complied'],
        ['3', 'Make-in-India Order (Local Content)', '✓ Complied'],
        ['4', 'Minimum bid duration of 21 days maintained', '✓ Complied'],
        ['5', 'No post-bid negotiation carried out', '✓ Complied'],
        ['6', 'Quantities not split to avoid committee approval', '✓ Complied'],
        ['7', 'EMD collected from all bidders as per rules', '✓ Complied'],
        ['8', 'e-PBG / SD clause included in bid terms', '✓ Complied'],
        ['9', 'Reverse Auction conducted (for eligible amount)', data.ra_conducted ? '✓ Complied' : 'Not Applicable'],
        ['10', 'L1 identification done without negotiation', '✓ Complied'],
      ]),
      ...spacer(2),
      new Paragraph({ children: [new TextRun({ text: 'We certify that this procurement is transparent, competitive, and in accordance with all applicable rules and policies.', font: 'Times New Roman', size: 22, italics: true })] }),
      ...spacer(3),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal / Director, LDCE' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCL1InfoSheet {
  /** DOC-34: L1 INFO Sheet for DPC */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('L1 BIDDER INFORMATION SHEET', `For DPC – GeM Bid No: ${data.bid_no || ''}`),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      sectionHeading('L1 Vendor Details'),
      simpleTable([
        ['Parameter', 'Details'],
        ['Firm / Company Name', data.l1_vendor || ''],
        ['GeM Seller ID', data.gem_seller_id || ''],
        ['Registered Address', data.vendor_address || ''],
        ['State', data.vendor_state || ''],
        ['GST Number', data.gst_no || ''],
        ['PAN Number', data.pan_no || ''],
        ['MSME Registration No.', data.msme_no || 'Not Applicable'],
        ['Annual Turnover (Last 3 Yrs)', data.turnover || ''],
        ['Contact Person', data.contact_person || ''],
        ['Mobile / Email', data.contact_info || ''],
      ], [40, 60]),
      ...spacer(1),
      sectionHeading('L1 Financial Bid Details'),
      simpleTable([
        ['Component', 'Amount (Rs)'],
        ['Basic Price', inr(data.basic_price)],
        ['GST', inr(data.gst_amount)],
        ['Other Taxes/Charges', inr(data.other_charges)],
        ['Total L1 Bid Value', inr(data.l1_amount)],
        ['Estimated Cost', inr(data.est_cost)],
        ['Savings', inr(parseFloat(data.est_cost || 0) - parseFloat(data.l1_amount || 0))],
      ], [60, 40]),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCDPCMOM {
  /** DOC-35: DPC Minutes of Meeting */
  static async generate(data = {}) {
    const attendees = data.attendees || [];
    const children = [
      ...ldceHeader('MINUTES OF MEETING – DEPARTMENTAL PURCHASE COMMITTEE (DPC)', data.meeting_ref || 'LDCE/DPC/2026-27/___'),
      labelValue('Meeting Date & Time', fmtDate(data.meeting_date) + ' | ' + (data.meeting_time || '___')),
      labelValue('Venue', data.venue || 'Conference Room, LDCE'),
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
      labelValue('Estimated Cost', inr(data.est_cost)),
      ...spacer(1),
      sectionHeading('Proceedings & Deliberations'),
      new Paragraph({ children: [new TextRun({ text: data.recommendation || 'The Committee deliberated on the GeM bid outcome, reviewed the Scrutiny Report and Rate Reasonability Certificate. The L1 rate was found to be within acceptable range. After thorough discussion, the Committee resolved to recommend placement of Purchase Order.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      sectionHeading('Resolution'),
      new Paragraph({ children: [new TextRun({ text: `RESOLVED: That the Competent Authority (Principal/Director) be requested to approve and place a Purchase Order on GeM with ${data.l1_vendor || '___'} for ${data.item_name || '___'} at the L1 value of ${inr(data.l1_amount)} charged to ${data.budget_head || '___'}.`, bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(3),
      signatureBlock([...attendees.map((a, i) => ({ label: i === 0 ? 'DPC Chairman' : `DPC Member ${i}`, name: a.name })), { label: 'Store Officer (Secretary)' }, { label: 'Principal (Approval)' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCDPCIndex, DOCDPCForwardingLetter, DOCDPCAgenda, DOCInstituteBIDCertificate, DOCL1InfoSheet, DOCDPCMOM };
