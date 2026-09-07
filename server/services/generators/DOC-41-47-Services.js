/**
 * DOC-41: Inquiry Letter (Non-GeM)
 * DOC-42: Comparative Statement (Govt / Non-Govt)
 * DOC-43: Purchase Order (PO – Non-GeM)
 * DOC-44: Repairable Equipment Register
 * DOC-45: Note for Approval of Repairing
 * DOC-46: Work Order (WO – Repairing)
 * DOC-47: Pass for Payment (Non-GeM & Repair)
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeightRule, ImageRun, UnderlineType, Footer
} = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate, INST_NAME } = require('./DOC-common');

class DOCInquiryLetter {
  /** DOC-41: Official Inquiry Letter to vendors for local purchase / equipment repair quotations */
  static async generate(data = {}) {
    const ldceLogoPath = path.join(__dirname, '../../assets/ldce_logo.png');
    const gandhiLogoPath = path.join(__dirname, '../../assets/gandhi_150_logo.png');

    let ldceLogoBuffer = null;
    let gandhiLogoBuffer = null;

    if (fs.existsSync(ldceLogoPath)) {
      ldceLogoBuffer = fs.readFileSync(ldceLogoPath);
    }
    if (fs.existsSync(gandhiLogoPath)) {
      gandhiLogoBuffer = fs.readFileSync(gandhiLogoPath);
    }

    const noBorder = {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    };

    const tableBorder = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
    };

    // Header Left cell: Circular LDCE Logo + L.D.C.E in red
    const leftCellChildren = [];
    if (ldceLogoBuffer) {
      leftCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: ldceLogoBuffer,
              transformation: { width: 75, height: 75 }
            })
          ]
        })
      );
    }
    leftCellChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20 },
        children: [
          new TextRun({
            text: 'L.D.C.E',
            bold: true,
            color: 'C0392B',
            font: 'Times New Roman',
            size: 18
          })
        ]
      })
    );

    // Header Center cell: Official government and college header text
    const centerCellChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 15 },
        children: [
          new TextRun({
            text: 'Government of Gujarat',
            color: 'C0392B',
            font: 'Georgia',
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: 'L. D. College of Engineering, Ahmedabad',
            bold: true,
            color: 'C0392B',
            font: 'Georgia',
            size: 28
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 15 },
        children: [
          new TextRun({
            text: 'Opp. Gujarat University, Navrangpura',
            color: '204A87',
            font: 'Verdana',
            size: 17
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 15 },
        children: [
          new TextRun({
            text: 'Ahmedabad - 380 015',
            color: '204A87',
            font: 'Verdana',
            size: 17
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 15 },
        children: [
          new TextRun({
            text: 'Phone : Office - 079 26306752, Principal - 079 26302887',
            color: '204A87',
            font: 'Verdana',
            size: 15
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: 'Email : ldce-abad-dte@gujarat.gov.in   Website : www.ldce.ac.in',
            color: '204A87',
            font: 'Verdana',
            size: 15
          })
        ]
      })
    ];

    // Header Right cell: Gandhi 150 Logo
    const rightCellChildren = [];
    if (gandhiLogoBuffer) {
      rightCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: gandhiLogoBuffer,
              transformation: { width: 85, height: 62 }
            })
          ]
        })
      );
    }

    const headerTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [1400, 7200, 1400],
      borders: noBorder,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1400, type: WidthType.DXA },
              borders: noBorder,
              children: leftCellChildren
            }),
            new TableCell({
              width: { size: 7200, type: WidthType.DXA },
              borders: noBorder,
              children: centerCellChildren
            }),
            new TableCell({
              width: { size: 1400, type: WidthType.DXA },
              borders: noBorder,
              children: rightCellChildren
            })
          ]
        })
      ]
    });

    // Full width red horizontal separator line under header using paragraph border
    const headerRedLine = new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 14, color: 'C0392B', space: 2 }
      },
      spacing: { before: 40, after: 80 },
      children: []
    });

    // Reference & Date row
    let deptName = data.dept_name || data.department || 'Library';
    deptName = deptName.replace(/ Department$/i, '').replace(/ Dept$/i, '').replace(/ Engineering$/i, '');
    const finYear = data.fin_year || '2021-22';
    const inqNo = data.inquiry_no || data.ref_suffix || '';
    const dateStr = data.letter_date ? fmtDate(data.letter_date) : (data.date_str || '   /   /2021');

    const refDateTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [6200, 3800],
      borders: noBorder,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 6200, type: WidthType.DXA },
              borders: noBorder,
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({ text: 'No. LDCE/Purchase/', font: 'Times New Roman', size: 22 }),
                    new TextRun({ text: `${deptName}/${finYear}/`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 22 }),
                    new TextRun({ text: `${inqNo}`, font: 'Times New Roman', size: 22 })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 3800, type: WidthType.DXA },
              borders: noBorder,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({ text: 'Dated: ', font: 'Times New Roman', size: 22 }),
                    new TextRun({ text: `${dateStr}`, font: 'Times New Roman', size: 22 })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });

    // Parse items: array or JSON string
    let items = data.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (_) { items = null; }
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      if (data.item_name || data.equipment_name) {
        items = [{
          item_name: data.item_name || data.equipment_name || '',
          qty: data.qty || '',
          remarks: data.remarks || data.specs || data.fault_desc || ''
        }];
      } else {
        items = [];
      }
    }

    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sr.No.', bold: true, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 22 })] })]
          }),
          new TableCell({
            width: { size: 5500, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Description of Item', bold: true, font: 'Times New Roman', size: 22 })] })]
          }),
          new TableCell({
            width: { size: 1300, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Qty', bold: true, font: 'Times New Roman', size: 22 })] })]
          }),
          new TableCell({
            width: { size: 2300, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Remarks', bold: true, font: 'Times New Roman', size: 22 })] })]
          })
        ]
      })
    ];

    const totalRowsCount = Math.max(items.length, 6);
    for (let i = 0; i < totalRowsCount; i++) {
      const it = items[i] || {};
      tableRows.push(
        new TableRow({
          height: { value: 320, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              width: { size: 900, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), font: 'Times New Roman', size: 22 })] })]
            }),
            new TableCell({
              width: { size: 5500, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: it.item_name || it.description || '', font: 'Times New Roman', size: 22 })] })]
            }),
            new TableCell({
              width: { size: 1300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: it.qty ? String(it.qty) : '', font: 'Times New Roman', size: 22 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: it.remarks || it.specs || '', font: 'Times New Roman', size: 22 })] })]
            })
          ]
        })
      );
    }

    const itemsTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [900, 5500, 1300, 2300],
      borders: tableBorder,
      rows: tableRows
    });

    // Footer lines
    const footerChildren = [
      new Paragraph({
        border: {
          top: { style: BorderStyle.SINGLE, size: 14, color: 'C0392B', space: 4 }
        },
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 15 },
        children: [
          new TextRun({
            text: 'Civil Engineering, Mechanical Engineering and Electrical Engineering programs accredited by NBA',
            color: '204A87',
            font: 'Times New Roman',
            size: 16
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 15 },
        children: [
          new TextRun({
            text: 'Best Engineering College Award - 2019 by ISTE',
            color: '204A87',
            font: 'Times New Roman',
            size: 16
          })
        ]
      })
    ];

    // To section
    const toChildren = [
      new Paragraph({
        spacing: { before: 60, after: 40 },
        children: [
          new TextRun({
            text: 'To,',
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            font: 'Times New Roman',
            size: 24
          })
        ]
      })
    ];
    if (data.vendor_name) {
      toChildren.push(
        new Paragraph({
          children: [new TextRun({ text: data.vendor_name, bold: true, font: 'Times New Roman', size: 22 })]
        })
      );
    }
    if (data.vendor_address) {
      toChildren.push(
        new Paragraph({
          children: [new TextRun({ text: data.vendor_address, font: 'Times New Roman', size: 22 })]
        })
      );
    }

    const quotationSubject = data.quotation_for || data.subject || (data.item_name ? `Quotation for ${data.item_name}` : 'Quotation for ............................................');
    const superscribedItem = data.superscribed_text || (data.item_name ? `Quotation for ${data.item_name} for ${deptName.toLowerCase()}` : `Quotation for stationary items for ${deptName.toLowerCase()}`);
    const lastDateText = data.last_date ? fmtDate(data.last_date) : (data.last_date_str || '.....................................');

    const children = [
      headerTable,
      headerRedLine,
      refDateTable,
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 100 },
        children: [
          new TextRun({
            text: 'Confidential',
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            font: 'Times New Roman',
            size: 24
          })
        ]
      }),
      ...toChildren,
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: 'Sub: ',
            bold: true,
            font: 'Times New Roman',
            size: 22
          }),
          new TextRun({
            text: quotationSubject.startsWith('Quotation for') ? quotationSubject : `Quotation for ${quotationSubject}`,
            color: '204A87',
            underline: { type: UnderlineType.SINGLE },
            font: 'Times New Roman',
            size: 22
          }),
          new TextRun({
            text: '.',
            font: 'Times New Roman',
            size: 22
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 60, after: 80 },
        children: [
          new TextRun({
            text: 'We are pleased to invite quotations for the following items.',
            font: 'Times New Roman',
            size: 22
          })
        ]
      }),
      itemsTable,
      new Paragraph({
        spacing: { before: 120, after: 50 },
        children: [
          new TextRun({
            text: 'Conditions:',
            bold: true,
            font: 'Times New Roman',
            size: 22
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: '1) The quotation should be sent to Principal, L.D Engineering College, Navrangpura ',
            font: 'Times New Roman',
            size: 20
          }),
          new TextRun({
            text: 'Ahmedabad in',
            color: '204A87',
            underline: { type: UnderlineType.SINGLE },
            font: 'Times New Roman',
            size: 20
          }),
          new TextRun({
            text: ' a sealed cover duly superscripted as ',
            font: 'Times New Roman',
            size: 20
          }),
          new TextRun({
            text: `"${superscribedItem}"`,
            bold: true,
            italics: true,
            color: 'C0392B',
            font: 'Times New Roman',
            size: 20
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: '2) The last date for receiving the quotation is ',
            font: 'Times New Roman',
            size: 20
          }),
          new TextRun({
            text: `${lastDateText}`,
            bold: true,
            color: 'C0392B',
            font: 'Times New Roman',
            size: 20
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: '3) Your rates should be F.O.R. inclusive of all charges.',
            font: 'Times New Roman',
            size: 20
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: '4) Government taxes may admissible.',
            font: 'Times New Roman',
            size: 20
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: '5) The validity period for the quotation should be 3 months from the due date of receipt.',
            font: 'Times New Roman',
            size: 20
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: '6) This office reserves the right to reject any or all quotations without assigning any reasons.',
            font: 'Times New Roman',
            size: 20
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 300, after: 60 },
        children: [
          new TextRun({
            text: 'Principal',
            bold: true,
            font: 'Times New Roman',
            size: 24
          })
        ]
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 1080, right: 1080 }
            }
          },
          footers: {
            default: new Footer({
              children: footerChildren
            })
          },
          children
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCComparativeStatement {
  /** DOC-42: Comparative Statement (Govt Fund & Non-Govt Fund) */
  static async generate(data = {}) {
    const noBorder = {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    };

    const tableBorder = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
    };

    const fundTypeStr = (data.fund_type || data.fundType || '').toLowerCase();
    const isNonGovt = data.is_non_govt === true || data.isNonGovt === true || fundTypeStr.includes('non');

    const govtMembers = [
      'Prof S P Shah', 'Prof H M Ravat', 'V P Mamtora',
      'Prof S M Shah', 'Prof M C Chudasama', 'Prof R B Khasiya', 'Prof N M Bhatt'
    ];

    const nonGovtMembers = [
      'Prof S P Shah', 'Prof H M Ravat', 'Prof A I Thakkar',
      'Prof C S Sanghvi', 'Prof S M Shah', 'Prof M C Chudasama', 'Prof N M Bhatt'
    ];

    const committeeMembers = (Array.isArray(data.committee_members) && data.committee_members.length === 7)
      ? data.committee_members
      : (isNonGovt ? nonGovtMembers : govtMembers);

    // Parse Vendors
    let vendors = data.vendors;
    if (typeof vendors === 'string') {
      try { vendors = JSON.parse(vendors); } catch (_) { vendors = null; }
    }
    if (!Array.isArray(vendors) || vendors.length === 0) {
      vendors = [
        {
          name: data.vendor1_name || 'AKSH Services',
          address: data.vendor1_address || '1-Anand Bhavan, Abadnagar Bopal, A\'bad',
          rate: data.vendor1_rate || '',
          tax: data.vendor1_tax || '',
          other: data.vendor1_other || '',
          total: data.vendor1_total || '',
          tc: data.vendor1_tc || ''
        },
        {
          name: data.vendor2_name || 'FAST Services',
          address: data.vendor2_address || 'I-2, GF-Kumkum Residency B/h Satyam Hospital, Chandkheda A\'bad',
          rate: data.vendor2_rate || '',
          tax: data.vendor2_tax || '',
          other: data.vendor2_other || '',
          total: data.vendor2_total || '',
          tc: data.vendor2_tc || ''
        },
        {
          name: data.vendor3_name || 'KARAN Enterprise',
          address: data.vendor3_address || 'C-10 Appts, Central jail road, Subhashbridge, A\'bad',
          rate: data.vendor3_rate || '',
          tax: data.vendor3_tax || '',
          other: data.vendor3_other || '',
          total: data.vendor3_total || '',
          tc: data.vendor3_tc || ''
        }
      ];
    }

    // Parse Items
    let items = data.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (_) { items = null; }
    }
    if (!Array.isArray(items) || items.length === 0) {
      items = [
        {
          item_name: data.item_name || data.equipment_name || data.statement_for || '',
          qty: data.qty || '',
          rates: vendors.map(v => v.rate || ''),
          remarks: data.remarks || ''
        }
      ];
    }

    const statementFor = data.statement_for || data.subject || data.item_name || '.............................................';
    const inqNo = data.inquiry_no || data.ref_no || data.ref_suffix || 'LDCE/store/CAMC-Canon/2019-20/337';
    const inqDate = data.inquiry_date ? fmtDate(data.inquiry_date) : (data.letter_date ? fmtDate(data.letter_date) : (data.date_str || '31/01/2020'));
    const lastDate = data.last_date ? fmtDate(data.last_date) : (data.last_date_str || '12/06/2020');
    const openingDate = data.opening_date ? fmtDate(data.opening_date) : (data.opening_date_str || '');

    // Header 1: L. D. College of Engineering, Ahmedabad-380015.
    const headerParas = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 30 },
        children: [
          new TextRun({
            text: 'L. D. College of Engineering, Ahmedabad–380015.',
            bold: true,
            font: 'Times New Roman',
            size: 26
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 100 },
        children: [
          new TextRun({
            text: `Comparative statement for${statementFor.startsWith('.') ? statementFor : ' ' + statementFor}`,
            font: 'Times New Roman',
            size: 22
          })
        ]
      })
    ];

    // Meta table: Inq No, Dated, Last date, Date of opening
    const metaTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [5500, 4500],
      borders: noBorder,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 5500, type: WidthType.DXA },
              borders: noBorder,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 30 },
                  children: [
                    new TextRun({ text: 'Inq No : ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: inqNo, font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: ' Dated: ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: inqDate, font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 4500, type: WidthType.DXA },
              borders: noBorder,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 30 },
                  children: [
                    new TextRun({ text: 'Last date of receipt: ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: lastDate, font: 'Times New Roman', size: 20 })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({ text: 'Date of opening: ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: openingDate, font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });

    // Column widths: Sr (500), Desc (2400), Qty (800), Remarks (900), Remaining evenly for vendors
    const numVendors = Math.max(vendors.length, 1);
    const vendorColWidth = Math.floor(5400 / numVendors);
    const totalVendorWidth = vendorColWidth * numVendors;
    const descColWidth = 10000 - 500 - 800 - 900 - totalVendorWidth;

    const colWidths = [500, descColWidth, 800, ...Array(numVendors).fill(vendorColWidth), 900];

    const compTableRows = [
      // Header Row 1
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            rowSpan: 2,
            width: { size: 500, type: WidthType.DXA },
            borders: tableBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Sr.\nNo', font: 'Times New Roman', size: 19 })
                ]
              })
            ]
          }),
          new TableCell({
            rowSpan: 2,
            width: { size: descColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Description of Item', font: 'Times New Roman', size: 19 })
                ]
              })
            ]
          }),
          new TableCell({
            rowSpan: 2,
            width: { size: 800, type: WidthType.DXA },
            borders: tableBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Qty.', font: 'Times New Roman', size: 19 })
                ]
              })
            ]
          }),
          new TableCell({
            columnSpan: numVendors,
            width: { size: totalVendorWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'All rates are in Rupees', font: 'Times New Roman', size: 19 })
                ]
              })
            ]
          }),
          new TableCell({
            rowSpan: 2,
            width: { size: 900, type: WidthType.DXA },
            borders: tableBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Remarks', font: 'Times New Roman', size: 19 })
                ]
              })
            ]
          })
        ]
      }),

      // Header Row 2: Vendor details
      new TableRow({
        tableHeader: true,
        children: vendors.map(v => new TableCell({
          width: { size: vendorColWidth, type: WidthType.DXA },
          borders: tableBorder,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${v.name || ''}\n`, bold: true, font: 'Times New Roman', size: 17 }),
                new TextRun({ text: v.address || '', font: 'Times New Roman', size: 16 })
              ]
            })
          ]
        }))
      })
    ];

    // Data Rows
    items.forEach((item, idx) => {
      const itemRates = item.rates || vendors.map(v => (idx === 0 ? v.rate : ''));
      compTableRows.push(
        new TableRow({
          height: { value: 600, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              width: { size: 500, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: descColWidth, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: item.item_name || '', font: 'Times New Roman', size: 18 })] })]
            }),
            new TableCell({
              width: { size: 800, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(item.qty || ''), font: 'Times New Roman', size: 18 })] })]
            }),
            ...vendors.map((_, vIdx) => new TableCell({
              width: { size: vendorColWidth, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(itemRates[vIdx] || ''), font: 'Times New Roman', size: 18 })] })]
            })),
            new TableCell({
              width: { size: 900, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.remarks || '', font: 'Times New Roman', size: 18 })] })]
            })
          ]
        })
      );
    });

    // Summary Rows
    // 1. Govt. Tax
    compTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 500 + descColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Govt. Tax', font: 'Times New Roman', size: 18 })] })]
          }),
          new TableCell({
            width: { size: 800, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          }),
          ...vendors.map(v => new TableCell({
            width: { size: vendorColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v.tax || '', font: 'Times New Roman', size: 18 })] })]
          })),
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          })
        ]
      })
    );

    // 2. Other charges
    compTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 500 + descColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Other charges', font: 'Times New Roman', size: 18 })] })]
          }),
          new TableCell({
            width: { size: 800, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          }),
          ...vendors.map(v => new TableCell({
            width: { size: vendorColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v.other || '', font: 'Times New Roman', size: 18 })] })]
          })),
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          })
        ]
      })
    );

    // 3. Grand total
    compTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 500 + descColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Grand total', bold: true, font: 'Times New Roman', size: 19 })] })]
          }),
          new TableCell({
            width: { size: 800, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          }),
          ...vendors.map(v => new TableCell({
            width: { size: vendorColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v.total || '', bold: true, font: 'Times New Roman', size: 19 })] })]
          })),
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          })
        ]
      })
    );

    // 4. Terms & Condition
    compTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 500 + descColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Terms & Condition\n', bold: true, font: 'Times New Roman', size: 18 }),
                  new TextRun({ text: '(Party wise if any)', bold: true, font: 'Times New Roman', size: 18 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 800, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          }),
          ...vendors.map(v => new TableCell({
            width: { size: vendorColWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v.tc || '', font: 'Times New Roman', size: 17 })] })]
          })),
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: tableBorder,
            children: [new Paragraph({ text: '' })]
          })
        ]
      })
    );

    const comparativeTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: colWidths,
      borders: tableBorder,
      rows: compTableRows
    });

    // Signatures Row 1
    const signRow1 = new Paragraph({
      spacing: { before: 180, after: 120 },
      children: [
        new TextRun({ text: 'Prepared By:               ', bold: true, font: 'Times New Roman', size: 21 }),
        new TextRun({ text: 'Checked By: 1)                           ', bold: true, font: 'Times New Roman', size: 21 }),
        new TextRun({ text: '2)', bold: true, font: 'Times New Roman', size: 21 })
      ]
    });

    // Certificate by HOD
    const certHeading = new Paragraph({
      spacing: { before: 80, after: 40 },
      children: [
        new TextRun({ text: 'Certificate by Head of Department:', bold: true, font: 'Times New Roman', size: 21 })
      ]
    });

    const certBody = new Paragraph({
      spacing: { before: 20, after: 80 },
      children: [
        new TextRun({
          text: '        The lowest rate quoted by the party for the above items, which are encircled by the red ink and initialed by the undersigned are lowest price quoted for the items and these items are as per specifications mentioned in said inquiry. Hence it is hereby recommended to purchase item(s) from the respective party. It is also certified that lowest price quoted by the party for the above items are found reasonable as per the current market survey.',
          font: 'Times New Roman',
          size: 19
        })
      ]
    });

    const hodHeading = new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({ text: 'Head of the department', bold: true, font: 'Times New Roman', size: 21 })
      ]
    });

    const commHeading = new Paragraph({
      spacing: { before: 40, after: 60 },
      children: [
        new TextRun({ text: 'Committee Members:', bold: true, font: 'Times New Roman', size: 21 })
      ]
    });

    // Committee Table: 7 members with signature space above and name centered below
    const memberCellWidth = Math.floor(10000 / committeeMembers.length);
    const committeeTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      borders: tableBorder,
      rows: [
        new TableRow({
          height: { value: 750, rule: HeightRule.ATLEAST },
          children: committeeMembers.map(m => new TableCell({
            width: { size: memberCellWidth, type: WidthType.DXA },
            borders: tableBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 380, after: 20 },
                children: [
                  new TextRun({ text: m, font: 'Times New Roman', size: 18 })
                ]
              })
            ]
          }))
        })
      ]
    });

    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 20 },
          children: [
            new TextRun({ text: '01 of 01', font: 'Times New Roman', size: 18 })
          ]
        })
      ]
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 900, right: 900 }
            }
          },
          footers: {
            default: footer
          },
          children: [
            ...headerParas,
            metaTable,
            comparativeTable,
            signRow1,
            certHeading,
            certBody,
            hodHeading,
            commHeading,
            committeeTable
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCPurchaseOrderNonGeM {
  /** DOC-43: Purchase Order (Non-GeM) & Work Order (Repairing) */
  static async generate(data = {}) {
    const isWorkOrder = data.order_type === 'work_order' || data.type === 'work_order' || data.is_work_order === true;

    const ldceLogoPath = path.join(__dirname, '../../assets/ldce_logo.png');
    const gandhiLogoPath = path.join(__dirname, '../../assets/gandhi_150_logo.png');

    let ldceLogoBuffer = null;
    let gandhiLogoBuffer = null;

    if (fs.existsSync(ldceLogoPath)) {
      ldceLogoBuffer = fs.readFileSync(ldceLogoPath);
    }
    if (fs.existsSync(gandhiLogoPath)) {
      gandhiLogoBuffer = fs.readFileSync(gandhiLogoPath);
    }

    const noBorder = {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    };

    const tableBorder = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
    };

    // Header Left cell: Circular LDCE Logo + L.D.C.E in red
    const leftCellChildren = [];
    if (ldceLogoBuffer) {
      leftCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: ldceLogoBuffer,
              transformation: { width: 70, height: 60 }
            })
          ]
        })
      );
    }
    leftCellChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 0 },
        children: [
          new TextRun({
            text: 'L.D.C.E',
            bold: true,
            color: 'C0392B',
            font: 'Times New Roman',
            size: 19
          })
        ]
      })
    );

    // Header Center cell
    const centerCellChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 15 },
        children: [
          new TextRun({
            text: 'Government of Gujarat',
            color: 'C0392B',
            font: 'Georgia',
            size: 21
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 15 },
        children: [
          new TextRun({
            text: 'L. D. College of Engineering, Ahmedabad',
            bold: true,
            color: 'C0392B',
            font: 'Georgia',
            size: 26
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 15 },
        children: [
          new TextRun({
            text: 'Opp. Gujarat University, Navrangpura',
            color: '204A87',
            font: 'Verdana',
            size: 17
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 15 },
        children: [
          new TextRun({
            text: 'Ahmedabad - 380 015',
            color: '204A87',
            font: 'Verdana',
            size: 17
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 15 },
        children: [
          new TextRun({
            text: 'Phone : Office - 079 26306752, Principal - 079 26302887',
            color: '204A87',
            font: 'Verdana',
            size: 15
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: 'Email : ldce-abad-dte@gujarat.gov.in   Website : www.ldce.ac.in',
            color: '204A87',
            font: 'Verdana',
            size: 15
          })
        ]
      })
    ];

    // Header Right cell: Gandhi 150 Logo
    const rightCellChildren = [];
    if (gandhiLogoBuffer) {
      rightCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: gandhiLogoBuffer,
              transformation: { width: 85, height: 62 }
            })
          ]
        })
      );
    }

    const headerTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [1400, 7200, 1400],
      borders: noBorder,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1400, type: WidthType.DXA },
              borders: noBorder,
              children: leftCellChildren
            }),
            new TableCell({
              width: { size: 7200, type: WidthType.DXA },
              borders: noBorder,
              children: centerCellChildren
            }),
            new TableCell({
              width: { size: 1400, type: WidthType.DXA },
              borders: noBorder,
              children: rightCellChildren
            })
          ]
        })
      ]
    });

    const headerRedLine = new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 14, color: 'C0392B', space: 2 }
      },
      spacing: { before: 40, after: 80 },
      children: []
    });

    let deptName = data.dept_name || data.department || (isWorkOrder ? 'Chemical' : '');
    deptName = deptName.replace(/ Department$/i, '').replace(/ Dept$/i, '').replace(/ Engineering$/i, '');
    const finYear = data.fin_year || '2021-22';
    const yearOnly = finYear.split('-')[0] || '2021';
    const refNo = data.order_no || data.po_no || data.ref_no || '';
    const dateStr = data.order_date ? fmtDate(data.order_date) : (data.letter_date ? fmtDate(data.letter_date) : (data.date_str || `   /   /${yearOnly}`));

    let refDateTable;
    if (isWorkOrder) {
      refDateTable = new Table({
        width: { size: 10000, type: WidthType.DXA },
        columnWidths: [6200, 3800],
        borders: noBorder,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 6200, type: WidthType.DXA },
                borders: noBorder,
                children: [
                  new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: [
                      new TextRun({ text: 'No. LDCE/', font: 'Times New Roman', size: 22 }),
                      new TextRun({ text: `${deptName || 'Chemical'}`, color: 'C0392B', font: 'Times New Roman', size: 22 }),
                      new TextRun({ text: `/repairing/${yearOnly}/${refNo ? refNo : ''}`, font: 'Times New Roman', size: 22 })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 3800, type: WidthType.DXA },
                borders: noBorder,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 60, after: 60 },
                    children: [
                      new TextRun({ text: 'Date: ', font: 'Times New Roman', size: 22 }),
                      new TextRun({ text: `${dateStr}`, font: 'Times New Roman', size: 22 })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    } else {
      refDateTable = new Table({
        width: { size: 10000, type: WidthType.DXA },
        columnWidths: [6200, 3800],
        borders: noBorder,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 6200, type: WidthType.DXA },
                borders: noBorder,
                children: [
                  new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: [
                      new TextRun({ text: 'No. LDCE/Purchase / ', font: 'Times New Roman', size: 22 }),
                      new TextRun({ text: deptName ? `${deptName} / ` : '', font: 'Times New Roman', size: 22 }),
                      new TextRun({ text: `/${finYear}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 22 })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 3800, type: WidthType.DXA },
                borders: noBorder,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 60, after: 60 },
                    children: [
                      new TextRun({ text: 'Dated: ', font: 'Times New Roman', size: 22 }),
                      new TextRun({ text: `${dateStr}`, font: 'Times New Roman', size: 22 })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    }

    // Title
    const titlePara = new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({
          text: isWorkOrder ? 'Work Order' : 'Purchase Order',
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          font: 'Times New Roman',
          size: 24
        })
      ]
    });

    // To, Vendor Details
    const vendorName = data.supplier_name || data.vendor_name || data.party_name || '';
    const vendorAddress = data.supplier_address || data.vendor_address || '';

    const toSection = [
      new Paragraph({
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({
            text: 'To,',
            bold: isWorkOrder,
            color: isWorkOrder ? 'C0392B' : '000000',
            font: 'Times New Roman',
            size: 22
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [
          new TextRun({ text: vendorName, font: 'Times New Roman', size: 22 })
        ]
      }),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({ text: vendorAddress, font: 'Times New Roman', size: 20 })
        ]
      })
    ];

    // Subject / Reference (Work Order) or Intro
    const introSection = [];
    if (isWorkOrder) {
      const eqName = data.equipment_name || data.item_name || '...........................................';
      const quoteDate = data.quotation_date ? fmtDate(data.quotation_date) : (data.quote_date_str || '........................');
      introSection.push(
        new Paragraph({
          spacing: { before: 60, after: 30 },
          children: [
            new TextRun({ text: 'Sub:  Repairing of ', font: 'Times New Roman', size: 21 }),
            new TextRun({ text: eqName, font: 'Times New Roman', size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 80 },
          children: [
            new TextRun({ text: 'Ref.  Your quotation dated: ', font: 'Times New Roman', size: 21 }),
            new TextRun({ text: quoteDate, font: 'Times New Roman', size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { before: 40, after: 80 },
          children: [
            new TextRun({
              text: 'With reference to your quotation mention above the undersigned is pleased to order out the following.',
              font: 'Times New Roman',
              size: 21
            })
          ]
        })
      );
    } else {
      introSection.push(
        new Paragraph({
          spacing: { before: 60, after: 80 },
          children: [
            new TextRun({
              text: 'We are pleased to order out the following items for our institute.',
              font: 'Times New Roman',
              size: 21
            })
          ]
        })
      );
    }

    // Parse Items
    let items = data.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (_) { items = null; }
    }
    if (!Array.isArray(items) || items.length === 0) {
      items = [
        {
          item_name: data.item_name || data.equipment_name || '',
          unit_rate: data.unit_rate || '',
          qty: data.qty || '',
          total_amount: data.total_amount || data.total_value || data.total_cost || ''
        }
      ];
    }

    // Build Table
    let orderTable;
    if (isWorkOrder) {
      // 4 columns: Sr. No. (600), Description of repairing (5600), Qty. (1500), Amount in Rs. (2300)
      const rowsCount = Math.max(items.length, 2);
      const rows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 600, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sr.\nNo.', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 5600, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Description of repairing', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Qty.', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Amount in\nRs.', font: 'Times New Roman', size: 19 })] })]
            })
          ]
        })
      ];

      for (let i = 0; i < rowsCount; i++) {
        const it = items[i] || {};
        rows.push(
          new TableRow({
            height: { value: 400, rule: HeightRule.ATLEAST },
            children: [
              new TableCell({
                width: { size: 600, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), font: 'Times New Roman', size: 19 })] })]
              }),
              new TableCell({
                width: { size: 5600, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ children: [new TextRun({ text: it.item_name || it.desc || '', font: 'Times New Roman', size: 19 })] })]
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: it.qty || '', font: 'Times New Roman', size: 19 })] })]
              }),
              new TableCell({
                width: { size: 2300, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: it.total_amount ? (typeof it.total_amount === 'number' ? it.total_amount.toFixed(2) : String(it.total_amount)) : '', font: 'Times New Roman', size: 19 })] })]
              })
            ]
          })
        );
      }

      // Other charges, GST, Grand total, Total Rupees
      rows.push(
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Other charges', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.other_charges ? String(data.other_charges) : '', font: 'Times New Roman', size: 19 })] })]
            })
          ]
        }),
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'GST', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.gst_amount ? String(data.gst_amount) : '', font: 'Times New Roman', size: 19 })] })]
            })
          ]
        }),
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Grand total', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.grand_total ? String(data.grand_total) : (data.total_amount ? String(data.total_amount) : ''), font: 'Times New Roman', size: 19 })] })]
            })
          ]
        }),
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Total Rupees', bold: true, font: 'Times New Roman', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.grand_total ? String(data.grand_total) : (data.total_amount ? String(data.total_amount) : '0'), bold: true, font: 'Times New Roman', size: 20 })] })]
            })
          ]
        })
      );

      orderTable = new Table({
        width: { size: 10000, type: WidthType.DXA },
        columnWidths: [600, 5600, 1500, 2300],
        borders: tableBorder,
        rows
      });
    } else {
      // Purchase Order (5 columns): Sr.No. (500), Description (4200), Unit Rate (1500), Qty. (1500), Total Amount (2300)
      const rowsCount = Math.max(items.length, 3);
      const rows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 500, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sr.No.', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 4200, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Description', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Unit Rate', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Qty.', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Total\nAmount', font: 'Times New Roman', size: 19 })] })]
            })
          ]
        })
      ];

      for (let i = 0; i < rowsCount; i++) {
        const it = items[i] || {};
        rows.push(
          new TableRow({
            height: { value: 400, rule: HeightRule.ATLEAST },
            children: [
              new TableCell({
                width: { size: 500, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), font: 'Times New Roman', size: 19 })] })]
              }),
              new TableCell({
                width: { size: 4200, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ children: [new TextRun({ text: it.item_name || it.desc || '', font: 'Times New Roman', size: 19 })] })]
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: it.unit_rate ? String(it.unit_rate) : '', font: 'Times New Roman', size: 19 })] })]
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: it.qty || '', font: 'Times New Roman', size: 19 })] })]
              }),
              new TableCell({
                width: { size: 2300, type: WidthType.DXA },
                borders: tableBorder,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: it.total_amount ? (typeof it.total_amount === 'number' ? it.total_amount.toFixed(2) : String(it.total_amount)) : '', font: 'Times New Roman', size: 19 })] })]
              })
            ]
          })
        );
      }

      // Other charges, GST, Grand total, Total Rupees
      rows.push(
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 4,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Other charges', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.other_charges ? String(data.other_charges) : '', font: 'Times New Roman', size: 19 })] })]
            })
          ]
        }),
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 4,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'GST', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.gst_amount ? String(data.gst_amount) : '', font: 'Times New Roman', size: 19 })] })]
            })
          ]
        }),
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 4,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Grand total', font: 'Times New Roman', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.grand_total ? String(data.grand_total) : (data.total_amount ? String(data.total_amount) : ''), font: 'Times New Roman', size: 19 })] })]
            })
          ]
        }),
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              columnSpan: 4,
              width: { size: 7700, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: 'Total Rupees', bold: true, font: 'Times New Roman', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2300, type: WidthType.DXA },
              borders: tableBorder,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.grand_total ? String(data.grand_total) : (data.total_amount ? String(data.total_amount) : '0'), bold: true, font: 'Times New Roman', size: 20 })] })]
            })
          ]
        })
      );

      orderTable = new Table({
        width: { size: 10000, type: WidthType.DXA },
        columnWidths: [500, 4200, 1500, 1500, 2300],
        borders: tableBorder,
        rows
      });
    }

    // Conditions Section
    const conditionParas = [];
    if (isWorkOrder) {
      conditionParas.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({ text: 'Conditions:', bold: true, font: 'Times New Roman', size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '1) The repairing should be done within ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: '7 days', bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' from the date of this order.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '2) The parts for repairing should be used of standard quality.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '3) The bill should be sent in quadruplicate.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '4) Taxes to be pay as per govt. rules.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '5) Payment will be done as soon as possible after due scrutiny & Inspection.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: '6) The undersigned reserves the right to cancel the order or reject the one or all items which may be found of inferior quality or not as per our requirement/suitable to machine. Such items will be sent back to you at your cost.',
              font: 'Times New Roman',
              size: 19
            })
          ]
        })
      );
    } else {
      conditionParas.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({ text: 'Terms and Conditions:', bold: true, font: 'Times New Roman', size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '1) The items should be delivered urgently on receiving this order.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '2) The items must be as per specifications mentioned above.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '3) Taxes to be pay as per govt. rules.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '4) The bill should be sent in quadruplicate.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: '5) Payment will be done as soon as possible after due scrutiny & Inspection.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: '6) The undersigned reserves the right to cancel the order or reject one or all items which may be found of inferior quality or not as per our requirement or not as per specifications. Such items will be sent back to you at your cost.',
              font: 'Times New Roman',
              size: 19
            })
          ]
        })
      );
    }

    // Principal Sign
    const principalSign = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 240, after: 40 },
      children: [
        new TextRun({
          text: 'Principal',
          bold: true,
          font: 'Times New Roman',
          size: 24
        })
      ]
    });

    // Footer with red top line
    const footerChildren = [
      new Paragraph({
        border: {
          top: { style: BorderStyle.SINGLE, size: 14, color: 'C0392B', space: 2 }
        },
        spacing: { before: 40, after: 20 },
        children: []
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 15 },
        children: [
          new TextRun({
            text: 'Civil Engineering, Mechanical Engineering and Electrical Engineering programs accredited by NBA',
            color: '204A87',
            font: 'Times New Roman',
            size: 16
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: 'Best Engineering College Award - 2019 by ISTE',
            color: '204A87',
            font: 'Times New Roman',
            size: 16
          })
        ]
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 1080, right: 1080 }
            }
          },
          footers: {
            default: new Footer({
              children: footerChildren
            })
          },
          children: [
            headerTable,
            headerRedLine,
            refDateTable,
            titlePara,
            ...toSection,
            ...introSection,
            orderTable,
            ...conditionParas,
            principalSign
          ]
        }
      ]
    });

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
    let deptName = data.dept_name || data.department || '';
    deptName = deptName.replace(/ Department$/i, '').replace(/ Dept$/i, '');
    
    const deptGuj = deptName ? deptName : '.....................';
    const eqName = data.equipment_name || data.item_name || '...................';
    const estCost = data.est_repair_cost ? (typeof data.est_repair_cost === 'number' ? inr(data.est_repair_cost) : data.est_repair_cost) : '...............';
    const estCostWords = data.est_cost_words || data.cost_words || '............................................';
    const reasonText = data.reason || data.fault_desc || '......................................................................................';
    const dateStr = data.approval_date ? fmtDate(data.approval_date) : (data.date ? fmtDate(data.date) : (data.date_str || '............................'));

    // 1. Top-right header
    const headerParas = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({ text: `${deptGuj} ડીપાર્ટમેન્ટ`, font: 'Nirmala UI', size: 22 })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({ text: 'એલ.ડી. કોલેજ ઓફ એન્જી.,અમદાવાદ', font: 'Nirmala UI', size: 22 })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({ text: `તા.${dateStr}`, font: 'Nirmala UI', size: 22 })
        ]
      })
    ];

    // 2. Left Subheading: સાદર રજુ:
    const sadarRaju = new Paragraph({
      spacing: { before: 80, after: 120 },
      children: [
        new TextRun({ text: 'સાદર રજુ:', bold: true, font: 'Nirmala UI', size: 22 })
      ]
    });

    // 3. Gujarati Body Paragraph
    const bodyPara = new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 40, after: 260, line: 380 },
      children: [
        new TextRun({ text: 'અત્રેની સંસ્થાનાં ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: deptGuj, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' વિભાગ/વિદ્યાશાખાનાં આ સાથે સામેલ પત્રક મુજબનાં ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: eqName, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' સાધન/સાધનોનાં રીપેરીંગ માટે અંદાજીત કુલ રૂ. ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: String(estCost), underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' અંકે રૂપિયા ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: estCostWords, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' ખર્ચ થાય તેમ છે. ઉક્ત સાધન/સાધનોનાં રીપેરીંગ ની સેવાઓ GeM Portal ઉપર ઉપલબ્ધ નથી./ છે. સદર સાધનોનું રીપેરીંગ ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: reasonText, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' ને કારણે અનિવાર્ય છે. ઉક્ત વિગતો ધ્યાને લઇ જરૂરી રીપેરીંગ કરાવવા મંજુરી આપવા વિનંતી.', font: 'Nirmala UI', size: 21 })
      ]
    });

    // 4. Signatures
    const hodSign = new Paragraph({
      spacing: { before: 240, after: 240 },
      children: [
        new TextRun({ text: 'Head of department', bold: true, font: 'Times New Roman', size: 22 })
      ]
    });

    const storeSign = new Paragraph({
      spacing: { before: 240, after: 240 },
      children: [
        new TextRun({ text: 'Store Officer', bold: true, font: 'Times New Roman', size: 22 })
      ]
    });

    const committeeSign = new Paragraph({
      spacing: { before: 240, after: 320 },
      children: [
        new TextRun({ text: 'Head Store & Purchase/ Purchase Committee', bold: true, font: 'Times New Roman', size: 22 })
      ]
    });

    // 5. Section: Approval of Principal
    const approvalHeading = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 120 },
      children: [
        new TextRun({
          text: 'Approval of Principal',
          bold: true,
          italics: true,
          underline: { type: UnderlineType.SINGLE },
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    const expBudgetHead = new Paragraph({
      spacing: { before: 80, after: 60 },
      children: [
        new TextRun({
          text: 'Expenditure to be incurred under following (√) marked budget head:',
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    const contingencyPla = new Paragraph({
      spacing: { before: 40, after: 100 },
      children: [
        new TextRun({
          text: 'Contingency    /    PLA',
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    const otherFund = new Paragraph({
      spacing: { before: 60, after: 80 },
      children: [
        new TextRun({
          text: 'Please mention if any other fund:',
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    const remarks = new Paragraph({
      spacing: { before: 60, after: 80 },
      children: [
        new TextRun({
          text: 'Remarks:',
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    const approvedNotApproved = new Paragraph({
      spacing: { before: 60, after: 320 },
      children: [
        new TextRun({
          text: 'Approved / Not Approved',
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    const principalSign = new Paragraph({
      spacing: { before: 180, after: 40 },
      children: [
        new TextRun({
          text: 'Principal',
          bold: true,
          font: 'Times New Roman',
          size: 24
        })
      ]
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 900, bottom: 900, left: 1200, right: 1200 }
            }
          },
          children: [
            ...headerParas,
            sadarRaju,
            bodyPara,
            hodSign,
            storeSign,
            committeeSign,
            approvalHeading,
            expBudgetHead,
            contingencyPla,
            otherFund,
            remarks,
            approvedNotApproved,
            principalSign
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCWorkOrder {
  /** DOC-46: Note for Work Order (WO – Repairing) */
  static async generate(data = {}) {
    let deptName = data.dept_name || data.department || '';
    deptName = deptName.replace(/ Department$/i, '').replace(/ Dept$/i, '');

    const deptGuj = deptName ? deptName : '.....................';
    const eqName = data.equipment_name || data.item_name || '...................';
    const prevPageNo = data.prev_page_no || data.page_no || '.......';
    const lastDateStr = data.last_date ? fmtDate(data.last_date) : (data.last_date_str || '..................');
    const l1Party = data.l1_vendor || data.agency_name || data.supplier_name || '......................................';
    const meetingDateStr = data.meeting_date ? fmtDate(data.meeting_date) : (data.committee_date ? fmtDate(data.committee_date) : '...................');
    const dateStr = data.wo_date ? fmtDate(data.wo_date) : (data.date ? fmtDate(data.date) : (data.date_str || '............................'));

    // 1. Top-right header
    const headerParas = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({ text: `${deptGuj} ડીપાર્ટમેન્ટ`, font: 'Nirmala UI', size: 22 })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({ text: 'એલ.ડી. કોલેજ ઓફ એન્જી.,અમદાવાદ', font: 'Nirmala UI', size: 22 })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({ text: `તા.${dateStr}`, font: 'Nirmala UI', size: 22 })
        ]
      })
    ];

    // 2. Left Subheading: સાદર રજુ:
    const sadarRaju = new Paragraph({
      spacing: { before: 80, after: 120 },
      children: [
        new TextRun({ text: 'સાદર રજુ:', bold: true, font: 'Nirmala UI', size: 22 })
      ]
    });

    // 3. Gujarati Body Paragraph
    const bodyPara = new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 40, after: 320, line: 380 },
      children: [
        new TextRun({ text: 'પુર્વ પૃષ્ઠ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: prevPageNo, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: 'ની નોંધ ઉપર આચાર્યા શ્રી તરફથી મળેલ મંજુરી અન્વયે અત્રેની સંસ્થાનાં ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: deptGuj, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' વિભાગ/વિદ્યાશાખાનાં ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: eqName, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' સાધન/સાધનોનાં રીપેરીંગ માટે તા.', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: lastDateStr, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' સુધીમાં વિવિધ પેઢીઓ પાસેથી ભાવપત્રક મંગાવવામાં આવેલ. સમય મર્યાદામાં મળેલ ભાવપત્રકોનાં તુલનાત્મક પત્રક મુજબ જરૂરી રીપેરીંગ માટે સૌથી ઓછા ભાવ આપનાર પાર્ટી ', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: l1Party, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' છે. / આ સાથે સામેલ પત્રક મુજબ છે. પેઢી/પેઢીઓ દ્વારા આપવામાં આવેલ ભાવ વ્યાજબી જણાય છે. આ સાથે ખરીદ સમિતિની તા.', font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: meetingDateStr, underline: { type: UnderlineType.SINGLE }, font: 'Nirmala UI', size: 21 }),
        new TextRun({ text: ' ની બેઠકની કાર્યવાહી નોંધ સામેલ છે. સદર બાબતો ધ્યાને લઇ લાયક ઠરેલ પેઢી/પેઢીઓને વર્ક ઓર્ડર આપવા બાબતે રજુ કરેલ છે.', font: 'Nirmala UI', size: 21 })
      ]
    });

    // 4. Signatures
    const hodSign = new Paragraph({
      spacing: { before: 260, after: 260 },
      children: [
        new TextRun({ text: 'Head of department', bold: true, font: 'Times New Roman', size: 22 })
      ]
    });

    const storeSign = new Paragraph({
      spacing: { before: 260, after: 260 },
      children: [
        new TextRun({ text: 'Store Officer', bold: true, font: 'Times New Roman', size: 22 })
      ]
    });

    const committeeSign = new Paragraph({
      spacing: { before: 260, after: 380 },
      children: [
        new TextRun({ text: 'Head Store & Purchase/ Purchase Committee', bold: true, font: 'Times New Roman', size: 22 })
      ]
    });

    const approvedNotApproved = new Paragraph({
      spacing: { before: 180, after: 380 },
      children: [
        new TextRun({
          text: 'Approved/Not Approved',
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    const principalSign = new Paragraph({
      spacing: { before: 180, after: 40 },
      children: [
        new TextRun({
          text: 'Principal',
          bold: true,
          font: 'Times New Roman',
          size: 24
        })
      ]
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 900, bottom: 900, left: 1200, right: 1200 }
            }
          },
          children: [
            ...headerParas,
            sadarRaju,
            bodyPara,
            hodSign,
            storeSign,
            committeeSign,
            approvedNotApproved,
            principalSign
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }
}

function numToEnglishWords(amount) {
  const num = Math.round(parseFloat(amount || 0));
  if (num === 0) return 'Rupees Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n) {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  let n = num;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remainder = n;

  let parts = [];
  if (crore > 0) parts.push(`${convertGroup(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertGroup(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertGroup(thousand)} Thousand`);
  if (remainder > 0) parts.push(convertGroup(remainder));

  return `Rupees ${parts.join(' ')} Only`;
}

class DOCPassForPaymentRepair {
  /** DOC-47: Pass for Payment – Certificate To Be Given Along With Bills (Non-GeM & Repairing) */
  static async generate(data = {}) {
    const isNonGeM = data.pass_type === 'non_gem' || data.type === 'non_gem';

    const noBorder = {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    };

    if (isNonGeM) {
      // -------------------------------------------------------------
      // 1. PASS FOR PAYMENT: NON-GeM PURCHASE
      // -------------------------------------------------------------
      const billNo = data.bill_no || '16707';
      const billDate = data.bill_date ? fmtDate(data.bill_date) : (data.bill_date_str || '10/02/2021');
      const itemDesc = data.item_desc || data.item_name_qty || (data.item_name ? `${data.item_name}, Qty: ${data.qty || '1'}` : 'Senitizer, Qty: 19 Bottles (500 ml each)');
      const partyName = data.party_name || data.vendor_name || 'Chandkheda Medical Store, Ahmedabad';
      const poNo = data.po_no || data.order_no || 'LDCE/Store/Covid-19/sanitizer';
      const poDate = data.po_date ? fmtDate(data.po_date) : (data.order_date ? fmtDate(data.order_date) : '09/02/2021');
      let deptName = data.dept_name || data.department || 'Store';
      deptName = deptName.replace(/ Department$/i, '').replace(/ Dept$/i, '');
      const regName = data.register_name || 'General purchase';
      const regPage = data.page_no || data.reg_page || '.......';
      const regSr = data.sr_no || data.reg_sr || '.......';
      const paymentType = data.payment_type || 'Full'; // Full / Part
      const budgetHead = data.budget_head || 'Gymkhana';
      const deduction = data.deduction || data.deductions || 'NIL';
      const amount = data.amount || data.net_amount || data.gross_amount || '3750';
      const amountWords = data.amount_words || numToEnglishWords(amount);

      const gpRegNo = data.gp_reg_no || '.................';
      const gpPageNo = data.gp_page_no || '............';
      const gpSrNo = data.gp_sr_no || '..............';

      const children = [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 140 },
          children: [
            new TextRun({
              text: 'CERTIFICATE TO BE GIVEN ALONG WITH BILLS',
              bold: true,
              underline: { type: UnderlineType.SINGLE },
              font: 'Times New Roman',
              size: 22
            })
          ]
        }),

        // 1. Ref Bill No
        new Paragraph({
          spacing: { before: 40, after: 30 },
          children: [
            new TextRun({ text: '1. Ref. Bill No ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${billNo}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ' Dt ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${billDate}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ' for ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${itemDesc}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({ text: '    Party : ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${partyName}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 })
          ]
        }),

        // 2 A.T. No./Purchase Order No.
        new Paragraph({
          spacing: { before: 30, after: 80 },
          children: [
            new TextRun({ text: '2  A.T. No./Purchase Order No. ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${poNo}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ', Dated ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${poDate}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 })
          ]
        }),

        // Certified that:
        new Paragraph({
          spacing: { before: 40, after: 30 },
          children: [
            new TextRun({ text: 'Certified that:', bold: true, font: 'Times New Roman', size: 20 })
          ]
        }),

        // Points 1 to 11
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '1. The procurement has been made according to the Gujarat Govt. G.R.S., norms and guidelines.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '2. The procurement has been made according to policies and procedures of Govt. of Gujarat.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '3. Certified that the material received is/are inspected, found satisfactory working condition and in accordance with the specifications of A.T (Purchase order)', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '4. The bill is checked, verified and found correct.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '5. Certified the charges of GST,Insurance,Fright,Packing and forwarding etc. are admissible.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '6. Certified that the all materials of this bill have been correctly entered in ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${deptName}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' department ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${regName}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' register on page no ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${regPage}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' at Sr No ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${regSr}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: '.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '7. This is ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: paymentType === 'Full' ? 'Full' : 'Full', bold: paymentType === 'Full', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' / ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: paymentType === 'Part' ? 'Part' : 'Part', bold: paymentType === 'Part', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' payment.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '8. The amount relating to the above said bill passed as below has not been passed before.', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '9. The budget head is ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${budgetHead}`, bold: true, color: 'C0392B', underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '10. Certified that the amount deducted from the above bill is ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${deduction}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 100 },
          children: [
            new TextRun({ text: '11. Recommended for payment of ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `Rs.${amount}/- (`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${amountWords}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ')', bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 })
          ]
        }),

        // Department Signatures Table (3 columns)
        new Table({
          width: { size: 10000, type: WidthType.DXA },
          columnWidths: [3300, 3400, 3300],
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 3300, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Lab Assi / Office Clerk', bold: true, font: 'Times New Roman', size: 19 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 3400, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Lab Incharge / Office In charge', bold: true, font: 'Times New Roman', size: 19 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 3300, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 160, after: 15 },
                      children: [new TextRun({ text: 'Head of the Dept.', bold: true, font: 'Times New Roman', size: 19 })]
                    }),
                    new Paragraph({
                      spacing: { before: 40, after: 15 },
                      children: [new TextRun({ text: 'Officer in Charge', bold: true, font: 'Times New Roman', size: 19 })]
                    }),
                    new Paragraph({
                      spacing: { before: 15, after: 30 },
                      children: [new TextRun({ text: 'Admin Officer', bold: true, font: 'Times New Roman', size: 19 })]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Solid Horizontal Separator
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 2 }
          },
          spacing: { before: 60, after: 80 },
          children: []
        }),

        // (For Store use only)
        new Paragraph({
          spacing: { before: 30, after: 40 },
          children: [
            new TextRun({ text: '(For Store use only)', bold: true, font: 'Times New Roman', size: 20 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 100 },
          children: [
            new TextRun({ text: 'Entered in General purchase Register No.', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${gpRegNo}`, font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' on page No. ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${gpPageNo}`, font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ' at Sr No. ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${gpSrNo}`, font: 'Times New Roman', size: 19 })
          ]
        }),

        // Store Signatures Table (2 columns)
        new Table({
          width: { size: 10000, type: WidthType.DXA },
          columnWidths: [5000, 5000],
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 5000, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Store Keeper', bold: true, font: 'Times New Roman', size: 19 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 5000, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Store Officer', bold: true, font: 'Times New Roman', size: 19 })]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Dashed Horizontal Separator
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.DASHED, size: 8, color: '000000', space: 2 }
          },
          spacing: { before: 60, after: 80 },
          children: []
        }),

        // (For Account use only)
        new Paragraph({
          spacing: { before: 30, after: 60 },
          children: [
            new TextRun({ text: '(For Account use only)', bold: true, font: 'Times New Roman', size: 20 })
          ]
        }),
        new Paragraph({
          spacing: { before: 30, after: 160 },
          children: [
            new TextRun({ text: 'Passed for payment of ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `Rs.${amount}/- (`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${amountWords}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ')', bold: true, color: 'C0392B', font: 'Times New Roman', size: 20 })
          ]
        }),

        // Account & Principal Signatures Table
        new Table({
          width: { size: 10000, type: WidthType.DXA },
          columnWidths: [5000, 5000],
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 5000, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Account Officer', bold: true, font: 'Times New Roman', size: 20 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 5000, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Principal', bold: true, font: 'Times New Roman', size: 22 })]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ];

      const doc = new Document({
        sections: [{
          properties: {
            page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } }
          },
          children
        }]
      });

      return await Packer.toBuffer(doc);

    } else {
      // -------------------------------------------------------------
      // 2. PASS FOR PAYMENT: REPAIRING & MAINTENANCE
      // -------------------------------------------------------------
      const billNo = data.bill_no || '.................';
      const billDate = data.bill_date ? fmtDate(data.bill_date) : (data.bill_date_str || '.................');
      const eqName = data.equipment_name || data.item_name || '.................';
      let deptName = data.dept_name || data.department || '.................';
      deptName = deptName.replace(/ Department$/i, '').replace(/ Dept$/i, '');
      const partyName = data.party_name || data.vendor_name || '................................................................................';
      const orderNo = data.order_no || data.wo_no || data.po_no || '....................................................';
      const orderDate = data.order_date ? fmtDate(data.order_date) : (data.wo_date ? fmtDate(data.wo_date) : '.................');
      const compDate = data.comp_date ? fmtDate(data.comp_date) : (data.comparative_date ? fmtDate(data.comparative_date) : '.................');
      const parcelAgency = data.parcel_agency || data.agency_name || '..................';
      const rrLrNo = data.rr_lr_no || '............';
      const rrLrDate = data.rr_lr_date ? fmtDate(data.rr_lr_date) : '.........';
      const fittedEq = data.fitted_equipment || eqName;
      const cashBillNo = data.cash_bill_no || '---';
      const cashBillDate = data.cash_bill_date || '---';
      const cashAmount = data.cash_amount || '----';
      const cashRecipient = data.cash_recipient || '-----------';
      const paymentType = data.payment_type || 'Full'; // Full / Part / Remaining
      const budgetHead = data.budget_head || 'Contingency';
      const amount = data.amount || data.net_amount || data.est_repair_cost || '.................';
      const amountWords = data.amount_words || (amount && amount !== '.................' ? numToEnglishWords(amount) : 'Rupees .................................... Only');

      const children = [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 120 },
          children: [
            new TextRun({
              text: 'CERTIFICATE TO BE GIVEN ALONG WITH BILLS',
              bold: true,
              underline: { type: UnderlineType.SINGLE },
              font: 'Times New Roman',
              size: 22
            })
          ]
        }),

        // 1. Ref Bill No
        new Paragraph({
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({ text: '1. Ref. Bill No ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${billNo}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ', Dt ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${billDate}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ' for Repairing of ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${eqName}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 30 },
          children: [
            new TextRun({ text: '   of ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${deptName}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ' department', font: 'Times New Roman', size: 20 })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 50 },
          children: [
            new TextRun({ text: '   Party : ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${partyName}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 })
          ]
        }),

        // 2 A.T. / Order No.
        new Paragraph({
          spacing: { before: 30, after: 40 },
          children: [
            new TextRun({ text: '2  A.T. / Order No. ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${orderNo}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 }),
            new TextRun({ text: ', Dated ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${orderDate}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 })
          ]
        }),

        // 3. Comparative Statement dated:
        new Paragraph({
          spacing: { before: 30, after: 80 },
          children: [
            new TextRun({ text: '3. Comparative Statement dated: ', font: 'Times New Roman', size: 20 }),
            new TextRun({ text: `${compDate}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 20 })
          ]
        }),

        // Certified that:
        new Paragraph({
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({ text: 'Certified that:', bold: true, font: 'Times New Roman', size: 20 })
          ]
        }),

        // Points 1 to 12
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '1. This is a laboring/ loading/ unloading/ carting/ service/ repairing/ printing charge of Laboratory Equipment Repairing and Maintenance of ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${deptName}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ' Dept.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '2. The purchase process of Laboratory Equipment Repairing and Maintenance of ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${deptName}`, bold: true, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ' Dept. has been made according to the Gujarat Govt. G.R.S., norms and guidelines.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '3. The purchase process of laboring/ loading/ unloading/ carting/ service/ repairing/ printing has been made according to policies and procedures of Govt. of Gujarat.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '4. This is a cash receipt for clearing the parcel from M/S. ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${parcelAgency}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: '.\n    The parcel has been cleared RR/LR No. ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${rrLrNo}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ' Date ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${rrLrDate}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '5. The spares are fitted in ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${fittedEq}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ' and work has been done satisfactory.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '6. The above work has been done satisfactory as per our order and permission was taken from the Principal.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '7. Items included in this bill are approved by the Principal.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '8. The amount of cash memo/Bill No. ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${cashBillNo}`, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ' date ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${cashBillDate}`, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ' of Rs. ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${cashAmount}`, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ' has been paid cash and hence same may be given to ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${cashRecipient}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '9. The rate seems to be reasonable.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: `10. This is ${paymentType === 'Part' ? 'Part' : (paymentType === 'Remaining' ? 'Remaining' : 'Full')} payment.`, font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 25 },
          children: [
            new TextRun({ text: '11. The amount relating to the above said bill passed as below has not been passed before.', font: 'Times New Roman', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 15, after: 80 },
          children: [
            new TextRun({ text: '12. The budget head is ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${budgetHead}`, underline: { type: UnderlineType.SINGLE }, font: 'Times New Roman', size: 18 }),
            new TextRun({ text: '\n      Recommended for payment of ', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `Rs.${amount}/- (`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: `${amountWords}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 18 }),
            new TextRun({ text: ')', bold: true, color: 'C0392B', font: 'Times New Roman', size: 18 })
          ]
        }),

        // Department Signatures Table (4 columns)
        new Table({
          width: { size: 10000, type: WidthType.DXA },
          columnWidths: [2500, 2500, 2500, 2500],
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 140, after: 30 },
                      children: [new TextRun({ text: 'Lab Assi /Office clerk', bold: true, font: 'Times New Roman', size: 18 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 140, after: 30 },
                      children: [new TextRun({ text: 'Lab /Office in charge', bold: true, font: 'Times New Roman', size: 18 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 140, after: 30 },
                      children: [new TextRun({ text: 'Store Officer', bold: true, font: 'Times New Roman', size: 18 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 140, after: 15 },
                      children: [new TextRun({ text: 'Head of Department', bold: true, font: 'Times New Roman', size: 18 })]
                    }),
                    new Paragraph({
                      spacing: { before: 40, after: 15 },
                      children: [new TextRun({ text: 'Officer in charge', bold: true, font: 'Times New Roman', size: 18 })]
                    }),
                    new Paragraph({
                      spacing: { before: 15, after: 30 },
                      children: [new TextRun({ text: 'Admin Officer', bold: true, font: 'Times New Roman', size: 18 })]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Solid Horizontal Separator
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 2 }
          },
          spacing: { before: 60, after: 80 },
          children: []
        }),

        // (FOR OFFICE USE)
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 30, after: 60 },
          children: [
            new TextRun({
              text: '(FOR OFFICE USE)',
              bold: true,
              underline: { type: UnderlineType.SINGLE },
              font: 'Times New Roman',
              size: 20
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 30, after: 140 },
          children: [
            new TextRun({ text: 'Passed for payment of ', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `Rs. ${amount}/- (`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: `${amountWords}`, bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 }),
            new TextRun({ text: ')', bold: true, color: 'C0392B', font: 'Times New Roman', size: 19 })
          ]
        }),

        // Signatures Table (2 columns)
        new Table({
          width: { size: 10000, type: WidthType.DXA },
          columnWidths: [5000, 5000],
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 5000, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Account Officer.', bold: true, font: 'Times New Roman', size: 19 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 5000, type: WidthType.DXA },
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 160, after: 30 },
                      children: [new TextRun({ text: 'Principal', bold: true, font: 'Times New Roman', size: 22 })]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ];

      const doc = new Document({
        sections: [{
          properties: {
            page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } }
          },
          children
        }]
      });

      return await Packer.toBuffer(doc);
    }
  }
}

module.exports = { DOCInquiryLetter, DOCComparativeStatement, DOCPurchaseOrderNonGeM, DOCRepairableEquipment, DOCRepairApprovalNote, DOCWorkOrder, DOCPassForPaymentRepair };
