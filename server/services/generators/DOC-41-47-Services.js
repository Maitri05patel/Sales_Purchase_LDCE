/**
 * DOC-41: Inquiry Letter (Non-GeM)
 * DOC-42: Comparative Statement (Govt / Non-Govt)
 * DOC-43: Purchase Order (PO – Non-GeM)
 * DOC-44: Repairable Equipment Register
 * DOC-45: Note for Approval of Repairing
 * DOC-46: Work Order (WO – Repairing)
 * DOC-47: Pass for Payment (Non-GeM & Repair)
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate, INST_NAME } = require('./DOC-common');

class DOCInquiryLetter {
  /** DOC-41: Inquiry Letter to vendors for local purchase */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('INQUIRY LETTER', `Ref No: ${data.ref_no || 'LDCE/S&P/INQ/2026-27/___'}`),
      labelValue('Date', fmtDate()),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'To,', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: 'M/s _____________________', bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: 'Address: _________________', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `Sub: Invitation of Quotation for Supply of ${data.item_name || '___'} – Regarding`, bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `${INST_NAME} invites sealed quotations from reputed firms/suppliers for the supply of the following items. Quotations should be submitted to the Store & Purchase Section by ${fmtDate(data.last_date)} up to 4:00 PM.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      sectionHeading('Items Required'),
      simpleTable([
        ['Sr.', 'Item Description', 'Qty', 'Unit', 'Specifications'],
        ...(data.items || [{ item_name: data.item_name, qty: data.qty, unit: 'Nos', specs: data.specs }]).map((it, i) => [
          String(i + 1), it.item_name || '', String(it.qty || ''), it.unit || 'Nos', it.specs || ''
        ])
      ]),
      ...spacer(1),
      sectionHeading('Terms & Conditions'),
      new Paragraph({ children: [new TextRun({ text: '1. Rates should be quoted inclusive of all taxes and GST.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: `2. Delivery at: ${data.delivery_location || 'Store, LDCE, Ahmedabad-380015'}.`, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. Payment: 30 days from acceptance of goods.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. Warranty: As per specifications.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '5. The institute reserves the right to reject any or all quotations without assigning any reason.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(3),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCComparativeStatement {
  /** DOC-42: Comparative Statement */
  static async generate(data = {}) {
    const vendors = data.vendors || [];
    const items = data.items || [];

    // Build header row with vendor names
    const headerRow = ['Sr.', 'Item Description', 'Qty', 'Unit', ...vendors.map(v => `${v.name}\n(Rs)`), 'L1 Rate', 'Remarks'];
    const dataRows = items.map((it, i) => {
      const rates = vendors.map(v => inr(v.rates?.[i]));
      const l1 = Math.min(...vendors.map(v => parseFloat(v.rates?.[i] || Infinity)));
      return [String(i + 1), it.item_name || '', String(it.qty || ''), it.unit || 'Nos', ...rates, inr(l1), ''];
    });

    const children = [
      ...ldceHeader('COMPARATIVE STATEMENT', `${data.fund_type || 'Govt Fund'} – Local Purchase`),
      labelValue('Ref No', data.ref_no || 'LDCE/S&P/COMP/2026-27/___'),
      labelValue('Date', fmtDate()),
      labelValue('Department', data.dept_name || ''),
      labelValue('Inquiry Ref No', data.inquiry_ref || ''),
      labelValue('Last Date of Quotation', fmtDate(data.last_date)),
      labelValue('Number of Quotations Received', String(vendors.length)),
      ...spacer(1),
      sectionHeading('Comparative Rate Statement'),
      simpleTable([headerRow, ...dataRows]),
      ...spacer(1),
      sectionHeading('Recommendation'),
      new Paragraph({ children: [new TextRun({ text: `L1 (Lowest) Rate is quoted by: ${data.l1_vendor || '___'} at a total value of ${inr(data.l1_total)}.`, bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: 'It is recommended to place the order with the L1 firm, subject to approval of the competent authority.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Prepared By' }, { label: 'Checked By 1' }, { label: 'Checked By 2' }, { label: 'HOD' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCPurchaseOrderNonGeM {
  /** DOC-43: Purchase Order (Non-GeM) */
  static async generate(data = {}) {
    const items = data.items || [{ item_name: data.item_name, qty: data.qty, unit_rate: data.unit_rate, total: data.total_value }];
    const children = [
      ...ldceHeader('PURCHASE ORDER', `PO No: ${data.order_no || ''}`),
      labelValue('Date', fmtDate(data.order_date)),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'To,', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: data.supplier_name || 'M/s ___', bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: data.supplier_address || '', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `Sub: Purchase Order for supply of ${data.item_name || '___'}`, bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: `Ref: Comparative Statement Ref No: ${data.ref_no || '___'} | Principal Approval dated: ${fmtDate(data.approval_date)}`, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'You are hereby requested to supply the following items as per the terms and conditions mentioned below:', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      sectionHeading('Order Details'),
      simpleTable([
        ['Sr.', 'Item Description', 'Qty', 'Unit', 'Unit Rate (Rs)', 'Total (Rs)'],
        ...items.map((it, i) => [String(i + 1), it.item_name || '', String(it.qty || ''), it.unit || 'Nos', inr(it.unit_rate), inr(it.total)])
      ]),
      ...spacer(1),
      labelValue('Grand Total', inr(data.total_value)),
      ...spacer(1),
      sectionHeading('Terms & Conditions'),
      labelValue('Delivery Location', data.delivery_location || 'Store, LDCE, Ahmedabad-380015'),
      labelValue('Delivery Date', fmtDate(data.delivery_date)),
      labelValue('Warranty', data.warranty || '1 Year'),
      labelValue('Payment', '100% after delivery and acceptance'),
      labelValue('LD Clause', '1% per week delay, max 5%'),
      ...spacer(3),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCRepairableEquipment {
  /** DOC-44: Repairable Equipment Register */
  static async generate(data = {}) {
    const repairs = data.repairs || [];
    const children = [
      ...ldceHeader('REPAIRABLE EQUIPMENT REGISTER', `Department: ${data.dept_name || 'All Departments'}`),
      labelValue('Date', fmtDate()),
      labelValue('Financial Year', data.fin_year || '2026-27'),
      ...spacer(1),
      simpleTable([
        ['Sr.', 'Dept', 'Equipment Name', 'Purchase Date', 'Original Cost', 'Date Non-Working', 'Est. Repair Cost', 'Market Value', 'Status'],
        ...repairs.map((r, i) => [
          String(i + 1), r.dept_name || '', r.equipment_name || '',
          fmtDate(r.purchase_date), inr(r.original_cost),
          fmtDate(r.breakdown_date), inr(r.est_repair_cost), inr(r.market_value),
          r.status || 'Submitted for Approval'
        ])
      ], [5, 9, 18, 10, 10, 10, 12, 12, 14]),
      ...spacer(2),
      signatureBlock([{ label: 'Dept In-charge' }, { label: 'HOD' }, { label: 'Store Officer' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCRepairApprovalNote {
  /** DOC-45: Note for Approval of Repairing */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('NOTE SHEET', 'Note for Administrative Approval of Equipment Repair'),
      labelValue('Note No', data.note_no || 'LDCE/S&P/REP-NOTE/2026-27/___'),
      labelValue('Date', fmtDate()),
      labelValue('Department', data.dept_name || ''),
      ...spacer(1),
      sectionHeading('Equipment Details'),
      labelValue('Name of Equipment / Instrument', data.equipment_name || ''),
      labelValue('Original Date of Purchase', fmtDate(data.purchase_date)),
      labelValue('Original Purchase Cost', inr(data.original_cost)),
      labelValue('Date Since Non-Working', fmtDate(data.breakdown_date)),
      labelValue('Previously Repaired?', data.prev_repaired ? 'Yes – ' + (data.last_repair_info || '') : 'No'),
      labelValue('Prevailing Market Value', inr(data.market_value)),
      ...spacer(1),
      sectionHeading('Nature of Fault'),
      new Paragraph({ children: [new TextRun({ text: data.fault_desc || '___', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      sectionHeading('Cost Justification'),
      labelValue('Estimated Repair Cost', inr(data.est_repair_cost)),
      new Paragraph({ children: [new TextRun({ text: `The estimated repair cost of ${inr(data.est_repair_cost)} is ${parseFloat(data.est_repair_cost || 0) < parseFloat(data.market_value || 1) * 0.5 ? 'within acceptable range (< 50% of market value). Repair is recommended.' : 'being evaluated against replacement cost.'}`, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'It is requested to kindly grant approval for repairing of the above equipment.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(3),
      signatureBlock([{ label: 'HOD' }, { label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCWorkOrder {
  /** DOC-46: Work Order (WO – Repairing) */
  static async generate(data = {}) {
    const children = [
      ...ldceHeader('WORK ORDER', `WO No: ${data.order_no || ''}`),
      labelValue('Date', fmtDate(data.order_date)),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'To,', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: data.agency_name || 'M/s ___', bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: data.agency_address || '', font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `Sub: Work Order for Repairing of ${data.equipment_name || '___'} – Regarding`, bold: true, font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: `Ref: Approval Note No: ${data.approval_note_no || '___'} dated: ${fmtDate(data.approval_date)}`, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: `You are hereby authorized to carry out the repair of the following equipment belonging to ${data.dept_name || 'Department'}, LDCE:`, font: 'Times New Roman', size: 22 })] }),
      ...spacer(1),
      sectionHeading('Repair Scope'),
      labelValue('Equipment Name', data.equipment_name || ''),
      labelValue('Department', data.dept_name || ''),
      labelValue('Nature of Repair', data.repair_scope || data.fault_desc || ''),
      labelValue('Agreed Repair Cost', inr(data.agreed_cost)),
      labelValue('Completion Timeline', data.completion_timeline || '15 days from date of WO'),
      ...spacer(1),
      sectionHeading('Terms'),
      new Paragraph({ children: [new TextRun({ text: '1. The equipment must be repaired to full working condition.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. A service/repair report must be submitted after completion.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. Warranty on repair: minimum 90 days.', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. Payment will be released only after satisfactory inspection.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(3),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCPassForPaymentRepair {
  /** DOC-47: Pass for Payment – Non-GeM & Repair */
  static async generate(data = {}) {
    const gross = parseFloat(data.gross_amount || 0);
    const ded = parseFloat(data.deductions || 0);
    const net = gross - ded;
    const children = [
      ...ldceHeader('PASS FOR PAYMENT', `Non-GeM / Repairing – Voucher No: ${data.voucher_no || ''}`),
      labelValue('Date', fmtDate()),
      labelValue('Work Order No', data.wo_no || data.po_no || ''),
      labelValue('Vendor / Agency', data.vendor_name || ''),
      labelValue('Invoice No & Date', data.invoice_no_date || ''),
      labelValue('Nature of Work', data.nature_of_work || ''),
      labelValue('Department', data.dept_name || ''),
      ...spacer(1),
      sectionHeading('Bill Calculation'),
      simpleTable([
        ['Component', 'Amount (Rs)'],
        ['Invoice Amount (Gross)', inr(gross)],
        ['TDS / LD Deductions', inr(ded)],
        ['NET PAYABLE', inr(net)],
      ], [60, 40]),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'Work Completion / Repair Report received: Yes | Goods / Service Accepted: Yes', bold: true, font: 'Times New Roman', size: 22 })] }),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal' }])
    ];
    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCInquiryLetter, DOCComparativeStatement, DOCPurchaseOrderNonGeM, DOCRepairableEquipment, DOCRepairApprovalNote, DOCWorkOrder, DOCPassForPaymentRepair };
