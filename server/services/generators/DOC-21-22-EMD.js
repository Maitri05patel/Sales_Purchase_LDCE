/**
 * DOC-21: EMD Refund Letter (Matches Format-EMD-return.docx & EMD letter-2025-26.docx)
 * DOC-22: Note for Security Deposit (e-PBG) Submission to Accounts (Matches Notes-SD-Submission in Account.docx)
 */
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType } = require('docx');
const { spacer, fmtDate } = require('./DOC-common');

function numberToWordsINR(amount) {
  if (!amount || isNaN(amount)) return '';
  const num = Math.floor(Math.abs(Number(amount)));
  if (num === 0) return 'Zero';

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
  }

  function convertThreeDigits(n) {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += a[Math.floor(n / 100)] + ' Hundred';
      if (n % 100 !== 0) str += ' ';
    }
    if (n % 100 !== 0) {
      str += convertTwoDigits(n % 100);
    }
    return str;
  }

  let crore = Math.floor(num / 10000000);
  let lakh = Math.floor((num % 10000000) / 100000);
  let thousand = Math.floor((num % 100000) / 1000);
  let remainder = num % 1000;

  let result = '';
  if (crore > 0) result += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) result += convertThreeDigits(lakh) + ' Lakh ';
  if (thousand > 0) result += convertThreeDigits(thousand) + ' Thousand ';
  if (remainder > 0) result += convertThreeDigits(remainder);

  return result.trim();
}

class DOCEMDRefund {
  /** DOC-21: EMD Refund Letter strictly matching Format-EMD-return.docx / EMD letter-2025-26.docx */
  static async generate(data = {}) {
    const finYear = data.fin_year || '2025-26';
    const natureDoc = data.instrument_type || 'EMD';
    const refNo = data.refund_ref || `LDCE/PUR/${natureDoc}/RFD/${finYear}`;
    const dateStr = fmtDate(data.refund_date || new Date());
    const partyName = data.vendor_name || 'The Manager';
    const partyAddress = data.vendor_address || '';
    const itemName = data.item_service_name || data.item_name || 'Equipment / Service';
    const dept = data.department || '';
    const bidNo = data.bid_order_no || '';
    const bidDateStr = data.bid_start_date ? ` dt. ${fmtDate(data.bid_start_date)}` : '';
    const bankName = data.other_bank_specify 
      ? `${data.bank_name || ''} - ${data.other_bank_specify}`
      : (data.bank_name || '');
    const amountVal = parseFloat(data.amount || 0);
    const amountFormatted = amountVal > 0 ? `${amountVal.toLocaleString('en-IN')} /-` : '-';
    const amountWords = data.amount_in_rupees || (amountVal > 0 ? `${numberToWordsINR(amountVal)} Only` : '');

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sr.No.', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bid No. & Date', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'D.D Amount in Rs.', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bank', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'D.D No.', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Date of D.D', bold: true, font: 'Times New Roman', size: 21 })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.sr_no || '1'), font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `${bidNo}${bidDateStr}`, font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: amountFormatted, font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: bankName, font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.dd_number || ''), font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: fmtDate(data.dd_date), font: 'Times New Roman', size: 20 })] })]
          })
        ]
      })
    ];

    const children = [
      new Paragraph({
        children: [
          new TextRun({ text: `No:  ${refNo}`, bold: true, font: 'Times New Roman', size: 22 }),
          new TextRun({ text: `\t\t\t\tDate: ${dateStr}`, bold: true, font: 'Times New Roman', size: 22 })
        ]
      }),
      ...spacer(1),
      new Paragraph({
        children: [new TextRun({ text: 'By Speed Post / Hand to Hand', italics: true, bold: true, font: 'Times New Roman', size: 21 })]
      }),
      ...spacer(1),
      new Paragraph({ children: [new TextRun({ text: 'To,', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: 'The Manager,', font: 'Times New Roman', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: partyName, bold: true, font: 'Times New Roman', size: 22 })] }),
      ...(partyAddress ? partyAddress.split('\n').map(line => 
        new Paragraph({ children: [new TextRun({ text: line.trim(), font: 'Times New Roman', size: 21 })] })
      ) : []),
      ...spacer(1),
      new Paragraph({
        children: [
          new TextRun({ 
            text: `Sub: Refund of ${natureDoc} Submitted against our Bid for ${itemName}${dept ? ' for ' + dept : ''}.`, 
            bold: true, 
            font: 'Times New Roman', 
            size: 22 
          })
        ]
      }),
      ...spacer(1),
      new Paragraph({
        children: [
          new TextRun({
            text: 'With reference to the above subject, please find herewith your Original D.D as detailed below. Please acknowledge receipt of the same.',
            font: 'Times New Roman',
            size: 22
          })
        ]
      }),
      ...spacer(1),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows
      }),
      ...spacer(1),
      new Paragraph({
        children: [
          new TextRun({ text: 'Total:  ', bold: true, font: 'Times New Roman', size: 22 }),
          new TextRun({ text: `Rupees ${amountWords}`, bold: true, font: 'Times New Roman', size: 22 })
        ]
      }),
      ...spacer(3),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: 'Principal\n', bold: true, font: 'Times New Roman', size: 22 }),
          new TextRun({ text: 'L.D. College of Engineering, Ahmedabad', font: 'Times New Roman', size: 20 })
        ]
      }),
      ...spacer(2),
      new Paragraph({
        children: [
          new TextRun({ text: 'Encl: Original DD.-01(One)', bold: true, font: 'Times New Roman', size: 21 })
        ]
      })
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

class DOCSecurityDepositNote {
  /** DOC-22: Note for Security Deposit (e-PBG) Submission to Accounts (Matches Notes-SD-Submission in Account.docx) */
  static async generate(data = {}) {
    const dateStr = fmtDate(data.date || new Date());
    const dept = data.department || 'સ્ટોર';
    const itemName = data.item_service_name || data.item_name || 'સાધન / સામગ્રી';
    const vendorName = data.vendor_name || '';
    const vendorAddress = data.vendor_address ? `, ${data.vendor_address}` : '';
    const committee = data.committee || (parseFloat(data.amount || 0) > 500000 ? 'DPC' : 'DLPC');
    const epbgPct = data.epbg_percentage || '૫';
    const amountVal = parseFloat(data.amount || 0);
    const amountFormatted = amountVal > 0 ? `${amountVal.toLocaleString('en-IN')}/-` : '-';
    const bankName = data.other_bank_specify 
      ? `${data.bank_name || ''}, ${data.other_bank_specify}`
      : (data.bank_name || '');

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sr.No.', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'D.D No.', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Date of D.D', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Amount of D.D Rs.', bold: true, font: 'Times New Roman', size: 21 })] })]
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bank', bold: true, font: 'Times New Roman', size: 21 })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.sr_no || '1'), font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.dd_number || ''), font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: fmtDate(data.dd_date), font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: amountFormatted, font: 'Times New Roman', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: bankName, font: 'Times New Roman', size: 20 })] })]
          })
        ]
      })
    ];

    const children = [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: 'સેન્ટ્રલ સ્ટોર ,  એલ.ડી કોલેજ ઓફ એન્જી., અમદાવાદ', bold: true, font: 'Shruti', size: 24 }),
          new TextRun({ text: `\t\t\tતા.${dateStr}`, bold: true, font: 'Shruti', size: 22 })
        ]
      }),
      ...spacer(1),
      new Paragraph({
        children: [
          new TextRun({ text: 'સાદર રજુ:', bold: true, underline: {}, font: 'Shruti', size: 24 })
        ]
      }),
      ...spacer(1),
      new Paragraph({
        children: [
          new TextRun({
            text: `અત્રેની સંસ્થાની ${dept} વિદ્યાશાખા / વિભાગ ખાતે જરૂરી ${itemName} અંતર્ગત બીડ પ્રસિદ્ધ કરવામાં આવેલ જે અંતર્ગત લાયક ઠરેલ પેઢી ${vendorName}${vendorAddress} ને ખરીદાદેશ આપવા માટે ${committee} મારફતે મંજુરી મળતા અત્રેના ${dept} વિભાગ દ્વારા સદર પેઢીને ખરીદાદેશ આપવામાં આવેલ છે જે અંતર્ગત પેઢીએ બીડની શરતો અનુસાર ખરીદાદેશની કિંમતના ${epbgPct}% લેખે e-PBG પેટે નીચેની વિગતે ડિમાન્ડ ડ્રાફ્ટ રજુ કરેલ છે.`,
            font: 'Shruti',
            size: 22
          })
        ]
      }),
      ...spacer(1),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows
      }),
      ...spacer(1),
      new Paragraph({
        children: [
          new TextRun({
            text: 'ઉક્ત ડિમાન્ડ ડ્રાફ્ટની રકમ ડીપોઝીટ સદરે જમા લેવા બાબતે અત્રેના હિસાબી અધિકારીને જણાવીએ.',
            font: 'Shruti',
            size: 22
          })
        ]
      }),
      ...spacer(3),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 33, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Store Officer', bold: true, font: 'Times New Roman', size: 20 })] })
                ]
              }),
              new TableCell({
                width: { size: 33, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Head, Store & Purchase', bold: true, font: 'Times New Roman', size: 20 })] })
                ]
              }),
              new TableCell({
                width: { size: 34, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Principal', bold: true, font: 'Times New Roman', size: 20 })] })
                ]
              })
            ]
          })
        ]
      }),
      ...spacer(2),
      new Paragraph({
        children: [
          new TextRun({ text: 'To,\n', bold: true, font: 'Times New Roman', size: 21 }),
          new TextRun({ text: 'Account Officer, L.D College of Engg. for necessary action.\n', font: 'Times New Roman', size: 21 }),
          new TextRun({ text: 'Encl: Original demand draft as per the details above.', bold: true, font: 'Times New Roman', size: 21 })
        ]
      })
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCEMDRefund, DOCSecurityDepositNote, numberToWordsINR };
