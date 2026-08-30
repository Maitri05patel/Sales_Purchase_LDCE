/**
 * DOC-21: EMD Refund Letter
 * DOC-22: Note for Security Deposit (e-PBG) Submission to Accounts
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, signatureBlock, inr, fmtDate } = require('./DOC-common');

class DOCEMDRefund {
  /** DOC-21: EMD Refund Letter to unsuccessful bidder */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('EMD REFUND LETTER', `Ref No: ${data.refund_ref || 'LDCE/S&P/EMD-REF/2026-27/___'}`),
      labelValue('Date', fmtDate(data.refund_date)),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'To,', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: data.vendor_name || 'M/s _________________', bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: data.vendor_address || '_______________\n_______________', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `Sub: Refund of Earnest Money Deposit (EMD) – GeM Bid No. ${data.bid_order_no || ''} – Regarding`, bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `With reference to the above-mentioned GeM Bid, your firm participated in the bid for ${data.item_name || 'the item'}. After evaluation, your firm could not be selected as the L1 bidder. We hereby return the Earnest Money Deposit (EMD) submitted by your firm.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      sectionHeading('EMD Details Being Returned'),
      labelValue('Demand Draft / PBG No', data.dd_number || ''),
      labelValue('Date of DD', fmtDate(data.dd_date)),
      labelValue('Amount', inr(data.amount)),
      labelValue('Issuing Bank', data.bank_name || ''),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'Please acknowledge receipt of the above DD by signing and returning a copy of this letter.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(2),
      new Paragraph({ children: [new TextRun({ text: 'Acknowledgement: Received the above DD.       Date: ___________    Signature: ___________', font: 'Times New Roman', size: 20, italics: true })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal / Director, LDCE' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCSecurityDepositNote {
  /** DOC-22: Note for e-PBG / Security Deposit submission to Accounts */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('NOTE SHEET', 'Note for Submission of Security Deposit (e-PBG) to Accounts'),
      labelValue('Note No', data.note_no || `LDCE/S&P/SD-NOTE/2026-27/___`),
      labelValue('Date', fmtDate()),
      labelValue('Department', data.dept_name || ''),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `Respected Sir/Ma'am, after finalization of GeM Bid No. ${data.bid_order_no || '___'} for ${data.item_name || '___'}, the following firm has been selected as L1 bidder and a Purchase Order has been issued. The firm has submitted the Security Deposit (e-PBG) as per terms and conditions. It is requested to kindly accept and record the following Security Deposit in the Institute accounts.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      sectionHeading('Security Deposit Details'),
      labelValue('Purchase Order No', data.order_no || ''),
      labelValue('Vendor / Firm Name', data.vendor_name || ''),
      labelValue('Total PO Value', inr(data.total_value)),
      labelValue('SD Amount (5% of PO)', inr(data.amount)),
      labelValue('Instrument Type', data.instrument_type || 'e-PBG / Demand Draft'),
      labelValue('DD / PBG Number', data.dd_number || ''),
      labelValue('Date of Instrument', fmtDate(data.dd_date)),
      labelValue('Issuing Bank & Branch', data.bank_name || ''),
      ...spacer(2),
      new Paragraph({ children: [new TextRun({ text: 'Kindly credit the Security Deposit to Account Head: ' + (data.account_head || '___'), bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal' }, { label: 'Accounts Officer' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCEMDRefund, DOCSecurityDepositNote };
