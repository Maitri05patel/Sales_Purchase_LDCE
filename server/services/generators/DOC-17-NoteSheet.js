const docx = require('docx');
const { Document, Packer, Paragraph, TextRun } = docx;

class DOC17NoteSheet {
  /**
   * Generates DOC-17 Note Sheet
   */
  static async generate(entityId) {
    // In a real application, fetch from DB
    const mockData = {
      noteNo: `LDCE/SP/2026-27/${entityId.padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-GB'),
      department: 'Computer Engineering',
      schemeYear: 'વિકાસલક્ષી યોજના -૨૦૨૬-૨૭ ની નવીબાબત',
      itemNameGuj: 'હાઈ એન્ડ વર્કસ્ટેશન (High End Workstation)',
      qtyStr: '05 નંગ',
      totalAmount: 750000,
      amountWords: 'સાત લાખ પચાસ હજાર પૂરા',
      procurementMode: 'GeM Bid',
      budgetHead: 'TED-5'
    };

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "L.D. COLLEGE OF ENGINEERING, AHMEDABAD", bold: true, size: 28 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "STORE & PURCHASE SECTION - NOTE SHEET", bold: true, size: 24 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Note No: ${mockData.noteNo}`, bold: true }),
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
              new TextRun({ text: "Subject: Approval for purchase via " + mockData.procurementMode, bold: true }),
            ],
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Department: ${mockData.department}` }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Scheme: ${mockData.schemeYear}` }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Item: ${mockData.itemNameGuj}` }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Quantity: ${mockData.qtyStr}` }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Total Amount: Rs. ${mockData.totalAmount} (${mockData.amountWords})` }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Budget Head: ${mockData.budgetHead}` }),
            ],
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Sanctioning Authority Signature:", bold: true }),
            ],
            spacing: { before: 400, after: 800 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "_________________________" }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Principal" }),
            ]
          }),
        ],
      }],
    });

    return await Packer.toBuffer(doc);
  }
}

module.exports = DOC17NoteSheet;
