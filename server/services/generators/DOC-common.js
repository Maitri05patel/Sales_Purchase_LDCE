/**
 * DOC-common.js
 * Shared builder utilities for all LDCE document generators.
 * Provides: LDCE header, metadata rows, signature blocks, bordered tables.
 */
const {
  Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType,
  HeadingLevel, UnderlineType
} = require('docx');

const INST_NAME = 'L.D. COLLEGE OF ENGINEERING, AHMEDABAD - 380015';
const DEPT_FULL = 'Store & Purchase Section';

/** Standard LDCE + section header */
function ldceHeader(sectionTitle, subTitle = '') {
  const paras = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: INST_NAME, bold: true, size: 26, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: DEPT_FULL, bold: true, size: 22, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new TextRun({ text: sectionTitle, bold: true, size: 28, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman' })
      ]
    }),
  ];
  if (subTitle) {
    paras.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: subTitle, bold: true, size: 22, font: 'Times New Roman' })]
    }));
  }
  return paras;
}

/** Blank spacer paragraph */
function spacer(lines = 1) {
  return Array.from({ length: lines }, () => new Paragraph({ text: '' }));
}

/** Bold label + plain value on same line */
function labelValue(label, value) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, font: 'Times New Roman', size: 22 }),
      new TextRun({ text: String(value ?? ''), font: 'Times New Roman', size: 22 })
    ]
  });
}

/** Section heading */
function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, underline: { type: UnderlineType.SINGLE }, size: 23, font: 'Times New Roman' })
    ]
  });
}

/** Simple bordered table from 2D array of strings / TextRun[] */
function simpleTable(rows, widths = null) {
  const colCount = rows[0]?.length ?? 1;
  const defaultWidth = Math.floor(100 / colCount);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, rowIdx) =>
      new TableRow({
        children: row.map((cell, colIdx) => {
          const content = typeof cell === 'string'
            ? new Paragraph({ children: [new TextRun({ text: cell, bold: rowIdx === 0, font: 'Times New Roman', size: 20 })] })
            : cell; // accept Paragraph directly
          return new TableCell({
            width: { size: widths ? widths[colIdx] : defaultWidth, type: WidthType.PERCENTAGE },
            shading: rowIdx === 0 ? { fill: 'D9D9D9', type: ShadingType.CLEAR } : undefined,
            children: [content]
          });
        })
      })
    )
  });
}

/** Signature block — takes array of { label, name? } */
function signatureBlock(signatories) {
  const cellWidth = Math.floor(100 / signatories.length);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: signatories.map(() =>
          new TableCell({
            width: { size: cellWidth, type: WidthType.PERCENTAGE },
            children: [...spacer(3), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '____________________', font: 'Times New Roman', size: 20 })] })]
          })
        )
      }),
      new TableRow({
        children: signatories.map(s =>
          new TableCell({
            width: { size: cellWidth, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.label, bold: true, font: 'Times New Roman', size: 20 })] }),
              ...(s.name ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.name, font: 'Times New Roman', size: 18 })] })] : [])
            ]
          })
        )
      })
    ]
  });
}

/** Format currency */
function inr(amount) {
  const n = parseFloat(amount ?? 0);
  return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

/** Format date from ISO or Date */
function fmtDate(d) {
  if (!d) return new Date().toLocaleDateString('en-GB');
  return new Date(d).toLocaleDateString('en-GB');
}

module.exports = { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate, INST_NAME };
