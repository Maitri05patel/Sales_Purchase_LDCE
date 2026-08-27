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

export const api = {
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

  // Dashboard
  getDashboardMetrics: () => fetchApi('/dashboard/metrics'),
};
