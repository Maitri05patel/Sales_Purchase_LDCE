/**
 * DOC-36: Department Material Receipt Note
 * DOC-37: Technical Inspection Report
 * DOC-38: Pass for Payment Voucher
 * DOC-39: Checklist D & E – Bill Verification
 * DOC-40: Procurement Progress Status Report
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, UnderlineType, ShadingType, HeightRule
} = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate } = require('./DOC-common');

class DOCReceiptNote {
  /** DOC-36: Department Material Receipt Note */
  static async generate(data = {}) {
    const borders = {
      top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 6, color: '000000' }
    };

    const cellMargins = { top: 100, bottom: 100, left: 140, right: 140 };

    // Format address into clean lines
    let supplierLines = [];
    if (data.supplier_name) supplierLines.push(data.supplier_name);
    if (data.supplier_address) {
      const addrLines = data.supplier_address.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      supplierLines.push(...addrLines);
    }
    if (supplierLines.length === 0) {
      supplierLines = [
        'M/s Earth Syscom Private Limited',
        '201-208, Palak Prime,',
        'Opp. Hotel Double Tree by Hilton,',
        'ISCON-Ambali Road,',
        'Ahmedabad-380058, Gujarat'
      ];
    }

    const orderNoStr = `${data.order_no || 'DTE/0214/08/2025'}${data.order_date ? `, dt.${fmtDate(data.order_date)}` : ', dt.26/08/2025'}`;
    const qtyStr = data.qty ? String(data.qty).padStart(2, '0') : (data.indent_qty ? String(data.indent_qty).padStart(2, '0') : '02');
    const unitCostStr = data.unit_price ? `${inr(data.unit_price)}/-` : '14,180/-';
    const totalCostStr = data.total_price ? `${inr(data.total_price)}/-` : (data.total_value ? `${inr(data.total_value)}/-` : '28,360/-');

    function tableRow2Col(label, valContent, isHeader = false) {
      const leftChildren = typeof label === 'string'
        ? [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: label, font: 'Arial', size: 20, bold: isHeader })] })]
        : label;

      let rightChildren = [];
      if (Array.isArray(valContent)) {
        rightChildren = valContent.map(text => new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text, font: 'Arial', size: 20 })] }));
      } else if (typeof valContent === 'string') {
        rightChildren = [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: valContent, font: 'Arial', size: 20 })] })];
      } else {
        rightChildren = valContent;
      }

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders,
            margins: cellMargins,
            children: leftChildren
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders,
            margins: cellMargins,
            children: rightChildren
          })
        ]
      });
    }

    function tableRowSpan(content, isBold = false, align = AlignmentType.LEFT) {
      return new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders,
            margins: cellMargins,
            children: [
              new Paragraph({
                alignment: align,
                spacing: { before: 60, after: 60 },
                children: [new TextRun({ text: content, font: 'Arial', size: 20, bold: isBold })]
              })
            ]
          })
        ]
      });
    }

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        tableRow2Col('Details of the supplier', supplierLines),
        tableRow2Col('DTE purchase order No.', orderNoStr),
        tableRow2Col('Name of Hardware', data.item_name || 'A4 size duplex Scanner'),
        tableRow2Col('Make Model No.', data.make_model || 'Canon DR-C230'),
        tableRow2Col('Capex cost Per unit in Rs.', unitCostStr),
        tableRow2Col('Total Price Rs.', totalCostStr),
        tableRow2Col('Total Qty allocated to the institute as per PO:', qtyStr),
        tableRowSpan('Following respective Column(s) to be filled by end user department', true, AlignmentType.CENTER),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders,
              margins: cellMargins,
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({ text: 'Name of the Department: ', font: 'Arial', size: 21, bold: true }),
                    new TextRun({ text: data.dept_name || 'Choose an item.', font: 'Arial', size: 20 })
                  ]
                })
              ]
            })
          ]
        }),
        tableRow2Col('Date of receipt', data.receipt_date ? fmtDate(data.receipt_date) : ''),
        tableRow2Col('Date of Installation', data.installation_date ? fmtDate(data.installation_date) : ''),
        tableRow2Col('Qty received', data.qty_received ? String(data.qty_received) : ''),
        tableRow2Col('Dead Stock Reg.No. / Pg No/ Sr.No.', data.dead_stock_no || '')
      ]
    });

    const sigTable = new Table({
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
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: "Receiver's Sign:", font: 'Arial', size: 20 })] }),
                new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: `Name: ${data.receiver_name || ''}`, font: 'Arial', size: 20 })] }),
                new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: `Designation: ${data.receiver_designation || ''}`, font: 'Arial', size: 20 })] })
              ]
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 80, after: 40 },
                  children: [new TextRun({ text: 'HOD, Sign & Stamp', font: 'Arial', size: 20 })]
                })
              ]
            })
          ]
        })
      ]
    });

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 60 },
        children: [new TextRun({ text: 'L.D College of Engineering, Ahmedabad', bold: true, size: 26, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: '----------------------------------------------------------------------------------------------------', size: 18, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [new TextRun({ text: 'Material Receipt', bold: true, underline: { type: UnderlineType.SINGLE }, size: 24, font: 'Arial' })]
      }),
      table,
      new Paragraph({
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: `Remarks if any: ${data.remarks || ''}`, font: 'Arial', size: 20 })]
      }),
      new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),
      sigTable
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 }
          }
        },
        children
      }]
    });
    return await Packer.toBuffer(doc);
  }
}

class DOCInspectionReport {
  /** DOC-37: Technical Inspection Report */
  static async generate(data = {}) {
    const borders = {
      top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 6, color: '000000' }
    };

    const cellMargins = { top: 90, bottom: 90, left: 130, right: 130 };

    let supplierLines = [];
    if (data.supplier_name) supplierLines.push(data.supplier_name);
    if (data.supplier_address) {
      const addrLines = data.supplier_address.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      supplierLines.push(...addrLines);
    }
    if (supplierLines.length === 0) {
      supplierLines = [
        'M/s Earth Syscom Private Limited',
        '201-208, Palak Prime,',
        'Opp. Hotel Double Tree by Hilton,',
        'ISCON-Ambali Road,',
        'Ahmedabad-380058, Gujarat'
      ];
    }

    const orderNoStr = `${data.order_no || 'DTE/0215/08/2025'}${data.order_date ? `, dt.${fmtDate(data.order_date)}` : ', dt.26/08/2025'}`;
    const orderQtyInst = data.order_qty_institute || (data.quantity ? `${String(data.quantity).padStart(2, '0')} Nos.` : (data.indent_qty ? `${String(data.indent_qty).padStart(2, '0')} Nos.` : '02 Nos.'));
    const allocQtyDept = data.allocated_qty_dept || (data.qty_dept ? `Allocated Qty. to Dept. ${String(data.qty_dept).padStart(2, '0')} No.` : 'Allocated Qty. to Dept. 01 No.');
    const totalCostStr = data.total_order_amount ? `${inr(data.total_order_amount)}/-` : (data.total_value ? `${inr(data.total_value)}/-` : (data.total_price ? `${inr(data.total_price)}/-` : '28,360/-'));

    function row2Col(labelContent, valContent, minHeight = null) {
      const leftChildren = typeof labelContent === 'string'
        ? labelContent.split('\n').map(t => new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: t, font: 'Arial', size: 20 })] }))
        : labelContent;

      let rightChildren = [];
      if (Array.isArray(valContent)) {
        rightChildren = valContent.map(t => new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: t, font: 'Arial', size: 20 })] }));
      } else if (typeof valContent === 'string') {
        rightChildren = valContent.split('\n').map(t => new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: t, font: 'Arial', size: 20 })] }));
      } else {
        rightChildren = valContent;
      }

      if (minHeight && rightChildren.length === 1 && rightChildren[0].text === '') {
        rightChildren.push(...Array.from({ length: minHeight }, () => new Paragraph({ text: '', spacing: { before: 60, after: 60 } })));
      }

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 3060, type: WidthType.DXA },
            borders,
            margins: cellMargins,
            children: leftChildren
          }),
          new TableCell({
            columnSpan: 2,
            width: { size: 6930, type: WidthType.DXA },
            borders,
            margins: cellMargins,
            children: rightChildren
          })
        ]
      });
    }

    const mainTable = new Table({
      width: { size: 9990, type: WidthType.DXA },
      columnWidths: [3060, 2407, 4523],
      rows: [
        row2Col('Name of Item', [
          data.item_name || 'A4 size Duplex Scanner',
          `(${data.make_model || 'Canon -DR-C230'})`
        ]),
        row2Col('Consignee Department', data.consignee_dept || data.dept_name || ''),
        row2Col('Name of Party', supplierLines),
        row2Col('Order No. and Date', orderNoStr),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3060, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: 'Order Qty. for Institute', font: 'Arial', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2407, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: orderQtyInst, font: 'Arial', size: 20, bold: true })] })]
            }),
            new TableCell({
              width: { size: 4523, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: allocQtyDept, font: 'Arial', size: 20 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3060, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: 'Due date for supply', font: 'Arial', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2407, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: data.due_date || 'As per P.O', font: 'Arial', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 4523, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: `Date of receipt in dept.: ${data.receipt_date ? fmtDate(data.receipt_date) : ''}`, font: 'Arial', size: 20 })] })]
            })
          ]
        }),
        row2Col('Total Order Amount', totalCostStr),
        row2Col('Inspection Remarks:\n(Attach separate sheet if require)', data.inspection_remarks || '', 3),
        row2Col('Any Deviation? Yes/No\nIf yes then mention:\n(Attach separate sheet if require)', data.deviation || '', 2),
        row2Col('Not Accepted/Accepted:', data.acceptance_status || 'Accepted')
      ]
    });

    const inspSignTable = new Table({
      width: { size: 9990, type: WidthType.DXA },
      columnWidths: [2070, 2880, 2520, 2520],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              rowSpan: 3,
              width: { size: 2070, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [
                new Paragraph({
                  spacing: { before: 180, after: 180 },
                  children: [new TextRun({ text: 'Inspected By:', font: 'Arial', size: 20, bold: true })]
                })
              ]
            }),
            new TableCell({
              width: { size: 2880, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 30, after: 30 }, children: [new TextRun({ text: 'Sign', font: 'Arial', size: 20, bold: true })] })]
            }),
            new TableCell({
              width: { size: 2520, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 30, after: 30 }, children: [new TextRun({ text: 'Name', font: 'Arial', size: 20, bold: true })] })]
            }),
            new TableCell({
              width: { size: 2520, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 30, after: 30 }, children: [new TextRun({ text: 'Designation', font: 'Arial', size: 20, bold: true })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2880, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun({ text: data.insp1_sign || '', font: 'Arial', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2520, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun({ text: data.insp1_name || '', font: 'Arial', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2520, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun({ text: data.insp1_designation || '', font: 'Arial', size: 20 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2880, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun({ text: data.insp2_sign || '', font: 'Arial', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2520, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun({ text: data.insp2_name || '', font: 'Arial', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2520, type: WidthType.DXA },
              borders,
              margins: cellMargins,
              children: [new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun({ text: data.insp2_designation || '', font: 'Arial', size: 20 })] })]
            })
          ]
        })
      ]
    });

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 60 },
        children: [new TextRun({ text: 'L.D College of Engineering, Ahmedabad-380015', bold: true, size: 26, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [new TextRun({ text: 'Inspection Report', bold: true, size: 30, font: 'Arial' })]
      }),
      mainTable,
      new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
      inspSignTable,
      new Paragraph({ text: '', spacing: { before: 120, after: 80 } }),
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
                width: { size: 55, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    spacing: { before: 140, after: 40 },
                    children: [new TextRun({ text: `Date of Inspection: ${data.inspection_date ? fmtDate(data.inspection_date) : ''}`, font: 'Arial', size: 20 })]
                  })
                ]
              }),
              new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 140, after: 40 },
                    children: [new TextRun({ text: 'HOD Sign and Stamp', font: 'Arial', size: 20 })]
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
          page: {
            margin: { top: 900, bottom: 900, left: 1100, right: 1100 }
          }
        },
        children
      }]
    });
    return await Packer.toBuffer(doc);
  }
}

class DOCPassForPayment {
  /** DOC-38: Pass for Payment Certificate for Purchase from GeM */
  static async generate(data = {}) {
    const font = 'Verdana';
    const borders = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
    };
    const noBorders = {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE }
    };

    const cellPad = { top: 35, bottom: 35, left: 70, right: 70 };

    function txt(t, bold = false, sz = 19, italic = false) {
      return new TextRun({ text: t || '', bold, italics: italic, font, size: sz });
    }

    function p(children, align = AlignmentType.LEFT, spacing = { before: 15, after: 15 }) {
      const childArr = Array.isArray(children) ? children : [children];
      return new Paragraph({ alignment: align, spacing, children: childArr });
    }

    // Top Right Checkboxes
    const checkboxPara = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({ text: '□ Store Copy      □ Account Copy-1      □ Account Copy-2', bold: true, font, size: 16 })
      ]
    });

    // Shaded Title Banner
    const bannerTable = new Table({
      width: { size: 9900, type: WidthType.DXA },
      borders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 9900, type: WidthType.DXA },
              borders,
              shading: { fill: 'B4C6E7', val: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [
                p([txt('L.D College of Engineering, Ahmedabad 380015', true, 22)], AlignmentType.CENTER, { before: 10, after: 20 }),
                p([txt('Pass for Payment Certificate for Purchase from Government e Market place', true, 20)], AlignmentType.CENTER, { before: 10, after: 10 })
              ]
            })
          ]
        })
      ]
    });

    function row1Val(label, val) {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 3300, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(label, false, 19)])]
          }),
          new TableCell({
            width: { size: 300, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(':', false, 19)], AlignmentType.CENTER)]
          }),
          new TableCell({
            columnSpan: 2,
            width: { size: 6300, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(val, false, 19)])]
          })
        ]
      });
    }

    function row2Val(label, val1, val2) {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 3300, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(label, false, 19)])]
          }),
          new TableCell({
            width: { size: 300, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(':', false, 19)], AlignmentType.CENTER)]
          }),
          new TableCell({
            width: { size: 3800, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(val1, false, 19)])]
          }),
          new TableCell({
            width: { size: 2500, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(val2, false, 19)])]
          })
        ]
      });
    }

    function rowRegister(label, regType, pgNo, srNo) {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 3300, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(label, false, 19)])]
          }),
          new TableCell({
            width: { size: 300, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(':', false, 19)], AlignmentType.CENTER)]
          }),
          new TableCell({
            width: { size: 2800, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [p([txt(regType || '', false, 19)])]
          }),
          new TableCell({
            width: { size: 3500, type: WidthType.DXA },
            borders,
            margins: cellPad,
            children: [
              p([
                txt(`Pg. No. ${pgNo || ''}`, false, 19),
                txt('    '),
                txt(`Sr.No. ${srNo || ''}`, false, 19)
              ])
            ]
          })
        ]
      });
    }

    const qtyStr = data.ordered_qty || (data.quantity ? `${data.quantity} No(s).` : (data.indent_qty ? `${data.indent_qty} No(s).` : '02 No(s).'));
    const orderCostStr = data.contract_amount ? `${inr(data.contract_amount)}/-` : (data.total_value ? `${inr(data.total_value)}/-` : (data.total_price ? `${inr(data.total_price)}/-` : '28,360/-'));
    const invCostStr = data.invoice_amount ? `${inr(data.invoice_amount)}/-` : orderCostStr;
    const netCostStr = data.net_payment ? `${inr(data.net_payment)}/-` : (data.net_payable ? `${inr(data.net_payable)}/-` : invCostStr);

    const mainTable = new Table({
      width: { size: 9900, type: WidthType.DXA },
      columnWidths: [3300, 300, 3800, 2500],
      rows: [
        // 1. Name of Item
        row1Val('Name of Item', data.item_name || 'A4 size Duplex Scanner (Canon -DR-C230)'),
        // 2. Buyer & user Dept.
        row1Val('Buyer & user Dept.', data.dept_name || 'Central Computer Center'),
        // 3. Admin. Approval Mode & Date
        row1Val('Admin. Approval Mode & Date', data.admin_approval_note || 'તા ..................... ની નોંધ ઉપર આચાર્યશ્રીની મંજૂરી મળેલ છે.'),
        // 4. Admin. Approval Authority
        row1Val('Admin. Approval Authority', data.admin_approval_authority || 'Principal, L.D.C.E'),
        // 5. Ordered Qty
        row1Val('Ordered Qty', qtyStr),
        // 6. GeM e-bid No. & Date
        row2Val('GeM e-bid No. & Date', data.gem_bid_no || 'GEM/2026/B/1234567', data.gem_bid_date ? fmtDate(data.gem_bid_date) : 'dt. 12/08/2026'),
        // 7. GeM Contract No.& Date
        row2Val('GeM Contract No.& Date', data.gem_contract_no || data.order_no || 'GEMC-5116877-987654321', data.gem_contract_date || data.order_date ? fmtDate(data.gem_contract_date || data.order_date) : 'dt. 26/08/2026'),
        // 8. GeM Contract Amount (Rs.)
        row1Val('GeM Contract Amount (Rs.)', orderCostStr),

        // 9-15: Seller and Bank Detail (7 rows)
        new TableRow({
          children: [
            new TableCell({
              rowSpan: 7,
              width: { size: 3300, type: WidthType.DXA },
              borders,
              margins: cellPad,
              children: [p([txt('Name of Seller and Bank Detail', false, 19)])]
            }),
            new TableCell({
              rowSpan: 7,
              width: { size: 300, type: WidthType.DXA },
              borders,
              margins: cellPad,
              children: [p([txt(':', false, 19)], AlignmentType.CENTER)]
            }),
            new TableCell({
              width: { size: 2200, type: WidthType.DXA },
              borders,
              margins: cellPad,
              children: [p([txt('Name of Seller', false, 19)])]
            }),
            new TableCell({
              width: { size: 4100, type: WidthType.DXA },
              borders,
              margins: cellPad,
              children: [p([txt(data.seller_name || data.supplier_name || 'M/s Earth Syscom Private Limited', false, 19)])]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 2200, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('City', false, 19)])] }),
            new TableCell({ width: { size: 4100, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.seller_city || 'Ahmedabad', false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 2200, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('State', false, 19)])] }),
            new TableCell({ width: { size: 4100, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.seller_state || 'Gujarat', false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 2200, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('Name of Bank', false, 19)])] }),
            new TableCell({ width: { size: 4100, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.seller_bank_name || 'State Bank of India', false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 2200, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('Bank Account No.', false, 19)])] }),
            new TableCell({ width: { size: 4100, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.seller_bank_acc || '123456789012', false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 2200, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('IFSC', false, 19)])] }),
            new TableCell({ width: { size: 4100, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.seller_bank_ifsc || 'SBIN0001234', false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 2200, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('PAN No.', false, 19)])] }),
            new TableCell({ width: { size: 4100, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.seller_pan || 'ABCDE1234F', false, 19)])] })
          ]
        }),

        // 16. Date of Delivery
        row1Val('Date of Delivery', data.delivery_date ? fmtDate(data.delivery_date) : '05/09/2026'),
        // 17. Delivery Challan No.& Qty.
        row1Val('Delivery Challan No.& Qty.', `${data.challan_no || 'DC/2026/89'}    Qty. ${data.challan_qty || qtyStr}`),
        // 18. CRAC No. and Date
        row2Val('CRAC No. and Date', data.crac_no || 'GEMCRAC-5116877-001', data.crac_date ? fmtDate(data.crac_date) : 'dt. 06/09/2026'),
        // 19. GeM Invoice No and Date
        row2Val('GeM Invoice No and Date', data.gem_invoice_no || data.invoice_no || 'GEM-INV-2026-99', data.gem_invoice_date || data.invoice_date ? fmtDate(data.gem_invoice_date || data.invoice_date) : 'dt. 06/09/2026'),
        // 20. Invoice Amount (Rs.)
        row1Val('Invoice Amount (Rs.)', invCostStr),
        // 21. Penalty for delay supply
        row1Val('Penalty for delay supply or any liquidated damage charges. (Rs.)', data.penalty_text || '@0.5% per week or a part of week for xx Week(s) Nil'),
        // 22. Net Payment to Seller (Rs.)
        row1Val('Net Payment to Seller (Rs.)', netCostStr),
        // 23. Register type/Page No/ Sr.No.
        rowRegister('Register type/Page No/ Sr.No.', data.register_type || 'Dead Stock Register', data.page_no || '45', data.sr_no || '12'),
        // 24. Grant Head
        row1Val('Grant Head', data.grant_head || data.account_head || 'GOG / CTE / Head of Account')
      ]
    });

    const storeTable = new Table({
      width: { size: 9900, type: WidthType.DXA },
      columnWidths: [4500, 1800, 1800, 1800],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 4,
              width: { size: 9900, type: WidthType.DXA },
              borders,
              margins: cellPad,
              children: [p([txt('For Central Store use Only', true, 19)], AlignmentType.CENTER)]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('Entered in Central Dead Stock Register', false, 19)])] }),
            new TableCell({ width: { size: 1800, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(`Reg.No. ${data.store_reg_no || ''}`, false, 19)])] }),
            new TableCell({ width: { size: 1800, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(`Pg. No. ${data.store_pg_no || ''}`, false, 19)])] }),
            new TableCell({ width: { size: 1800, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(`Sr.No. ${data.store_sr_no || ''}`, false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('Entered in General Purchase Register', false, 19)])] }),
            new TableCell({ width: { size: 1800, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(`GPR No. ${data.store_gpr_no || ''}`, false, 19)])] }),
            new TableCell({ width: { size: 1800, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(`Pg. No. ${data.store_gpr_pg || ''}`, false, 19)])] }),
            new TableCell({ width: { size: 1800, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(`Sr.No. ${data.store_gpr_sr || ''}`, false, 19)])] })
          ]
        })
      ]
    });

    const accountTable = new Table({
      width: { size: 9900, type: WidthType.DXA },
      columnWidths: [4500, 5400],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              width: { size: 9900, type: WidthType.DXA },
              borders,
              margins: cellPad,
              children: [p([txt('For Account dept. use Only', true, 19)], AlignmentType.CENTER)]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('Payment Detail', false, 19)])] }),
            new TableCell({ width: { size: 5400, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.account_payment_detail || '', false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('RTGS/NEFT Ref. No / Cheque No. & Date', false, 19)])] }),
            new TableCell({ width: { size: 5400, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.account_rtgs_ref || '', false, 19)])] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt('Name of Bank', false, 19)])] }),
            new TableCell({ width: { size: 5400, type: WidthType.DXA }, borders, margins: cellPad, children: [p([txt(data.account_bank_name || '', false, 19)])] })
          ]
        })
      ]
    });

    function sigRow3(s1, s2, s3) {
      return new Table({
        width: { size: 9900, type: WidthType.DXA },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 3300, type: WidthType.DXA }, borders: noBorders, children: [p([txt(s1, false, 19)], AlignmentType.LEFT, { before: 100, after: 30 })] }),
              new TableCell({ width: { size: 3300, type: WidthType.DXA }, borders: noBorders, children: [p([txt(s2, false, 19)], AlignmentType.CENTER, { before: 100, after: 30 })] }),
              new TableCell({ width: { size: 3300, type: WidthType.DXA }, borders: noBorders, children: [p([txt(s3, false, 19)], AlignmentType.RIGHT, { before: 100, after: 30 })] })
            ]
          })
        ]
      });
    }

    function sigRow2(s1, s2) {
      return new Table({
        width: { size: 9900, type: WidthType.DXA },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 5000, type: WidthType.DXA }, borders: noBorders, children: [p([txt(s1, false, 19)], AlignmentType.LEFT, { before: 100, after: 30 })] }),
              new TableCell({ width: { size: 4900, type: WidthType.DXA }, borders: noBorders, children: [p([txt(s2, false, 19)], AlignmentType.RIGHT, { before: 100, after: 30 })] })
            ]
          })
        ]
      });
    }

    const children = [
      checkboxPara,
      bannerTable,
      new Paragraph({ text: '', spacing: { before: 30, after: 30 } }),
      mainTable,
      new Paragraph({
        spacing: { before: 60, after: 40 },
        children: [
          txt('Inspection & Installation of above item(s) is carried out and item(s) received satisfactorily as per order specifications, so bill for the same is recommended to pass for payment.', false, 18)
        ]
      }),
      sigRow3('Lab Assistant/Office Clerk\n/Store Keeper', 'Lab/Office Incharge', 'Head of the Dept.'),
      new Paragraph({ text: '', spacing: { before: 40, after: 40 } }),
      storeTable,
      sigRow3('Lab Assistant', 'Storekeeper', 'Store Officer'),
      new Paragraph({ text: '', spacing: { before: 40, after: 40 } }),
      accountTable,
      sigRow2('Accounts officer', 'Principal')
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 450, bottom: 400, left: 1000, right: 1000 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCChecklistDE {
  /** DOC-39: Check list–D & Check list–E for Pass for Payment (Both combined in one official doc) */
  static async generate(data = {}) {
    const font = 'Calibri';
    const finYear = data.fin_year || '2024-25';

    const boxBorders = {
      top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 6, color: '000000' }
    };

    const noneBorders = {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
    };

    function buildChecklistTable(items) {
      const tableRows = items.map((itemText, idx) => {
        return new TableRow({
          children: [
            new TableCell({
              width: { size: 8500, type: WidthType.DXA },
              borders: noneBorders,
              margins: { top: 30, bottom: 30, left: 0, right: 100 },
              children: [
                new Paragraph({
                  spacing: { before: 30, after: 30 },
                  children: [
                    new TextRun({
                      text: `${idx + 1}. ${itemText}`,
                      font,
                      size: 22
                    })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 650, type: WidthType.DXA },
              borders: boxBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: '', size: 20 })]
                })
              ]
            })
          ]
        });
      });

      return new Table({
        width: { size: 9150, type: WidthType.DXA },
        columnWidths: [8500, 650],
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
        },
        rows: tableRows
      });
    }

    function buildSigBlock() {
      return [
        new Paragraph({
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: 'Sign: Dept. Representative', bold: true, font, size: 22 })]
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noneBorders,
                  children: [
                    new Paragraph({
                      spacing: { before: 80 },
                      children: [new TextRun({ text: 'Name:', bold: true, font, size: 22 })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noneBorders,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 80 },
                      children: [new TextRun({ text: 'HOD, Sign & Stamp', bold: true, font, size: 22 })]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ];
    }

    const itemsD = [
      'Pass for payment form with sign and stamp',
      'Copy of form approved by DLPC/DPC/SDPC/SPC',
      'Copy of note approved by the Principal',
      'GeM Invoice sign & Stamp of HOD',
      'Seller payment details generated from GeM',
      'CRAC with sign & Stamp of HOD',
      'Contract Order with sign & Stamp of HOD',
      'Inspection report',
      'Additional documents if any',
      'Approved file separately (As per check list – A & B)'
    ];

    const itemsE = [
      'Pass for payment form with sign and stamp',
      'Copy of form approved by DLPC/DPC/SDPC/SPC',
      'Copy of note approved by the Principal',
      'GeM Invoice with sign & Stamp of HOD',
      'Seller payment details generated from GeM',
      'CRAC with sign & Stamp of HOD',
      'Contract Order with sign & Stamp of HOD',
      'Inspection report'
    ];

    const sectionD = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'L.D College of Engineering, Ahmedabad', bold: true, underline: { type: UnderlineType.SINGLE }, font, size: 28 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Check list–D', bold: true, font, size: 30 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 240 },
        children: [new TextRun({ text: '(Pass for Payment - Set-1: Store Copy)', bold: true, font, size: 22 })]
      }),
      buildChecklistTable(itemsD),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: '*Sr.No.2 Document is required only for Purchase through Bid.', font, size: 20 })]
      }),
      new Paragraph({
        spacing: { before: 120, after: 140 },
        children: [new TextRun({ text: 'I have checked that the above documents are signed and stamp by the concerned officers/Staff & there is no any missing.', font, size: 21 })]
      }),
      ...buildSigBlock(),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 260, after: 40 },
        children: [new TextRun({ text: `LDCE/Pur/${finYear}`, italics: true, font, size: 20 })]
      })
    ];

    const sectionE = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: 'L.D College of Engineering, Ahmedabad', bold: true, underline: { type: UnderlineType.SINGLE }, font, size: 28 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Check list–E', bold: true, font, size: 30 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 240 },
        children: [new TextRun({ text: '(Pass for Payment - Set-2: A/C Copy-1 & Set- 3: A/C Copy-2)', bold: true, font, size: 22 })]
      }),
      buildChecklistTable(itemsE),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: '*Sr.No.2 Document is required only for Purchase through Bid.', font, size: 20 })]
      }),
      new Paragraph({
        spacing: { before: 120, after: 140 },
        children: [new TextRun({ text: 'I have checked that the above documents are signed and stamp by the concerned officers/Staff & there is no any missing in the file.', font, size: 21 })]
      }),
      ...buildSigBlock(),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 280, after: 40 },
        children: [new TextRun({ text: `LDCE/Pur/${finYear}`, italics: true, font, size: 20 })]
      })
    ];

    // Always generate both Check list–D and Check list–E in the same document
    const doc = new Document({
      sections: [
        { properties: { page: { margin: { top: 900, bottom: 800, left: 1200, right: 1200 } } }, children: sectionD },
        { properties: { page: { margin: { top: 900, bottom: 800, left: 1200, right: 1200 } } }, children: sectionE }
      ]
    });

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
