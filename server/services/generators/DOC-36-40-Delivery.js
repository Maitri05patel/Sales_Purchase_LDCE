/**
 * DOC-36: Department Material Receipt Note
 * DOC-37: Technical Inspection Report
 * DOC-38: Pass for Payment Voucher
 * DOC-39: Checklist D & E – Bill Verification
 * DOC-40: Procurement Progress Status Report
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate } = require('./DOC-common');

class DOCReceiptNote {
  /** DOC-36: Department Material Receipt Note */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('DEPARTMENT MATERIAL RECEIPT NOTE', `Order No: ${data.order_no || ''}`),
      labelValue('Date of Receipt', fmtDate(data.receipt_date)),
      labelValue('Department', data.dept_name || ''),
      labelValue('GeM Order / PO No', data.order_no || ''),
      labelValue('Supplier Name', data.supplier_name || ''),
      labelValue('Invoice No & Date', data.invoice_no_date || ''),
      ...spacer(1),
      sectionHeading('Items Received'),
      simpleTable([
        ['Sr.', 'Item Name', 'Qty Ordered', 'Qty Received', 'Unit', 'Remarks'],
        ...(data.items || []).map((it, i) => [String(i + 1), it.item_name || '', String(it.qty_ordered || ''), String(it.qty_received || ''), it.unit || 'Nos', it.remarks || 'OK'])
      ]),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'All items listed above have been physically received and are pending technical inspection.', font: 'Times New Roman', size: 22, italics: true })] }),
      ...spacer(3),
      signatureBlock([{ label: 'Receiving Officer\n(Dept Representative)' }, { label: 'HOD' }, { label: 'Store Officer' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCInspectionReport {
  /** DOC-37: Technical Inspection Report */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('TECHNICAL INSPECTION REPORT', `PO / GeM Order No: ${data.order_no || ''}`),
      labelValue('Date of Inspection', fmtDate(data.inspection_date)),
      labelValue('Date of Goods Arrival', fmtDate(data.receipt_date)),
      labelValue('Department', data.dept_name || ''),
      labelValue('Supplier', data.supplier_name || ''),
      labelValue('Invoice No & Date', data.invoice_no_date || ''),
      ...spacer(1),
      sectionHeading('Inspection Parameters'),
      simpleTable([
        ['Sr.', 'Inspection Point', 'Observation', 'Status'],
        ['1', 'Technical Specifications as per PO / Bid', 'Verified against specification sheet', data.specs_verified ? '✓ Confirmed' : '✗ Deviation Found'],
        ['2', 'Make / Model / Brand', data.make_model || '___', data.specs_verified ? '✓ As per Order' : '✗ Mismatch'],
        ['3', 'Quantity as per Invoice vs Received', data.invoice_no_date || '', 'Matched'],
        ['4', 'Accessories & Consumables', 'Checked against packing list', data.accessories_ok ? '✓ Complete' : '✗ Missing Items'],
        ['5', 'Physical Condition', 'No visible damage / transit damage', 'Good Condition'],
        ['6', 'Working / Functional Test', 'Powered on and tested', data.working_status || 'Fully Functional & Accepted'],
      ]),
      ...spacer(1),
      sectionHeading('Serial Numbers / Asset Tags'),
      new Paragraph({ children: [new TextRun({ text: data.serial_numbers || 'Serial numbers recorded in stock register', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      sectionHeading('Overall Inspection Verdict'),
      new Paragraph({
        children: [new TextRun({
          text: data.working_status === 'Fully Functional & Accepted'
            ? '✓ ACCEPTED – The goods are technically compliant, fully functional, and acceptable for stock entry.'
            : '✗ REJECTED – Goods do not meet specifications. Vendor advised to replace/repair.',
          bold: true, font: 'Times New Roman', size: 24
        })]
      }),
      ...spacer(3),
      signatureBlock([{ label: 'Expert Member 1' }, { label: 'Expert Member 2' }, { label: 'Expert Member 3' }, { label: 'HOD' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCPassForPayment {
  /** DOC-38: Pass for Payment Voucher */
  static async generate(data = {}) {
    const gross = parseFloat(data.gross_amount || 0);
    const sd = parseFloat(data.sd_retained || 0);
    const ded = parseFloat(data.other_deductions || 0);
    const net = gross - sd - ded;

    const children = [
      ...ldceHeader('PASS FOR PAYMENT VOUCHER', `Voucher No: ${data.voucher_no || ''}`),
      labelValue('Date', fmtDate()),
      labelValue('Sanction Reference', data.sanction_ref || ''),
      labelValue('Order No', data.order_no || ''),
      labelValue('Vendor / Supplier', data.vendor_info || ''),
      labelValue('Invoice No & Date', data.invoice_no_date || ''),
      labelValue('Stock Register Folio No', data.stock_folio_no || ''),
      labelValue('Head of Account (Grant)', data.account_head || ''),
      ...spacer(1),
      sectionHeading('Bill Calculation'),
      simpleTable([
        ['Component', 'Amount (Rs)'],
        ['Invoice / Gross Amount', inr(gross)],
        ['Security Deposit Retained (if DD not submitted)', inr(sd)],
        ['Other Deductions (TDS / LD Penalty)', inr(ded)],
        ['NET PAYABLE AMOUNT', inr(net)],
      ], [60, 40]),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `Net Payable in Words: ${data.net_payable_words || '_______________'}`, bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `Checklist D & E Verified: ${data.chk_de_verified ? '✓ Yes – Cleared for payment' : '○ Pending'}`, bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Store Clerk' }, { label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCChecklistDE {
  /** DOC-39: Checklist D & E – Bill Verification Before Accounts Payment */
  static async generate(data = {}) {
    const checksD = [
      ['1', 'GeM Order / PO copy attached', data.chk_po ? '✓' : '○'],
      ['2', 'Vendor Invoice / Bill attached', data.chk_invoice ? '✓' : '○'],
      ['3', 'Delivery Challan / Packing List attached', data.chk_challan ? '✓' : '○'],
      ['4', 'Department Receipt Note signed by HOD', data.chk_receipt ? '✓' : '○'],
      ['5', 'Technical Inspection Report signed by Expert Committee', data.chk_inspection ? '✓' : '○'],
      ['6', 'Central Stock Register entry made (Folio No noted)', data.chk_stock_entry ? '✓' : '○'],
      ['7', 'DLPC / DPC Sanction Order attached', data.chk_sanction ? '✓' : '○'],
    ];
    const checksE = [
      ['8', 'GST Invoice with GSTIN verified', data.chk_gst ? '✓' : '○'],
      ['9', 'e-PBG / SD submitted by vendor OR retention deducted', data.chk_sd ? '✓' : '○'],
      ['10', 'TDS applicable – deducted if applicable', data.chk_tds ? '✓' : 'N/A'],
      ['11', 'LD (Liquidated Damages) calculated if delivery delayed', data.chk_ld ? '✓' : 'N/A'],
      ['12', 'Net payable amount matches invoice after all deductions', data.chk_net ? '✓' : '○'],
      ['13', 'Payment to be made via PFMS / GeM payment gateway', data.chk_pfms ? '✓' : '○'],
      ['14', 'All documents stamped and signed by Store Officer', data.chk_stamps ? '✓' : '○'],
      ['15', 'Pass for Payment Voucher signed by all authorities', data.chk_voucher ? '✓' : '○'],
    ];
    const children = [
      ...ldceHeader('CHECKLIST D & E', 'Bill Verification Before Submission to Accounts'),
      labelValue('Voucher No', data.voucher_no || ''),
      labelValue('Order No', data.order_no || ''),
      labelValue('Vendor', data.vendor_info || ''),
      labelValue('Net Payable', inr(data.net_payable)),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      sectionHeading('Checklist D – Document Verification'),
      simpleTable([['Sr.', 'Check Point', 'Status'], ...checksD], [8, 72, 20]),
      ...spacer(1),
      sectionHeading('Checklist E – Financial & Payment Verification'),
      simpleTable([['Sr.', 'Check Point', 'Status'], ...checksE], [8, 72, 20]),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Accounts Officer' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCProcurementStatus {
  /** DOC-40: Procurement Progress Status Report */
  static async generate(data = {}) {
    const indents = data.indents || [];
    const children = [
      ...ldceHeader('PROCUREMENT PROGRESS STATUS REPORT', `As on: ${fmtDate()} | Financial Year: ${data.fin_year || '2026-27'}`),
      ...spacer(1),
      sectionHeading('Overall Summary'),
      simpleTable([
        ['Status', 'Count'],
        ['Initiated', String(indents.filter(i => i.status === 'Initiated').length)],
        ['Specs Defined', String(indents.filter(i => i.status === 'Specs_Defined').length)],
        ['Admin Approved', String(indents.filter(i => i.status === 'Admin_Approved').length)],
        ['Bid Published', String(indents.filter(i => i.status === 'Bid_Published').length)],
        ['Sanctioned', String(indents.filter(i => i.status === 'Sanctioned').length)],
        ['Completed', String(indents.filter(i => i.status === 'Completed').length)],
        ['Total', String(indents.length)],
      ], [70, 30]),
      ...spacer(1),
      sectionHeading('Department-wise Procurement Status'),
      simpleTable([
        ['Sr.', 'Indent No', 'Department', 'Item', 'Amount', 'Fund', 'Status'],
        ...indents.map((ind, i) => [
          String(i + 1), ind.indent_no || '', ind.dept_name || '',
          (ind.item_name || '').substring(0, 30),
          inr(ind.total_cost), ind.fund_type || '', ind.status || ''
        ])
      ], [5, 14, 14, 20, 12, 10, 25]),
      ...spacer(2),
      new Paragraph({ children: [new TextRun({ text: 'Total Estimated Value of All Active Procurements: ' + inr(indents.reduce((s, i) => s + parseFloat(i.total_cost || 0), 0)), bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCReceiptNote, DOCInspectionReport, DOCPassForPayment, DOCChecklistDE, DOCProcurementStatus };
