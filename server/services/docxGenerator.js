const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel } = require('docx');

/**
 * Generate a native, editable Microsoft Word (.docx) document for Gujarati Administrative Note Sheets
 */
async function generateGujaratiNoteSheetDocx(data) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "એલ. ડી. એન્જિનિયરિંગ કોલેજ, અમદાવાદ - ૩૮૦૦૧૫",
                bold: true,
                size: 28, // 14pt
                font: "Calibri"
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "સ્ટોર અને ખરીદ શાખા - કાર્યાલય નોંધ",
                bold: true,
                size: 24, // 12pt
                font: "Calibri"
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "વિભાગ: ", bold: true }),
                          new TextRun({ text: data.dept_name || data.dept_code || 'કોમ્પ્યુટર એન્જિનિયરિંગ' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "તારીખ: ", bold: true }),
                          new TextRun({ text: new Date().toLocaleDateString('en-GB') })
                        ]
                      })
                    ]
                  }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "ગ્રાન્ટ હેડ / યોજના: ", bold: true }),
                          new TextRun({ text: data.budget_head || 'State Grant (TED-5)' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "નોંધ ક્રમાંક: ", bold: true }),
                          new TextRun({ text: data.note_no || 'LDCE/NOTE/2026/01' })
                        ]
                      })
                    ]
                  }),
                ]
              }),
            ]
          }),

          new Paragraph({ text: "" }),
          
          // Subject
          new Paragraph({
            children: [
              new TextRun({ text: "વિષય: ", bold: true, size: 24 }),
              new TextRun({ text: `${data.item_name_guj || data.item_name} ખરીદવા બાબતે મંજૂરી મેળવવાની નોંધ.`, bold: true, size: 24 })
            ]
          }),

          new Paragraph({ text: "" }),

          // Body Content (Gujarati)
          new Paragraph({
            children: [
              new TextRun({
                text: data.content_guj || 
                  `ઉપરોક્ત વિષય અન્વયે જણાવવાનું કે ${data.dept_name || 'વિભાગ'} માટે ${data.item_name_guj || data.item_name} (જથ્થો: ${data.qty_str || '૧ નંગ'}) ની ખરીદી કરવી જરૂરી છે. સદર ખરીદી નો અંદાજિત ખર્ચ રૂ. ${data.total_amount || '0.00'} (${data.amount_words_guj || 'અંક અક્ષરે'}) થાય છે. આ ખરીદી GeM (Government e-Marketplace) પોર્ટલ મારફતે ${data.procurement_mode || 'GeM Bid'} પદ્ધતિથી હાથ ધરવામાં આવશે.`,
                size: 22
              })
            ]
          }),

          new Paragraph({ text: "" }),

          // Verification Details
          new Paragraph({
            children: [
              new TextRun({ text: "ચેકલિસ્ટ ચકાસણી: ", bold: true }),
              new TextRun({ text: data.chk_a_verified ? "ચેકલિસ્ટ A ની ચકાસણી પૂર્ણ કરેલ છે." : "ચેકલિસ્ટ Verification બાકી છે." })
            ]
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Signature Block Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "વિભાગીય પ્રધિનિધિ", bold: true })] }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(સહી)" })] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "વિભાગીય વડા (HOD)", bold: true })] }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(સહી અને સિક્કો)" })] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 34, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "સ્ટોર ઓફિસર", bold: true })] }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(સહી)" })] })
                    ]
                  }),
                ]
              })
            ]
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Approval Block
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "મંજૂર / ના-મંજૂર\n\n\n", bold: true }),
              new TextRun({ text: "આચાર્યશ્રી\nએલ. ડી. એન્જિનિયરિંગ કોલેજ, અમદાવાદ", bold: true })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

module.exports = {
  generateGujaratiNoteSheetDocx
};
