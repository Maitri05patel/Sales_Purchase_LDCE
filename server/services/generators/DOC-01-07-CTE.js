/**
 * DOC-01 to DOC-07: CTE Annual Demand Statements
 * Statement 1 – Non-IT Equipment
 * Statement 2 – IT Equipment
 * Statement 3 – Furniture
 * Statement 4 – Books & Periodicals
 * Statement 5 – Maintenance & AMC
 * DOC-06 – IT Items Summary
 * DOC-07 – CTE Consolidated Summary
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, sectionHeading, simpleTable, signatureBlock, inr, fmtDate, labelValue } = require('./DOC-common');

const CATEGORY_LABELS = {
  'DOC-01': { cat: 'Non-IT Equipment', stmt: 'Statement 1', sigs: [{ label: 'HOD' }, { label: 'Store Officer' }, { label: 'Principal' }] },
  'DOC-02': { cat: 'IT Equipment',     stmt: 'Statement 2', sigs: [{ label: 'HOD' }, { label: 'IT Expert Committee' }, { label: 'Principal' }] },
  'DOC-03': { cat: 'Furniture',         stmt: 'Statement 3', sigs: [{ label: 'HOD' }, { label: 'Furniture Committee' }, { label: 'Principal' }] },
  'DOC-04': { cat: 'Books & Periodicals', stmt: 'Statement 4', sigs: [{ label: 'Librarian' }, { label: 'Library Committee' }, { label: 'Principal' }] },
  'DOC-05': { cat: 'Maintenance & AMC', stmt: 'Statement 5', sigs: [{ label: 'HOD' }, { label: 'Store Officer' }, { label: 'Principal' }] },
};

class DOCCTEStatements {
  static async generate(docId, data = {}) {
    const cfg = CATEGORY_LABELS[docId];
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];

    const tableRows = [
      ['Sr.', 'Department', 'Item Name', 'Qty', 'Approx Rate (Rs)', 'Total Cost (Rs)', 'Grant Head', 'GeM Available', 'Justification'],
      ...items.map((it, idx) => [
        String(idx + 1), it.dept_name || '', it.item_name || '',
        String(it.qty || ''), inr(it.unit_rate), inr(it.total_cost),
        it.grant_head || '', it.gem_available ? 'Yes' : 'No', it.justification || ''
      ])
    ];

    const totalCost = items.reduce((s, i) => s + parseFloat(i.total_cost || 0), 0);

    const children = [
      ...ldceHeader(
        `ANNUAL CTE PROPOSAL ${fin_year}`,
        `${cfg.stmt}: ${cfg.cat}`
      ),
      labelValue('Financial Year', fin_year),
      labelValue('Prepared Date', fmtDate()),
      labelValue('Total Items', items.length),
      labelValue('Total Estimated Cost', inr(totalCost)),
      ...spacer(1),
      sectionHeading('Item-wise Demand List'),
      simpleTable(tableRows, [4, 10, 18, 5, 10, 10, 10, 8, 25]),
      ...spacer(2),
      signatureBlock(cfg.sigs)
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCITSummary {
  /** DOC-06: Summary of IT Items across all departments */
  static async generate(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const below5L = items.filter(i => parseFloat(i.total_cost || 0) <= 500000);
    const above5L = items.filter(i => parseFloat(i.total_cost || 0) > 500000);

    const mkTable = (rows, heading) => [
      sectionHeading(heading),
      simpleTable([
        ['Sr.', 'Dept', 'Item', 'Qty', 'Total (Rs)'],
        ...rows.map((it, idx) => [String(idx + 1), it.dept_name || '', it.item_name || '', String(it.qty || ''), inr(it.total_cost)])
      ])
    ];

    const children = [
      ...ldceHeader('IT ITEMS – SUMMARY SHEET', `Financial Year: ${fin_year}`),
      ...spacer(1),
      ...mkTable(below5L, 'Category A: Below Rs 5.00 Lakhs'),
      ...spacer(1),
      ...mkTable(above5L, 'Category B: Above Rs 5.00 Lakhs'),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Principal' }])
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCCTESummary {
  /** DOC-07: Institute-wide CTE Consolidated Summary */
  static async generate(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const byCategory = data.byCategory || [];
    const byGrant = data.byGrant || [];

    const children = [
      ...ldceHeader('CTE CONSOLIDATED SUMMARY', `Institute-wide Annual Demands – ${fin_year}`),
      ...spacer(1),
      sectionHeading('Summary by Category'),
      simpleTable([
        ['Category', 'No. of Items', 'Total Estimated Cost (Rs)'],
        ...byCategory.map(r => [r.category, String(r.item_count), inr(r.total_amount)])
      ]),
      ...spacer(1),
      sectionHeading('Summary by Grant Head'),
      simpleTable([
        ['Grant Head', 'No. of Items', 'Total Estimated Cost (Rs)'],
        ...byGrant.map(r => [r.grant_head, String(r.item_count), inr(r.total_amount)])
      ]),
      ...spacer(2),
      new Paragraph({
        children: [new TextRun({ text: 'Grand Total: ' + inr(byCategory.reduce((s, r) => s + parseFloat(r.total_amount || 0), 0)), bold: true, size: 24, font: 'Times New Roman' })]
      }),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Principal (with Seal)' }])
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCCTEStatements, DOCITSummary, DOCCTESummary };
