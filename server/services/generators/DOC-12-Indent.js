const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

class DOC12Indent {
  /**
   * Generates DOC-12 Purchase Indent
   */
  static async generate(entityId) {
    // In a real application, you would fetch data from the database here
    // For this POC, we are mocking the data based on the entityId
    const mockData = {
      indentNo: `IND/2026-27/COMP/${entityId.padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-GB'),
      department: 'Computer Engineering',
      fundType: 'Govt Fund',
      budgetHead: 'State Grant (TED-5)',
      items: [
        { name: 'High End AI Workstation Computers', qty: 5, unitCost: 150000, totalCost: 750000 }
      ],
      indenterName: 'Dr. D. A. Parikh',
      justification: 'Required for Advanced AI & Machine Learning Postgraduate Laboratory setup.'
    };

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "L.D. COLLEGE OF ENGINEERING, AHMEDABAD", bold: true, size: 32 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "PURCHASE INDENT", bold: true, size: 28 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Indent No: ${mockData.indentNo}`, bold: true }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Date: ${mockData.date}`, bold: true }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Department: ${mockData.department}` }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Fund Type: ${mockData.fundType} | Budget Head: ${mockData.budgetHead}` }),
            ],
            spacing: { after: 400 }
          }),
          this.createItemsTable(mockData.items),
          new Paragraph({
            children: [
              new TextRun({ text: "Justification:", bold: true }),
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: mockData.justification }),
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Signatures:", bold: true }),
            ],
            spacing: { after: 800 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "_________________________                                _________________________" }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Indenter / HOD                                                    Store Officer / Principal" }),
            ]
          }),
        ],
      }],
    });

    return await Packer.toBuffer(doc);
  }

  static createItemsTable(items) {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Sr No", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Item Name", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Quantity", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Unit Cost (Rs)", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Total Cost (Rs)", bold: true })] }),
        ],
      })
    ];

    items.forEach((item, index) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph((index + 1).toString())] }),
            new TableCell({ children: [new Paragraph(item.name)] }),
            new TableCell({ children: [new Paragraph(item.qty.toString())] }),
            new TableCell({ children: [new Paragraph(item.unitCost.toString())] }),
            new TableCell({ children: [new Paragraph(item.totalCost.toString())] }),
          ],
        })
      );
    });

    return new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  }
}

module.exports = DOC12Indent;
