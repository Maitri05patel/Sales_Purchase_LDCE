/**
 * DOC-30: DPC Proposal Index
 * DOC-31: DPC Forwarding Letter
 * DOC-32: GeM Agenda Format – DPC
 * DOC-33: Institute BID Certificate
 * DOC-34: L1 INFO Sheet for DPC
 * DOC-35: DPC Minutes of Meeting (MOM)
 */
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, ImageRun } = require('docx');
const ExcelJS = require('exceljs');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate, INST_NAME } = require('./DOC-common');

class DOCDPCIndex {
  /** DOC-30: DPC Proposal Index matching exact official Gujarati DPC Index format */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const bidNo = data.bid_no || agenda.bid_no || 'GEM/2026/B/7586906';
    let bidDate = '';
    if (data.bid_opening_date || data.bid_publish_date) {
      bidDate = fmtDate(data.bid_opening_date || data.bid_publish_date);
    } else if (agenda.bid_date) {
      bidDate = agenda.bid_date;
    } else {
      bidDate = '26/05/2026';
    }

    const headerPara1 = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'L.D College of Engineering, Ahmedabad',
          bold: true,
          font: 'Verdana',
          size: 32
        })
      ]
    });

    const headerPara2 = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: `(Bid No. ${bidNo}${bidDate ? `, dt.${bidDate}` : ''})`,
          bold: true,
          font: 'Verdana',
          size: 24
        })
      ]
    });

    const tableItems = [
      { sr: '1', title: 'સંસ્થા કક્ષાએ આંતરીક કિમટીની રચના અંગેનો કચેરી આદેશ', page: '1-1' },
      { sr: '2', title: 'બીડને લગતી શરતો / સ્પેશિફીકેશન (કોરીજડમની વિગતો જો લાગુ પડતી હોય તો)', page: '5-17' },
      { sr: '3', title: 'બીડ ડોક્યુમેન્ટ', page: '19-25' },
      { sr: '4', title: 'ટેકનીકલ ઈવેલ્યુએશનની વિગતો', page: '27-101' },
      { sr: '5', title: 'ફાયનાન્સિયલ ઈવેલ્યુએશનની વિગતો', page: '103-111' },
      { sr: '6', title: 'જો કોઈ બીડરને અમાન્ય કરેલ હોઈ તો અમાન્ય કરવાના કારણોની વિગતો', page: '113-113' },
      { sr: '7', title: 'GeM મારફત ખરીદી માટે ખરીદ સિમિત સમક્ષ રજુ કરવાની એજન્ડા નોંધ', page: '115-115' }
    ];

    const cellPadding = { top: 140, bottom: 140, left: 140, right: 140 };

    const rows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1129, type: WidthType.DXA },
            margins: cellPadding,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'ક્રમ', bold: true, font: 'Shruti', size: 24 })]
              })
            ]
          }),
          new TableCell({
            width: { size: 7797, type: WidthType.DXA },
            margins: cellPadding,
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'બિડને લગતા દસ્તાવેજ', bold: true, font: 'Shruti', size: 24 })]
              })
            ]
          }),
          new TableCell({
            width: { size: 1275, type: WidthType.DXA },
            margins: cellPadding,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'પેજ નં.', bold: true, font: 'Shruti', size: 24 })]
              })
            ]
          })
        ]
      }),
      ...tableItems.map(item => new TableRow({
        children: [
          new TableCell({
            width: { size: 1129, type: WidthType.DXA },
            margins: cellPadding,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: item.sr, font: 'Verdana', size: 24 })]
              })
            ]
          }),
          new TableCell({
            width: { size: 7797, type: WidthType.DXA },
            margins: cellPadding,
            children: [
              new Paragraph({
                children: [new TextRun({ text: item.title, font: 'Shruti', size: 24 })]
              })
            ]
          }),
          new TableCell({
            width: { size: 1275, type: WidthType.DXA },
            margins: cellPadding,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: item.page, font: 'Verdana', size: 24 })]
              })
            ]
          })
        ]
      }))
    ];

    const table = new Table({
      width: { size: 10201, type: WidthType.DXA },
      columnWidths: [1129, 7797, 1275],
      rows
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 851, bottom: 1440, left: 851, header: 708, footer: 708 }
          }
        },
        children: [
          headerPara1,
          headerPara2,
          table
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

const path = require('path');
const fs = require('fs');

function numToGujaratiWords(amount) {
  if (!amount || isNaN(parseFloat(amount))) return 'શૂન્ય';
  const num = Math.round(parseFloat(amount));
  if (num === 0) return 'શૂન્ય';

  const units = ['', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ', 'દસ',
    'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ', 'વીસ',
    'એકવીસ', 'બાવીસ', 'તેવીસ', 'ચોવીસ', 'પચ્ચીસ', 'છવ્વીસ', 'સત્તાવીસ', 'અઠ્ઠાવીસ', 'ઓગણત્રીસ', 'ત્રીસ',
    'એકત્રીસ', 'બત્રીસ', 'તેત્રીસ', 'ચોત્રીસ', 'પાંત્રીસ', 'છત્રીસ', 'સાડત્રીસ', 'અડત્રીસ', 'ઓગણચાલીસ', 'ચાલીસ',
    'એકતાલીસ', 'બેતાલીસ', 'તેતાલીસ', 'ચુમ્માલીસ', 'પિસ્તાલીસ', 'છેતાલીસ', 'સુડતાલીસ', 'અડતાલીસ', 'ઓગણપચાસ', 'પચાસ',
    'એકાવન', 'બાવન', 'ત્રેપન', 'ચોપન', 'પંચાવન', 'છપ્પન', 'સત્તાવન', 'અઠ્ઠાવન', 'ઓગણસાઠ', 'સાઠ',
    'એકસઠ', 'બાસઠ', 'ત્રેસઠ', 'ચોસઠ', 'પાંસઠ', 'છાસઠ', 'સડસઠ', 'અડસઠ', 'ઓગણોસિત્તેર', 'સિત્તેર',
    'એકોતેર', 'બોતેર', 'તોતેર', 'ચોંતેર', 'પંચોતેર', 'છોતેર', 'સંતોતેર', 'ઇઠોતેર', 'ઓગણાએંસી', 'એંસી',
    'એક્યાસી', 'બ્યાસી', 'ત્યાસી', 'ચોર્યાસી', 'પંચાસી', 'છ્યાસી', 'સત્યાસી', 'અઠ્યાસી', 'નેવ્યાસી', 'નેવું',
    'એકાણું', 'બાણું', 'ત્રાણું', 'ચોરાણું', 'પંચાણું', 'છન્નું', 'સત્તાણું', 'અઠ્ઠાણું', 'નવાણું'];

  function convertTwoDigits(n) {
    if (n < 100) return units[n] || '';
    return '';
  }

  let words = '';
  let crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  let hundred = Math.floor(rem / 100);
  rem = rem % 100;

  if (crore > 0) words += `${convertTwoDigits(crore)} કરોડ `;
  if (lakh > 0) words += `${convertTwoDigits(lakh)} લાખ `;
  if (thousand > 0) words += `${convertTwoDigits(thousand)} હજાર `;
  if (hundred > 0) words += `${convertTwoDigits(hundred)} સો `;
  if (rem > 0) words += `${convertTwoDigits(rem)} `;

  return words.trim();
}

class DOCDPCForwardingLetter {
  /** DOC-31: DPC Forwarding Letter to Director of Technical Education */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const meetingRef = data.meeting_ref || agenda.agenda_ref || '';
    const dateStr = data.meeting_date ? fmtDate(data.meeting_date) : (agenda.agenda_date ? fmtDate(agenda.agenda_date) : fmtDate(new Date()));

    const itemName = agenda.item_name || data.item_name || 'Handling & Shifting Services';
    const qty = agenda.qty || data.indent_qty || '';
    const l1Vendor = agenda.l1_vendor || data.l1_vendor || 'Tousman Ventures Pvt. Ltd. અમદાવાદ';
    const rawL1 = agenda.l1_amount || data.l1_amount || '549000';
    const l1Amount = rawL1 ? parseFloat(rawL1).toLocaleString('en-IN') : '૫,૪૯,૦૦૦';
    const l1AmountWords = rawL1 ? numToGujaratiWords(rawL1) : 'પાંચ લાખ ઓગણપચાસ હજાર';

    let logoBuffer = null;
    const logoPath = path.join(__dirname, '../../assets/ldce_logo.png');
    if (fs.existsSync(logoPath)) {
      logoBuffer = fs.readFileSync(logoPath);
    }

    // Letterhead table (2 columns)
    const logoCellChildren = [];
    if (logoBuffer) {
      logoCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: logoBuffer,
              transformation: { width: 85, height: 85 }
            })
          ]
        })
      );
    }
    logoCellChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40 },
        children: [
          new TextRun({
            text: 'EST:1948',
            bold: true,
            color: 'E05A47',
            font: 'Verdana',
            size: 19
          })
        ]
      })
    );

    const textCellChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: 'Government of Gujarat',
            color: 'E05A47',
            font: 'Georgia',
            size: 28
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [
          new TextRun({
            text: 'L. D. College of Engineering, Ahmedabad',
            bold: true,
            color: 'E05A47',
            font: 'Georgia',
            size: 32
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: 'Opp. Gujarat University, Navrangpura',
            color: '337AB7',
            font: 'Verdana',
            size: 20
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: 'Ahmedabad, Gujarat – 380 015',
            color: '337AB7',
            font: 'Verdana',
            size: 20
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: 'Email: ldce-abad-dte@gujarat.gov.in   Website: www.ldce.ac.in',
            color: '337AB7',
            font: 'Verdana',
            size: 19
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: 'Phone: Office – 079 26302887',
            color: '337AB7',
            font: 'Verdana',
            size: 19
          })
        ]
      })
    ];

    const letterheadTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [1800, 8200],
      borders: {
        top: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1800, type: WidthType.DXA },
              children: logoCellChildren
            }),
            new TableCell({
              width: { size: 8200, type: WidthType.DXA },
              children: textCellChildren
            })
          ]
        })
      ]
    });

    const dividerPara = new Paragraph({
      spacing: { before: 40, after: 180 },
      border: { bottom: { color: 'E05A47', space: 1, value: 'single', size: 16 } },
      children: []
    });

    // Reference and Date Line
    const refDateTable = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [6500, 3500],
      borders: {
        top: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 6500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { after: 140 },
                  children: [
                    new TextRun({ text: `ક્રમાંક:એલડીસીઈ/ખરીદી/ડીપીસી/૨૦૨૬-૨૭/${meetingRef}`, font: 'Shruti', size: 23 })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 3500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { after: 140 },
                  children: [
                    new TextRun({ text: `તા. ${dateStr}`, font: 'Shruti', size: 23 })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });

    // Addressee Block
    const toParas = [
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'પ્રતિ,', font: 'Shruti', size: 23 })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'નિયામકશ્રી,', font: 'Shruti', size: 23 })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'ટેકનીકલ શિક્ષણની કચેરી,', font: 'Shruti', size: 23 })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'બ્લોક નંબર-૦૨, છઠ્ઠો માળ,', font: 'Shruti', size: 23 })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'કર્મયોગીભાવન,સેક્ટર-૧૦એ,', font: 'Shruti', size: 23 })] }),
      new Paragraph({ spacing: { after: 180 }, children: [new TextRun({ text: 'ગાંધીનગર-૩૮૨૦૧૦', font: 'Shruti', size: 23 })] })
    ];

    // Subject
    const subjectPara = new Paragraph({
      spacing: { before: 100, after: 140 },
      children: [
        new TextRun({ text: 'વિષય: સંસ્થા ખાતે જરૂરી સાધન/સેવાની ખરીદી બાબતે મંજુરી આપવા બાબત.', font: 'Shruti', size: 23 })
      ]
    });

    // Reference
    const refPara1 = new Paragraph({
      spacing: { after: 30 },
      children: [
        new TextRun({ text: 'સંદર્ભ: Gujarat State Procurement Policy-2024, Resolution No. SPO-102021-188460-CH', font: 'Shruti', size: 22 })
      ]
    });
    const refPara2 = new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({ text: '       dt.14/03/2024 of Industry & Mines Department, Govt. of Gujarat.', font: 'Shruti', size: 22 })
      ]
    });

    // Salutation
    const sirPara = new Paragraph({
      spacing: { before: 100, after: 140 },
      children: [
        new TextRun({ text: 'માનનીય સાહેબ,', font: 'Shruti', size: 23 })
      ]
    });

    // Body
    const bodyPara = new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { after: 600, line: 360 },
      children: [
        new TextRun({ text: 'અત્રેની સંસ્થા ખાતે  જરૂરી ', font: 'Shruti', size: 23 }),
        new TextRun({ text: itemName + (qty ? ` Qty. ${qty}` : ''), bold: true, font: 'Shruti', size: 23 }),
        new TextRun({ text: ' માટે બીડ પ્રસિદ્ધ કરવામાં આવેલ જે અન્વયે તબક્કાવારની પ્રક્રિયાને અંતે  લાયક ઠરેલ  સૌથી ઓછા ભાવ આપનાર  ', font: 'Shruti', size: 23 }),
        new TextRun({ text: `L1 પેઢી ${l1Vendor}`, bold: true, font: 'Shruti', size: 23 }),
        new TextRun({ text: ` તરફથી રૂ.${l1Amount}/- અંકે રૂપિયા `, font: 'Shruti', size: 23 }),
        new TextRun({ text: `${l1AmountWords} પુરા`, font: 'Shruti', size: 23 }),
        new TextRun({ text: ' ના ભાવ મળેલ છે. સદર મંજૂરી માટે DPC સ્તરે સત્તા પ્રદાન થયેલ હોવાથી મંજુરી આપવા ઘટતી કાર્યવાહી કરવા વિનંતી.', font: 'Shruti', size: 23 })
      ]
    });

    // Principal Signature
    const signPara = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 1200 },
      children: [
        new TextRun({ text: 'આચાર્ય', font: 'Shruti', size: 24 })
      ]
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 708, right: 851, bottom: 993, left: 851, header: 708, footer: 708 }
          }
        },
        children: [
          letterheadTable,
          dividerPara,
          refDateTable,
          ...toParas,
          subjectPara,
          refPara1,
          refPara2,
          sirPara,
          bodyPara,
          signPara
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCDPCAgenda {
  /** DOC-32: GeM Agenda Format – DPC matching exact 9-point Gujarati Word template */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const finYear = agenda.gem_fin_year || data.fin_year || agenda.fin_year || '૨૦૨૬ -૨૭';
    const meetingRef = agenda.gem_meeting_ref || agenda.agenda_ref || data.meeting_ref || '_____';
    const meetingDate = agenda.gem_meeting_date || agenda.agenda_date || (data.meeting_date ? fmtDate(data.meeting_date) : '_____');

    let deptName = agenda.gem_dept_name || data.dept_name || agenda.dept_name || 'ઇન્ફોર્મેશન ટેકનોલોજી';
    if (deptName.toLowerCase().endsWith('department')) {
      deptName = deptName.replace(/department/i, '').trim();
    }

    const itemName = agenda.gem_item_name || agenda.item_name || data.item_name || 'સાધન સામગ્રી';
    const qty = agenda.gem_qty || agenda.qty || data.indent_qty || data.quantity || '01 Nos.';
    const estCost = agenda.gem_est_cost || agenda.est_cost || (data.est_cost ? parseFloat(data.est_cost).toLocaleString('en-IN') : 'xx,xx,xxx');
    const adminApproval = agenda.gem_admin_approval || agenda.admin_approval || '૧) સીટીઈ/નબા ૨૦૨૪-૨૫/ટીઈડી-૫/Non-IT Infra./છ(આ)\n૨) સીટીઈ/નબા ૨૦૨૪-૨૫/ટીઈડી-૧૧/Non-IT Infra./છ(આ)\nતા.૨૦/૦૫/૨૦૨૪';
    const grantAvailability = agenda.gem_grant_avail || agenda.grant_avail || 'ગ્રાન્ટ ઉપલબ્ધ છે.';
    
    const internalComm = agenda.gem_internal_comm || agenda.internal_comm || 'LDCE/Dept/Committee/2026-27/1664,\nતા.૧૪/૦૫/૨૦૨૬';
    const specsDetermined = agenda.gem_specs_det || agenda.specs_det || 'હા, નકલ સામેલ છે.';
    const specsMatching = agenda.gem_specs_gem_match || agenda.specs_gem_match || 'હા';
    const preQualTerms = agenda.gem_pre_qual_terms || agenda.pre_qual_terms || 'નકલ સામેલ છે.';
    const disqualDetails = agenda.gem_disqual_details || agenda.disqual_details || (data.disqualified_count ? `${data.disqualified_count} પેઢી(ઓ)\nપેઢી(ઓ)ને અમાન્ય કરવાના કારણોની નકલ સામેલ છે.` : 'લાગુ પડતું નથી');

    // 5(A)
    const compL1 = agenda.gem_comp_l1 || agenda.comp_l1 || 'પેઢી: લાગુ પડતું નથી\nભાવ: લાગુ પડતું નથી';
    const compCount = agenda.gem_comp_count || agenda.comp_count || 'લાગુ પડતું નથી';

    const l1Vendor = agenda.gem_l1_vendor || agenda.l1_vendor || data.l1_vendor || 'L1 Vendor Name';
    const l1Amount = agenda.gem_l1_amount || agenda.l1_amount || (data.l1_amount ? parseFloat(data.l1_amount).toLocaleString('en-IN') : 'xx,xx,xxx');
    const partCount = agenda.gem_part_count || agenda.part_count || (data.total_participants ? `${data.total_participants} પેઢીઓ` : '03 પેઢીઓ');
    const bidDays = agenda.gem_bid_days || agenda.bid_duration || '૧૧ દિવસ';

    const raL1 = agenda.gem_ra_l1 || agenda.ra_l1 || 'પેઢી: લાગુ પડતું નથી\nભાવ: લાગુ પડતું નથી';
    const raCount = agenda.gem_ra_count || agenda.ra_count || 'લાગુ પડતું નથી';
    const raDays = agenda.gem_ra_days || agenda.ra_duration || 'લાગુ પડતું નથી';

    // 5(B)
    const finalL1Vendor = agenda.gem_final_l1_vendor || l1Vendor;
    const unitPrice = agenda.gem_unit_price || agenda.unit_price || l1Amount;
    const finalQty = agenda.gem_final_qty || qty;
    const finalL1Amount = agenda.gem_final_l1_amount || l1Amount;
    const prevPurch = agenda.gem_prev_purchase || agenda.prev_purchase || `ખરીદ ભાવ: Rs. *****\nજથ્થો: *********\nબીડર પેઢીનું નામ: ********`;

    // 6 PAC
    const pac1 = agenda.gem_pac_1 || agenda.pac_1 || 'ના\n\n\nના';
    const pac2 = agenda.gem_pac_2 || agenda.pac_2 || 'લાગુ પડતું નથી';
    const pac3 = agenda.gem_pac_3 || agenda.pac_3 || 'લાગુ પડતું નથી';
    const pac4 = agenda.gem_pac_4 || agenda.pac_4 || 'લાગુ પડતું નથી';
    const pac5 = agenda.gem_pac_5 || agenda.pac_5 || 'લાગુ પડતું નથી';
    const pac6 = agenda.gem_pac_6 || agenda.pac_6 || 'લાગુ પડતું નથી';
    const pac7 = agenda.gem_pac_7 || agenda.pac_7 || 'લાગુ પડતું નથી';

    // 7, 8, 9
    const reps = agenda.gem_representations || agenda.representations || 'કોઈ રજુઆત મળેલ નથી';
    const inspectMethod = agenda.gem_inspect_method || agenda.inspect_method || 'તજજ્ઞ સમિતિ દ્વારા ઇન્સ્પેક્શન કરવામાં આવે છે.';
    const specialRemarks = agenda.gem_special_remarks || agenda.special_remarks || '-';

    // Header elements
    const titlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: 'GeM મારફત ખરીદી માટે ખરીદ સમિતિ સમક્ષ રજુ કરવાની એજન્ડાનોંધ',
          bold: true,
          underline: {},
          font: 'Shruti',
          size: 24
        })
      ]
    });

    const yearPara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `વર્ષ : ${finYear}`,
          bold: true,
          underline: {},
          font: 'Shruti',
          size: 22
        })
      ]
    });

    const metaParas = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: 'DPC No. ', bold: true, color: 'FF0000', font: 'Shruti', size: 22 }),
          new TextRun({ text: meetingRef, bold: true, underline: {}, color: '0000FF', font: 'Shruti', size: 22 })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: 'તારીખ : ', bold: true, font: 'Shruti', size: 22 }),
          new TextRun({ text: meetingDate, bold: true, underline: {}, font: 'Shruti', size: 22 })
        ]
      })
    ];

    const createParas = (text, isBold = false) => {
      if (!text) return [new Paragraph({ text: '' })];
      return String(text).split('\n').map(line => new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: line, bold: isBold, font: 'Shruti', size: 20 })]
      }));
    };

    const makeRow = (col1, col2, col3, col4, isHeading = false) => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 650, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [new TextRun({ text: col1 || '', bold: isHeading, font: 'Shruti', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 4800, type: WidthType.DXA },
            children: createParas(col2, isHeading)
          }),
          new TableCell({
            width: { size: 300, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [new TextRun({ text: col3 !== undefined ? col3 : ':', font: 'Shruti', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 4250, type: WidthType.DXA },
            children: createParas(col4, false)
          })
        ]
      });
    };

    const rows = [
      // 1
      makeRow('૧ .', 'ખરીદકર્તા કચેરીનું નામ', ':', `${deptName}, એલ.ડી. કોલેજ ઓફ એન્જિનીયરીંગ, અમદાવાદ`),
      // 2
      makeRow('૨ .', 'ખરીદીનો પ્રકાર (સામાન્ય / બ્રાન્ડેડ (PAC))', ':', agenda.purchase_type || 'સામાન્ય'),
      // 3 Header
      makeRow('૩ .', 'ખરીદી હેઠળની ચીજવસ્તુ', '', ''),
      makeRow('', '(૧) નામ', ':', itemName),
      makeRow('', '(૨) જથ્થો', ':', qty),
      makeRow('', '(૩) અંદાજીત કિંમત', ':', `Rs. ${estCost}`),
      makeRow('', '(૪) સરકારશ્રીના વહીવટી મંજૂરીનો ક્રમાંક અને તારીખ', ':', adminApproval),
      makeRow('', '(૫) ખરીદી માટે જરૂરી ગ્રાન્ટ ઉપલબ્ધતાની વિગત', ':', grantAvailability),
      // 4 Header
      makeRow('૪ .', 'ખરીદવાની ચીજવસ્તુઓની પસંદગી પ્રક્રિયા', '', ''),
      makeRow('', '૧) આંતરિક કમિટીની રચના અંગેની વિગત', ':', internalComm),
      makeRow('', '૨) આંતરિક કમિટી દ્વારા ચીજવસ્તુઓના ટેકનિકલ સ્પેસિફિકેશન નક્કી કરેલ છે કે કેમ ? (નકલ જોડવી)', ':', specsDetermined),
      makeRow('', '૩) GeM પર રાખેલ ટેકનિકલ સ્પેસિફિકેશન કમિટીએ નક્કી કર્યા મુજબના છે કે કેમ તેની વિગત', ':', specsMatching),
      makeRow('', '૪) GeM પર બીડીંગ માટે બીડર પેઢીના પૂર્વ લાયકાતના ધોરણો કે અન્ય શરતો રાખેલ હોય તો તેની વિગતો (નકલ જોડવી)', ':', preQualTerms),
      makeRow('', '૫) કચેરીએ બીડીંગ માટે પ્રાથમિક/ટેકનિકલ ચકાસણીમાં કોઈ પેઢીઓને અમાન્ય કરેલ છે કે કેમ તેની વિગત. જો કોઈ બીડરપેઢીને અમાન્ય કરેલ હોય તો અમાન્ય કરવાના કારણોની વિગતો.', ':', disqualDetails),
      // 5 (અ) Header
      makeRow('૫ (અ)', 'GeM પર ખરીદી માટે અપનાવેલ પધ્ધતિ', '', '', true),
      makeRow('૧)', '૧.૧ GeM પર સરખામણી (Comparison) કર્યા બાદ GeM Recommended L1 પેઢીનું નામ તથા મળેલ ભાવ', ':', compL1),
      makeRow('', '૧.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)', ':', compCount),
      makeRow('૨)', '૨.૧ GeM પર બીડીંગ કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ', ':', `પેઢી : ${l1Vendor}\nભાવ રૂા. : ${l1Amount}`),
      makeRow('', '૨.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)', ':', partCount),
      makeRow('', '૨.૩ બીડીંગનો સમયગાળો ઓછામાં ઓછો ૭(સાત) દિવસ છે કે કેમ?', ':', bidDays),
      makeRow('૩)', '૩.૧ રીવર્સ ઓક્શન કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ', ':', raL1),
      makeRow('', '૩.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)', ':', raCount),
      makeRow('', '૩.૩ રીવર્સ ઓક્શનનો સમયગાળો', ':', raDays),
      // 5 (બ) Header
      makeRow('૫ . (બ)', 'GeM પર ખરીદીની આખરી વિગતો', '', '', true),
      makeRow('', '૧) L1 પેઢીનું નામ', ':', finalL1Vendor),
      makeRow('', '૨) મળેલ ભાવ (પ્રતિ નંગ)', ':', unitPrice),
      makeRow('', '૩) જથ્થો', ':', finalQty),
      makeRow('', '૪) કુલ કિંમત', ':', `Rs. ${finalL1Amount}`),
      makeRow('', '૫) અગાઉ કરેલ ખરીદીની વિગત', ':', prevPurch),
      // 6 Header
      makeRow('૬.', 'બ્રાન્ડેડ / PAC આધારે ખરીદી હોય તો:', '', '', true),
      makeRow('', '૧) ખરીદી હેઠળની ચીજ - વસ્તુ GeM પર PAC આઇટમ તરીકે વર્ગીકૃત થયેલ છે (દા.ત. ઓરિજલ વિડીયો)\n\nઅથવા\n\nPAC આઇટમ તરીકે વર્ગીકૃત નથી, પરંતુ PAC આઇટમ તરીકે ખરીદવાની માંગણી છે.', ':', pac1),
      makeRow('', '૨) PAC સર્ટીફીકેટના વિગત (નકલ જોડવી)', ':', pac2),
      makeRow('', '૩) સપ્લાયરનું નામ અને સરનામું', ':', pac3),
      makeRow('', '૪) મળેલ ભાવ (પ્રતિ નંગ)', ':', pac4),
      makeRow('', '૫) જથ્થો', ':', pac5),
      makeRow('', '૬) કુલ કિંમત', ':', pac6),
      makeRow('', '૭) ભાવનું વ્યાજબીપણું (Reasonability) ની વિગત\n(૧) માર્કેટ સર્વેની વિગતો\n(૨) અગાઉની ખરીદીની વિગતો', ':', pac7),
      // 7, 8, 9
      makeRow('૭ .', 'ખરીદી/બીડીંગ દરમ્યાન મળેલ રજુઆતોની વિગત', ':', reps),
      makeRow('૮ .', 'ચીજ - વસ્તુ મળ્યા બાદ તે ટેકનિકલ સ્પેસિફિકેશન મુજબ છે કે કેમ ?\nતેની ચકાસણી માટે પધ્ધતિ નિયત કરેલ હોય તો તેની વિગતો', ':', inspectMethod),
      makeRow('૯.', 'રીમાર્ક્સ/વિશેષ નોંધ', ':', specialRemarks)
    ];

    const table = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [650, 4800, 300, 4250],
      rows
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 709, right: 616, bottom: 1440, left: 1440, header: 708, footer: 708 }
          }
        },
        children: [
          titlePara,
          yearPara,
          ...metaParas,
          table,
          new Paragraph({
            spacing: { before: 300, after: 200 },
            children: [new TextRun({ text: 'અધ્યક્ષશ્રી', bold: true, font: 'Shruti', size: 22 })]
          }),
          new Table({
            width: { size: 10000, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 5000, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        spacing: { before: 400, after: 80 },
                        children: [new TextRun({ text: 'ખાતાના વડાની સહી', bold: true, font: 'Shruti', size: 22 })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 5000, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 400, after: 40 },
                        children: [new TextRun({ text: 'સભ્ય સચિવ અને', bold: true, font: 'Shruti', size: 22 })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 40 },
                        children: [new TextRun({ text: 'અધિક ઉદ્યોગ કમિશનર (ખ.ખા.)', bold: true, font: 'Shruti', size: 22 })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 80 },
                        children: [new TextRun({ text: 'ગાંધીનગર-૨૦', bold: true, font: 'Shruti', size: 22 })]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: 'બિડાણ : ઉપર દર્શાવેલ વિગતોના ઉપલબ્ધ આધાર/પુરાવાની નકલો જોડવાની રહે છે.', font: 'Shruti', size: 20 })]
          })
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCInstituteBIDCertificate {
  /** DOC-33: Institute BID Certificate matching exact Gujarati template */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const instName = data.institute_name || 'એલ. ડી. કોલેજ ઓફ એન્જિનિયરિંગ, અમદાવાદ';
    const itemName = agenda.item_name || data.item_name || 'Handling & Shifting Services';
    const bidNo = data.bid_no || agenda.bid_no || 'GEM/2026/B/7586906';

    const headerPara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 800 },
      children: [
        new TextRun({
          text: '( સંસ્થાનો લેટરહેડ )',
          font: 'Shruti',
          size: 24
        })
      ]
    });

    const titlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 800 },
      children: [
        new TextRun({
          text: 'પ્રમાણપત્ર',
          bold: true,
          underline: {},
          font: 'Shruti',
          size: 28
        })
      ]
    });

    const bodyPara = new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { line: 440, lineRule: 'auto', after: 1200 },
      children: [
        new TextRun({ text: 'સંસ્થા ', font: 'Shruti', size: 24 }),
        new TextRun({ text: instName, bold: true, font: 'Shruti', size: 24 }),
        new TextRun({ text: ' દ્વારા (હાઉસકીપીંગ સેવા/મેનપાવર આઉટસોર્સિંગ સેવા/ સાધન સામગ્રી/ફર્નિચર/અન્ય) ', font: 'Shruti', size: 24 }),
        new TextRun({ text: itemName, bold: true, font: 'Shruti', size: 24 }),
        new TextRun({ text: ' ની ખરીદી માટે GeM પોર્ટલ પર બીડ નંબર ', font: 'Shruti', size: 24 }),
        new TextRun({ text: bidNo, bold: true, font: 'Shruti', size: 24 }),
        new TextRun({ text: ' થી પ્રસિદ્ધ કરવામાં આવેલ બીડ તેમજ સદર બીડમાં આવેલ L1 બીડર સરકારશ્રી દ્વારા પ્રસિદ્ધ કરવામાં આવેલ પ્રવર્તમાન ઠરાવો, પરિપત્રો, ખરીદ નીતિ સાથે તેમજ GeM પોર્ટલના પ્રવર્તમાન નિયમો સાથે સુસંગત છે તે બાબતને હું પ્રમાણિત કરું છું.', font: 'Shruti', size: 24 })
      ]
    });

    const signPara = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 1000, after: 200 },
      children: [
        new TextRun({
          text: 'આચાર્યની સહી તથા સિક્કો',
          bold: true,
          font: 'Shruti',
          size: 24
        })
      ]
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 }
          }
        },
        children: [
          headerPara,
          titlePara,
          bodyPara,
          signPara
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCL1InfoSheet {
  /** DOC-34 Word (.docx): L1 INFO Sheet for DPC */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const instName = data.institute_name || 'L.D College of Engg., Ahmedabad';
    const bidNo = data.bid_no || agenda.bid_no || 'GEM/2026/B/7586906';
    const emdCount = data.emd_bidders_count || agenda.emd_bidders_count || '2';
    const nsicCount = data.nsic_bidders_count || agenda.nsic_bidders_count || '3';
    const l1EmdDetails = data.l1_emd_details || agenda.l1_emd_details || data.emd_details || "Demand Draft No. '084779 of\nRs.15,300/- of\nkotak Mahindra Bank";

    const cellPadding = { top: 140, bottom: 140, left: 140, right: 140 };

    const headerRow = new TableRow({
      children: [
        new TableCell({
          width: { size: 900, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ક્રમ', bold: true, font: 'Shruti', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2800, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'સંસ્થાનું નામ', bold: true, font: 'Shruti', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2800, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'બીડ નંબર', bold: true, font: 'Shruti', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2700, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'બીડમાં Earnest Money Deposit (EMD) ભરનાર પેઢીઓની સંખ્યા', bold: true, font: 'Shruti', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2700, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'બીડમાં NSIC સર્ટીફીકેટ ધરાવતી પેઢીઓની સંખ્યા', bold: true, font: 'Shruti', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 3500, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'L1 જાહેર થયેલ પેઢીનું NSIC સર્ટીફીકેટ અથવા પેઢીએ ભરેલ EMD ની વિગતો.', bold: true, font: 'Shruti', size: 22 })] })]
        })
      ]
    });

    const dataRow = new TableRow({
      children: [
        new TableCell({
          width: { size: 900, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1', font: 'Verdana', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2800, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: instName, font: 'Verdana', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2800, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: bidNo, font: 'Verdana', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2700, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(emdCount), font: 'Verdana', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 2700, type: WidthType.DXA },
          margins: cellPadding,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(nsicCount), font: 'Verdana', size: 22 })] })]
        }),
        new TableCell({
          width: { size: 3500, type: WidthType.DXA },
          margins: cellPadding,
          children: String(l1EmdDetails).split('\n').map(line => new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: line, font: 'Verdana', size: 22 })]
          }))
        })
      ]
    });

    const table = new Table({
      width: { size: 15400, type: WidthType.DXA },
      columnWidths: [900, 2800, 2800, 2700, 2700, 3500],
      rows: [headerRow, dataRow]
    });

    // Notes Box
    const notesTable = new Table({
      width: { size: 7000, type: WidthType.DXA },
      alignment: AlignmentType.RIGHT,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 7000, type: WidthType.DXA },
              margins: cellPadding,
              children: [
                new Paragraph({
                  spacing: { after: 60 },
                  children: [new TextRun({ text: '(૧) સંસ્થાના વડાની સહી તેમજ સંસ્થાના સિક્કા સાથે પ્રમાણિત કરવું', bold: true, font: 'Shruti', size: 20 })]
                }),
                new Paragraph({
                  children: [new TextRun({ text: '(૨) L1 જાહેર થયેલ પેઢીના NSIC સર્ટીફિકેટ/ L1 પેઢી દ્વારા ભરેલ EMD ની નકલ જોડવી', bold: true, font: 'Shruti', size: 20 })]
                })
              ]
            })
          ]
        })
      ]
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 16838, height: 11906 }, // Landscape
            margin: { top: 1000, right: 720, bottom: 1000, left: 720, header: 708, footer: 708 }
          }
        },
        children: [
          table,
          new Paragraph({ spacing: { before: 400, after: 200 } }),
          notesTable
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /** DOC-34 Excel (.xlsx): Official L1 INFO Sheet */
  static async generateExcel(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const instName = data.institute_name || 'L.D College of Engg., Ahmedabad';
    const bidNo = data.bid_no || agenda.bid_no || 'GEM/2026/B/7586906';
    const emdCount = data.emd_bidders_count || agenda.emd_bidders_count || 2;
    const nsicCount = data.nsic_bidders_count || agenda.nsic_bidders_count || 3;
    const l1EmdDetails = data.l1_emd_details || agenda.l1_emd_details || data.emd_details || "Demand Draft No. '084779 of\nRs.15,300/- of\nkotak Mahindra Bank";

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('L1 INFO Sheet', {
      pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true }
    });

    // Column definitions
    ws.columns = [
      { key: 'sr', width: 8 },
      { key: 'inst', width: 26 },
      { key: 'bid', width: 24 },
      { key: 'emd', width: 28 },
      { key: 'nsic', width: 28 },
      { key: 'l1details', width: 38 }
    ];

    // Header Row
    const headerRow = ws.addRow([
      'ક્રમ',
      'સંસ્થાનું નામ',
      'બીડ નંબર',
      'બીડમાં Earnest Money\nDeposit (EMD) ભરનાર\nપેઢીઓની સંખ્યા',
      'બીડમાં NSIC સર્ટીફીકેટ\nધરાવતી પેઢીઓની સંખ્યા',
      'L1 જાહેર થયેલ પેઢીનું NSIC\nસર્ટીફીકેટ અથવા પેઢીએ ભરેલ\nEMD ની વિગતો.'
    ]);
    headerRow.height = 65;

    const thinBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    });

    // Data Row
    const dataRow = ws.addRow([
      1,
      instName,
      bidNo,
      emdCount,
      nsicCount,
      l1EmdDetails
    ]);
    dataRow.height = 60;

    dataRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });

    // Empty row
    ws.addRow([]);

    // Note Box
    ws.mergeCells('D4:F5');
    const noteCell = ws.getCell('D4');
    noteCell.value = '(૧) સંસ્થાના વડાની સહી તેમજ સંસ્થાના સિક્કા સાથે પ્રમાણિત કરવું\n(૨) L1 જાહેર થયેલ પેઢીના NSIC સર્ટીફિકેટ/ L1 પેઢી દ્વારા ભરેલ EMD ની નકલ જોડવી';
    noteCell.font = { name: 'Calibri', size: 10, bold: true };
    noteCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

    // Apply borders around note box
    ['D4', 'E4', 'F4', 'D5', 'E5', 'F5'].forEach(cellRef => {
      ws.getCell(cellRef).border = thinBorder;
    });

    return await wb.xlsx.writeBuffer();
  }
}

module.exports = { DOCDPCIndex, DOCDPCForwardingLetter, DOCDPCAgenda, DOCInstituteBIDCertificate, DOCL1InfoSheet };

