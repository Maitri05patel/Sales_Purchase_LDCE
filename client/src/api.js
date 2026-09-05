const API_BASE = 'http://localhost:5000/api';

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'API Request Failed');
  }
  return data;
}
const DOC_DEFAULT_NAMES = {
  'DOC-01': '1. Statement 1_Non-IT Equipments',
  'DOC-02': '2. Statement 2_IT Equipment',
  'DOC-03': '3. Statement 3_Furniture',
  'DOC-04': '4. Statement 4_Books',
  'DOC-05': '5. Statement 5_Maintenance',
  'DOC-06': '6. Summary_IT Items',
  'DOC-07': '7. CTE Consolidated Summary',
  'DOC-08': 'Order - Dept. Representatives',
  'DOC-09': 'Order - Expert Committees',
  'DOC-10': 'Order - Special Committees',
  'DOC-11': 'Note for Change in Committee',
  'DOC-12': 'Purchase Indent (Govt. Fund)',
  'DOC-13': 'Purchase Indent (Non-Govt. Fund)',
  'DOC-14': 'Technical Specification Sheet',
  'DOC-15': 'Additional Terms and Conditions (ATC)',
  'DOC-16': 'General GeM Guidelines Sheet',
  'DOC-17': 'Note for Purchase - New Item',
  'DOC-18': 'Note for Purchase - Other Items',
  'DOC-19': 'Checklist A - Pre-Bid Verification',
  'DOC-20': 'Checklist C - Custom Bid or BOQ',
  'DOC-21': 'EMD Refund Letter',
  'DOC-22': 'Note for Security Deposit (e-PBG)',
  'DOC-23': 'Bid Scrutiny Evaluation Report',
  'DOC-24': 'Reasons for Disqualification Sheet',
  'DOC-25': 'DLPC Agenda & Proposal',
  'DOC-26': 'DLPC Rate Reasonability Certificate',
  'DOC-27': 'DLPC Minutes of Meeting (MOM)',
  'DOC-28': 'Checklist B - Final Approval',
  'DOC-29': 'Note - Direct Purchase Against Bid',
  'DOC-30': 'DPC Proposal Document Index',
  'DOC-31': 'DPC Forwarding Letter to Principal',
  'DOC-32': 'GeM Agenda Format - DPC',
  'DOC-33': 'Institute BID Certificate',
  'DOC-34': 'L1 INFO Sheet for DPC',
  'DOC-35': 'DPC Minutes of Meeting (MOM)',
  'DOC-36': 'Department Material Receipt Note',
  'DOC-37': 'Technical Inspection Report',
  'DOC-38': 'Pass for Payment Voucher',
  'DOC-39': 'Checklist D & E - Bill Verification',
  'DOC-40': 'Procurement Progress Status Report',
  'DOC-41': 'Inquiry Letter (Non-GeM)',
  'DOC-42': 'Comparative Statement',
  'DOC-43': 'Purchase Order (Non-GeM)',
  'DOC-44': 'Repairable Equipment Register',
  'DOC-45': 'Note for Approval of Repairing',
  'DOC-46': 'Work Order (Repairing)',
  'DOC-47': 'Pass for Payment (Repairing)',
};

export async function downloadDocument(docId, entityId, extraParams = {}) {
  const params = new URLSearchParams({ ...(entityId ? { entityId } : {}), ...extraParams }).toString();
  const url = `${API_BASE}/documents/${docId}${params ? '?' + params : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    let errorMessage = 'Failed to generate document';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch(e) {}
    throw new Error(errorMessage);
  }

  // Extract filename from Content-Disposition header if present
  let filename = '';
  const disposition = response.headers.get('Content-Disposition') || response.headers.get('content-disposition');
  if (disposition) {
    const matchUtf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (matchUtf8 && matchUtf8[1]) {
      try {
        filename = decodeURIComponent(matchUtf8[1].trim());
      } catch (e) {}
    }
    if (!filename) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) filename = match[1].trim();
    }
  }

  // Fallback if header could not be read
  if (!filename) {
    const isXlsx = extraParams.format === 'xlsx' || (!extraParams.format && docId === 'DOC-01');
    const ext = isXlsx ? 'xlsx' : 'docx';
    const baseName = DOC_DEFAULT_NAMES[docId] || `Document_${docId}`;
    let suffix = '';
    if (extraParams.fin_year && ['DOC-01', 'DOC-02', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-06', 'DOC-07', 'DOC-08', 'DOC-09', 'DOC-10'].includes(docId)) {
      suffix = `_${extraParams.fin_year}`;
    } else if (entityId && entityId !== '0') {
      suffix = `_${entityId}`;
    }
    filename = `${baseName}${suffix}.${ext}`;
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export async function downloadTemplate(templatePath) {
  const url = `${API_BASE}/documents/template?path=${encodeURIComponent(templatePath)}`;
  const response = await fetch(url);
  if (!response.ok) {
    let errorMessage = 'Failed to generate template';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch(e) {}
    throw new Error(errorMessage);
  }
  
  let filename = '';
  const disposition = response.headers.get('Content-Disposition') || response.headers.get('content-disposition');
  if (disposition) {
    const matchUtf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (matchUtf8 && matchUtf8[1]) {
      try {
        filename = decodeURIComponent(matchUtf8[1].trim());
      } catch (e) {}
    }
    if (!filename) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) filename = match[1].trim();
    }
  }
  if (!filename) {
    filename = templatePath.replace(/\\/g, '/').split('/').pop() || 'GeneratedDocument.docx';
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export const api = {
  downloadDocument,
  downloadTemplate,
  // Masters
  getDepartments: () => fetchApi('/masters/departments'),
  getUsers: () => fetchApi('/masters/users'),
  getCommittees: () => fetchApi('/masters/committees'),
  createDepartment: (data) => fetchApi('/masters/departments', { method: 'POST', body: data }),

  // CTE Demands
  getCteDemands: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/cte/demands?${query}`);
  },
  createCteDemand: (data) => fetchApi('/cte/demands', { method: 'POST', body: data }),
  getCteSummary: () => fetchApi('/cte/summary'),

  // Indents & Note Sheets
  getIndents: () => fetchApi('/indents'),
  createIndent: (data) => fetchApi('/indents', { method: 'POST', body: data }),
  getIndentFull: (id) => fetchApi(`/indents/${id}/full`),
  saveSpecs: (id, data) => fetchApi(`/indents/${id}/specs`, { method: 'POST', body: data }),
  saveAtc: (id, data) => fetchApi(`/indents/${id}/atc`, { method: 'POST', body: data }),
  saveNoteSheet: (id, data) => fetchApi(`/indents/${id}/note-sheet`, { method: 'POST', body: data }),
  getDocxNoteUrl: (id) => `${API_BASE}/indents/${id}/docx-note`,

  // Financial Ledger
  getFinancialInstruments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/financial/instruments?${query}`);
  },
  createFinancialInstrument: (data) => fetchApi('/financial/instruments', { method: 'POST', body: data }),

  // Scrutiny & Bids
  getBids: () => fetchApi('/scrutiny/bids'),
  createBid: (data) => fetchApi('/scrutiny/bids', { method: 'POST', body: data }),
  getEvaluations: (bidId) => fetchApi(`/scrutiny/evaluations/${bidId}`),
  createEvaluation: (data) => fetchApi('/scrutiny/evaluations', { method: 'POST', body: data }),

  // Committee Meetings (DLPC/DPC)
  getMeetings: () => fetchApi('/committee/meetings'),
  createMeeting: (data) => fetchApi('/committee/meetings', { method: 'POST', body: data }),

  // Delivery & Pass for Payment
  getOrders: () => fetchApi('/delivery/orders'),
  createInspection: (data) => fetchApi('/delivery/inspections', { method: 'POST', body: data }),
  createVoucher: (data) => fetchApi('/delivery/vouchers', { method: 'POST', body: data }),
  getVouchers: () => fetchApi('/delivery/vouchers'),

  // Repairs
  getRepairs: () => fetchApi('/repairs/requests'),
  createRepair: (data) => fetchApi('/repairs/requests', { method: 'POST', body: data }),

  // Documents
  getDocumentCatalog: () => fetchApi('/documents'),

  // Dashboard
  getDashboardMetrics: () => fetchApi('/dashboard/metrics'),
};
