/**
 * DOC-23: Bid Scrutiny Report (Technical Evaluation Matrix)
 * DOC-24: Reasons for Disqualification Sheet
 * DOC-25: DLPC Agenda & Proposal
 * DOC-26: DLPC Rate Reasonability Certificate
 * DOC-27: DLPC Minutes of Meeting (MOM)
 * DOC-28: Checklist B – Final Approval
 * DOC-29: Note – Direct Purchase Against Bid
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, UnderlineType
} = require('docx');
const { ldceHeader, spacer, labelValue, sectionHeading, simpleTable, signatureBlock, inr, fmtDate } = require('./DOC-common');

class DOCScrutinyReport {
  /** DOC-23: Bid Scrutiny Report (Evaluation Matrix) matching exact LDCE format */
  static async generate(data = {}) {
    const bidders = data.bidders || [];
    // Only include actual participating bidders (no unallocated party columns). If 0 bidders, show 1 empty column.
    const parties = bidders.length > 0 ? bidders : [null];
    const partyCount = parties.length;

    const bidNo = data.bid_no || '..................';
    const bidDate = data.bid_publish_date ? fmtDate(data.bid_publish_date) : (data.bid_date ? fmtDate(data.bid_date) : '.............');
    const itemName = data.item_name || '.......................................';
    const deptName = data.dept_name ? `${data.dept_name} Department` : '..................... Department';
    const bidEndDate = data.bid_end_date ? fmtDate(data.bid_end_date) : '';
    const bidOpeningDate = data.bid_opening_date ? fmtDate(data.bid_opening_date) : '';
    const scrutinyDate = data.scrutiny_date ? fmtDate(data.scrutiny_date) : fmtDate(new Date());

    // Resolve scrutiny parameters (custom list per bid or standard LDCE defaults)
    let paramsList = [];
    if (Array.isArray(data.scrutiny_params)) {
      paramsList = data.scrutiny_params;
    } else if (typeof data.scrutiny_params === 'string') {
      try { paramsList = JSON.parse(data.scrutiny_params); } catch (_) {}
    }
    if (!paramsList || paramsList.length === 0) {
      paramsList = [
        'i.e. Avg. annual Turn over of Bidder 10 L',
        'Past Experience / Performance Criteria',
        'OEM Authorization Certificate Submitted',
        'Technical Specifications Compliance',
        'ATC / Additional Terms Compliance',
        'EMD / Bid Security Compliance',
        'GST Registration & Valid PAN Card',
        'Make & Model Offered / Datasheet Verified',
        'Delivery & Warranty Terms Accepted',
        'Mandatory Undertakings / Declarations'
      ];
    }

    // Header paragraphs
    const titlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({ text: 'L.D College of Engineering, Ahmedabad', bold: true, size: 28, font: 'Times New Roman' })
      ]
    });

    const subHeaderPara1 = new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Scrutiny report for Bid No: ', bold: false, font: 'Times New Roman', size: 21 }),
        new TextRun({ text: bidNo, bold: true, font: 'Times New Roman', size: 21 }),
        new TextRun({ text: ' , dated ', font: 'Times New Roman', size: 21 }),
        new TextRun({ text: bidDate, bold: true, font: 'Times New Roman', size: 21 }),
        new TextRun({ text: '  Item Name: ', font: 'Times New Roman', size: 21 }),
        new TextRun({ text: itemName, bold: true, font: 'Times New Roman', size: 21 })
      ]
    });

    // Sub-header with department on left and dates on right
    const metaTable = new Table({
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
              width: { size: 55, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: deptName, bold: true, font: 'Times New Roman', size: 21 })]
                })
              ]
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: `Bid End date: ${bidEndDate}`, font: 'Times New Roman', size: 20 })]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: `Bid Opening date: ${bidOpeningDate}`, font: 'Times New Roman', size: 20 })]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: `Date of Scrutiny: ${scrutinyDate}`, font: 'Times New Roman', size: 20 })]
                })
              ]
            })
          ]
        })
      ]
    });

    // Evaluation Matrix Table
    const paramWidth = Math.max(28, 100 - (partyCount * 22));
    const colWidth = Math.floor((100 - paramWidth) / partyCount);

    const toYesNo = (val, defaultVal = 'Yes') => {
      if (val === undefined || val === null || val === '') return defaultVal;
      const s = String(val).trim().toLowerCase();
      if (s === 'no' || s === 'disqualified' || s === 'fail' || s === 'failed' || s === 'false') return 'No';
      return 'Yes';
    };

    const formatPartyHeader = (p, idx) => {
      if (!p) {
        return [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Party ${idx + 1}`, bold: true, font: 'Times New Roman', size: 18 })]
          })
        ];
      }
      const paras = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: p.bidder_name?.startsWith('M/s') ? p.bidder_name : `M/s ${p.bidder_name}`, bold: true, font: 'Times New Roman', size: 18 })]
        })
      ];
      if (p.bidder_address) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: p.bidder_address, font: 'Times New Roman', size: 16 })]
          })
        );
      }
      return paras;
    };

    const headerRow = new TableRow({
      children: [
        new TableCell({
          width: { size: paramWidth, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Scrutiny Parameter', bold: true, font: 'Times New Roman', size: 20 })]
            })
          ]
        }),
        ...parties.map((p, idx) =>
          new TableCell({
            width: { size: colWidth, type: WidthType.PERCENTAGE },
            children: formatPartyHeader(p, idx)
          })
        )
      ]
    });

    const getParamVal = (bidder, pName) => {
      if (!bidder) return 'Yes/No';
      let dynMap = bidder.param_evaluations;
      if (typeof dynMap === 'string') {
        try { dynMap = JSON.parse(dynMap); } catch (_) {}
      }
      if (dynMap && dynMap[pName] !== undefined) {
        return dynMap[pName];
      }
      const lower = pName.toLowerCase();
      if (lower.includes('turn') || lower.includes('over')) return bidder.param_turnover;
      if (lower.includes('experience') || lower.includes('performance')) return bidder.param_experience;
      if (lower.includes('oem')) return bidder.param_oem;
      if (lower.includes('spec')) return bidder.param_specs;
      if (lower.includes('atc') || lower.includes('term')) return bidder.param_atc;
      if (lower.includes('emd') || lower.includes('security')) return bidder.param_emd;
      if (lower.includes('gst') || lower.includes('pan')) return bidder.param_gst;
      if (lower.includes('datasheet') || lower.includes('model') || lower.includes('make')) return bidder.param_datasheet;
      if (lower.includes('warranty') || lower.includes('delivery')) return bidder.param_warranty;
      if (lower.includes('undertaking') || lower.includes('declaration')) return bidder.param_undertaking;
      return 'Yes';
    };

    const paramRows = paramsList.map(pName => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: paramWidth, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: pName, font: 'Times New Roman', size: 19 })]
              })
            ]
          }),
          ...parties.map(p => {
            const val = p ? toYesNo(getParamVal(p, pName)) : 'Yes/No';
            return new TableCell({
              width: { size: colWidth, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: val, font: 'Times New Roman', size: 19 })]
                })
              ]
            });
          })
        ]
      });
    });

    // Summary qualification rows matching the image
    const summaryRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: paramWidth, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Primarily Qualified\nYes/No', font: 'Times New Roman', size: 19 })] })]
          }),
          ...parties.map(p => new TableCell({
            width: { size: colWidth, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p ? (p.final_tech_status === 'Disqualified' ? 'No' : 'Yes') : 'Yes/No', font: 'Times New Roman', size: 19 })] })]
          }))
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: paramWidth, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Technically Qualified\nYes/No', font: 'Times New Roman', size: 19 })] })]
          }),
          ...parties.map(p => new TableCell({
            width: { size: colWidth, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p ? (p.final_tech_status === 'Disqualified' ? 'No' : 'Yes') : 'Yes/No', font: 'Times New Roman', size: 19 })] })]
          }))
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: paramWidth, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Qualified to open financial bid Yes/No', font: 'Times New Roman', size: 19 })] })]
          }),
          ...parties.map(p => new TableCell({
            width: { size: colWidth, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p ? (p.final_tech_status === 'Qualified' ? 'Yes' : 'No') : 'Yes/No', font: 'Times New Roman', size: 19 })] })]
          }))
        ]
      })
    ];

    const matrixTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...paramRows, ...summaryRows]
    });

    // Signature Block at Bottom
    const signatureTable = new Table({
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
              width: { size: 55, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 240, after: 180 },
                  children: [new TextRun({ text: 'Name & Sign: Scrutinizer-1', font: 'Times New Roman', size: 21 })]
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [new TextRun({ text: 'Name & Sign: Scrutinizer-2', font: 'Times New Roman', size: 21 })]
                })
              ]
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 360, after: 120 },
                  children: [new TextRun({ text: 'HOD Sign & Stamp', bold: true, font: 'Times New Roman', size: 21 })]
                })
              ]
            })
          ]
        })
      ]
    });

    const children = [
      titlePara,
      subHeaderPara1,
      metaTable,
      ...spacer(1),
      matrixTable,
      signatureTable
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });
    return await Packer.toBuffer(doc);
  }
}

class DOCDisqualificationSheet {
  /** DOC-24: Reasons for Disqualification Sheet matching exact LDCE format */
  static async generate(data = {}) {
    const bidders = data.bidders || [];
    const disqualified = bidders.filter(b => b.final_tech_status === 'Disqualified');

    const bidNo = data.bid_no || '..................';
    const bidDate = data.bid_publish_date ? fmtDate(data.bid_publish_date) : (data.bid_date ? fmtDate(data.bid_date) : '.............');
    const itemName = data.item_name || '.......................................';

    const titlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'L.D College of Engineering, Ahmedabad', bold: true, size: 28, font: 'Times New Roman' })
      ]
    });

    const docHeadingPara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: 'Reasons for disqualified in the Bid.', bold: true, size: 24, font: 'Times New Roman' })
      ]
    });

    const bidSubPara = new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({ text: `Bid No. ${bidNo} dated ${bidDate} for ${itemName}`, bold: true, size: 22, font: 'Times New Roman' })
      ]
    });

    // Build table rows
    const headerRow = new TableRow({
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Sr.No.', bold: true, font: 'Times New Roman', size: 20 })]
            })
          ]
        }),
        new TableCell({
          width: { size: 42, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Party Name/City/State', bold: true, font: 'Times New Roman', size: 20 })]
            })
          ]
        }),
        new TableCell({
          width: { size: 48, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Reason(s) for disqualified', bold: true, font: 'Times New Roman', size: 20 })]
            })
          ]
        })
      ]
    });

    const rows = [headerRow];

    if (disqualified.length === 0) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '-', font: 'Times New Roman', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 42, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'N/A', font: 'Times New Roman', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 48, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'All participating bidders were found technically qualified.', italic: true, font: 'Times New Roman', size: 20 })] })]
            })
          ]
        })
      );
    } else {
      disqualified.forEach((b, idx) => {
        // Collect reason bullets
        const reasons = [];
        if (b.disqualify_reason) {
          const lines = b.disqualify_reason.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean);
          reasons.push(...lines);
        }

        // Add any failed parameters if not already in reasons
        let dynMap = b.param_evaluations;
        if (typeof dynMap === 'string') {
          try { dynMap = JSON.parse(dynMap); } catch (_) {}
        }
        if (dynMap && typeof dynMap === 'object') {
          for (const [pName, status] of Object.entries(dynMap)) {
            if (status === 'No') {
              const formatted = `${pName} not compliant / not submitted`;
              if (!reasons.some(r => r.toLowerCase().includes(pName.toLowerCase().substring(0, 12)))) {
                reasons.push(formatted);
              }
            }
          }
        }

        if (reasons.length === 0) {
          reasons.push('Disqualified during technical scrutiny evaluation.');
        }

        const partyText = (b.bidder_name || '').toUpperCase();
        const addressText = b.bidder_address ? `, ${(b.bidder_address || '').toUpperCase()}` : '';

        const partyParas = [
          new Paragraph({
            children: [
              new TextRun({ text: `${partyText}${addressText}`, bold: true, font: 'Times New Roman', size: 19 })
            ]
          })
        ];

        const reasonParas = reasons.map(r => new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `➢  ${r}`, font: 'Times New Roman', size: 19 })
          ]
        }));

        rows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 10, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: String(idx + 1), font: 'Times New Roman', size: 20 })]
                  })
                ]
              }),
              new TableCell({
                width: { size: 42, type: WidthType.PERCENTAGE },
                children: partyParas
              }),
              new TableCell({
                width: { size: 48, type: WidthType.PERCENTAGE },
                children: reasonParas
              })
            ]
          })
        );
      });
    }

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          titlePara,
          docHeadingPara,
          bidSubPara,
          table
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCDLPCAgenda {
  /** DOC-25: DLPC Agenda & Proposal matching exact Gujarati DLPC 4-column format */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const titlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: 'GeM મારફત ખરીદી માટે જિલ્લા કક્ષાની ખરીદ સમિતિ (DLPC/DPC) સમક્ષ રજુ કરવાનો એજન્ડા',
          bold: true, size: 22, font: 'Shruti'
        })
      ]
    });

    const createTextParagraphs = (content, isBold = false, color = undefined) => {
      if (Array.isArray(content)) return content;
      if (!content) return [new Paragraph({ text: '' })];
      return String(content).split('\n').map(line => new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: line, bold: isBold, font: 'Shruti', size: 22, color })]
      }));
    };

    const build4ColRow = (sr, leftText, rightContent, isHeader = false, showColon = true) => {
      const isShaded = isHeader;
      const shading = isShaded ? { fill: 'D9D9D9', type: ShadingType.CLEAR } : undefined;

      return new TableRow({
        children: [
          // Col 1: Sr No (355 dxa)
          new TableCell({
            width: { size: 355, type: WidthType.DXA },
            shading,
            children: [new Paragraph({
              spacing: { after: 20 },
              children: [new TextRun({ text: sr || '', bold: isHeader, font: 'Shruti', size: 22 })]
            })]
          }),
          // Col 2: Question description (5460 dxa)
          new TableCell({
            width: { size: 5460, type: WidthType.DXA },
            shading,
            children: createTextParagraphs(leftText, isHeader)
          }),
          // Col 3: Colon (283 dxa)
          new TableCell({
            width: { size: 283, type: WidthType.DXA },
            shading,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 20 },
              children: [new TextRun({ text: showColon ? ':' : '', bold: isHeader, font: 'Shruti', size: 22 })]
            })]
          }),
          // Col 4: Value (4109 dxa)
          new TableCell({
            width: { size: 4109, type: WidthType.DXA },
            shading,
            children: Array.isArray(rightContent) ? rightContent : createTextParagraphs(rightContent, false)
          })
        ]
      });
    };

    // Build Row 1 Response with Red "સેન્ટ્રલ સ્ટોર"
    const officeLines = (agenda.office_name || 'એલ.ડી કોલેજ ઓફ એન્જીનિયરીંગ, અમદાવાદ\nસેન્ટ્રલ સ્ટોર').split('\n');
    const officeParas = officeLines.map((line, idx) => new Paragraph({
      spacing: { after: 20 },
      children: [new TextRun({
        text: line,
        font: 'Shruti',
        size: 22,
        color: idx === 1 ? 'FF0000' : undefined
      })]
    }));

    // Main 4-column agenda rows matching the exact Word template
    const mainRows = [
      // 1.
      build4ColRow(
        '1.',
        'રાજ્ય સરકારની ખરીદકર્તા કચેરીનું નામ\nસરનામુ, ફોન નંબર, ઇ-મેઇલ એડ્રેસ\n(સ્થાનિક સ્વરાજ્યની સંસ્થાને રાજ્ય સરકારે સોંપેલી પ્રવૃત્તિ અને તેનું ભંડોળ આપેલ હોય તો જ DLPC / DPC માં પ્રકરણ મોકલવા તે સિવાયનાં કિસ્સામાં તેમની સક્ષમ સમિતિની મંજૂરી મેળવવી. તેવી જ રીતે બોર્ડ/ નિગમ / સોસાયટી/ સ્વાયત સંસ્થાઓએ તેમની સક્ષમ સમિતિની મંજૂરી મેળવવી)',
        officeParas,
        false,
        true
      ),
      // 2.
      build4ColRow(
        '2.',
        'સંબંધિત કચેરીનાં એજન્ડા ક્રમ અને તારીખ\n(દરેક કચેરીએ ખરીદીનું રજિસ્ટર નિભાવવુ સલાહભર્યુ છે,\nઆ રજિસ્ટર પર જે ક્રમ આવે તે મુજબ એજન્ડા ક્રમ રાખવો)',
        `એજન્ડા ક્રમ-     / FY 2026- 27\nતા. ${agenda.agenda_date || fmtDate(data.meeting_date)}`,
        false,
        true
      ),
      // 3.
      build4ColRow(
        '3.',
        'ખરીદીનો પ્રકાર\n(ભારત સરકારનાં DO Ltr No. 222/CEO-GeM/2022, dt.08-07-2022 મુજબ GeM પર જે કેટગરી ઉપલબ્ધ છે તેમાં BoQ/Custom Bid કરવાની મનાઇ છે)',
        `[${agenda.purchase_type === 'GeM Suggested L1' ? '✔' : '_'}]  GeM Suggested L1\n[${agenda.purchase_type === 'Bid' || !agenda.purchase_type ? '✔' : '_'}]  Bid (Rs.1 lacથી વધુની ખરીદીમાં ફરજીયાત)\n[${agenda.purchase_type === 'RA' ? '✔' : '_'}]  RA (Reverse Auction)`,
        false,
        true
      ),
      // 4. Header
      build4ColRow('4.', 'ખરીદી હેઠળ ચીજ વસ્તુઓ/ સેવાની વિગત', '', true, false),
      // 4A
      build4ColRow('A.', 'વસ્તુ / સેવાનું નામ', agenda.item_name || data.item_name || '', false, true),
      // 4B
      build4ColRow('B.', 'જથ્થો', agenda.qty || (data.indent_qty ? `${data.indent_qty}` : 'As per Bid'), false, true),
      // 4C
      build4ColRow('C.', 'અંદાજીત કિંમત / બીડ વેલ્યુ', agenda.est_cost ? inr(agenda.est_cost) : (data.est_cost ? inr(data.est_cost) : inr(data.l1_amount)), false, true),
      // 4D
      build4ColRow('D.', 'સરકારશ્રીની વહીવટી મંજૂરીનો ક્રમાંક અને તારીખ', agenda.admin_approval || `તા. ${fmtDate(data.meeting_date || new Date())} ની નોંધ ઉપર આચાર્યશ્રી ની મંજુરી મળેલ છે.`, false, true),
      // 4E
      build4ColRow('E.', 'ખરીદી માટે જરૂરી ગ્રાન્ટ ઉપલબ્ધતાની વિગત અને મેજર હેડ ફરજીયાત લખવો', agenda.grant_head || data.budget_head || 'Office Expenses/Contingency', false, true),
      // 4F
      build4ColRow('F.', 'જે વસ્તુ ખરીદ કરવાની છે તે MSE માટે અનામત રાખેલ વસ્તુઓની યાદીમાં સમાવેશ થાય છે ?', agenda.mse_reserved ? 'હા. ફક્ત MSE પાસેથી જ ખરીદી કરવાની છે.' : 'જો ‘હા’ તો ફક્ત MSE પાસેથી જ ખરીદી કરવાની છે.', false, true),
      // 4G
      build4ColRow('G.', 'Rate Contractનાં બીડમાં SPC અથવા સક્ષમ સત્તાધિકારીની મંજૂરી છે ?', agenda.spc_approval || 'લાગુ પડતું નથી.', false, true),
      // 4H
      build4ColRow('H.', 'Rate Contractનો સમયગાળો  (એક વર્ષનો જ હોવો જોઇએ. )', agenda.rc_period || 'લાગુ પડતું નથી.', false, true),
      // 5. Header
      build4ColRow('5.', 'જે વસ્તુની ખરીદી કરવાની છે તે છેલ્લે કયારે ખરીદ કરવામાં આવી તેની વિગતો', '', true, false),
      // 5A
      build4ColRow('A.', 'કઇ રીતે ખરીદી કરેલ હતી ?', `[${agenda.last_purchase_mode === 'vendor' ? '✔' : '_'}]  માન્ય વેન્ડર પાસેથી વિના ટેન્ડર\n[${agenda.last_purchase_mode === 'gem_bid' || !agenda.last_purchase_mode ? '✔' : '_'}]  GeM Bid No.\n[${agenda.last_purchase_mode === 'direct' ? '✔' : '_'}]  GeM Direct Purchase / Comparison`, false, true),
      // 5B
      build4ColRow('B.', 'જે વસ્તુ કે સેવા ખરીદ કરેલ હોય તેના', `જથ્થો : ${agenda.last_qty || ''}\nરકમ. : ${agenda.last_amount ? inr(agenda.last_amount) : ''}`, false, true),
      // 5C
      build4ColRow('C.', 'L1નું નામ અને સરનામું:', agenda.l1_vendor || data.l1_vendor || '', false, true),
      // 5D
      build4ColRow('D.', 'Consigneeનું નામ અને તેની વિગત', agenda.consignee || 'Principal, L.D. College of Engineering, Ahmedabad', false, true),
      // 6. Header
      build4ColRow('6.', 'બીડ ડોક્યુમેન્ટમાં સમાવેશ કરેલ વિગતો', '', true, false),
      // 6A
      build4ColRow('A.', 'આંતરીક સમિતિ દ્વારા ચીજવસ્તુઓના ટેકનીકલ સ્પેસીફીકેશન નક્કી કરેલ છે કે કેમ?\n(નકલ જોડવી) (Bureau of Indian Standardને સ્પેસિફીકશન હોવા જોઇએ.)', agenda.spec_committee || 'હા. , નકલ સામેલ છે.', false, true),
      // 6B
      build4ColRow('B.', 'GeM પર રાખેલ ટેકનીકલ સ્પેસીફીકેશન સમિતિએ નક્કી કર્યા મુજબના છે કે કેમ? તેની વિગત (Golden Parameterને અગ્રતા આપવી)', agenda.spec_gem || 'હા.', false, true),
      // 6C
      build4ColRow('C.', 'ખરીદીમાં જરૂરી નોંધણી હોવાની શરતો રાખેલી છે ?', `[${agenda.reg_udyam ?? true ? '✔' : '_'}]    UDYAM Registration as MSE\n[${agenda.reg_cspo ?? true ? '✔' : '_'}]    CSPO Registration as MSE\n[${agenda.reg_nsic ?? true ? '✔' : '_'}]    NSIC Registration as MSE\n[${agenda.reg_dpiit ?? true ? '✔' : '_'}]    Start-ups recognized by DPIIT\n[${agenda.reg_startup ?? true ? '✔' : '_'}]    Start-up registered as MSE under CSPO and NSIC`, false, true),
      // 6D
      build4ColRow('D.', 'GeM ૫૨ બીડીંગ માટે બીડર પેઢીના પૂર્વ લાયકાતના ધોરણો કે અન્ય શરતો રાખેલ હોય તો તેની વિગતો (નકલ જોડવી) (આ શરતો સ્પર્ધા મર્યાદિત કરે તેવી અને ખરીદનીતિ-૨૦૨૪ની જોગવાઇની વિરૂદ્ધની ન હોવી જોઇએ)', agenda.pre_qual_terms || 'હા, નકલ સામેલ છે.', false, true),
      // 6E
      build4ColRow('E.', 'Earnest Money Deposit – 3%', agenda.emd_terms || 'હા, નકલ સામેલ છે.', false, true),
      // 6F
      build4ColRow('F.', 'Security Deposit – 3% or 5%', agenda.sd_terms || 'હા. બીડ અનુસાર e-PBG ની શરત રાખેલ છે.', false, true),
      // 6G
      build4ColRow('G.', 'બિડમાં પાછલા નાણાકીય વર્ષમાં પુરા થતા ત્રણ વર્ષનાં ટર્નઓવર / સરેરાશ વાસ્તવિક ઉત્પાદન બિડ વેલ્યુનાં બે ગણાની શરત રાખેલ છે કે કેમ અને તેની રકમ.', agenda.turnover_terms || 'હા.....રૂ. ૧૦ લાખ', false, true),
      // 6H
      build4ColRow('H.', 'Make in India અને સ્થાનિક સામગ્રી સંદર્ભે Bid Splittingનો વિકલ્પ રાખેલ છે?', agenda.splitting_option || 'લાગુ પડતું નથી', false, true),
      // 6I
      build4ColRow('I.', 'Make in India અંતર્ગત રૃ. ૫.૦૦ લાખથી ઉપરની ખરીદીમાં સ્થાનિક સામગ્રીનાં સંદર્ભમાં Bid Documentમાં ખરીદીમાં પસંદગી ક્રમ Class-1 Guj MSE, Class-1 Local Supplier, Class-2 Guj MSE, Class-2 Local Supplier અને Non Local Supplier તે મુજબ રાખેલ છે ?', `Class-1 Guj MSE            [${agenda.mii_c1_guj ?? true ? '✔' : '__'}]\nClass-1 Local Supplier      [${agenda.mii_c1_local ?? true ? '✔' : '__'}]\nClass-2 Guj MSE             [${agenda.mii_c2_guj ?? true ? '✔' : '__'}]\nClass-2 Local Supplier      [${agenda.mii_c2_local ?? true ? '✔' : '__'}]\nNon Local Supplier           [${agenda.mii_non_local ?? false ? '✔' : '__'}]`, false, true),
      // 6J
      build4ColRow('J.', 'બીડનો સમયગાળો ઓછામાં ઓછો GeM Portal પર દર્શાવ્યા મુજબ છે ? (ઓછામાં ઓછો સમયગાળો ૧૫ દિવસનો રાખવો)', `સમયગાળો :  ${agenda.bid_duration || '૧૧  દિવસ'}`, false, false),
      // 7. Header
      build4ColRow('7.', 'ટેકનીકલ ઇવોલ્યુશનઃ', '', true, false),
      // 7A
      build4ColRow('A.', 'ખરીદીમાં ભાગ લેનાર ઉત્પાદક / સપ્લાયરની સંખ્યા (ઓછામાં ઓછા ૩ (ત્રણ) ભાગ લેનાર હોવા જોઇએ)', agenda.total_participants || (data.total_bidders !== undefined ? String(data.total_bidders) : '૦૩'), false, true),
      // 7B
      build4ColRow('B.', 'તેમાંથી ક્વોલીફાઇડ થયેલ ઉત્પાદક / સપ્લાયરની સંખ્યા', agenda.qualified_count || (data.qualified_bidders !== undefined ? String(data.qualified_bidders) : '૦૩'), false, true),
      // 7C
      build4ColRow('C.', 'ડીસ્કવોલીફાઇડ કર્યા હોય તેનાં કારણો', agenda.disqualified_reasons || 'નકલ સામેલ છે. / લાગુ પડતું નથી', false, true),
      // 7D
      build4ColRow('D.', 'સ્થાનિક સામગ્રી અંગે બીડમાં ભાગ લેનાર ઉત્પાદક / સપ્લાયરનાં પ્રમાણપત્રોની ચકાસણી કરવામાં આવેલ છે ?', agenda.local_cert_verified || 'હા.', false, true),
      // 7E
      build4ColRow('E.', 'MSE નોંધણીનાં આધાર પુરાવા સામેલ છે ?', agenda.mse_proof_attached || 'હા.', false, true),
      // 7F
      build4ColRow('F.', 'Original Equipment Manufacturer (OEM)નાં ઓથો. ડીલર કે જે પોતે પણ ખરીદ નીતિ મુજબ MSE તરીકે ક્રમ -6(C) મુજબની નોંધણી ધરાવતા હોય તેવા સપ્લાયર પાસે OEMની માન્યતા (ઓથો. ડીલર) અંગેનો અધિકૃતિપત્ર છે ?', agenda.oem_auth_letter || '', false, true),
      // 7G
      build4ColRow('G.', 'ખરીદનીતિ ૨૦૨૪ મુજબ EMD ભરેલી છે ?', agenda.emd_paid || 'હા  / Exempted', false, true),
      // 7H
      build4ColRow('H.', 'પાછલા નાણાકીય વર્ષમાં પુરા થતા ત્રણ વર્ષનાં ટર્નઓવર / સરેરાશ વાસ્તવિક ઉત્પાદન બિડ વેલ્યુનાં બે ગણા છે ?', agenda.turnover_fulfilled || 'હા.', false, true),
      // 7I
      build4ColRow('I.', 'GeM પર બીડીંગ માટે બીડર પેઢીના પૂર્વ લાયકાતના ધોરણો કે અન્ય શરતો રાખેલ હોય તો તેની વિગતો છે ?', agenda.pre_qual_details || 'બીડ અનુસાર  શરતો રાખેલ છે.', false, true),
      // 7J
      build4ColRow('J.', 'વસ્તુ ઇન્સ્ટોલ થયા બાદ તેનો ઉપયોગ થઇ શકે તેમ હોય તેવા કિસ્સામાં ‘હાર્ડવેર ઇન્સ્ટોલેશન રીપોર્ટ’ મળ્યા બાદ ચૂકવણુ કરવાની શરત રાખેલી છે ?', agenda.install_report_terms || '', false, true),
      // 7K
      build4ColRow('K.', 'અન્ય બાબતો.', agenda.other_matters || '', false, true)
    ];

    const mainTable = new Table({
      width: { size: 10207, type: WidthType.DXA },
      columnWidths: [355, 5460, 283, 4109],
      rows: mainRows
    });

    // Gujarati Declaration (બાંહેધરી)
    const declarationHeading = new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: 'બાંહેધરી :', bold: true, size: 22, font: 'Shruti' })]
    });
    const declarationSub = new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: 'આથી બાંહેધરી આપવામાં આવે છે કે,', bold: true, size: 22, font: 'Shruti' })]
    });
    const decPoints = [
      '1. ઉદ્યોગ અને ખાણ વિભાગનાં તા. ૦૩-૦૨-૨૦૨૧નો ઠરાવ અને તેના ફકરા નં. ૨ અને ૯ની તમામ સૂચનાઓ વાંચેલી છે અને ખરીદીમાં તે મુજબની અમલવારી કરેલ છે.',
      '2. Comparison by GeM Suggested L1 નાં કિસ્સામાં ભાવનાં વ્યાજબીપણાની મેં ખરીદકર્તા તરીકે પુરેપુરી ચકાસણી કરેલી છે.',
      '3. BoQ /Customized Bid માં જ્યાં કેટેગરી ઉપલબ્ધ નથી ત્યાં જ ઉપયોગ કરેલ છે.',
      '4. ખરીદીમાં સ્પર્ધાત્મકતા મર્યાદિત ન થાય તેની તકેદારી રાખેલી છે અને ત્યારબાદ જ DPC / DLPC સમક્ષ દરખાસ્ત રજુ કરેલ છે.',
      '5. સ્પેસિફીકેશન મુજબની જ વસ્તુ / સેવા મળે તેની ખાતરી કરવામાં આવશે. ઉપરોક્ત કોઇપણ સૂચના તથા સરકારશ્રીનાં વખતોવખતની GeM Purchase અંગેની સૂચનાઓની ખરીદીનાં કોઇપણ તબક્કે ઉલ્લંઘન થતુ હશે તો તેના પરિણામોની સઘળી જવાબદારી ખરીદકર્તા કચેરી તરીકે અમારી છે.'
    ].map(t => new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: t, size: 21, font: 'Shruti' })]
    }));

    const secSignature = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 180, after: 180 },
      children: [new TextRun({ text: 'સભ્ય સચિવ, ખરીદકર્તા કચેરી', bold: true, size: 22, font: 'Shruti' })]
    });

    // Notes (નોંધ)
    const noteHeading = new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: 'નોંધ :', bold: true, size: 22, font: 'Shruti' })]
    });
    const notePoints = [
      '1. રૂ ૭૫.૦૦ લાખ સુધીનાં મેનપાવર (ફક્ત પટાવાળા અને ડ્રાયવર) અને હાઉસકીપીંગ સર્વિસ માટે સંબંધિત કચેરીઓએ તેમના ખાતાનાં વડાની કચેરી પાસેથી મંજૂરી મેળવવાની હોય તેવા પ્રકરણો DLPC માં રજુ કરવાનાં રહેશે નહીં.',
      '2. DLPC ને રૂ. ૧0.00 લાખ સુધીની સત્તા હોય તેટલી રકમનાં જ પ્રકરણો રજુ કરવાનાં રહેશે.'
    ].map(t => new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: t, size: 21, font: 'Shruti' })]
    }));

    // Table 1: L1 Party Info Table (4537, 1843, 2698 dxa)
    const l1InfoTable = new Table({
      width: { size: 9078, type: WidthType.DXA },
      columnWidths: [4537, 1843, 2698],
      rows: [
        new TableRow({
          children: [
            new TableCell({ width: { size: 4537, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'L1 પાર્ટીનું નામ', bold: true, font: 'Shruti', size: 22 })] })] }),
            new TableCell({ width: { size: 1843, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'રકમ', bold: true, font: 'Shruti', size: 22 })] })] }),
            new TableCell({ width: { size: 2698, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'વસ્તુ કે સેવાનું નામ', bold: true, font: 'Shruti', size: 22 })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 4537, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: agenda.l1_vendor || data.l1_vendor || '', bold: true, font: 'Shruti', size: 22 })] })] }),
            new TableCell({ width: { size: 1843, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: inr(agenda.l1_amount || data.l1_amount), bold: true, font: 'Shruti', size: 22 })] })] }),
            new TableCell({ width: { size: 2698, type: WidthType.DXA }, children: [
              new Paragraph({ children: [new TextRun({ text: `જથ્થો : ${agenda.qty || data.indent_qty || 'બીડ મુજબ'}`, font: 'Shruti', size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: `નામ : ${agenda.item_name || data.item_name || ''}`, font: 'Shruti', size: 20 })] })
            ] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 6380, type: WidthType.DXA },
              columnSpan: 2,
              children: [new Paragraph({ children: [new TextRun({ text: 'નાણાકીય બીડ ઓપન કરવાનો સમય અને તારીખ (OTP વાળો ઈમેલ મુકવો)', bold: true, font: 'Shruti', size: 20 })] })]
            }),
            new TableCell({
              width: { size: 2698, type: WidthType.DXA },
              children: [
                new Paragraph({ children: [new TextRun({ text: `તારીખ : ${agenda.fin_bid_open_date || fmtDate(data.bid_opening_date)}`, font: 'Shruti', size: 20 })] }),
                new Paragraph({ children: [new TextRun({ text: `સમય : ${agenda.fin_bid_open_time || '11:00 AM'}`, font: 'Shruti', size: 20 })] })
              ]
            })
          ]
        })
      ]
    });

    // Table 2: 20-Item DLPC Checklist (7998, 516 dxa)
    const checklistHeading = new Paragraph({
      spacing: { before: 240, after: 100 },
      children: [new TextRun({ text: 'DLPC ની ફાઈલ નીચે મુજબના ક્રમમાં તૈયાર કરવી (Tick as applicable)', bold: true, size: 22, font: 'Shruti' })]
    });

    const checklistItems = [
      '1. Agenda Statement',
      '2. MoM for DLPC (દરેક બીડ માટે અલગ અલગ)',
      '3. Administrative approval (New or Current Item)',
      '4. Grant order with Major Head classification of Current Financial Year',
      '5. Certificate for process done',
      '6. GeM Agenda Note',
      '7. EMD/e-PBG details (In case of BID)',
      '8. MSE exemption certificate & MII Certificate of L1',
      '9. Certificate for reasonability of rate',
      '10. GeM generated L1 details after RA',
      '11. GeM generated L1 details before RA',
      '12. Details of Financial Statement generated from GeM',
      '13. Final Scrutiny Report',
      '14. All Scrutinized documents of L1 Vendor',
      '15. Documents of reasons for disqualified',
      '16. Technical Scrutiny report generated from GeM',
      '17. Qualifying Status generated from GeM',
      '18. Details of participants generated from GeM',
      '19. Copy of Published Bid',
      '20. Certificate: Non-division (કટકા કે ભાગલા) of purchase of service/goods in current FY.'
    ];

    const checklistRows = checklistItems.map((item, idx) => {
      const isTicked = agenda[`chk_${idx + 1}`] ?? true;
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 7998, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: item, font: 'Shruti', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 516, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isTicked ? '✔' : '', font: 'Shruti', size: 20 })] })]
          })
        ]
      });
    });

    const checklistTable = new Table({
      width: { size: 8514, type: WidthType.DXA },
      columnWidths: [7998, 516],
      rows: checklistRows
    });

    const children = [
      titlePara,
      mainTable,
      ...spacer(1),
      declarationHeading,
      declarationSub,
      ...decPoints,
      secSignature,
      noteHeading,
      ...notePoints,
      ...spacer(1),
      l1InfoTable,
      checklistHeading,
      checklistTable
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 284, right: 1440, bottom: 993, left: 1440, header: 708, footer: 708 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCRateReasonability {
  /** DOC-26: Rate Reasonability Certificate (DLPC & DPC) matching exact LDCE format */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    let deptName = data.dept_name || agenda.dept_name || 'Name of the Department';
    if (!deptName.toLowerCase().includes('department') && deptName !== 'Name of the Department') {
      deptName = `${deptName} Department`;
    }

    const itemName = agenda.item_name || data.item_name || '...........................................';
    const qty = agenda.qty || data.indent_qty || data.quantity || '...........';
    const rawL1 = agenda.l1_amount || data.l1_amount || agenda.last_amount || data.est_cost;
    const l1Amount = rawL1 ? `${parseFloat(rawL1).toLocaleString('en-IN')}/-` : '.............';
    
    let partyText = (agenda.l1_vendor || data.l1_vendor || '').trim();
    if (partyText) {
      const addr = (data.vendor_address || '').trim();
      if (addr) {
        const tokens = addr.split(',').map(s => s.trim()).filter(Boolean);
        const newTokens = tokens.filter(t => !partyText.toLowerCase().includes(t.toLowerCase()));
        if (newTokens.length > 0) {
          partyText += `, ${newTokens.join(', ')}`;
        }
      } else {
        if (data.vendor_city && !partyText.toLowerCase().includes(data.vendor_city.toLowerCase())) {
          partyText += `, ${data.vendor_city}`;
        }
        if (data.vendor_state && !partyText.toLowerCase().includes(data.vendor_state.toLowerCase())) {
          partyText += `, ${data.vendor_state}`;
        }
      }
    } else {
      partyText = 'Party Name, City, State';
    }

    // Top Right: Department Name (Underlined)
    const deptPara = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 600, line: 360 },
      children: [
        new TextRun({
          text: deptName,
          font: 'Arial',
          size: 28,
          underline: { type: UnderlineType.SINGLE }
        })
      ]
    });

    // Centered Title: Certificate for reasonability of rate (Bold, Underlined)
    const titlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 600, line: 360 },
      children: [
        new TextRun({
          text: 'Certificate for reasonability of rate',
          bold: true,
          font: 'Arial',
          size: 28,
          underline: { type: UnderlineType.SINGLE }
        })
      ]
    });

    // Body Paragraph (Justified, 1.5 line spacing)
    const bodyPara = new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 0, after: 1200, line: 360 },
      children: [
        new TextRun({ text: 'This is to Certify that after subsequent process for purchase of ', font: 'Arial', size: 28 }),
        new TextRun({ text: itemName, font: 'Arial', size: 28 }),
        new TextRun({ text: ` Qty `, font: 'Arial', size: 28 }),
        new TextRun({ text: `${qty}`, font: 'Arial', size: 28 }),
        new TextRun({ text: ` No(s). , the L1 rate of Rs. `, font: 'Arial', size: 28 }),
        new TextRun({ text: `${l1Amount}`, font: 'Arial', size: 28 }),
        new TextRun({ text: ` from `, font: 'Arial', size: 28 }),
        new TextRun({ text: partyText, font: 'Arial', size: 28 }),
        new TextRun({ text: ` is found reasonable as per our market survey.`, font: 'Arial', size: 28 })
      ]
    });

    // Signature Block (Right-aligned)
    const signPara = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 1800, line: 360 },
      children: [
        new TextRun({
          text: 'Head of the Department',
          font: 'Arial',
          size: 28
        })
      ]
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 851, right: 758, bottom: 1440, left: 1440, header: 708, footer: 708 }
          }
        },
        children: [
          deptPara,
          titlePara,
          bodyPara,
          signPara
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

function numToGujaratiWords(amount) {
  const num = Math.round(parseFloat(amount || 0));
  if (num === 0) return 'શૂન્ય';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rem = num % 100;

  const parts = [];
  if (crore > 0) parts.push(`${crore} કરોડ`);
  if (lakh > 0) parts.push(`${lakh} લાખ`);
  if (thousand > 0) parts.push(`${thousand} હજાર`);
  if (hundred > 0) parts.push(`${hundred} સો`);
  if (rem > 0) parts.push(`${rem}`);
  return parts.join(' ');
}

class DOCDLPCMOM {
  /** DOC-27: DLPC Minutes of Meeting (MOM) matching exact official Gujarati format */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    let deptName = data.dept_name || agenda.dept_name || 'Department';
    if (!deptName.toLowerCase().includes('department') && deptName !== 'Department') {
      deptName = `${deptName} Department`;
    }

    const meetingRef = agenda.agenda_ref || data.meeting_ref || '..................';
    const meetingDate = agenda.agenda_date || (data.meeting_date ? fmtDate(data.meeting_date) : '..................');
    const itemName = agenda.item_name || data.item_name || '...........................................';
    const qty = agenda.qty || data.indent_qty || data.quantity || '...........';
    
    let partyName = agenda.l1_vendor || data.l1_vendor || '';
    if (partyName) {
      const addr = (data.vendor_address || '').trim();
      if (addr && !partyName.toLowerCase().includes(addr.toLowerCase())) {
        partyName += `, ${addr}`;
      } else if (!addr) {
        if (data.vendor_city && !partyName.toLowerCase().includes(data.vendor_city.toLowerCase())) {
          partyName += `, ${data.vendor_city}`;
        }
      }
    } else {
      partyName = 'Party Name, City';
    }

    const rawL1 = agenda.l1_amount || data.l1_amount || agenda.last_amount || data.est_cost || 0;
    const l1Amount = rawL1 ? `${parseFloat(rawL1).toLocaleString('en-IN')}` : '..........';
    const amountInWords = numToGujaratiWords(rawL1);

    // 1. College Header (Centered, Bold)
    const headerPara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({
          text: 'L.D College of Engineering, Ahmedabad',
          bold: true,
          font: 'Verdana',
          size: 28
        })
      ]
    });

    // 2. Top-Right Dept, DLPC No., DLPC Date
    const metaParas = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 40 },
        children: [new TextRun({ text: deptName, font: 'Shruti', size: 21 })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 40 },
        children: [new TextRun({ text: `DLPC No. ${meetingRef}`, font: 'Shruti', size: 21 })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
        children: [new TextRun({ text: `DLPC Date: ${meetingDate}`, font: 'Shruti', size: 21 })]
      })
    ];

    // 3. Gujarati Resolution Body
    const bodyPara = new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 100, after: 240, line: 360 },
      children: [
        new TextRun({
          text: `એલ.ડી. એન્જીનિયરીંગ કોલેજની વિવિધ વિદ્યાશાખામાં જરૂરી સાધન `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: itemName,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` Qty. `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: `${qty}`,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` No. ની ખરીદી બાબતે આંતરિક સમિતિ દ્વારા સાધનાના સ્પેસીફીકેશન તથા બીડની બોલીઓ અને શરતો નક્કી કરી GeM Portal ઉપર બીડ પ્રસિદ્ધ કરવામાં આવેલ. તબક્કાવારની ખરીદ પ્રક્રિયાને અંતે સૌથી ઓછા ભાવ આપતી l1 પેઢી `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: partyName,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` ના ભાવ રૂ.. `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: `${l1Amount}/-`,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` અંકે રૂપિયા `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: amountInWords,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` પુરા જીલ્લા કક્ષાની સત્તાધિકાર સમિતિ (DLPC) દ્વારા સર્વાનુમતે ખરીદી માટે માન્ય રાખવામાં આવેછે.`,
          font: 'Shruti',
          size: 22
        })
      ]
    });

    // 4. Committee Heading
    const commHeadingPara = new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({
          text: 'જીલ્લા કક્ષાની સત્તાધિકાર ખરીદ સમિતિ (DLPC):',
          bold: true,
          font: 'Shruti',
          size: 22
        })
      ]
    });

    // 5. Committee Table: 4 Columns (720, 5353, 1417, 2268 dxa)
    const committeeMembers = [
      ['૧', 'આચાર્યશ્રી,એલ.ડી. કોલેજ ઓફ એન્જી. ,અમદાવાદ.', 'અધ્યક્ષ'],
      ['૨', 'હિસાબી અધિકારીશ્રી જિલ્લા પંચાયત અમદાવાદ', 'સભ્ય'],
      ['૩', 'જિલ્લા ઉદ્યોગ કેન્દ્રના જનરલ મેનેજરશ્રી,અમદાવાદ', 'સભ્ય'],
      ['૪', 'હિસાબી અધિકારીશ્રી,એલ.ડી.કોલેજ ઓફ એન્જી., અમદાવાદ', 'સભ્ય સચિવ'],
      ['૫.૧', 'પ્રાધ્યાપક,મીકેનીકલ એન્જી., સ્ટોર અને ખરીદી શાખાનાં વડા', 'સભ્ય'],
      ['૫.૨', 'પ્રાધ્યાપક,કોમ્પ્યુટર એન્જી.', 'સભ્ય'],
      ['૫.૩', 'પ્રાધ્યાપક, સિવિલ એન્જી.', 'સભ્ય'],
      ['૫.૪', 'પ્રાધ્યાપક,કેમિકલ એન્જી.', 'સભ્ય'],
      ['૫.૫', 'પ્રાધ્યાપક, ઈલેક્ટ્રીકલ એન્જી.', 'સભ્ય'],
      ['૫.૬', 'સહપ્રાધ્યાપક, મીકેનીકલ એન્જી. , સ્ટોર ઓફિસર', 'સભ્ય'],
      ['૫.૭', 'સહપ્રાધ્યાપક, ટેક્ષટાઈલ ટેકનોલોજી, સ્ટોર ઓફિસર', 'સભ્ય']
    ];

    const tableRows = committeeMembers.map(([sr, designation, role]) => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 720, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: sr, font: 'Shruti', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 5353, type: WidthType.DXA },
            children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: designation, font: 'Shruti', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 1417, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: role, font: 'Shruti', size: 20 })] })]
          }),
          new TableCell({
            width: { size: 2268, type: WidthType.DXA },
            children: [new Paragraph({ text: '', spacing: { before: 40, after: 40 } })]
          })
        ]
      });
    });

    const commTable = new Table({
      width: { size: 9758, type: WidthType.DXA },
      columnWidths: [720, 5353, 1417, 2268],
      rows: tableRows
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 993, right: 849, bottom: 1440, left: 1440, header: 708, footer: 708 }
          }
        },
        children: [
          headerPara,
          ...metaParas,
          bodyPara,
          commHeadingPara,
          commTable
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCChecklistB {
  /** DOC-28: Checklist B – Final Approval (Check list–B-R3) matching exact LDCE format */
  static async generate(data = {}) {
    // 1. College Header
    const collegePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 140 },
      children: [
        new TextRun({
          text: 'L.D College of Engineering, Ahmedabad',
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          font: 'Times New Roman',
          size: 26
        })
      ]
    });

    // 2. Main Title: Check list–B-R3
    const titlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({
          text: 'Check list–B-R3',
          bold: true,
          font: 'Times New Roman',
          size: 32
        })
      ]
    });

    // 3. Subtitle: (For final approval)
    const subtitlePara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: '(For final approval)',
          bold: true,
          font: 'Times New Roman',
          size: 24
        })
      ]
    });

    // 4. Intro text: The File contains following documents.
    const introPara = new Paragraph({
      spacing: { before: 100, after: 140 },
      children: [
        new TextRun({
          text: 'The File contains following documents.',
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    // 17 Checklist Items matching the official template image
    const items = [
      '1.  MOM for DLPC',
      '2.  Agenda for DLPC (Additional Document) -02 Copies',
      '3.  GeM Agenda note',
      '4.  EMD/e-PBG details (in case of bid)',
      '5.  MSE exemption certificate & MII certificate of L1',
      '6.  Certificate for reasonability of rate.',
      '7.  GeM generated L1 details  after RA',
      '8.  GeM generated L1 details  before RA',
      '9.  Details of financial statement generated from GeM',
      '10. Final Scrutiny report',
      '11. All scrutinized documents of L1 vender',
      '12. Document of reasons for disqualified',
      '13. Technical Scrutiny report generated from GeM',
      '14. Qualifying status generated from GeM',
      '15. Details of participant generated from GeM',
      '16. Copy of published bid',
      '17. Documents as per Check list-A or C'
    ];

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

    const tableRows = items.map(itemText => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 8500, type: WidthType.DXA },
            borders: noneBorders,
            children: [
              new Paragraph({
                spacing: { before: 30, after: 30 },
                children: [
                  new TextRun({
                    text: itemText,
                    font: 'Times New Roman',
                    size: 21
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

    const checklistTable = new Table({
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

    // Declaration statement
    const statementPara = new Paragraph({
      spacing: { before: 240, after: 240 },
      children: [
        new TextRun({
          text: 'I have checked that the above documents are signed and stamp by the concerned officers & there is no any missing in the file.',
          font: 'Times New Roman',
          size: 21
        })
      ]
    });

    // Signature 1: Sign: Dept. Representative
    const repSignPara = new Paragraph({
      spacing: { before: 240, after: 280 },
      children: [
        new TextRun({
          text: 'Sign: Dept. Representative',
          bold: true,
          font: 'Times New Roman',
          size: 22
        })
      ]
    });

    // Signature 2 Table / Row: Name (Left) ... HOD, Sign & Stamp (Right)
    const signTable = new Table({
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
                  spacing: { before: 240 },
                  children: [new TextRun({ text: 'Name', bold: true, font: 'Times New Roman', size: 22 })]
                })
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noneBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 240 },
                  children: [new TextRun({ text: 'HOD, Sign & Stamp', bold: true, font: 'Times New Roman', size: 22 })]
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
            size: { width: 12240, height: 15840 },
            margin: { top: 284, right: 900, bottom: 568, left: 1701, header: 708, footer: 277 }
          }
        },
        children: [
          collegePara,
          titlePara,
          subtitlePara,
          introPara,
          checklistTable,
          statementPara,
          repSignPara,
          signTable
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCDirectPurchaseNote {
  /** DOC-29: Note – Direct Purchase Against Bid matching exact official Gujarati format */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    let deptName = data.dept_name || agenda.dept_name || 'મિકેનિકલ એન્જી.';
    if (deptName.toLowerCase().endsWith('department')) {
      deptName = deptName.replace(/department/i, '').trim();
    }

    const meetingDate = agenda.agenda_date || (data.meeting_date ? fmtDate(data.meeting_date) : fmtDate(new Date()));
    const finYear = data.fin_year || agenda.fin_year || '૨૦૨૩-૨૪';
    const itemName = agenda.item_name || data.item_name || 'સાધન';
    const qty = agenda.qty || data.indent_qty || data.quantity || '01';
    
    let l1Vendor = agenda.l1_vendor || data.l1_vendor || 'L1 Vendor';
    const rawL1 = agenda.l1_amount || data.l1_amount || 0;
    const l1Amount = rawL1 ? `${parseFloat(rawL1).toLocaleString('en-IN')}` : '૨૩,૩૫૦';
    
    const rawEst = agenda.est_cost || data.est_cost || 0;
    const estCost = rawEst ? `${parseFloat(rawEst).toLocaleString('en-IN')}` : '૪૫,૦૦૦';

    // Top Right Block
    const metaParas = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: deptName, font: 'Shruti', size: 22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 40 },
        children: [new TextRun({ text: 'એલ.ડી કોલેજ ઓફ એન્જી., અમદાવાદ', font: 'Shruti', size: 22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 280 },
        children: [new TextRun({ text: `તા.${meetingDate}`, font: 'Shruti', size: 22 })]
      })
    ];

    // Left Heading
    const headingPara = new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 100, after: 140 },
      children: [
        new TextRun({
          text: 'સાદર રજુ:',
          bold: true,
          font: 'Shruti',
          size: 22
        })
      ]
    });

    // Gujarati Resolution Body
    const bodyPara = new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 60, after: 400, line: 360 },
      children: [
        new TextRun({
          text: `અત્રેની સંસ્થા ખાતે વિકાસલક્ષી યોજના-${finYear} અંતર્ગત નવી બાબત હેઠળની સાધન સામગ્રીની ખરીદી અન્વયે `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: deptName,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` વિદ્યાશાખામાં જરૂરી સાધન `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: itemName,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` - `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: `${qty} No.`,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` ખરીદવા GeM Portal પર બીડ પ્રસિદ્ધ કરવામાં આવેલ. તબક્કાવારની પ્રક્રિયાને અંતે લાયક ઠરેલ પેઢીઓના ભાવ ખોલતા સૌથી ઓછા L1 ભાવ રૂ. `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: `${l1Amount}/-`,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` આપનાર પેઢી તરીકે `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: l1Vendor,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` લાયક ઠરેલ છે. સદર આઈટમની અંદાજીત કિંમત રૂ.`,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: `${estCost}/-`,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` આંકવામાં આવી હતી પરંતુ L1 ભાવ રૂ.૨૫ હજારની મર્યાદામાં આવેલ હોવાથી સરકારશ્રીના પ્રવર્તમાન નિયમોનુસર રૂ. ૨૫ હજાર સુધીની ખરીદી માટે સંસ્થા સ્તરેથી નોંધ મંજુર કરી ખરીદાદેશ આપી શકાય તેમછે. પ્રસ્તુત બાબતે L1 રૂ. `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: `${l1Amount}/-`,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` ના ભાવે `,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: l1Vendor,
          bold: true,
          font: 'Shruti',
          size: 22
        }),
        new TextRun({
          text: ` ને ખરીદાદેશ આપવા મંજુરી અર્થે રજુ કરેલ છે.`,
          font: 'Shruti',
          size: 22
        })
      ]
    });

    // Left-aligned Signatures with spacing
    const signParas = [
      new Paragraph({
        spacing: { before: 400, after: 360 },
        children: [new TextRun({ text: 'Store Officer', font: 'Times New Roman', size: 22 })]
      }),
      new Paragraph({
        spacing: { before: 360, after: 440 },
        children: [new TextRun({ text: 'Head, Purchase & Store', font: 'Times New Roman', size: 22 })]
      }),
      new Paragraph({
        spacing: { before: 440, after: 100 },
        children: [new TextRun({ text: 'Principal', font: 'Times New Roman', size: 22 })]
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 709, right: 616, bottom: 1440, left: 1440, header: 708, footer: 708 }
          }
        },
        children: [
          ...metaParas,
          headingPara,
          bodyPara,
          ...signParas
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

class DOCGeMDLPCAgenda {
  /** DOC-25A: GeM Agenda Format – DLPC matching exact 9-point Gujarati Word template */
  static async generate(data = {}) {
    let agenda = data.agenda_data || {};
    if (typeof agenda === 'string') {
      try { agenda = JSON.parse(agenda); } catch (_) {}
    }

    const finYear = agenda.gem_fin_year || data.fin_year || agenda.fin_year || '૨૦૨૬ -૨૭';
    const meetingRef = agenda.gem_meeting_ref || agenda.agenda_ref || data.meeting_ref || '____';
    const meetingDate = agenda.gem_meeting_date || agenda.agenda_date || (data.meeting_date ? fmtDate(data.meeting_date) : '_____');

    let deptName = agenda.gem_dept_name || data.dept_name || agenda.dept_name || 'ઇન્ફોર્મેશન ટેકનોલોજી';
    if (deptName.toLowerCase().endsWith('department')) {
      deptName = deptName.replace(/department/i, '').trim();
    }

    const itemName = agenda.gem_item_name || agenda.item_name || data.item_name || 'સાધન સામગ્રી';
    const qty = agenda.gem_qty || agenda.qty || data.indent_qty || data.quantity || '01';
    const estCost = agenda.gem_est_cost || agenda.est_cost || (data.est_cost ? parseFloat(data.est_cost).toLocaleString('en-IN') : 'xx,xx,xxx');
    const adminApproval = agenda.gem_admin_approval || agenda.admin_approval || '૧) સીટીઈ / નબા ૨૦૨૬ - ૨૭ / ટીઈડી - ૫ / Non-IT Infra./ છ ( આ )\n૨) સીટીઈ / નબા ૨૦૨૬ - ૨૭ / ટીઈડી - ૧૧ / Non-IT Infra./ છ ( આ ) તા.૨૦/૦૫/૨૦૨૬\n3) તા.........................ની નોંધ ઉપર આચાર્યશ્રીની મંજુરી મળેલ છે.';
    const grantAvailability = agenda.gem_grant_avail || agenda.grant_avail || 'ગ્રાન્ટ ઉપલબ્ધ છે.';
    
    const internalComm = agenda.gem_internal_comm || agenda.internal_comm || 'LDCE/Pur/Dept/Committee/2026-27/1664 dt. 14/05/2026';
    const specsDetermined = agenda.gem_specs_det || agenda.specs_det || 'હા , નકલ સામેલ છે.';
    const specsMatching = agenda.gem_specs_gem_match || agenda.specs_gem_match || 'હા, સમિતિએ નક્કી કર્યા મુજબના છે.';
    const preQualTerms = agenda.gem_pre_qual_terms || agenda.pre_qual_terms || 'હા , નકલ સામેલ છે.';
    const disqualDetails = agenda.gem_disqual_details || agenda.disqual_details || (data.disqualified_count ? `${data.disqualified_count} પેઢી(ઓ) અમાન્ય થયેલ છે.` : 'લાગુ પડતું નથી');

    // 5(A)
    const compL1 = agenda.gem_comp_l1 || agenda.comp_l1 || 'પેઢી : લાગુ પડતું નથી\nભાવ : લાગુ પડતું નથી';
    const compCount = agenda.gem_comp_count || agenda.comp_count || 'લાગુ પડતું નથી';

    const l1Vendor = agenda.gem_l1_vendor || agenda.l1_vendor || data.l1_vendor || 'L1 Vendor Name';
    const l1Amount = agenda.gem_l1_amount || agenda.l1_amount || (data.l1_amount ? parseFloat(data.l1_amount).toLocaleString('en-IN') : 'xx,xx,xxx');
    const partCount = agenda.gem_part_count || agenda.part_count || (data.total_participants ? `${data.total_participants} પેઢીઓ` : '03 પેઢીઓ');
    const bidDays = agenda.gem_bid_days || agenda.bid_duration || '૧૧ દિવસ';

    const raL1 = agenda.gem_ra_l1 || agenda.ra_l1 || 'પેઢી : લાગુ પડતું નથી\nભાવ : લાગુ પડતું નથી';
    const raCount = agenda.gem_ra_count || agenda.ra_count || 'લાગુ પડતું નથી';
    const raDays = agenda.gem_ra_days || agenda.ra_duration || 'લાગુ પડતું નથી';

    // 5(B)
    const finalL1Vendor = agenda.gem_final_l1_vendor || l1Vendor;
    const unitPrice = agenda.gem_unit_price || agenda.unit_price || l1Amount;
    const finalQty = agenda.gem_final_qty || qty;
    const finalL1Amount = agenda.gem_final_l1_amount || l1Amount;
    const prevPurch = agenda.gem_prev_purchase || agenda.prev_purchase || `ખરીદ ભાવ : Rs. -\nજ્થ્થો : -\nબીડર પેઢીનું નામ : -`;

    // 6 PAC
    const pac1 = agenda.gem_pac_1 || agenda.pac_1 || 'ના\nના';
    const pac2 = agenda.gem_pac_2 || agenda.pac_2 || 'લાગુ પડતું નથી';
    const pac3 = agenda.gem_pac_3 || agenda.pac_3 || 'લાગુ પડતું નથી';
    const pac4 = agenda.gem_pac_4 || agenda.pac_4 || 'લાગુ પડતું નથી';
    const pac5 = agenda.gem_pac_5 || agenda.pac_5 || 'લાગુ પડતું નથી';
    const pac6 = agenda.gem_pac_6 || agenda.pac_6 || 'લાગુ પડતું નથી';
    const pac7 = agenda.gem_pac_7 || agenda.pac_7 || 'લાગુ પડતું નથી';

    // 7, 8, 9
    const reps = agenda.gem_representations || agenda.representations || 'કોઈ રજુઆત મળેલ નથી.';
    const inspectMethod = agenda.gem_inspect_method || agenda.inspect_method || 'તજજ્ઞ સમિતિ દ્વારા ઇન્સ્પેકસન કરવામાં આવે છે.';
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
          text: `વર્ષ: ${finYear}`,
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
          new TextRun({ text: 'DLPC No. ', bold: true, color: 'FF0000', font: 'Shruti', size: 22 }),
          new TextRun({ text: meetingRef, bold: true, underline: {}, color: '0000FF', font: 'Shruti', size: 22 })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: 'તારીખ: ', bold: true, font: 'Shruti', size: 22 }),
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
      makeRow('૨ .', 'ખરીદીનો પ્રકાર ( સામાન્ય / બ્રાન્ડેડ ( PAC))', ':', agenda.purchase_type || 'સામાન્ય'),
      // 3 Header
      makeRow('૩ .', 'ખરીદી હેઠળની ચીજવસ્તુ', '', ''),
      makeRow('', '(૧) નામ', ':', itemName),
      makeRow('', '(૨) જથ્થો', ':', qty),
      makeRow('', '(૩) અંદાજીત કિંમત', ':', `Rs. ${estCost}/-`),
      makeRow('', '(૪) સરકારશ્રીની વહીવટી મંજૂરીનો ક્રમાંક અને તારીખ', ':', adminApproval),
      makeRow('', '(૫) ખરીદી માટે જરૂરી ગ્રાન્ટ ઉપલબ્ધતાની વિગત', ':', grantAvailability),
      // 4 Header
      makeRow('૪ .', 'ખરીદવાની ચીજવસ્તુઓની પસંદગી પ્રક્રિયા', '', ''),
      makeRow('', '૧ ) આંતરિક કમિટીની રચના અંગેની વિગત', ':', internalComm),
      makeRow('', '૨ ) આંતરિક કમિટી દ્વારા ચીજવસ્તુઓના ટેક્નીકલ સ્પેસીફીકેશન નક્કી કરેલ છે કે કેમ ? ( નકલ જોડવી)', ':', specsDetermined),
      makeRow('', '૩ ) GeM પર રાખેલ ટેકનિકલ સ્પેશીફિકેશન કમિટીએ નક્કી કર્યા મુજબના છે કે કેમ તેની વિગત', ':', specsMatching),
      makeRow('', '૪ ) GeM પર બીડીંગ માટે બીડર પેઢીના પૂર્વ લાયકાતના ધોરણો કે અન્ય શરતો રાખેલ હોય તો તેની વિગતો ( નકલ જોડવી)', ':', preQualTerms),
      makeRow('', '૫ ) કચેરીએ બીડીંગ માટે પ્રાથમિક/ટેક્નીકલ ચકાસણીમાં કોઇ પેઢીઓને અમાન્ય કરેલ છે કે કેમ તેની વિગત જો કોઇ બીડરપેઢીને અમાન્ય કરેલ હોય તો અમાન્ય કરવાના કારણોની વિગતો .', ':', disqualDetails),
      // 5 (અ) Header
      makeRow('૫ (અ)', 'GeM પર ખરીદી માટે અપનાવેલ પધ્ધતિ', '', '', true),
      makeRow('૧)', '૧.૧ GeM પર સરખામણી ( Comparison) કર્યા બાદ GeM Recommended L1 પેઢીનું નામ તથા મળેલ ભાવ', ':', compL1),
      makeRow('', '૧.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)', ':', compCount),
      makeRow('૨ )', '૨.૧ GeM પર બીડીંગ કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ', ':', `પેઢી : ${l1Vendor}\nભાવ : Rs. ${l1Amount}/-`),
      makeRow('', '૨.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)', ':', partCount),
      makeRow('', '૨.૩ બીડીંગનો સમયગાળો ઓછામાં ઓછો ૭ ( સાત ) દિવસ છે કે કેમ ?', ':', bidDays),
      makeRow('૩ )', '૩.૧ રીવર્સ ઓક્શન કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ', ':', raL1),
      makeRow('', '૩.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)', ':', raCount),
      makeRow('', '૩.૩ રીવર્સ ઓક્શનનો સમયગાળો', ':', raDays),
      // 5 (બ) Header
      makeRow('૫ . (બ)', 'GeM પર ખરીદી ની આખરી વિગતો', '', '', true),
      makeRow('', '૧ ) L1 પેઢીનું નામ', ':', l1Vendor),
      makeRow('', '૨) મળેલ ભાવ (પ્રતિ નંગ)', ':', `Rs. ${unitPrice}/-`),
      makeRow('', '૩) જથ્થો', ':', qty),
      makeRow('', '૪) કુલ કિંમત', ':', `Rs. ${l1Amount}/-`),
      makeRow('', '૫) અગાઉ કરેલ ખરીદીની વિગત', ':', prevPurch),
      // 6 Header
      makeRow('૬.', 'બ્રાન્ડેડ / PAC આધારે ખરીદી હોય તો :', '', '', true),
      makeRow('', '૧ ) ખરીદી હેઠળની ચીજ - વસ્તુ GeM પર PAC આઇટમ તરીકે વર્ગીકૃત થયેલ છે અથવા PAC આઇટમ તરીકે ખરીદવાની માંગણી છે.', ':', pac1),
      makeRow('', '૨ ) PAC સર્ટીફિકેટની વિગત ( નકલ જોડવી)', ':', pac2),
      makeRow('', '૩ ) સપ્લાયરનું નામ અને સરનામું', ':', pac3),
      makeRow('', '૪ ) મળેલ ભાવ ( પ્રતિ નંગ )', ':', pac4),
      makeRow('', '૫ ) જથ્થો', ':', pac5),
      makeRow('', '૬ ) કુલ કિંમત', ':', pac6),
      makeRow('', '૭ ) ભાવ નું વ્યાજબીપણું (Reasonability) ની વિગત (૧) માર્કેટ સર્વેની વિગતો (૨) અગાઉની ખરીદી ની વિગતો', ':', pac7),
      // 7, 8, 9
      makeRow('૭ .', 'ખરીદી/ બીડીંગ દરમિયાન મળેલ રજુઆતોની વિગત', ':', reps),
      makeRow('૮ .', 'ચીજ - વસ્તુ મળ્યા બાદ તે ટેકનીકલ સ્પેશીફિકેશન મુજબ છે કે કેમ ? તેની ચકાસણી માટે પધ્ધતિ નિયત કરેલ હોય તો તેની વિગતો', ':', inspectMethod),
      makeRow('૯.', 'રીમાર્ક્સ/વિશેષ નોંધ', ':', specialRemarks)
    ];

    const table = new Table({
      width: { size: 10000, type: WidthType.DXA },
      columnWidths: [650, 4800, 300, 4250],
      rows
    });

    const footerParas = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 500, after: 200 },
        children: [new TextRun({ text: 'વિદ્યાશાખા / ઓફીસના વડા', bold: true, font: 'Shruti', size: 22 })]
      }),
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: 'બિડાણ : ઉપર દર્શાવેલ વિગતોના ઉપલબ્ધ આધાર / પુરાવાની નકલો જોડવાની રહે છે .', font: 'Shruti', size: 20 })]
      })
    ];

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
          ...footerParas
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

module.exports = { DOCScrutinyReport, DOCDisqualificationSheet, DOCDLPCAgenda, DOCGeMDLPCAgenda, DOCRateReasonability, DOCDLPCMOM, DOCChecklistB, DOCDirectPurchaseNote };
