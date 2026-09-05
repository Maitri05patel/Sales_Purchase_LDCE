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
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, UnderlineType,
  PageOrientation
} = require('docx');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { ldceHeader, spacer, sectionHeading, simpleTable, signatureBlock, inr, fmtDate, labelValue } = require('./DOC-common');

const CATEGORY_LABELS = {
  'DOC-01': { cat: 'Non-IT Equipment', stmt: 'Statement 1', sigs: [{ label: 'HOD' }, { label: 'Store Officer' }, { label: 'Principal' }] },
  'DOC-02': { cat: 'IT Equipment',     stmt: 'Statement 2', sigs: [{ label: 'HOD' }, { label: 'IT Expert Committee' }, { label: 'Principal' }] },
  'DOC-03': { cat: 'Furniture',         stmt: 'Statement 3', sigs: [{ label: 'HOD' }, { label: 'Furniture Committee' }, { label: 'Principal' }] },
  'DOC-04': { cat: 'Books & Periodicals', stmt: 'Statement 4', sigs: [{ label: 'Librarian' }, { label: 'Library Committee' }, { label: 'Principal' }] },
  'DOC-05': { cat: 'Maintenance & AMC', stmt: 'Statement 5', sigs: [{ label: 'HOD' }, { label: 'Store Officer' }, { label: 'Principal' }] },
};

const DOC01_COL_HEADERS = [
  'Sr.',
  'Name of Item',
  'Qty.\nRequired',
  'Approx. Rate as per GeM\n(Rs.)',
  'Total Amount\n(Rs.)',
  'Department /\nDiscipline',
  'Is it available on GeM or not?\nYes/No',
  'Proposed item to be procured from which grant\n(State/Center)',
  'Total Approximate Annual Capital+Recurring Expenditure\n(if there is no recurring cost write NIL)',
  'Procurement Model\n(New Purchase/Renatal/Hybrid)',
  'Is demanded Item to be procured against Condemn item',
  'Total Quantity Required as per Norms',
  'Available Qty.',
  'Procurement Year of Available Item',
  'Condition of Available Item\n(Working/Non Working/ Obsolete/Not as per requirement)',
  'What is the estimated lifespan of item to be procured?',
  'How operation and maintenance will be carried out for the demanded item?',
  'Approximate usage of demanded item',
  'Detailed Justification'
];

const DOC02_COL_HEADERS = [
  'Sr.',
  'Name of Item\n(Type of IT Hardware/Software)',
  'Qty.\nRequired',
  'Approx. Rate as per GeM\n(Rs.)',
  'Total Amount\n(Rs.)',
  'Department /\nDiscipline',
  'Is it available on GeM or not?\nYes/No',
  'Proposed IT item to be procured from which grant\n(State/Center)',
  'Total Quantity Required as per Norms',
  'Available Qty.',
  'Procurement Year of Available IT Item',
  'Is demanded Item to be procured against Condemn item',
  'Condition of Available IT Item\n(Working/Non Working/ Obsolete/Not as per requirement)',
  'What is the estimated lifespan of IT hardware to be procured?',
  'What procedures have been followed for the disposal of old equipment?',
  'In case of software, is standard software to be procured?',
  'In case of software, which type of software to be procured?\n(Educational/Office Work/Other)',
  'How operation and maintenance will be carried out for the demanded item?',
  'Approximate usage of demanded item',
  'Detailed Justification'
];

const DOC03_COL_HEADERS = [
  'Sr.',
  'Name of Item',
  'Qty.\nRequired',
  'Approx. Rate\n(Rs.)',
  'Total Amount\n(Rs.)',
  'Department /\nDiscipline',
  'Avalable Qty.',
  'Is it available\non GeM or\nnot? Yes/No',
  'Detailed Justification'
];

const DOC04_COL_HEADERS = [
  'Sr.',
  'Name of Department /\nDiscipline',
  'No. of Books\nRequired',
  'Is it available on GeM\nor not? Yes/No',
  'Approx. Total\nAmount\n(Rs.)'
];

const DOC05_COL_HEADERS = [
  'Sr.',
  'Name of Item',
  'Cost of Item\n(Rs.)',
  'Procured Year',
  'Required Maintenance Amount\n(Rs.)',
  'Is it available on GeM or not? Yes/No',
  'Remarks'
];

class DOCCTEStatements {
  static async generate(docId, data = {}) {
    if (docId === 'DOC-01') {
      return this.generateDoc01Docx(data);
    }
    if (docId === 'DOC-02') {
      return this.generateDoc02Docx(data);
    }
    if (docId === 'DOC-03') {
      return this.generateDoc03Docx(data);
    }
    if (docId === 'DOC-04') {
      return this.generateDoc04Docx(data);
    }
    if (docId === 'DOC-05') {
      return this.generateDoc05Docx(data);
    }

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

  /**
   * CTE Excel Generators: Produces exact Excel format as per official CTE templates
   */
  static async generateExcel(docId, data = {}) {
    if (docId === 'DOC-01') {
      return this.generateDoc01Excel(data);
    }
    if (docId === 'DOC-02') {
      return this.generateDoc02Excel(data);
    }
    if (docId === 'DOC-03') {
      return this.generateDoc03Excel(data);
    }
    if (docId === 'DOC-04') {
      return this.generateDoc04Excel(data);
    }
    if (docId === 'DOC-05') {
      return this.generateDoc05Excel(data);
    }
    throw new Error(`Excel generation is only supported for DOC-01 through DOC-05 currently`);
  }

  static async generateDoc01Excel(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const templatePath = path.resolve(__dirname, '../../../Format-Purchase-2026-27/1.CTE formats for NI/1. Statement 1_Non-IT Equipments.xlsx');

    const wb = new ExcelJS.Workbook();
    let ws;

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
      ws = wb.worksheets[0];
    } else {
      // Programmatic fallback if template file is missing
      ws = wb.addWorksheet('Statement 1 (Non-IT Equipment)', {
        pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
      });
      // Header rows 1 to 4
      ws.mergeCells('A1:S1');
      ws.getCell('A1').value = 'Statement -  1';
      ws.getCell('A1').font = { name: 'Calibri', size: 14, bold: true };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.mergeCells('A2:S2');
      ws.getCell('A2').value = 'Commissionerate of Technical Education, Gujarat State, Gandhinagar';
      ws.getCell('A2').font = { name: 'Calibri', size: 12, bold: true };
      ws.getCell('A2').alignment = { horizontal: 'center' };

      ws.mergeCells('A3:S3');
      ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
      ws.getCell('A3').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('A3').alignment = { horizontal: 'center' };

      ws.mergeCells('A4:S4');
      ws.getCell('A4').value = '[ Consolidated list of Non-IT Equipments for all Departments in this Single Sheet Only ]';
      ws.getCell('A4').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('A4').alignment = { horizontal: 'center' };

      ws.mergeCells('A5:E5');
      ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
      ws.getCell('A5').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('O5:S5');
      ws.getCell('O5').value = 'Type of Course: (Diploma/UG/PG)';
      ws.getCell('O5').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('O5').alignment = { horizontal: 'right' };

      ws.getCell('S6').value = 'Amount in Rs.';
      ws.getCell('S6').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('S6').alignment = { horizontal: 'right' };

      // Headers row 7
      const r7 = ws.getRow(7);
      r7.height = 100;
      DOC01_COL_HEADERS.forEach((h, idx) => {
        const c = r7.getCell(idx + 1);
        c.value = h;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Numbers row 8
      const r8 = ws.getRow(8);
      for (let i = 1; i <= 19; i++) {
        const c = r8.getCell(i);
        c.value = i;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      }

      // Initial template blank rows 9 to 16
      for (let r = 9; r <= 16; r++) {
        const row = ws.getRow(r);
        row.getCell(1).value = r - 8;
        for (let c = 1; c <= 19; c++) {
          row.getCell(c).font = { name: 'Calibri', size: 9 };
          row.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        }
      }

      // Notes and certificates in fallback
      ws.mergeCells('A19:S19');
      ws.getCell('A19').value = 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.';
      ws.getCell('A19').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A20:S20');
      ws.getCell('A20').value = 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહી.';
      ws.getCell('A20').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A21:S21');
      ws.getCell('A21').value = 'પ્રમાણપત્ર';
      ws.getCell('A21').font = { name: 'Calibri', size: 12, bold: true, underline: true };
      ws.getCell('A21').alignment = { horizontal: 'center' };

      ws.mergeCells('A22:S22');

      ws.getCell('E24').value = 'Institute Seal';
      ws.getCell('E24').font = { name: 'Calibri', size: 11, bold: true };

      ws.getCell('S24').value = 'Principal Sign';
      ws.getCell('S24').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('S24').alignment = { horizontal: 'right' };
    }

    // Ensure Institute Name & Financial Year are up to date
    ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
    ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
    if (ws.getCell('O5')) {
      ws.getCell('O5').value = 'Type of Course: (Diploma/UG/PG)';
    }
    if (ws.getCell('S6')) {
      ws.getCell('S6').value = 'Amount in Rs.';
    }

    const defaultRowCount = 8;
    const startRow = 9;
    const itemCount = items.length;

    // If more than 8 items, insert rows at row 17 before TOTAL
    if (itemCount > defaultRowCount) {
      const extraRows = itemCount - defaultRowCount;
      const blankRowData = new Array(19).fill('');
      const toInsert = Array.from({ length: extraRows }, () => blankRowData);
      ws.spliceRows(17, 0, ...toInsert);

      // Copy formatting from row 9 to newly inserted rows
      const templateRow = ws.getRow(9);
      for (let r = 17; r < 17 + extraRows; r++) {
        const row = ws.getRow(r);
        row.height = templateRow.height || 26;
        for (let c = 1; c <= 19; c++) {
          const srcCell = templateRow.getCell(c);
          const destCell = row.getCell(c);
          destCell.font = { ...srcCell.font };
          destCell.alignment = { ...srcCell.alignment };
          destCell.border = srcCell.border ? JSON.parse(JSON.stringify(srcCell.border)) : undefined;
        }
      }
    }

    const totalRowsToIterate = Math.max(itemCount, defaultRowCount);
    let totalQty = 0;
    let totalAmount = 0;

    for (let i = 0; i < totalRowsToIterate; i++) {
      const rowIdx = startRow + i;
      const row = ws.getRow(rowIdx);
      const it = items[i];

      if (it) {
        const qty = Number(it.qty) || 0;
        const rate = Number(it.unit_rate) || 0;
        const total = Number(it.total_cost) || (qty * rate);
        totalQty += qty;
        totalAmount += total;

        row.getCell(1).value = i + 1;
        row.getCell(2).value = it.item_name || '';
        row.getCell(3).value = qty;
        row.getCell(4).value = rate;
        row.getCell(5).value = total;
        row.getCell(6).value = it.dept_name || it.department || '';
        row.getCell(7).value = it.gem_available ? 'Yes' : 'No';
        row.getCell(8).value = it.grant_head || 'State Grant (TED-5)';
        row.getCell(9).value = (it.annual_expenditure !== undefined && it.annual_expenditure !== null && it.annual_expenditure !== '') ? Number(it.annual_expenditure) : total;
        row.getCell(10).value = it.procurement_model || 'New Purchase';
        row.getCell(11).value = it.against_condemn ? 'Yes' : 'No';
        row.getCell(12).value = Number(it.norm_qty) || 0;
        row.getCell(13).value = Number(it.available_qty) || 0;
        row.getCell(14).value = it.procurement_year || (it.available_qty > 0 ? '2020-21' : '-');
        row.getCell(15).value = it.stock_condition || 'Working';
        row.getCell(16).value = it.lifespan || '10 Years';
        row.getCell(17).value = it.maint_plan || 'Through Department Technical Staff & AMC';
        row.getCell(18).value = it.approx_usage || 'For UG/PG Laboratory & Research Practicals';
        row.getCell(19).value = it.justification || '';
      } else {
        // Clear unused template row numbers
        row.getCell(1).value = null;
        for (let c = 2; c <= 19; c++) {
          row.getCell(c).value = null;
        }
      }
    }

    const lastDataRow = startRow + totalRowsToIterate - 1;
    const totalRowIdx = lastDataRow + 1;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(3).value = { formula: `SUM(C9:C${lastDataRow})`, result: totalQty };
    totalRow.getCell(5).value = { formula: `SUM(E9:E${lastDataRow})`, result: totalAmount };

    // Update Gujarati Certificate text
    const certRowIdx = totalRowIdx + 5;
    const certCell = ws.getCell(`A${certRowIdx}`);
    const countRange = itemCount > 0 ? `૧ થી ${itemCount}` : '____ થી ____';
    certCell.value = `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણો શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ સાધનો/ઉપકરણોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા સાધનો/ઉપકરણોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ ખરીદી માટે ભલામણ કરવામાં આવે છે. `;

    return await wb.xlsx.writeBuffer();
  }

  /**
   * DOC-01 Word (.docx) Generator: Produces identical 19-column landscape layout matching screenshot
   */
  static async generateDoc01Docx(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const borderDef = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const borders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };

    // 19-column proportional widths in percentage summing to 100%
    const colWidths = [3, 8, 4, 5, 5, 6, 4, 6, 6, 5, 5, 4, 4, 5, 6, 5, 6, 6, 9];

    // Header cells (Row 1)
    const headerCells = DOC01_COL_HEADERS.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: h, bold: true, size: 13, font: 'Arial' })]
      })]
    }));

    // Column numbers (Row 2: 1 to 19)
    const numberCells = DOC01_COL_HEADERS.map((_, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: String(i + 1), bold: true, size: 13, font: 'Arial' })]
      })]
    }));

    // Data rows (or empty rows if 0 items)
    const rowsToRender = items.length > 0 ? items : Array.from({ length: 8 }, (_, idx) => ({ _empty: true, _idx: idx + 1 }));
    let totalQty = 0;
    let totalCost = 0;

    const dataTableRows = rowsToRender.map((it, idx) => {
      const isReal = !it._empty;
      const qty = isReal ? (Number(it.qty) || 0) : '';
      const rate = isReal ? (Number(it.unit_rate) || 0) : '';
      const total = isReal ? (Number(it.total_cost) || (qty * rate)) : '';
      if (isReal) {
        totalQty += Number(qty) || 0;
        totalCost += Number(total) || 0;
      }

      const values = [
        String(idx + 1),
        isReal ? (it.item_name || '') : '',
        isReal ? String(qty) : '',
        isReal ? inr(rate) : '',
        isReal ? inr(total) : '',
        isReal ? (it.dept_name || it.department || '') : '',
        isReal ? (it.gem_available ? 'Yes' : 'No') : '',
        isReal ? (it.grant_head || 'State Grant (TED-5)') : '',
        isReal ? inr(total) : '',
        isReal ? (it.procurement_model || 'New Purchase') : '',
        isReal ? (it.against_condemn ? 'Yes' : 'No') : '',
        isReal ? String(it.norm_qty || 0) : '',
        isReal ? String(it.available_qty || 0) : '',
        isReal ? (it.procurement_year || (it.available_qty > 0 ? '2020-21' : '-')) : '',
        isReal ? (it.stock_condition || 'Working') : '',
        isReal ? (it.lifespan || '10 Years') : '',
        isReal ? (it.maint_plan || 'Through Department Technical Staff & AMC') : '',
        isReal ? (it.approx_usage || 'For UG/PG Laboratory & Research Practicals') : '',
        isReal ? (it.justification || '') : ''
      ];

      return new TableRow({
        children: values.map((val, cIdx) => new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({
            alignment: [0, 2, 6, 10, 11, 12, 13, 14].includes(cIdx) ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: val, size: 13, font: 'Arial' })]
          })]
        }))
      });
    });

    // TOTAL row
    const totalRowCells = colWidths.map((w, cIdx) => {
      let text = '';
      let bold = true;
      let align = AlignmentType.CENTER;
      if (cIdx === 0) text = 'TOTAL';
      if (cIdx === 2) text = String(totalQty);
      if (cIdx === 4) { text = inr(totalCost); align = AlignmentType.RIGHT; }

      return new TableCell({
        width: { size: w, type: WidthType.PERCENTAGE },
        borders,
        shading: { fill: 'EAEAEA', type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: align,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text, bold, size: 13, font: 'Arial' })]
        })]
      });
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: headerCells }),
        new TableRow({ children: numberCells }),
        ...dataTableRows,
        new TableRow({ children: totalRowCells })
      ]
    });

    // Subheader meta row table (Inst name left, Type of Course right)
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Name of Inst. :- L. D. College of Engineering, Ahmedabad', bold: true, size: 20, font: 'Arial' })]
              })]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Type of Course: (Diploma/UG/PG)', bold: true, size: 20, font: 'Arial' })]
              })]
            })
          ]
        })
      ]
    });

    const countRange = items.length > 0 ? `૧ થી ${items.length}` : '____ થી ____';

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Statement -  1', bold: true, size: 26, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Commissionerate of Technical Education, Gujarat State, Gandhinagar', bold: true, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: `List of New Item for the Year ${fin_year}`, bold: true, size: 20, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: '[ Consolidated list of Non-IT Equipments for all Departments in this Single Sheet Only ]', bold: true, size: 19, color: 'FF0000', font: 'Arial' })]
      }),
      metaTable,
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Amount in Rs.', bold: true, size: 18, color: 'FF0000', font: 'Arial' })]
      }),
      mainTable,
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહિં.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'પ્રમાણપત્ર', bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણો શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ સાધનો/ઉપકરણોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા સાધનો/ઉપકરણોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ ખરીદી માટે ભલામણ કરવામાં આવે છે. `,
          size: 18,
          font: 'Arial'
        })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Institute Seal', bold: true, size: 20, font: 'Arial' })]
                })]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: 'Principal Sign', bold: true, size: 20, font: 'Arial' })]
                })]
              })
            ]
          })
        ]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 576, bottom: 576, left: 576, right: 576 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * DOC-02 Excel Generator: Produces exact Excel format as per official CTE IT Equipment template
   */
  static async generateDoc02Excel(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const templatePath = path.resolve(__dirname, '../../../Format-Purchase-2026-27/1.CTE formats for NI/2. Statement 2_IT Equipment.xlsx');

    const wb = new ExcelJS.Workbook();
    let ws;

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
      ws = wb.worksheets[0];
    } else {
      // Programmatic fallback if template file is missing
      ws = wb.addWorksheet('Statement 2 (IT Equipment)', {
        pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
      });
      // Header rows 1 to 4
      ws.mergeCells('A1:T1');
      ws.getCell('A1').value = 'Statement -  2';
      ws.getCell('A1').font = { name: 'Calibri', size: 14, bold: true };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.mergeCells('A2:T2');
      ws.getCell('A2').value = 'Commissionerate of Technical Education, Gujarat State, Gandhinagar';
      ws.getCell('A2').font = { name: 'Calibri', size: 12, bold: true };
      ws.getCell('A2').alignment = { horizontal: 'center' };

      ws.mergeCells('A3:T3');
      ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
      ws.getCell('A3').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('A3').alignment = { horizontal: 'center' };

      ws.mergeCells('A4:T4');
      ws.getCell('A4').value = '( Consolidated list of IT Equipments for all Departments in this Single Sheet Only )';
      ws.getCell('A4').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('A4').alignment = { horizontal: 'center' };

      ws.mergeCells('A5:E5');
      ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
      ws.getCell('A5').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('M5:T5');
      ws.getCell('M5').value = 'Type of Course: (Diploma/UG/PG)';
      ws.getCell('M5').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('M5').alignment = { horizontal: 'right' };

      ws.getCell('T6').value = 'Amount in Rs.';
      ws.getCell('T6').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('T6').alignment = { horizontal: 'right' };

      // Headers row 7
      const r7 = ws.getRow(7);
      r7.height = 100;
      DOC02_COL_HEADERS.forEach((h, idx) => {
        const c = r7.getCell(idx + 1);
        c.value = h;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Numbers row 8
      const r8 = ws.getRow(8);
      for (let i = 1; i <= 20; i++) {
        const c = r8.getCell(i);
        c.value = i;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      }

      // Initial template blank rows 9 to 16
      for (let r = 9; r <= 16; r++) {
        const row = ws.getRow(r);
        row.getCell(1).value = r - 8;
        for (let c = 1; c <= 20; c++) {
          row.getCell(c).font = { name: 'Calibri', size: 9 };
          row.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        }
      }

      // Notes and certificates in fallback
      ws.mergeCells('A19:T19');
      ws.getCell('A19').value = 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.';
      ws.getCell('A19').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A20:T20');
      ws.getCell('A20').value = 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહિં.';
      ws.getCell('A20').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A21:T21');
      ws.getCell('A21').value = 'પ્રમાણપત્ર';
      ws.getCell('A21').font = { name: 'Calibri', size: 12, bold: true, underline: true };
      ws.getCell('A21').alignment = { horizontal: 'center' };

      ws.mergeCells('A22:T22');

      ws.getCell('E24').value = 'Institute Seal';
      ws.getCell('E24').font = { name: 'Calibri', size: 11, bold: true };

      ws.getCell('T24').value = 'Principal Sign';
      ws.getCell('T24').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('T24').alignment = { horizontal: 'right' };
    }

    // Ensure Institute Name & Financial Year are up to date
    ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
    ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
    if (ws.getCell('M5')) {
      ws.getCell('M5').value = 'Type of Course: (Diploma/UG/PG)';
    }
    if (ws.getCell('T6')) {
      ws.getCell('T6').value = 'Amount in Rs.';
    }

    const defaultRowCount = 8;
    const startRow = 9;
    const itemCount = items.length;

    // If more than 8 items, insert rows at row 17 before TOTAL
    if (itemCount > defaultRowCount) {
      const extraRows = itemCount - defaultRowCount;
      const blankRowData = new Array(20).fill('');
      const toInsert = Array.from({ length: extraRows }, () => blankRowData);
      ws.spliceRows(17, 0, ...toInsert);

      // Copy formatting from row 9 to newly inserted rows
      const templateRow = ws.getRow(9);
      for (let r = 17; r < 17 + extraRows; r++) {
        const row = ws.getRow(r);
        row.height = templateRow.height || 26;
        for (let c = 1; c <= 20; c++) {
          const srcCell = templateRow.getCell(c);
          const destCell = row.getCell(c);
          destCell.font = { ...srcCell.font };
          destCell.alignment = { ...srcCell.alignment };
          destCell.border = srcCell.border ? JSON.parse(JSON.stringify(srcCell.border)) : undefined;
        }
      }
    }

    const totalRowsToIterate = Math.max(itemCount, defaultRowCount);
    let totalQty = 0;
    let totalAmount = 0;

    for (let i = 0; i < totalRowsToIterate; i++) {
      const rowIdx = startRow + i;
      const row = ws.getRow(rowIdx);
      const it = items[i];

      if (it) {
        const qty = Number(it.qty) || 0;
        const rate = Number(it.unit_rate) || 0;
        const total = Number(it.total_cost) || (qty * rate);
        totalQty += qty;
        totalAmount += total;

        row.getCell(1).value = i + 1;
        row.getCell(2).value = it.item_name || '';
        row.getCell(3).value = qty;
        row.getCell(4).value = rate;
        row.getCell(5).value = total;
        row.getCell(6).value = it.dept_name || it.department || '';
        row.getCell(7).value = it.gem_available ? 'Yes' : 'No';
        row.getCell(8).value = it.grant_head || 'State Grant (TED-5)';
        row.getCell(9).value = Number(it.norm_qty) || 0;
        row.getCell(10).value = Number(it.available_qty) || 0;
        row.getCell(11).value = it.procurement_year || (it.available_qty > 0 ? '2020-21' : '-');
        row.getCell(12).value = it.against_condemn ? 'Yes' : 'No';
        row.getCell(13).value = it.stock_condition || 'Working';
        row.getCell(14).value = it.lifespan || '5-7 Years';
        row.getCell(15).value = it.disposal_procedure || 'Through Institute Scrap / Condemnation Committee';
        row.getCell(16).value = it.is_standard_software || (it.category === 'IT Equipment' && (it.item_name || '').toLowerCase().includes('software') ? 'Yes' : 'N/A');
        row.getCell(17).value = it.software_type || (it.category === 'IT Equipment' && (it.item_name || '').toLowerCase().includes('software') ? 'Educational' : 'N/A');
        row.getCell(18).value = it.maint_plan || 'Through Central IT Cell & Comprehensive AMC';
        row.getCell(19).value = it.approx_usage || 'For IT/CS Computing Labs & Campus Network';
        row.getCell(20).value = it.justification || '';
      } else {
        // Clear unused template row numbers
        row.getCell(1).value = null;
        for (let c = 2; c <= 20; c++) {
          row.getCell(c).value = null;
        }
      }
    }

    const lastDataRow = startRow + totalRowsToIterate - 1;
    const totalRowIdx = lastDataRow + 1;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(3).value = { formula: `SUM(C9:C${lastDataRow})`, result: totalQty };
    totalRow.getCell(5).value = { formula: `SUM(E9:E${lastDataRow})`, result: totalAmount };

    // Update Gujarati Certificate text
    const certRowIdx = totalRowIdx + 5;
    const certCell = ws.getCell(`A${certRowIdx}`);
    const countRange = itemCount > 0 ? `૧ થી ${itemCount}` : '____ થી ____';
    certCell.value = `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણો શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ સાધનો/ઉપકરણોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા સાધનો/ઉપકરણોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ  ખરીદી માટે ભલામણ કરવામાં આવે છે. `;

    return await wb.xlsx.writeBuffer();
  }

  /**
   * DOC-02 Word (.docx) Generator: Produces identical 20-column landscape layout matching screenshot
   */
  static async generateDoc02Docx(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const borderDef = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const borders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };

    // 20-column proportional widths in percentage summing to 100%
    const colWidths = [3, 8, 4, 5, 5, 5, 4, 5, 4, 4, 4, 4, 5, 5, 6, 4, 5, 6, 5, 9];

    // Header cells (Row 1)
    const headerCells = DOC02_COL_HEADERS.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: h, bold: true, size: 12, font: 'Arial' })]
      })]
    }));

    // Column numbers (Row 2: 1 to 20)
    const numberCells = DOC02_COL_HEADERS.map((_, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: String(i + 1), bold: true, size: 12, font: 'Arial' })]
      })]
    }));

    // Data rows (or empty rows if 0 items)
    const rowsToRender = items.length > 0 ? items : Array.from({ length: 8 }, (_, idx) => ({ _empty: true, _idx: idx + 1 }));
    let totalQty = 0;
    let totalCost = 0;

    const dataTableRows = rowsToRender.map((it, idx) => {
      const isReal = !it._empty;
      const qty = isReal ? (Number(it.qty) || 0) : '';
      const rate = isReal ? (Number(it.unit_rate) || 0) : '';
      const total = isReal ? (Number(it.total_cost) || (qty * rate)) : '';
      if (isReal) {
        totalQty += Number(qty) || 0;
        totalCost += Number(total) || 0;
      }

      const values = [
        String(idx + 1),
        isReal ? (it.item_name || '') : '',
        isReal ? String(qty) : '',
        isReal ? inr(rate) : '',
        isReal ? inr(total) : '',
        isReal ? (it.dept_name || it.department || '') : '',
        isReal ? (it.gem_available ? 'Yes' : 'No') : '',
        isReal ? (it.grant_head || 'State Grant (TED-5)') : '',
        isReal ? String(it.norm_qty || 0) : '',
        isReal ? String(it.available_qty || 0) : '',
        isReal ? (it.procurement_year || (it.available_qty > 0 ? '2020-21' : '-')) : '',
        isReal ? (it.against_condemn ? 'Yes' : 'No') : '',
        isReal ? (it.stock_condition || 'Working') : '',
        isReal ? (it.lifespan || '5-7 Years') : '',
        isReal ? (it.disposal_procedure || 'Through Institute Scrap / Condemnation Committee') : '',
        isReal ? (it.is_standard_software || (it.category === 'IT Equipment' && (it.item_name || '').toLowerCase().includes('software') ? 'Yes' : 'N/A')) : '',
        isReal ? (it.software_type || (it.category === 'IT Equipment' && (it.item_name || '').toLowerCase().includes('software') ? 'Educational' : 'N/A')) : '',
        isReal ? (it.maint_plan || 'Through Central IT Cell & Comprehensive AMC') : '',
        isReal ? (it.approx_usage || 'For IT/CS Computing Labs & Campus Network') : '',
        isReal ? (it.justification || '') : ''
      ];

      return new TableRow({
        children: values.map((val, cIdx) => new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({
            alignment: [0, 2, 6, 8, 9, 10, 11, 12, 15].includes(cIdx) ? AlignmentType.CENTER : ([3, 4].includes(cIdx) ? AlignmentType.RIGHT : AlignmentType.LEFT),
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: val, size: 12, font: 'Arial' })]
          })]
        }))
      });
    });

    // TOTAL row
    const totalRowCells = colWidths.map((w, cIdx) => {
      let text = '';
      let bold = true;
      let align = AlignmentType.CENTER;
      if (cIdx === 0) text = 'TOTAL';
      if (cIdx === 2) text = String(totalQty);
      if (cIdx === 4) { text = inr(totalCost); align = AlignmentType.RIGHT; }

      return new TableCell({
        width: { size: w, type: WidthType.PERCENTAGE },
        borders,
        shading: { fill: 'EAEAEA', type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: align,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text, bold, size: 12, font: 'Arial' })]
        })]
      });
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: headerCells }),
        new TableRow({ children: numberCells }),
        ...dataTableRows,
        new TableRow({ children: totalRowCells })
      ]
    });

    // Subheader meta row table (Inst name left, Type of Course right)
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Name of Inst. :- L. D. College of Engineering, Ahmedabad', bold: true, size: 20, font: 'Arial' })]
              })]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Type of Course: (Diploma/UG/PG)', bold: true, size: 20, font: 'Arial' })]
              })]
            })
          ]
        })
      ]
    });

    const countRange = items.length > 0 ? `૧ થી ${items.length}` : '____ થી ____';

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Statement -  2', bold: true, size: 26, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Commissionerate of Technical Education, Gujarat State, Gandhinagar', bold: true, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: `List of New Item for the Year ${fin_year}`, bold: true, size: 20, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: '( Consolidated list of IT Equipments for all Departments in this Single Sheet Only )', bold: true, size: 19, color: 'FF0000', font: 'Arial' })]
      }),
      metaTable,
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Amount in Rs.', bold: true, size: 18, color: 'FF0000', font: 'Arial' })]
      }),
      mainTable,
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહિં.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'પ્રમાણપત્ર', bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણો શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ સાધનો/ઉપકરણોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા સાધનો/ઉપકરણોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ  ખરીદી માટે ભલામણ કરવામાં આવે છે. `,
          size: 18,
          font: 'Arial'
        })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Institute Seal', bold: true, size: 20, font: 'Arial' })]
                })]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: 'Principal Sign', bold: true, size: 20, font: 'Arial' })]
                })]
              })
            ]
          })
        ]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 576, bottom: 576, left: 576, right: 576 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * DOC-03 Excel Generator: Produces exact Excel format as per official CTE Furniture template
   */
  static async generateDoc03Excel(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const templatePath = path.resolve(__dirname, '../../../Format-Purchase-2026-27/1.CTE formats for NI/3. Statement 3_Furniture.xlsx');

    const wb = new ExcelJS.Workbook();
    let ws;

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
      ws = wb.worksheets[0];
    } else {
      // Programmatic fallback if template file is missing
      ws = wb.addWorksheet('Statement 3 (Furniture)', {
        pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
      });
      // Header rows 1 to 4
      ws.mergeCells('A1:I1');
      ws.getCell('A1').value = 'Statement -  3';
      ws.getCell('A1').font = { name: 'Calibri', size: 14, bold: true };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.mergeCells('A2:I2');
      ws.getCell('A2').value = 'Commissionerate of Technical Education, Gujarat State, Gandhinagar';
      ws.getCell('A2').font = { name: 'Calibri', size: 12, bold: true };
      ws.getCell('A2').alignment = { horizontal: 'center' };

      ws.mergeCells('A3:I3');
      ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
      ws.getCell('A3').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('A3').alignment = { horizontal: 'center' };

      ws.mergeCells('A4:I4');
      ws.getCell('A4').value = '( Consolidated list of Furniture for all Departments in this Single Sheet Only )';
      ws.getCell('A4').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('A4').alignment = { horizontal: 'center' };

      ws.mergeCells('A5:C5');
      ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
      ws.getCell('A5').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('F5:I5');
      ws.getCell('F5').value = 'Type of Course: (Diploma/UG/PG)';
      ws.getCell('F5').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('F5').alignment = { horizontal: 'right' };

      ws.getCell('I6').value = 'Amount in Rs.';
      ws.getCell('I6').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('I6').alignment = { horizontal: 'right' };

      // Headers row 7
      const r7 = ws.getRow(7);
      r7.height = 40;
      DOC03_COL_HEADERS.forEach((h, idx) => {
        const c = r7.getCell(idx + 1);
        c.value = h;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Numbers row 8
      const r8 = ws.getRow(8);
      for (let i = 1; i <= 9; i++) {
        const c = r8.getCell(i);
        c.value = i;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      }

      // Initial template blank rows 9 to 18 (10 rows)
      for (let r = 9; r <= 18; r++) {
        const row = ws.getRow(r);
        row.getCell(1).value = r - 8;
        for (let c = 1; c <= 9; c++) {
          row.getCell(c).font = { name: 'Calibri', size: 9 };
          row.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        }
      }

      // Notes and certificates in fallback
      ws.mergeCells('A21:I21');
      ws.getCell('A21').value = 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.';
      ws.getCell('A21').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A22:I22');
      ws.getCell('A22').value = 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહિં.';
      ws.getCell('A22').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A23:I23');
      ws.getCell('A23').value = 'પ્રમાણપત્ર';
      ws.getCell('A23').font = { name: 'Calibri', size: 12, bold: true, underline: true };
      ws.getCell('A23').alignment = { horizontal: 'center' };

      ws.mergeCells('A24:I24');

      ws.getCell('E26').value = 'Institute Seal';
      ws.getCell('E26').font = { name: 'Calibri', size: 11, bold: true };

      ws.getCell('I26').value = 'Principal Sign';
      ws.getCell('I26').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('I26').alignment = { horizontal: 'right' };
    }

    // Ensure Institute Name & Financial Year are up to date
    ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
    ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
    if (ws.getCell('F5')) {
      ws.getCell('F5').value = 'Type of Course: (Diploma/UG/PG)';
    }
    if (ws.getCell('I6')) {
      ws.getCell('I6').value = 'Amount in Rs.';
    }

    const defaultRowCount = 10;
    const startRow = 9;
    const itemCount = items.length;

    // If more than 10 items, insert rows at row 19 before TOTAL
    if (itemCount > defaultRowCount) {
      const extraRows = itemCount - defaultRowCount;
      const blankRowData = new Array(9).fill('');
      const toInsert = Array.from({ length: extraRows }, () => blankRowData);
      ws.spliceRows(19, 0, ...toInsert);

      // Copy formatting from row 9 to newly inserted rows
      const templateRow = ws.getRow(9);
      for (let r = 19; r < 19 + extraRows; r++) {
        const row = ws.getRow(r);
        row.height = templateRow.height || 26;
        for (let c = 1; c <= 9; c++) {
          const srcCell = templateRow.getCell(c);
          const destCell = row.getCell(c);
          destCell.font = { ...srcCell.font };
          destCell.alignment = { ...srcCell.alignment };
          destCell.border = srcCell.border ? JSON.parse(JSON.stringify(srcCell.border)) : undefined;
        }
      }
    }

    const totalRowsToIterate = Math.max(itemCount, defaultRowCount);
    let totalQty = 0;
    let totalAmount = 0;

    for (let i = 0; i < totalRowsToIterate; i++) {
      const rowIdx = startRow + i;
      const row = ws.getRow(rowIdx);
      const it = items[i];

      if (it) {
        const qty = Number(it.qty) || 0;
        const rate = Number(it.unit_rate) || 0;
        const total = Number(it.total_cost) || (qty * rate);
        totalQty += qty;
        totalAmount += total;

        row.getCell(1).value = i + 1;
        row.getCell(2).value = it.item_name || '';
        row.getCell(3).value = qty;
        row.getCell(4).value = rate;
        row.getCell(5).value = total;
        row.getCell(6).value = it.dept_name || it.department || '';
        row.getCell(7).value = Number(it.available_qty) || 0;
        row.getCell(8).value = it.gem_available ? 'Yes' : 'No';
        row.getCell(9).value = it.justification || '';
      } else {
        // Clear unused template row numbers
        row.getCell(1).value = null;
        for (let c = 2; c <= 9; c++) {
          row.getCell(c).value = null;
        }
      }
    }

    const lastDataRow = startRow + totalRowsToIterate - 1;
    const totalRowIdx = lastDataRow + 1;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(3).value = { formula: `SUM(C9:C${lastDataRow})`, result: totalQty };
    totalRow.getCell(5).value = { formula: `SUM(E9:E${lastDataRow})`, result: totalAmount };

    // Update Gujarati Certificate text
    const certRowIdx = totalRowIdx + 5;
    const certCell = ws.getCell(`A${certRowIdx}`);
    const countRange = itemCount > 0 ? `૧ થી ${itemCount}` : '____ થી ____';
    certCell.value = `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ ફર્નીચર શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ ફર્નીચરનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા ફર્નીચરની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ  ખરીદી માટે ભલામણ કરવામાં આવે છે. `;

    return await wb.xlsx.writeBuffer();
  }

  /**
   * DOC-03 Word (.docx) Generator: Produces identical 9-column landscape layout matching screenshot
   */
  static async generateDoc03Docx(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const borderDef = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const borders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };

    // 9-column proportional widths in percentage summing to 100%
    const colWidths = [5, 22, 7, 10, 11, 13, 8, 8, 16];

    // Header cells (Row 1)
    const headerCells = DOC03_COL_HEADERS.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: h, bold: true, size: 14, font: 'Arial' })]
      })]
    }));

    // Column numbers (Row 2: 1 to 9)
    const numberCells = DOC03_COL_HEADERS.map((_, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: String(i + 1), bold: true, size: 14, font: 'Arial' })]
      })]
    }));

    // Data rows (or empty rows if 0 items)
    const rowsToRender = items.length > 0 ? items : Array.from({ length: 10 }, (_, idx) => ({ _empty: true, _idx: idx + 1 }));
    let totalQty = 0;
    let totalCost = 0;

    const dataTableRows = rowsToRender.map((it, idx) => {
      const isReal = !it._empty;
      const qty = isReal ? (Number(it.qty) || 0) : '';
      const rate = isReal ? (Number(it.unit_rate) || 0) : '';
      const total = isReal ? (Number(it.total_cost) || (qty * rate)) : '';
      if (isReal) {
        totalQty += Number(qty) || 0;
        totalCost += Number(total) || 0;
      }

      const values = [
        String(idx + 1),
        isReal ? (it.item_name || '') : '',
        isReal ? String(qty) : '',
        isReal ? inr(rate) : '',
        isReal ? inr(total) : '',
        isReal ? (it.dept_name || it.department || '') : '',
        isReal ? String(it.available_qty || 0) : '',
        isReal ? (it.gem_available ? 'Yes' : 'No') : '',
        isReal ? (it.justification || '') : ''
      ];

      return new TableRow({
        children: values.map((val, cIdx) => new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({
            alignment: [0, 2, 6, 7].includes(cIdx) ? AlignmentType.CENTER : ([3, 4].includes(cIdx) ? AlignmentType.RIGHT : AlignmentType.LEFT),
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: val, size: 14, font: 'Arial' })]
          })]
        }))
      });
    });

    // TOTAL row
    const totalRowCells = colWidths.map((w, cIdx) => {
      let text = '';
      let bold = true;
      let align = AlignmentType.CENTER;
      if (cIdx === 0) text = 'TOTAL';
      if (cIdx === 2) text = String(totalQty);
      if (cIdx === 4) { text = inr(totalCost); align = AlignmentType.RIGHT; }

      return new TableCell({
        width: { size: w, type: WidthType.PERCENTAGE },
        borders,
        shading: { fill: 'EAEAEA', type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: align,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text, bold, size: 14, font: 'Arial' })]
        })]
      });
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: headerCells }),
        new TableRow({ children: numberCells }),
        ...dataTableRows,
        new TableRow({ children: totalRowCells })
      ]
    });

    // Subheader meta row table (Inst name left, Type of Course right)
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Name of Inst. :- L. D. College of Engineering, Ahmedabad', bold: true, size: 20, font: 'Arial' })]
              })]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Type of Course: (Diploma/UG/PG)', bold: true, size: 20, font: 'Arial' })]
              })]
            })
          ]
        })
      ]
    });

    const countRange = items.length > 0 ? `૧ થી ${items.length}` : '____ થી ____';

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Statement – 3', bold: true, size: 26, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Commissionerate of Technical Education, Gujarat State, Gandhinagar', bold: true, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: `List of New Item for the Year ${fin_year}`, bold: true, size: 20, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: '( Consolidated list of Furniture for all Departments in this Single Sheet Only )', bold: true, size: 19, color: 'FF0000', font: 'Arial' })]
      }),
      metaTable,
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Amount in Rs.', bold: true, size: 18, color: 'FF0000', font: 'Arial' })]
      }),
      mainTable,
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહિં.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'પ્રમાણપત્ર', bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ ફર્નીચર શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ ફર્નીચરનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા ફર્નીચરની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ  ખરીદી માટે ભલામણ કરવામાં આવે છે. `,
          size: 18,
          font: 'Arial'
        })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Institute Seal', bold: true, size: 20, font: 'Arial' })]
                })]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: 'Principal Sign', bold: true, size: 20, font: 'Arial' })]
                })]
              })
            ]
          })
        ]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 576, bottom: 576, left: 576, right: 576 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * DOC-04 Excel Generator: Produces exact Excel format as per official CTE Books template
   */
  static async generateDoc04Excel(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const templatePath = path.resolve(__dirname, '../../../Format-Purchase-2026-27/1.CTE formats for NI/4. Statement 4_Books.xlsx');

    const wb = new ExcelJS.Workbook();
    let ws;

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
      ws = wb.worksheets[0];
    } else {
      // Programmatic fallback if template file is missing
      ws = wb.addWorksheet('Statement 4 (Books)', {
        pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
      });
      // Header rows 1 to 4
      ws.mergeCells('A1:E1');
      ws.getCell('A1').value = 'Statement -  4';
      ws.getCell('A1').font = { name: 'Calibri', size: 14, bold: true };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.mergeCells('A2:E2');
      ws.getCell('A2').value = 'Commissionerate of Technical Education, Gujarat State, Gandhinagar';
      ws.getCell('A2').font = { name: 'Calibri', size: 12, bold: true };
      ws.getCell('A2').alignment = { horizontal: 'center' };

      ws.mergeCells('A3:E3');
      ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
      ws.getCell('A3').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('A3').alignment = { horizontal: 'center' };

      ws.mergeCells('A4:E4');
      ws.getCell('A4').value = '( Consolidated list of Books for all Departments in this Single Sheet Only )';
      ws.getCell('A4').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('A4').alignment = { horizontal: 'center' };

      ws.mergeCells('A5:C5');
      ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
      ws.getCell('A5').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('D5:E5');
      ws.getCell('D5').value = 'Type of Course: (Diploma/UG/PG)';
      ws.getCell('D5').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('D5').alignment = { horizontal: 'right' };

      ws.getCell('E6').value = 'Amount in Rs.';
      ws.getCell('E6').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('E6').alignment = { horizontal: 'right' };

      // Headers row 7
      const r7 = ws.getRow(7);
      r7.height = 40;
      DOC04_COL_HEADERS.forEach((h, idx) => {
        const c = r7.getCell(idx + 1);
        c.value = h;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Numbers row 8
      const r8 = ws.getRow(8);
      for (let i = 1; i <= 5; i++) {
        const c = r8.getCell(i);
        c.value = i;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      }

      // Initial template blank rows 9 to 14 (6 rows)
      for (let r = 9; r <= 14; r++) {
        const row = ws.getRow(r);
        row.getCell(1).value = r - 8;
        for (let c = 1; c <= 5; c++) {
          row.getCell(c).font = { name: 'Calibri', size: 9 };
          row.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        }
      }

      // Notes and certificates in fallback
      ws.mergeCells('A17:E17');
      ws.getCell('A17').value = 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.';
      ws.getCell('A17').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A18:E18');
      ws.getCell('A18').value = 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહી.';
      ws.getCell('A18').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A19:E19');
      ws.getCell('A19').value = 'પ્રમાણપત્ર';
      ws.getCell('A19').font = { name: 'Calibri', size: 12, bold: true, underline: true };
      ws.getCell('A19').alignment = { horizontal: 'center' };

      ws.mergeCells('A20:E20');

      ws.getCell('A21').value = 'Institute Seal';
      ws.getCell('A21').font = { name: 'Calibri', size: 11, bold: true };

      ws.getCell('E21').value = 'Principal Sign';
      ws.getCell('E21').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('E21').alignment = { horizontal: 'right' };
    }

    // Ensure Institute Name & Financial Year are up to date
    ws.getCell('A3').value = `List of New Item for the Year ${fin_year}`;
    ws.getCell('A5').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
    if (ws.getCell('D5')) {
      ws.getCell('D5').value = 'Type of Course: (Diploma/UG/PG)';
    }
    if (ws.getCell('E6')) {
      ws.getCell('E6').value = 'Amount in Rs.';
    }

    const defaultRowCount = 6;
    const startRow = 9;
    const itemCount = items.length;

    // If more than 6 items, insert rows at row 15 before TOTAL
    if (itemCount > defaultRowCount) {
      const extraRows = itemCount - defaultRowCount;
      const blankRowData = new Array(5).fill('');
      const toInsert = Array.from({ length: extraRows }, () => blankRowData);
      ws.spliceRows(15, 0, ...toInsert);

      // Copy formatting from row 9 to newly inserted rows
      const templateRow = ws.getRow(9);
      for (let r = 15; r < 15 + extraRows; r++) {
        const row = ws.getRow(r);
        row.height = templateRow.height || 26;
        for (let c = 1; c <= 5; c++) {
          const srcCell = templateRow.getCell(c);
          const destCell = row.getCell(c);
          destCell.font = { ...srcCell.font };
          destCell.alignment = { ...srcCell.alignment };
          destCell.border = srcCell.border ? JSON.parse(JSON.stringify(srcCell.border)) : undefined;
        }
      }
    }

    const totalRowsToIterate = Math.max(itemCount, defaultRowCount);
    let totalQty = 0;
    let totalAmount = 0;

    for (let i = 0; i < totalRowsToIterate; i++) {
      const rowIdx = startRow + i;
      const row = ws.getRow(rowIdx);
      const it = items[i];

      if (it) {
        const qty = Number(it.qty) || 0;
        const rate = Number(it.unit_rate) || 0;
        const total = Number(it.total_cost) || (qty * rate);
        totalQty += qty;
        totalAmount += total;

        row.getCell(1).value = i + 1;
        row.getCell(2).value = it.dept_name || it.department || (it.item_name ? `${it.dept_name || 'Department'} (${it.item_name})` : '');
        row.getCell(3).value = qty;
        row.getCell(4).value = it.gem_available ? 'Yes' : 'No';
        row.getCell(5).value = total;
      } else {
        // Clear unused template row numbers
        row.getCell(1).value = null;
        for (let c = 2; c <= 5; c++) {
          row.getCell(c).value = null;
        }
      }
    }

    const lastDataRow = startRow + totalRowsToIterate - 1;
    const totalRowIdx = lastDataRow + 1;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(3).value = { formula: `SUM(C9:C${lastDataRow})`, result: totalQty };
    totalRow.getCell(5).value = { formula: `SUM(E9:E${lastDataRow})`, result: totalAmount };

    // Update Gujarati Certificate text
    const certRowIdx = totalRowIdx + 5;
    const certCell = ws.getCell(`A${certRowIdx}`);
    const countRange = itemCount > 0 ? `૧ થી ${itemCount}` : '____ થી ____';
    certCell.value = `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ પુસ્તકો શૈક્ષણિક હેતુ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ પુસ્તકોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા પુસ્તકોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ ખરીદી માટે ભલામણ કરવામાં આવે છે. `;

    return await wb.xlsx.writeBuffer();
  }

  /**
   * DOC-04 Word (.docx) Generator: Produces identical 5-column landscape layout matching screenshot
   */
  static async generateDoc04Docx(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const borderDef = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const borders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };

    // 5-column proportional widths in percentage summing to 100%
    const colWidths = [8, 38, 18, 18, 18];

    // Header cells (Row 1)
    const headerCells = DOC04_COL_HEADERS.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: h, bold: true, size: 14, font: 'Arial' })]
      })]
    }));

    // Column numbers (Row 2: 1 to 5)
    const numberCells = DOC04_COL_HEADERS.map((_, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: String(i + 1), bold: true, size: 14, font: 'Arial' })]
      })]
    }));

    // Data rows (or empty rows if 0 items)
    const rowsToRender = items.length > 0 ? items : Array.from({ length: 6 }, (_, idx) => ({ _empty: true, _idx: idx + 1 }));
    let totalQty = 0;
    let totalCost = 0;

    const dataTableRows = rowsToRender.map((it, idx) => {
      const isReal = !it._empty;
      const qty = isReal ? (Number(it.qty) || 0) : '';
      const rate = isReal ? (Number(it.unit_rate) || 0) : '';
      const total = isReal ? (Number(it.total_cost) || (qty * rate)) : '';
      if (isReal) {
        totalQty += Number(qty) || 0;
        totalCost += Number(total) || 0;
      }

      const values = [
        String(idx + 1),
        isReal ? (it.dept_name || it.department || (it.item_name ? `${it.dept_name || 'Department'} (${it.item_name})` : '')) : '',
        isReal ? String(qty) : '',
        isReal ? (it.gem_available ? 'Yes' : 'No') : '',
        isReal ? inr(total) : ''
      ];

      return new TableRow({
        children: values.map((val, cIdx) => new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({
            alignment: [0, 2, 3].includes(cIdx) ? AlignmentType.CENTER : ([4].includes(cIdx) ? AlignmentType.RIGHT : AlignmentType.LEFT),
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: val, size: 14, font: 'Arial' })]
          })]
        }))
      });
    });

    // TOTAL row
    const totalRowCells = colWidths.map((w, cIdx) => {
      let text = '';
      let bold = true;
      let align = AlignmentType.CENTER;
      if (cIdx === 0) text = 'TOTAL';
      if (cIdx === 2) text = String(totalQty);
      if (cIdx === 4) { text = inr(totalCost); align = AlignmentType.RIGHT; }

      return new TableCell({
        width: { size: w, type: WidthType.PERCENTAGE },
        borders,
        shading: { fill: 'EAEAEA', type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: align,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text, bold, size: 14, font: 'Arial' })]
        })]
      });
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: headerCells }),
        new TableRow({ children: numberCells }),
        ...dataTableRows,
        new TableRow({ children: totalRowCells })
      ]
    });

    // Subheader meta row table (Inst name left, Type of Course right)
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Name of Inst. :- L. D. College of Engineering, Ahmedabad', bold: true, size: 20, font: 'Arial' })]
              })]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Type of Course: (Diploma/UG/PG)', bold: true, size: 20, font: 'Arial' })]
              })]
            })
          ]
        })
      ]
    });

    const countRange = items.length > 0 ? `૧ થી ${items.length}` : '____ થી ____';

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Statement – 4', bold: true, size: 26, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Commissionerate of Technical Education, Gujarat State, Gandhinagar', bold: true, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: `List of New Item for the Year ${fin_year}`, bold: true, size: 20, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: '( Consolidated list of Books for all Departments in this Single Sheet Only )', bold: true, size: 19, color: 'FF0000', font: 'Arial' })]
      }),
      metaTable,
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Amount in Rs.', bold: true, size: 18, color: 'FF0000', font: 'Arial' })]
      }),
      mainTable,
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહિં.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'પ્રમાણપત્ર', bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ પુસ્તકો શૈક્ષણિક હેતુ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ પુસ્તકોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા પુસ્તકોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ ખરીદી માટે ભલામણ કરવામાં આવે છે. `,
          size: 18,
          font: 'Arial'
        })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Institute Seal', bold: true, size: 20, font: 'Arial' })]
                })]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: 'Principal Sign', bold: true, size: 20, font: 'Arial' })]
                })]
              })
            ]
          })
        ]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 576, bottom: 576, left: 576, right: 576 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * DOC-05 Excel Generator: Produces exact Excel format as per official CTE Maintenance template
   */
  static async generateDoc05Excel(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const templatePath = path.resolve(__dirname, '../../../Format-Purchase-2026-27/1.CTE formats for NI/5. Statement 5_Maintanance.xlsx');

    const wb = new ExcelJS.Workbook();
    let ws;

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
      ws = wb.worksheets[0];
    } else {
      // Programmatic fallback if template file is missing
      ws = wb.addWorksheet('Statement 5 (Maintenance)', {
        pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
      });
      // Header rows 1 to 4
      ws.mergeCells('A1:G1');
      ws.getCell('A1').value = 'Statement - 5';
      ws.getCell('A1').font = { name: 'Calibri', size: 14, bold: true };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.mergeCells('A2:G2');
      ws.getCell('A2').value = 'Commissionerate of Technical Education, Gujarat State, Gandhinagar';
      ws.getCell('A2').font = { name: 'Calibri', size: 12, bold: true };
      ws.getCell('A2').alignment = { horizontal: 'center' };

      ws.mergeCells('A3:G3');
      ws.getCell('A3').value = `Requirement of maintanace-Year ${fin_year}`;
      ws.getCell('A3').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('A3').alignment = { horizontal: 'center' };

      ws.mergeCells('A4:D4');
      ws.getCell('A4').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
      ws.getCell('A4').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('E4:G4');
      ws.getCell('E4').value = 'Type of Course: (Diploma/UG/PG)';
      ws.getCell('E4').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('E4').alignment = { horizontal: 'right' };

      ws.getCell('G5').value = 'Amount in Rs.';
      ws.getCell('G5').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('G5').alignment = { horizontal: 'right' };

      // Headers row 6
      const r6 = ws.getRow(6);
      r6.height = 40;
      DOC05_COL_HEADERS.forEach((h, idx) => {
        const c = r6.getCell(idx + 1);
        c.value = h;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Numbers row 7
      const r7 = ws.getRow(7);
      for (let i = 1; i <= 7; i++) {
        const c = r7.getCell(i);
        c.value = i;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      }

      // Initial template blank rows 8 to 17 (10 rows)
      for (let r = 8; r <= 17; r++) {
        const row = ws.getRow(r);
        row.getCell(1).value = r - 7;
        for (let c = 1; c <= 7; c++) {
          row.getCell(c).font = { name: 'Calibri', size: 9 };
          row.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        }
      }

      // Notes and certificates in fallback
      ws.mergeCells('A19:G19');
      ws.getCell('A19').value = 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.';
      ws.getCell('A19').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A20:G20');
      ws.getCell('A20').value = 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહી.';
      ws.getCell('A20').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };

      ws.mergeCells('A21:G21');
      ws.getCell('A21').value = 'પ્રમાણપત્ર';
      ws.getCell('A21').font = { name: 'Calibri', size: 12, bold: true, underline: true };
      ws.getCell('A21').alignment = { horizontal: 'center' };

      ws.mergeCells('A22:G22');

      ws.getCell('A23').value = 'Institute Seal';
      ws.getCell('A23').font = { name: 'Calibri', size: 11, bold: true };

      ws.getCell('G23').value = 'Principal Sign';
      ws.getCell('G23').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('G23').alignment = { horizontal: 'right' };
    }

    // Ensure Institute Name & Financial Year are up to date
    ws.getCell('A3').value = `Requirement of maintanace-Year ${fin_year}`;
    ws.getCell('A4').value = 'Name of Inst. :- L. D. College of Engineering, Ahmedabad';
    if (ws.getCell('E4')) {
      ws.getCell('E4').value = 'Type of Course: (Diploma/UG/PG)';
    }
    if (ws.getCell('G5')) {
      ws.getCell('G5').value = 'Amount in Rs.';
    }

    const defaultRowCount = 10;
    const startRow = 8;
    const itemCount = items.length;

    // If more than 10 items, insert rows at row 18 before TOTAL
    if (itemCount > defaultRowCount) {
      const extraRows = itemCount - defaultRowCount;
      const blankRowData = new Array(7).fill('');
      const toInsert = Array.from({ length: extraRows }, () => blankRowData);
      ws.spliceRows(18, 0, ...toInsert);

      // Copy formatting from row 8 to newly inserted rows
      const templateRow = ws.getRow(8);
      for (let r = 18; r < 18 + extraRows; r++) {
        const row = ws.getRow(r);
        row.height = templateRow.height || 26;
        for (let c = 1; c <= 7; c++) {
          const srcCell = templateRow.getCell(c);
          const destCell = row.getCell(c);
          destCell.font = { ...srcCell.font };
          destCell.alignment = { ...srcCell.alignment };
          destCell.border = srcCell.border ? JSON.parse(JSON.stringify(srcCell.border)) : undefined;
        }
      }
    }

    const totalRowsToIterate = Math.max(itemCount, defaultRowCount);
    let totalMaintAmount = 0;

    for (let i = 0; i < totalRowsToIterate; i++) {
      const rowIdx = startRow + i;
      const row = ws.getRow(rowIdx);
      const it = items[i];

      if (it) {
        const costOfItem = Number(it.unit_rate) || 0;
        const maintAmount = (it.annual_expenditure !== undefined && it.annual_expenditure !== null && it.annual_expenditure !== '')
          ? Number(it.annual_expenditure)
          : (Number(it.total_cost) || costOfItem);
        totalMaintAmount += maintAmount;

        row.getCell(1).value = i + 1;
        row.getCell(2).value = it.item_name || '';
        row.getCell(3).value = costOfItem || '';
        row.getCell(4).value = it.procurement_year || (it.year_procured || '2020-21');
        row.getCell(5).value = maintAmount;
        row.getCell(6).value = it.gem_available ? 'Yes' : 'No';
        row.getCell(7).value = it.justification || it.remarks || '';
      } else {
        // Clear unused template row numbers
        row.getCell(1).value = null;
        for (let c = 2; c <= 7; c++) {
          row.getCell(c).value = null;
        }
      }
    }

    const lastDataRow = startRow + totalRowsToIterate - 1;
    const totalRowIdx = lastDataRow + 1;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.getCell(2).value = 'Total';
    totalRow.getCell(5).value = { formula: `SUM(E8:E${lastDataRow})`, result: totalMaintAmount };

    // Update Gujarati Certificate text
    const certRowIdx = totalRowIdx + 4;
    const certCell = ws.getCell(`A${certRowIdx}`);
    const countRange = itemCount > 0 ? `૧ થી ${itemCount}` : '____ થી ____';
    certCell.value = `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણોનું રાખ-રખાવ શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ તેનો સમાવેશ કરવા ભલામણ કરવામાં આવે છે. `;

    return await wb.xlsx.writeBuffer();
  }

  /**
   * DOC-05 Word (.docx) Generator: Produces identical 7-column landscape layout matching screenshot
   */
  static async generateDoc05Docx(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const borderDef = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const borders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };

    // 7-column proportional widths in percentage summing to 100%
    const colWidths = [6, 26, 12, 12, 16, 14, 14];

    // Header cells (Row 1)
    const headerCells = DOC05_COL_HEADERS.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: h, bold: true, size: 14, font: 'Arial' })]
      })]
    }));

    // Column numbers (Row 2: 1 to 7)
    const numberCells = DOC05_COL_HEADERS.map((_, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders,
      shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: String(i + 1), bold: true, size: 14, font: 'Arial' })]
      })]
    }));

    // Data rows (or empty rows if 0 items)
    const rowsToRender = items.length > 0 ? items : Array.from({ length: 10 }, (_, idx) => ({ _empty: true, _idx: idx + 1 }));
    let totalMaintAmount = 0;

    const dataTableRows = rowsToRender.map((it, idx) => {
      const isReal = !it._empty;
      const costOfItem = isReal ? (Number(it.unit_rate) || 0) : '';
      const maintAmount = isReal
        ? ((it.annual_expenditure !== undefined && it.annual_expenditure !== null && it.annual_expenditure !== '')
          ? Number(it.annual_expenditure)
          : (Number(it.total_cost) || costOfItem))
        : '';
      if (isReal) {
        totalMaintAmount += Number(maintAmount) || 0;
      }

      const values = [
        String(idx + 1),
        isReal ? (it.item_name || '') : '',
        isReal ? inr(costOfItem) : '',
        isReal ? (it.procurement_year || (it.year_procured || '2020-21')) : '',
        isReal ? inr(maintAmount) : '',
        isReal ? (it.gem_available ? 'Yes' : 'No') : '',
        isReal ? (it.justification || it.remarks || '') : ''
      ];

      return new TableRow({
        children: values.map((val, cIdx) => new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({
            alignment: [0, 3, 5].includes(cIdx) ? AlignmentType.CENTER : ([2, 4].includes(cIdx) ? AlignmentType.RIGHT : AlignmentType.LEFT),
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: val, size: 14, font: 'Arial' })]
          })]
        }))
      });
    });

    // TOTAL row
    const totalRowCells = colWidths.map((w, cIdx) => {
      let text = '';
      let bold = true;
      let align = AlignmentType.CENTER;
      if (cIdx === 1) text = 'Total';
      if (cIdx === 4) { text = inr(totalMaintAmount); align = AlignmentType.RIGHT; }

      return new TableCell({
        width: { size: w, type: WidthType.PERCENTAGE },
        borders,
        shading: { fill: 'EAEAEA', type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: align,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text, bold, size: 14, font: 'Arial' })]
        })]
      });
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: headerCells }),
        new TableRow({ children: numberCells }),
        ...dataTableRows,
        new TableRow({ children: totalRowCells })
      ]
    });

    // Subheader meta row table (Inst name left, Type of Course right)
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                children: [new TextRun({ text: 'Name of Inst. :- L. D. College of Engineering, Ahmedabad', bold: true, size: 20, font: 'Arial' })]
              })]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Type of Course: (Diploma/UG/PG)', bold: true, size: 20, font: 'Arial' })]
              })]
            })
          ]
        })
      ]
    });

    const countRange = items.length > 0 ? `૧ થી ${items.length}` : '____ થી ____';

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Statement – 5', bold: true, size: 26, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Commissionerate of Technical Education, Gujarat State, Gandhinagar', bold: true, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: `Requirement of maintanace-Year ${fin_year}`, bold: true, size: 20, color: 'FF0000', font: 'Arial' })]
      }),
      metaTable,
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Amount in Rs.', bold: true, size: 18, color: 'FF0000', font: 'Arial' })]
      }),
      mainTable,
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: 'ખાસ નોંધ:- પુરતા જસ્ટીફીકેશન વિના દરખાસ્ત સ્વીકારવામાં આવશે નહી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'પ્રમાણપત્ર', bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ${countRange} ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણોનું રાખ-રખાવ શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ તેનો સમાવેશ કરવા ભલામણ કરવામાં આવે છે. `,
          size: 18,
          font: 'Arial'
        })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Institute Seal', bold: true, size: 20, font: 'Arial' })]
                })]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: 'Principal Sign', bold: true, size: 20, font: 'Arial' })]
                })]
              })
            ]
          })
        ]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 576, bottom: 576, left: 576, right: 576 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

const SUMMARY_IT_ITEMS = [
  'Desktop Computer',
  'Work Stations',
  'Servers',
  'Laptop',
  'Softwares (Educational)',
  'A4 Size Printer',
  'A3 Size Printer',
  'Copier Machine',
  'CCTV Camera',
  'Network Switch',
  'UPS',
  'Multi Media Projector',
  'Smart/Interactive Board',
  'Miscellaneous (Routers, Access Points, Computer Accessories etc.)'
];

function aggregateITSummary(items = []) {
  const rows = SUMMARY_IT_ITEMS.map((name, idx) => ({
    sr: idx + 1,
    name,
    demandedQty: 0,
    availableQty: 0,
    totalCost: 0,
    justifications: []
  }));

  function findCategoryIndex(itemName) {
    if (!itemName) return 13;
    const lower = itemName.toLowerCase().trim();
    if (lower.includes('desktop') || lower.includes('computer') || lower.includes('pc')) return 0;
    if (lower.includes('work station') || lower.includes('workstation')) return 1;
    if (lower.includes('server')) return 2;
    if (lower.includes('laptop') || lower.includes('notebook')) return 3;
    if (lower.includes('software') || lower.includes('license')) return 4;
    if (lower.includes('a4') && lower.includes('printer')) return 5;
    if (lower.includes('a3') && lower.includes('printer')) return 6;
    if (lower.includes('printer')) return 5;
    if (lower.includes('copier') || lower.includes('photocopier') || lower.includes('xerox')) return 7;
    if (lower.includes('cctv') || lower.includes('camera')) return 8;
    if (lower.includes('switch') || lower.includes('router') || lower.includes('network')) return 9;
    if (lower.includes('ups') || lower.includes('inverter') || lower.includes('battery')) return 10;
    if (lower.includes('projector')) return 11;
    if (lower.includes('smart') || lower.includes('interactive') || lower.includes('panel')) return 12;
    return 13;
  }

  items.forEach(it => {
    let idx = SUMMARY_IT_ITEMS.findIndex(s => s.toLowerCase() === (it.item_name || '').toLowerCase().trim());
    if (idx === -1) {
      idx = findCategoryIndex(it.item_name);
    }
    const target = rows[idx] || rows[13];
    const qty = Number(it.qty) || 0;
    const avail = Number(it.available_qty) || 0;
    const cost = Number(it.total_cost) || (qty * (Number(it.unit_rate) || 0));

    target.demandedQty += qty;
    target.availableQty += avail;
    target.totalCost += cost;
    if (it.justification && !target.justifications.includes(it.justification)) {
      target.justifications.push(it.justification);
    }
  });

  return rows;
}

class DOCITSummary {
  /** DOC-06 Word: Summary of IT Items (Combined details from Statement-2) */
  static async generate(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const aggregated = aggregateITSummary(items);
    const borderDef = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const borders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };

    const colWidths = [6, 28, 14, 14, 16, 22];

    // Banner row over columns
    const bannerRow = new TableRow({
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.PERCENTAGE },
          borders,
          shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sr. No.', bold: true, size: 14, font: 'Arial' })] })]
        }),
        new TableCell({
          width: { size: colWidths[1], type: WidthType.PERCENTAGE },
          borders,
          shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Name of IT Item', bold: true, size: 14, font: 'Arial' })] })]
        }),
        new TableCell({
          width: { size: colWidths[2] + colWidths[3] + colWidths[4], type: WidthType.PERCENTAGE },
          columnSpan: 3,
          borders,
          shading: { fill: 'FEE2E2', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Below data should contain combined details from Statement-2', bold: true, size: 14, color: 'FF0000', font: 'Arial' })] })]
        }),
        new TableCell({
          width: { size: colWidths[5], type: WidthType.PERCENTAGE },
          borders,
          shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Justification', bold: true, size: 14, font: 'Arial' })] })]
        })
      ]
    });

    const subHeaderRow = new TableRow({
      children: [
        new TableCell({ width: { size: colWidths[0], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'F9F9F9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '', size: 12 })] })] }),
        new TableCell({ width: { size: colWidths[1], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'F9F9F9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '', size: 12 })] })] }),
        new TableCell({ width: { size: colWidths[2], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'F9F9F9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Total Demanded Quantity', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[3], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'F9F9F9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Total Available Quantity', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[4], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'F9F9F9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Total Amount for Required Quantity\n(Rs. In Lakhs)', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[5], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'F9F9F9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '', size: 12 })] })] })
      ]
    });

    let totalDemanded = 0;
    let totalAvail = 0;
    let totalCostLakhs = 0;

    const dataRows = aggregated.map(r => {
      const lakhs = r.totalCost > 0 ? (r.totalCost / 100000) : 0;
      totalDemanded += r.demandedQty;
      totalAvail += r.availableQty;
      totalCostLakhs += lakhs;

      const values = [
        String(r.sr),
        r.name,
        r.demandedQty > 0 ? String(r.demandedQty) : '',
        r.availableQty > 0 ? String(r.availableQty) : '',
        lakhs > 0 ? lakhs.toFixed(2) : '',
        r.justifications.join('; ')
      ];

      return new TableRow({
        children: values.map((val, cIdx) => new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({
            alignment: [0, 2, 3].includes(cIdx) ? AlignmentType.CENTER : ([4].includes(cIdx) ? AlignmentType.RIGHT : AlignmentType.LEFT),
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: val, size: 13, font: 'Arial' })]
          })]
        }))
      });
    });

    const totalRow = new TableRow({
      children: [
        new TableCell({ width: { size: colWidths[0], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '', size: 13 })] })] }),
        new TableCell({ width: { size: colWidths[1], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TOTAL', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[2], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: totalDemanded > 0 ? String(totalDemanded) : '', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[3], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: totalAvail > 0 ? String(totalAvail) : '', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[4], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totalCostLakhs.toFixed(2), bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[5], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: '', size: 13 })] })] })
      ]
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [bannerRow, subHeaderRow, ...dataRows, totalRow]
    });

    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Name of Institute: L. D. College of Engineering, Ahmedabad', bold: true, size: 20, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: 'Principal Name: Dr. Rajul K. Gajjar', bold: true, size: 20, font: 'Arial' })] })
              ]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Type of Course: (Diploma/UG/PG)', bold: true, size: 20, font: 'Arial' })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Mobile No:- 9825000000', bold: true, size: 20, font: 'Arial' })] })
              ]
            })
          ]
        })
      ]
    });

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Commissionerate of Technical Education, Gujarat State, Gandhinagar', bold: true, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: `New Item for the Year ${fin_year}`, bold: true, size: 20, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'Summary_IT Items', bold: true, size: 22, color: 'FF0000', font: 'Arial' })]
      }),
      metaTable,
      ...spacer(1),
      mainTable,
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [new TextRun({ text: 'પ્રમાણપત્ર', bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [new TextRun({
          text: `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ૧ થી 14 ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણો શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ સાધનો/ઉપકરણોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા સાધનો/ઉપકરણોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ ખરીદી માટે ભલામણ કરવામાં આવે છે. `,
          size: 18,
          font: 'Arial'
        })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({ children: [new TextRun({ text: 'Institute Seal', bold: true, size: 20, font: 'Arial' })] })]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Principal Sign', bold: true, size: 20, font: 'Arial' })] })]
              })
            ]
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 100 },
        children: [new TextRun({ text: 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 576, bottom: 576, left: 576, right: 576 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /** DOC-06 Excel: Summary of IT Items (Combined details from Statement-2) */
  static async generateExcel(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const aggregated = aggregateITSummary(items);
    const templatePath = path.resolve(__dirname, '../../../Format-Purchase-2026-27/1.CTE formats for NI/6. Summary_IT Items.xlsx');

    const wb = new ExcelJS.Workbook();
    let ws;

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
      ws = wb.worksheets[0];
    } else {
      ws = wb.addWorksheet('Summary_IT Items', {
        pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
      });
      // Header rows
      ws.mergeCells('A1:F1');
      ws.getCell('A1').value = 'Commissionerate of Technical Education, Gujarat State, Gandhinagar';
      ws.getCell('A1').font = { name: 'Calibri', size: 12, bold: true };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.mergeCells('A2:F2');
      ws.getCell('A2').value = `New Item for the Year ${fin_year}`;
      ws.getCell('A2').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('A2').alignment = { horizontal: 'center' };

      ws.mergeCells('A3:F3');
      ws.getCell('A3').value = 'Summary_IT Items';
      ws.getCell('A3').font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('A3').alignment = { horizontal: 'center' };

      ws.mergeCells('A4:C4');
      ws.getCell('A4').value = 'Name of Institute: L. D. College of Engineering, Ahmedabad';
      ws.getCell('A4').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('D4:F4');
      ws.getCell('D4').value = 'Type of Course: (Diploma/UG/PG)';
      ws.getCell('D4').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('A5:C5');
      ws.getCell('A5').value = 'Principal Name: Dr. Rajul K. Gajjar';
      ws.getCell('A5').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('D5:F5');
      ws.getCell('D5').value = 'Mobile No:- 9825000000';
      ws.getCell('D5').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('C7:E7');
      ws.getCell('C7').value = 'Below data should contain combined details from Statement-2';
      ws.getCell('C7').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('C7').alignment = { horizontal: 'center' };

      const r8 = ws.getRow(8);
      ['Sr. No.', 'Name of IT Item', 'Total Demanded Quantity', 'Total Available Quantity', 'Total Amount for Required Quantity (Rs. In Lakhs)', 'Justification'].forEach((h, idx) => {
        const c = r8.getCell(idx + 1);
        c.value = h;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
    }

    // Ensure headers & institute info are up to date
    ws.getCell('A2').value = `New Item for the Year ${fin_year}`;
    ws.getCell('A4').value = 'Name of Institute: L. D. College of Engineering, Ahmedabad';
    if (ws.getCell('D4')) ws.getCell('D4').value = 'Type of Course: (Diploma/UG/PG)';
    if (ws.getCell('A5')) ws.getCell('A5').value = 'Principal Name: Dr. Rajul K. Gajjar';
    if (ws.getCell('D5')) ws.getCell('D5').value = 'Mobile No:- 9825000000';

    // Populate rows 9 to 22 (14 items)
    let totalLakhs = 0;
    for (let i = 0; i < 14; i++) {
      const rowIdx = 9 + i;
      const row = ws.getRow(rowIdx);
      const it = aggregated[i];

      const lakhs = it.totalCost > 0 ? Number((it.totalCost / 100000).toFixed(2)) : null;
      if (lakhs) totalLakhs += lakhs;

      row.getCell(1).value = i + 1;
      row.getCell(2).value = it.name;
      row.getCell(3).value = it.demandedQty > 0 ? it.demandedQty : null;
      row.getCell(4).value = it.availableQty > 0 ? it.availableQty : null;
      row.getCell(5).value = lakhs;
      row.getCell(6).value = it.justifications.join('; ') || null;
    }

    // Gujarati Certificate
    if (ws.getCell('A24')) {
      ws.getCell('A24').value = `આથી પ્રમાણિત કરવામાં આવે છે કે, ઉક્ત ક્રમ નં. ૧ થી 14 ઉપર દર્શાવેલ તમામ સાધનો/ઉપકરણો શૈક્ષણિક હેતુ તેમજ સંસ્થાનાં વહીવટ માટે ખુબજ આવશ્યક અને ઉપયોગી છે. આ ઉપરાંત હાલમાં સંસ્થા ખાતે વિવિધ વિદ્યાશાખાઓમાં ઉપલબ્ધ સાધનો/ઉપકરણોનાં જથ્થાની ચકાસણી કરવામાં આવેલ છે અને ત્યારબાદ ઉક્ત નવા સાધનો/ઉપકરણોની જરૂરીયાત હોઈ સને ${fin_year}નાં વર્ષની નવી બાબત હેઠળ ખરીદી માટે ભલામણ કરવામાં આવે છે. `;
    }

    return await wb.xlsx.writeBuffer();
  }
}

class DOCCTESummary {
  /**
   * Aggregates CTE items by category for the Summary table
   */
  static aggregateSummary(items = []) {
    let nonItTotal = 0;
    let itTotal = 0;
    let furnitureTotal = 0;
    let booksTotal = 0;
    let maintTotal = 0;

    items.forEach(it => {
      const cat = (it.category || '').toLowerCase();
      const cost = Number(it.total_cost) || ((Number(it.qty) || 1) * (Number(it.unit_rate) || 0));

      if (cat.includes('non-it')) {
        nonItTotal += cost;
      } else if (cat.includes('it equipment') || cat === 'it') {
        itTotal += cost;
      } else if (cat.includes('furniture')) {
        furnitureTotal += cost;
      } else if (cat.includes('book')) {
        booksTotal += cost;
      } else if (cat.includes('maint') || cat.includes('amc')) {
        const amt = (it.annual_expenditure !== undefined && it.annual_expenditure !== null && it.annual_expenditure !== '')
          ? Number(it.annual_expenditure)
          : cost;
        maintTotal += amt;
      }
    });

    const grandTotal = nonItTotal + itTotal + furnitureTotal + booksTotal + maintTotal;

    return {
      nonItTotal,
      itTotal,
      furnitureTotal,
      booksTotal,
      maintTotal,
      grandTotal
    };
  }

  /** DOC-07 Word (.docx): Official 7-Column Summary */
  static async generate(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const totals = this.aggregateSummary(items);
    const borderDef = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const borders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };

    const colWidths = [16, 14, 14, 14, 14, 14, 14];

    const headers = [
      'Course Type\n(Diploma/UG/PG)',
      'Total amount for Non-IT Equipments',
      'Total amount for IT Equipments',
      'Total amount for Furniture',
      'Total amount for Books',
      'Total amount for Maintainance',
      'Grand Total'
    ];

    const headerRow = new TableRow({
      children: headers.map((h, i) => new TableCell({
        width: { size: colWidths[i], type: WidthType.PERCENTAGE },
        borders,
        shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: h, bold: true, size: 13, font: 'Arial' })]
        })]
      }))
    });

    // Degree Courses (UG/PG) Row
    const ugRow = new TableRow({
      children: [
        new TableCell({ width: { size: colWidths[0], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'UG (Degree)', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[1], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totals.nonItTotal > 0 ? inr(totals.nonItTotal) : '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[2], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totals.itTotal > 0 ? inr(totals.itTotal) : '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[3], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totals.furnitureTotal > 0 ? inr(totals.furnitureTotal) : '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[4], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totals.booksTotal > 0 ? inr(totals.booksTotal) : '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[5], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totals.maintTotal > 0 ? inr(totals.maintTotal) : '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[6], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totals.grandTotal > 0 ? inr(totals.grandTotal) : '0', bold: true, size: 13, font: 'Arial' })] })] })
      ]
    });

    // PG Row
    const pgRow = new TableRow({
      children: [
        new TableCell({ width: { size: colWidths[0], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'PG (Master)', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[1], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[2], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[3], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[4], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[5], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '0', size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[6], type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '0', size: 13, font: 'Arial' })] })] })
      ]
    });

    // TOTAL Row
    const totalRow = new TableRow({
      children: [
        new TableCell({ width: { size: colWidths[0], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'TOTAL', bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[1], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: inr(totals.nonItTotal), bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[2], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: inr(totals.itTotal), bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[3], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: inr(totals.furnitureTotal), bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[4], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: inr(totals.booksTotal), bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[5], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: inr(totals.maintTotal), bold: true, size: 13, font: 'Arial' })] })] }),
        new TableCell({ width: { size: colWidths[6], type: WidthType.PERCENTAGE }, borders, shading: { fill: 'EAEAEA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: inr(totals.grandTotal), bold: true, size: 14, color: 'FF0000', font: 'Arial' })] })] })
      ]
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ugRow, pgRow, totalRow]
    });

    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Name of Institute: L. D. College of Engineering, Ahmedabad', bold: true, size: 20, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: 'Principal Name: Dr. Rajul K. Gajjar', bold: true, size: 20, font: 'Arial' })] })
              ]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Type of Course: (Diploma/UG/PG)', bold: true, size: 20, font: 'Arial' })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Mobile No:- 9825000000', bold: true, size: 20, font: 'Arial' })] })
              ]
            })
          ]
        })
      ]
    });

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Commissionerate of Technical Education, Gujarat State, Gandhinagar', bold: true, size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: `New Item for the Year ${fin_year}`, bold: true, size: 20, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'Summary', bold: true, size: 24, color: 'FF0000', font: 'Arial' })]
      }),
      metaTable,
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Amount in Rs.', bold: true, size: 18, color: 'FF0000', font: 'Arial' })]
      }),
      mainTable,
      ...spacer(2),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({ children: [new TextRun({ text: 'Institute Seal', bold: true, size: 20, font: 'Arial' })] })]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Principal Sign', bold: true, size: 20, font: 'Arial' })] })]
              })
            ]
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 120 },
        children: [new TextRun({ text: 'નોંધ:-Diploma, UG અને PG અભ્યાસક્રમ માટે અલગ અલગ પત્રકો તૈયાર કરી માહિતી આપવી.', bold: true, size: 16, color: 'FF0000', font: 'Arial' })]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 576, bottom: 576, left: 576, right: 576 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /** DOC-07 Excel (.xlsx): Official 7-Column Summary */
  static async generateExcel(data = {}) {
    const fin_year = data.fin_year || '2026-27';
    const items = data.items || [];
    const totals = this.aggregateSummary(items);
    const templatePath = path.resolve(__dirname, '../../../Format-Purchase-2026-27/1.CTE formats for NI/7. Summary.xlsx');

    const wb = new ExcelJS.Workbook();
    let ws;

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
      ws = wb.worksheets[0];
    } else {
      ws = wb.addWorksheet('Summary', {
        pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
      });
      // Header rows
      ws.mergeCells('A1:G1');
      ws.getCell('A1').value = 'Commissionerate of Technical Education, Gujarat State, Gandhinagar';
      ws.getCell('A1').font = { name: 'Calibri', size: 12, bold: true };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.mergeCells('A2:G2');
      ws.getCell('A2').value = `New Item for the Year ${fin_year}`;
      ws.getCell('A2').font = { name: 'Calibri', size: 11, bold: true };
      ws.getCell('A2').alignment = { horizontal: 'center' };

      ws.mergeCells('A3:G3');
      ws.getCell('A3').value = 'Summary';
      ws.getCell('A3').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('A3').alignment = { horizontal: 'center' };

      ws.mergeCells('A4:C4');
      ws.getCell('A4').value = 'Name of Institute: L. D. College of Engineering, Ahmedabad';
      ws.getCell('A4').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('D4:G4');
      ws.getCell('D4').value = 'Type of Course: (Diploma/UG/PG)';
      ws.getCell('D4').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('A5:C5');
      ws.getCell('A5').value = 'Principal Name: Dr. Rajul K. Gajjar';
      ws.getCell('A5').font = { name: 'Calibri', size: 11, bold: true };

      ws.mergeCells('D5:G5');
      ws.getCell('D5').value = 'Mobile No:- 9825000000';
      ws.getCell('D5').font = { name: 'Calibri', size: 11, bold: true };

      ws.getCell('G6').value = 'Amount in Rs.';
      ws.getCell('G6').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFF0000' } };
      ws.getCell('G6').alignment = { horizontal: 'right' };

      const r7 = ws.getRow(7);
      ['Course Type\n(Diploma/UG/PG)', 'Total amount for Non-IT Equipments', 'Total amount for IT Equipments', 'Total amount for Furniture', 'Total amount for Books', 'Total amount for Maintainance', 'Grand Total'].forEach((h, idx) => {
        const c = r7.getCell(idx + 1);
        c.value = h;
        c.font = { name: 'Calibri', size: 9, bold: true };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
    }

    // Ensure headers & institute info
    ws.getCell('A2').value = `New Item for the Year ${fin_year}`;
    ws.getCell('A4').value = 'Name of Institute: L. D. College of Engineering, Ahmedabad';
    if (ws.getCell('D4')) ws.getCell('D4').value = 'Type of Course: (Diploma/UG/PG)';
    if (ws.getCell('A5')) ws.getCell('A5').value = 'Principal Name: Dr. Rajul K. Gajjar';
    if (ws.getCell('D5')) ws.getCell('D5').value = 'Mobile No:- 9825000000';
    if (ws.getCell('G6')) ws.getCell('G6').value = 'Amount in Rs.';

    // Populate Row 9 (UG Degree)
    const row9 = ws.getRow(9);
    row9.getCell(1).value = 'UG (Degree)';
    row9.getCell(2).value = totals.nonItTotal || null;
    row9.getCell(3).value = totals.itTotal || null;
    row9.getCell(4).value = totals.furnitureTotal || null;
    row9.getCell(5).value = totals.booksTotal || null;
    row9.getCell(6).value = totals.maintTotal || null;
    row9.getCell(7).value = { formula: 'SUM(B9:F9)', result: totals.grandTotal };

    // Populate Row 10 (PG Master)
    const row10 = ws.getRow(10);
    row10.getCell(1).value = 'PG (Master)';
    row10.getCell(2).value = null;
    row10.getCell(3).value = null;
    row10.getCell(4).value = null;
    row10.getCell(5).value = null;
    row10.getCell(6).value = null;
    row10.getCell(7).value = { formula: 'SUM(B10:F10)', result: 0 };

    // Row 11 (Diploma)
    const row11 = ws.getRow(11);
    row11.getCell(1).value = 'Diploma';
    row11.getCell(2).value = null;
    row11.getCell(3).value = null;
    row11.getCell(4).value = null;
    row11.getCell(5).value = null;
    row11.getCell(6).value = null;
    row11.getCell(7).value = { formula: 'SUM(B11:F11)', result: 0 };

    // Row 12 (TOTAL)
    const row12 = ws.getRow(12);
    row12.getCell(1).value = 'TOTAL';
    row12.getCell(2).value = { formula: 'SUM(B9:B11)', result: totals.nonItTotal };
    row12.getCell(3).value = { formula: 'SUM(C9:C11)', result: totals.itTotal };
    row12.getCell(4).value = { formula: 'SUM(D9:D11)', result: totals.furnitureTotal };
    row12.getCell(5).value = { formula: 'SUM(E9:E11)', result: totals.booksTotal };
    row12.getCell(6).value = { formula: 'SUM(F9:F11)', result: totals.maintTotal };
    row12.getCell(7).value = { formula: 'SUM(G9:G11)', result: totals.grandTotal };

    return await wb.xlsx.writeBuffer();
  }
}

module.exports = { DOCCTEStatements, DOCITSummary, DOCCTESummary };
