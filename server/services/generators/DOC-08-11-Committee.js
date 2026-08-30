/**
 * DOC-08: Office Order – Department Representatives
 * DOC-09: Office Order – Expert Committees
 * DOC-10: Office Order – Special Committees (DLPC, Write-off, AC)
 * DOC-11: Note for Change in Expert Committee / Representatives
 */
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, fmtDate } = require('./DOC-common');

class DOCCommitteeOrders {

  /** DOC-08: Department Representatives Office Order */
  static async generateDeptRepsOrder(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const orderNo = data.order_no || `LDCE/S&P/ORDER/DEPT-REPS/${fin_year}/01`;
    const reps = data.reps || []; // [{dept_name, rep1_name, rep1_desig, rep2_name, rep2_desig}]

    const children = [
      ...ldceHeader('OFFICE ORDER', `Order No: ${orderNo}    Date: ${fmtDate(data.date)}`),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `In exercise of powers vested, the following faculty members are hereby designated as Department Representatives for Store & Purchase activities for the year ${fin_year}. They shall coordinate all indenting, goods receipt, and inspection activities for their respective departments.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      sectionHeading('Department Representatives List'),
      simpleTable([
        ['Sr.', 'Department', 'Rep 1 (Name & Designation)', 'Rep 2 (Name & Designation)'],
        ...reps.map((r, i) => [
          String(i + 1), r.dept_name || '',
          `${r.rep1_name || ''} (${r.rep1_desig || ''})`,
          `${r.rep2_name || ''} (${r.rep2_desig || ''})`
        ])
      ], [5, 25, 35, 35]),
      ...spacer(2),
      new Paragraph({ children: [new TextRun({ text: 'This order comes into effect from the date of issuance.', font: 'Times New Roman', size: 22, italics: true })] }),
      ...spacer(3),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal / Director, LDCE' }])
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }

  /** DOC-09: Expert Committees Office Order */
  static async generateExpertCommitteeOrder(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const orderNo = data.order_no || `LDCE/S&P/ORDER/EXPERT-COMM/${fin_year}/01`;
    const committees = data.committees || []; // [{committee_name, discipline, members: [{name, desig}]}]

    const children = [
      ...ldceHeader('OFFICE ORDER', `Order No: ${orderNo}    Date: ${fmtDate(data.date)}`),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `In accordance with Gujarat Procurement Rules, the following discipline-wise Expert Committees are constituted for ${fin_year} for technical specification writing, bid evaluation, and inspection of goods.`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      ...committees.flatMap((comm, idx) => [
        sectionHeading(`${idx + 1}. ${comm.committee_name || `${comm.discipline} Expert Committee`}`),
        simpleTable([
          ['Sr.', 'Name', 'Designation', 'Role'],
          ...( comm.members || []).map((m, i) => [
            String(i + 1), m.name || '', m.desig || '', i === 0 ? 'Chairman' : 'Member'
          ])
        ]),
        ...spacer(1)
      ]),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Head S&P' }, { label: 'Principal / Director, LDCE' }])
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }

  /** DOC-10: Special Committees Order (DLPC, Write-off, AC) */
  static async generateSpecialCommitteeOrder(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const orderNo = data.order_no || `LDCE/S&P/ORDER/SPECIAL-COMM/${fin_year}/01`;
    const committee_name = data.committee_name || 'Departmental Local Purchase Committee (DLPC)';
    const members = data.members || [];

    const children = [
      ...ldceHeader('OFFICE ORDER', `Order No: ${orderNo}    Date: ${fmtDate(data.date)}`),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({
          text: `The following committee is hereby constituted for the financial year ${fin_year}:`,
          font: 'Times New Roman', size: 22
        })]
      }),
      ...spacer(1),
      sectionHeading(committee_name),
      simpleTable([
        ['Sr.', 'Name', 'Designation', 'Department', 'Role in Committee'],
        ...members.map((m, i) => [String(i + 1), m.name || '', m.desig || '', m.dept_name || '', i === 0 ? 'Chairman' : 'Member'])
      ]),
      ...spacer(2),
      signatureBlock([{ label: 'Store Officer' }, { label: 'Principal / Director, LDCE' }])
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }

  /** DOC-11: Note for Change in Expert Committee / Representatives */
  static async generateChangeNote(data = {}) {
    const children = [
      ...ldceHeader('OFFICE NOTE', 'Note for Change in Expert Committee / Department Representative'),
      ...spacer(1),
      labelValue('Note No', data.note_no || 'LDCE/S&P/CHG-NOTE/2026-27/01'),
      labelValue('Date', fmtDate(data.date)),
      labelValue('Department', data.dept_name || ''),
      labelValue('Reason for Change', data.reason || 'Transfer / Retirement / Promotion'),
      ...spacer(1),
      sectionHeading('Outgoing Member'),
      labelValue('Name', data.outgoing_name || ''),
      labelValue('Designation', data.outgoing_desig || ''),
      labelValue('Committee', data.committee_name || ''),
      ...spacer(1),
      sectionHeading('Incoming Member'),
      labelValue('Name', data.incoming_name || ''),
      labelValue('Designation', data.incoming_desig || ''),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'This change is effective immediately upon approval.', font: 'Times New Roman', size: 22 })] }),
      ...spacer(3),
      signatureBlock([{ label: 'HOD' }, { label: 'Store Officer' }, { label: 'Principal' }])
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = DOCCommitteeOrders;
