import { api } from './api.js';
import { Chart, registerables } from 'chart.js';
import ldceLogoImg from './assets/ldce_logo.png';
import gandhiLogoImg from './assets/gandhi_150_logo.png';
Chart.register(...registerables);

let activeRepairsTab = 'register';
let activePassForPaymentType = 'non_gem';
let activePoType = 'purchase_order';
let poFormItems = [
  { item_name: '', unit_rate: '', qty: '', total_amount: '' }
];

window.handleDownloadDoc = async (docId, entityId, extra = {}) => {
  try {
    await api.downloadDocument(docId, entityId, extra);
  } catch (err) {
    alert('Error downloading document: ' + err.message);
  }
};

function numToGujaratiWords(amount) {
  const num = Math.round(parseFloat(amount || 0));
  if (num === 0) return 'શૂન્ય રૂપિયા પુરા';

  const ones = [
    '', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ', 'દસ',
    'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ', 'વીસ',
    'એકવીસ', 'બાવીસ', 'તેવીસ', 'ચોવીસ', 'પચ્ચીસ', 'છવીસ', 'સત્તાવીસ', 'અઠ્ઠાવીસ', 'ઓગણત્રીસ', 'ત્રીસ',
    'એકત્રીસ', 'બત્રીસ', 'તેત્રીસ', 'ચોત્રીસ', 'પાંત્રીસ', 'છત્રીસ', 'સાડત્રીસ', 'ઓગણચાલીસ', 'ચાલીસ',
    'એકતાલીસ', 'બેતાલીસ', 'તેતાલીસ', 'ચુમ્માલીસ', 'પિસ્તાલીસ', 'છેતાલીસ', 'સુડતાલીસ', 'અડતાલીસ', 'ઓગણપચાસ', 'પચાસ',
    'એકાવન', 'બાવન', 'ત્રેપન', 'ચોપન', 'પંચાવન', 'છપ્પન', 'સત્તાવન', 'અઠ્ઠાવન', 'ઓગણસાઠ', 'સાઠ',
    'એકસઠ', 'બાસઠ', 'ત્રેસઠ', 'ચોસઠ', 'પાંસઠ', 'છાસઠ', 'સડસઠ', 'અડસઠ', 'ઓગણસિત્તેર', 'સિત્તેર',
    'એકોતેર', 'બોતેર', 'તોતેર', 'ચોતેર', 'પંચોતેર', 'છોતેર', 'સંતોતેર', 'ઇઠોતેર', 'ઓગણાએંસી', 'એંસી',
    'એક્યાસી', 'બ્યાસી', 'ત્યાસી', 'ચોર્યાસી', 'પંચાસી', 'છ્યાસી', 'સિત્યાસી', 'અઠ્યાસી', 'નેવ્યાસી', 'નેવું',
    'એકાણું', 'બાણું', 'ત્રાણું', 'ચોરાણું', 'પંચાણું', 'છન્નું', 'સત્તાણું', 'અઠ્ઠાણું', 'નવાણું'
  ];

  function twoDigits(n) {
    if (n < 100) return ones[n] || '';
    return '';
  }

  let n = num;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  const rem = n % 100;

  const parts = [];
  if (crore > 0) parts.push(`${twoDigits(crore)} કરોડ`);
  if (lakh > 0) parts.push(`${twoDigits(lakh)} લાખ`);
  if (thousand > 0) parts.push(`${twoDigits(thousand)} હજાર`);
  if (hundred > 0) parts.push(`${hundred === 1 ? 'એકસો' : (ones[hundred] + ' સો')}`);
  if (rem > 0) parts.push(`${twoDigits(rem)}`);
  return (parts.join(' ') + ' રૂપિયા પુરા').trim();
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

window.downloadTemplate = async (templatePath) => {
  try {
    await api.downloadTemplate(templatePath);
  } catch (err) {
    alert('Error downloading template: ' + err.message);
  }
};

// Current User Persona State (For Faculty Review & Demo)
let currentRole = localStorage.getItem('ldce_user_role') || 'Principal';

const ROLES = [
  'Principal',
  'StoreOfficer',
  'HOD',
  'DeptRep',
  'ExpertMember',
  'AccountsOfficer',
  'DLPCMember'
];

// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) ENGINE
// Access levels: hidden | view | create | approve | manage
// ============================================================
const ROLE_PERMISSIONS = {
  Principal: {
    dashboard: 'view',
    masters: 'view',
    cte: 'approve',
    indents: 'approve',
    notes: 'approve',
    financial: 'manage',
    scrutiny: 'view',
    committee: 'approve',
    delivery: 'view',
    repairs: 'view',
    templates: 'view',
    documents: 'view',
  },
  StoreOfficer: {
    dashboard: 'view',
    masters: 'manage',
    cte: 'view',
    indents: 'create',
    notes: 'create',
    financial: 'manage',
    scrutiny: 'create',
    committee: 'create',
    delivery: 'manage',
    repairs: 'manage',
    templates: 'view',
    documents: 'manage',
  },
  HOD: {
    dashboard: 'view',
    masters: 'create',
    cte: 'create',
    indents: 'create',
    notes: 'approve',
    financial: 'hidden',
    scrutiny: 'approve',
    committee: 'view',
    delivery: 'approve',
    repairs: 'hidden',
    templates: 'view',
    documents: 'view',
  },
  DeptRep: {
    dashboard: 'view',
    masters: 'view',
    cte: 'create',
    indents: 'create',
    notes: 'create',
    financial: 'hidden',
    scrutiny: 'view',
    committee: 'hidden',
    delivery: 'create',
    repairs: 'hidden',
    templates: 'view',
    documents: 'view',
  },
  ExpertMember: {
    dashboard: 'hidden',
    masters: 'view',
    cte: 'view',
    indents: 'create',
    notes: 'hidden',
    financial: 'hidden',
    scrutiny: 'create',
    committee: 'view',
    delivery: 'create',
    repairs: 'hidden',
    templates: 'view',
    documents: 'view',
  },
  AccountsOfficer: {
    dashboard: 'view',
    masters: 'view',
    cte: 'hidden',
    indents: 'hidden',
    notes: 'view',
    financial: 'manage',
    scrutiny: 'hidden',
    committee: 'view',
    delivery: 'manage',
    repairs: 'hidden',
    templates: 'view',
    documents: 'view',
  },
  DLPCMember: {
    dashboard: 'view',
    masters: 'hidden',
    cte: 'hidden',
    indents: 'hidden',
    notes: 'hidden',
    financial: 'hidden',
    scrutiny: 'view',
    committee: 'approve',
    delivery: 'hidden',
    repairs: 'hidden',
    templates: 'view',
    documents: 'view',
  }
};

// RBAC Helper Functions
function getAccessLevel(route) {
  return ROLE_PERMISSIONS[currentRole]?.[route] || 'hidden';
}

function canAccess(route) {
  return getAccessLevel(route) !== 'hidden';
}

function canCreate(route) {
  const level = getAccessLevel(route);
  return level === 'create' || level === 'manage' || level === 'approve';
}

function canApprove(route) {
  const level = getAccessLevel(route);
  return level === 'approve';
}

function canManage(route) {
  return getAccessLevel(route) === 'manage';
}

function getAccessLabel(route) {
  const labels = {
    hidden: 'No Access',
    view: 'Read Only',
    create: 'Create & Submit',
    approve: 'Review & Approve',
    manage: 'Full Access'
  };
  return labels[getAccessLevel(route)] || 'No Access';
}

function renderAccessBanner(route) {
  const level = getAccessLevel(route);
  const label = getAccessLabel(route);
  const roleLabel = formatRoleName(currentRole);
  if (level === 'view') {
    return `<div class="access-banner access-banner-view">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      <span>Viewing as <strong>${roleLabel}</strong> — ${label}. You can view data but cannot modify records.</span>
    </div>`;
  }
  if (level === 'approve') {
    return `<div class="access-banner access-banner-approve">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
      <span>Signed in as <strong>${roleLabel}</strong> — ${label}. You can review records and approve or sign.</span>
    </div>`;
  }
  if (level === 'manage') {
    return `<div class="access-banner access-banner-manage">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <span>Signed in as <strong>${roleLabel}</strong> — ${label}. You have full create, edit and delete privileges.</span>
    </div>`;
  }
  // 'create'
  return `<div class="access-banner access-banner-create">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
    <span>Signed in as <strong>${roleLabel}</strong> — ${label}. You can create and submit new records.</span>
  </div>`;
}

function renderAccessDenied() {
  return `
    <div class="access-denied-card">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--red-500)"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
      <h3>Access Restricted</h3>
      <p>Your current role (<strong>${formatRoleName(currentRole)}</strong>) does not have access to this module.</p>
      <p style="color:var(--neutral-500);font-size:0.85rem;margin-top:0.5rem;">Please switch to an authorized role or contact the system administrator.</p>
      <a href="#/dashboard" class="btn btn-primary" style="margin-top:1rem;">Return to Dashboard</a>
    </div>
  `;
}

// Nav Items Data (route, label, icon SVG, section)
const NAV_ITEMS = [
  {
    section: 'Overview', items: [
      { route: 'dashboard', label: 'Dashboard', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
      { route: 'masters', label: 'Departments', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-5h6v5"/></svg>' },
    ]
  },
  {
    section: 'Procurement', items: [
      { route: 'cte', label: 'CTE Demands', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13H8"/><path d="M16 17H8"/><path d="M16 13h-2"/></svg>' },
      { route: 'indents', label: 'Purchase Indents', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>' },
      { route: 'notes', label: 'Note Sheets', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>' },
      { route: 'financial', label: 'EMD & e-PBG Ledger', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>' },
    ]
  },
  {
    section: 'Evaluation', items: [
      { route: 'scrutiny', label: 'Technical Scrutiny', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' },
      { route: 'committee', label: 'DLPC / DPC Sanctions', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    ]
  },
  {
    section: 'Post-Order', items: [
      { route: 'delivery', label: 'Inspection & Vouchers', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>' },
      { route: 'repairs', label: 'Equipment Repairs', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>' },
    ]
  },

  {
    section: 'Documents', items: [
      { route: 'documents', label: 'Document Centre', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>' },
      { route: 'templates', label: 'Raw Templates', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
    ]
  },
];

function renderSidebarNav(activeRoute) {
  return NAV_ITEMS.map(section => {
    const visibleItems = section.items.filter(item => canAccess(item.route));
    if (visibleItems.length === 0) return '';
    return `
      <div class="nav-section-label">${section.section}</div>
      ${visibleItems.map(item => `
        <a href="#/${item.route}" class="nav-item ${activeRoute === item.route ? 'active' : ''}">
          ${item.icon}
          <span>${item.label}</span>
        </a>
      `).join('')}
    `;
  }).join('');
}

function renderAppShell(contentHtml, activeRoute = 'dashboard') {
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="institution-logo">LD</div>
        <div class="institution-title">
          <h2>Store &amp; Purchase</h2>
          <p>L.D. College of Engineering</p>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${renderSidebarNav(activeRoute)}
      </nav>
    </aside>
    <div class="main-wrapper">
      <header class="top-header">
        <div class="page-title">
          <h1>${getRouteTitle(activeRoute)}</h1>
        </div>
        <div class="role-switcher-container">
          <span class="role-badge">Role</span>
          <select id="roleSelector" class="role-select">
            ${ROLES.map(r => `<option value="${r}" ${r === currentRole ? 'selected' : ''}>${formatRoleName(r)}</option>`).join('')}
          </select>
        </div>
      </header>
      <main class="content-body">
        ${contentHtml}
      </main>
    </div>
  `;
}

function formatRoleName(role) {
  const names = {
    Principal: 'Principal / Director',
    StoreOfficer: 'Store Officer',
    HOD: 'Head of Department',
    DeptRep: 'Dept. Representative',
    ExpertMember: 'Expert Committee',
    AccountsOfficer: 'Accounts Officer',
    DLPCMember: 'DLPC / DPC Member'
  };
  return names[role] || role;
}

function getRouteTitle(route) {
  const titles = {
    dashboard: 'Executive Dashboard',
    masters: 'Departments & Governance',
    cte: 'Annual CTE Demand Entry',
    indents: 'Purchase Indents & Specifications',
    notes: 'Gujarati Administrative Note Sheets',
    financial: 'EMD & Security Deposit Ledger',
    scrutiny: 'Technical Scrutiny Matrix',
    committee: 'DLPC / DPC Sanctions',
    delivery: 'Inspection & Payment Vouchers',
    repairs: 'Equipment Repair Requests',
    documents: 'Document Centre — All 47 Documents',
    templates: 'Raw Document Templates'
  };
  return titles[route] || 'Store & Purchase Management System';
}

// Router & Controller
async function router() {
  const hash = window.location.hash || '#/dashboard';
  const cleanHash = hash.split('?')[0];
  const route = cleanHash.replace('#/', '') || 'dashboard';
  const appEl = document.getElementById('app');

  try {
    if (!canAccess(route)) {
      appEl.innerHTML = renderAppShell(renderAccessDenied(), route);
      bindRoleSwitcher();
      return;
    }

    if (route === 'dashboard') {
      const data = await api.getDashboardMetrics();
      appEl.innerHTML = renderAppShell(renderDashboardView(data.data), 'dashboard');
      initDashboardCharts(data.data);
    } else if (route === 'masters') {
      const depts = await api.getDepartments();
      const users = await api.getUsers();
      appEl.innerHTML = renderAppShell(renderMastersView(depts.data, users.data), 'masters');
      bindMastersEvents();
    } else if (route === 'cte') {
      const depts = await api.getDepartments();
      const demands = await api.getCteDemands();
      appEl.innerHTML = renderAppShell(renderCteView(depts.data, demands.data), 'cte');
      bindCteEvents();
    } else if (route === 'indents') {
      const depts = await api.getDepartments();
      const indents = await api.getIndents();
      appEl.innerHTML = renderAppShell(renderIndentsView(depts.data, indents.data), 'indents');
      bindIndentsEvents();
    } else if (route === 'notes') {
      const indents = await api.getIndents();
      appEl.innerHTML = renderAppShell(renderNotesView(indents.data), 'notes');
      bindNotesEvents();
    } else if (route === 'financial') {
      const [itemsRes, deptsRes] = await Promise.all([
        api.getFinancialInstruments().catch(() => ({ data: [] })),
        api.getDepartments().catch(() => ({ data: [] }))
      ]);
      appEl.innerHTML = renderAppShell(renderFinancialView(itemsRes.data || [], deptsRes.data || []), 'financial');
      bindFinancialEvents(itemsRes.data || []);
    } else if (route === 'scrutiny') {
      const bidsRes = await api.getBids();
      const bids = bidsRes.data || [];
      const selectedBidId = bids[0]?.id || null;
      let evaluations = [];
      if (selectedBidId) {
        try {
          const evalRes = await api.getEvaluations(selectedBidId);
          evaluations = evalRes.data || [];
        } catch (_) { }
      }
      appEl.innerHTML = renderAppShell(renderScrutinyView(bids, evaluations, selectedBidId), 'scrutiny');
      bindScrutinyEvents(bids);
    } else if (route === 'committee') {
      const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      const paramMtg = urlParams.get('meetingId') || window._targetMeetingId || null;
      const paramDoc = urlParams.get('docId') || window._targetDocId || null;
      window._targetMeetingId = null;
      window._targetDocId = null;

      const [meetingsRes, indentsRes, bidsRes] = await Promise.all([
        api.getMeetings().catch(() => ({ data: [] })),
        api.getIndents().catch(() => ({ data: [] })),
        api.getBids().catch(() => ({ data: [] }))
      ]);
      appEl.innerHTML = renderAppShell(renderCommitteeView(meetingsRes.data || [], indentsRes.data || [], bidsRes.data || [], paramMtg, paramDoc), 'committee');
      bindCommitteeEvents(meetingsRes.data || [], indentsRes.data || [], bidsRes.data || []);
    } else if (route === 'delivery') {
      const [ordersRes, vouchersRes, deptsRes] = await Promise.all([
        api.getOrders().catch(() => ({ data: [] })),
        api.getVouchers().catch(() => ({ data: [] })),
        api.getDepartments().catch(() => ({ data: [] })),
      ]);
      appEl.innerHTML = renderAppShell(renderDeliveryView(ordersRes.data || [], vouchersRes.data || [], deptsRes.data || []), 'delivery');
      bindDeliveryEvents(ordersRes.data || [], vouchersRes.data || [], deptsRes.data || []);
    } else if (route === 'templates') {
      appEl.innerHTML = renderAppShell(renderTemplatesView(), 'templates');
    } else if (route === 'documents') {
      // Fetch all live entity lists so the user can pick which record to download
      const [indents, bids, meetings, orders, vouchers, repairs, fi] = await Promise.all([
        api.getIndents().then(r => r.data).catch(() => []),
        api.getBids().then(r => r.data).catch(() => []),
        api.getMeetings().then(r => r.data).catch(() => []),
        api.getOrders().then(r => r.data).catch(() => []),
        api.getVouchers().then(r => r.data).catch(() => []),
        api.getRepairs().then(r => r.data).catch(() => []),
        api.getFinancialInstruments().then(r => r.data).catch(() => []),
      ]);
      appEl.innerHTML = renderAppShell(
        renderDocumentsView({ indents, bids, meetings, orders, vouchers, repairs, fi }),
        'documents'
      );
      bindDocumentsEvents();
    } else if (route === 'repairs') {
      const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      const paramTab = urlParams.get('tab') || window._targetRepairsTab || null;
      const paramRepairId = urlParams.get('repairId') || null;
      window._targetRepairsTab = null;
      if (paramTab) {
        activeRepairsTab = paramTab;
      }
      if (paramRepairId) {
        if (paramTab === 'doc43') window._selectedRepairForDoc43 = paramRepairId;
        if (paramTab === 'doc45') window._selectedRepairForDoc45 = paramRepairId;
        if (paramTab === 'doc46') window._selectedRepairForDoc46 = paramRepairId;
        if (paramTab === 'doc47') window._selectedRepairForDoc47 = paramRepairId;
        if (paramTab === 'inquiry') window._selectedRepairForInquiry = paramRepairId;
      }
      const depts = await api.getDepartments();
      const requests = await api.getRepairs();
      appEl.innerHTML = renderAppShell(renderRepairsView(depts.data, requests.data), 'repairs');
      bindRepairsEvents(depts.data, requests.data);
    }
  } catch (err) {
    appEl.innerHTML = renderAppShell(`<div class="card"><h3 style="color:var(--accent-red)">Error loading view: ${err.message}</h3></div>`, route);
  }

  // Bind Role Switcher
  bindRoleSwitcher();
}

function bindRoleSwitcher() {
  const selector = document.getElementById('roleSelector');
  if (selector && !selector.hasAttribute('data-bound')) {
    selector.setAttribute('data-bound', 'true');
    selector.addEventListener('change', (e) => {
      currentRole = e.target.value;
      localStorage.setItem('ldce_user_role', currentRole);
      router();
    });
  }
}

// ----------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------
function renderDashboardView(data) {
  const s = data.summary;
  return `
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Total Active Indents</span>
        <span class="metric-value">${s.totalIndents}</span>
        <span class="metric-sub">Valued at ₹${s.indentVal.toLocaleString('en-IN')}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Annual CTE Proposals</span>
        <span class="metric-value">${s.totalCte}</span>
        <span class="metric-sub">Valued at ₹${s.cteVal.toLocaleString('en-IN')}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Pending Gujarati Notes</span>
        <span class="metric-value" style="color:var(--accent-gold)">${s.pendingSanctions}</span>
        <span class="metric-sub">Awaiting Principal Sanction</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Passed Payment Vouchers</span>
        <span class="metric-value" style="color:var(--accent-green)">${s.vouchersPaid}</span>
        <span class="metric-sub">Disbursed ₹${s.paidVal.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Procurement Budget Allocation by Funding Head</h3>
        </div>
        <canvas id="grantChart" style="max-height: 260px;"></canvas>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Pipeline Status</h3>
        </div>
        <canvas id="pipelineChart" style="max-height: 260px;"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recent Procurement Activity Ledger</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Reference No</th>
              <th>Description / Vendor</th>
              <th>Amount (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.recentActivity.map(r => `
              <tr>
                <td><span class="badge badge-info">${r.type}</span></td>
                <td><strong>${r.ref}</strong></td>
                <td>${r.item_name}</td>
                <td>₹${parseFloat(r.amount).toLocaleString('en-IN')}</td>
                <td><span class="badge badge-warning">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function initDashboardCharts(data) {
  const grantCtx = document.getElementById('grantChart')?.getContext('2d');
  if (grantCtx) {
    new Chart(grantCtx, {
      type: 'bar',
      data: {
        labels: data.grantBudgets.map(g => g.budget_head),
        datasets: [{
          label: 'Allocated Budget (₹)',
          data: data.grantBudgets.map(g => parseFloat(g.total_allocated)),
          backgroundColor: '#00b4d8'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const pipeCtx = document.getElementById('pipelineChart')?.getContext('2d');
  if (pipeCtx) {
    new Chart(pipeCtx, {
      type: 'doughnut',
      data: {
        labels: data.pipeline.map(p => p.status),
        datasets: [{
          data: data.pipeline.map(p => parseInt(p.count, 10)),
          backgroundColor: ['#0077b6', '#00b4d8', '#ffb703', '#10b981', '#8b5cf6']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

// ----------------------------------------------------
// 2. MASTERS VIEW (FORM-01)
// ----------------------------------------------------
function renderMastersView(depts, users) {
  const formHtml = canManage('masters') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Add Academic / Administrative Department</h3>
      </div>
      <form id="addDeptForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Department Code (Uppercase)</label>
          <input type="text" id="deptCode" class="form-control" placeholder="e.g. COMP, MECH" required />
        </div>
        <div class="form-group">
          <label class="form-label">Department Name</label>
          <input type="text" id="deptName" class="form-control" placeholder="e.g. Computer Engineering Dept" required />
        </div>
        <div class="form-group" style="justify-content: flex-end;">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Register Department
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('masters')}
    ${formHtml}

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Registered Departments Master</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Dept Code</th>
              <th>Department Full Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${depts.map(d => `
              <tr>
                <td>${d.id}</td>
                <td><strong>${d.code}</strong></td>
                <td>${d.name}</td>
                <td><span class="badge badge-success">Active</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindMastersEvents() {
  document.getElementById('addDeptForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('deptCode').value;
    const name = document.getElementById('deptName').value;
    try {
      await api.createDepartment({ code, name });
      alert('Department registered successfully!');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

// ----------------------------------------------------
// 3. CTE DEMANDS VIEW (FORM-02)
// ----------------------------------------------------
function renderCteView(depts, demands) {
  const formHtml = canCreate('cte') ? `
    <div class="card">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
        <h3 class="card-title">Submit Annual CTE Demand</h3>
        <span id="cteBadge" class="badge badge-info" style="font-size:0.75rem;">Statement 1: 19 Government Specifications</span>
      </div>
      <form id="cteForm" class="form-grid">
        <!-- Core Parameters -->
        <div class="form-group">
          <label class="form-label">Financial Year <span style="color:#ef4444;">*</span></label>
          <select id="cteFinYear" class="form-control">
            <option value="2026-27">2026-27</option>
            <option value="2027-28">2027-28</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category (Statement Type) <span style="color:#ef4444;">*</span></label>
          <select id="cteCategory" class="form-control">
            <option value="Non-IT Equipment">Statement 1: Non-IT Equipment (19 Cols)</option>
            <option value="IT Equipment">Statement 2: IT Equipment (20 Cols)</option>
            <option value="Furniture">Statement 3: Furniture (9 Cols)</option>
            <option value="Books">Statement 4: Books & Periodicals</option>
            <option value="Maintenance">Statement 5: Maintenance & AMC</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Department / Discipline <span style="color:#ef4444;">*</span></label>
          <select id="cteDept" class="form-control">
            ${depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Proposed Grant Head <span style="color:#ef4444;">*</span></label>
          <select id="cteGrantHead" class="form-control">
            <option value="State Grant (TED-5)">State Grant (TED-5)</option>
            <option value="State Grant (TED-11)">State Grant (TED-11)</option>
            <option value="Center Grant">Center Grant</option>
            <option value="Student Welfare">Student Welfare</option>
            <option value="Other Grant">Other Grant</option>
          </select>
        </div>

        <!-- Item & Financials -->
        <div class="form-group full-width" id="grpItemNameText">
          <label class="form-label">Item Nomenclature / Description <span style="color:#ef4444;">*</span></label>
          <input type="text" id="cteItemName" class="form-control" placeholder="Full technical item title (e.g. Dual Desk / Executive Table / Lathe Machine)" required />
        </div>
        <div class="form-group full-width" id="grpItemNameIT" style="display:none;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <label class="form-label" style="margin-bottom:0;">Name of IT Item <span style="color:#ef4444;">*</span> <small style="color:#999;">(Select from 14 Official CTE IT Categories)</small></label>
            <button type="button" id="btnAddNewITItem" class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:0.75rem;height:auto;" title="Store Officer / User can add new standard IT item">+ Add New IT Item</button>
          </div>
          <select id="cteItemNameSelect" class="form-control">
            <!-- options generated dynamically from official IT items -->
          </select>
          <div id="grpCustomITInput" style="margin-top:8px;display:none;">
            <input type="text" id="cteCustomItemName" class="form-control" placeholder="Type new / custom IT item title..." />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Qty. Required <span style="color:#ef4444;">*</span></label>
          <input type="number" id="cteQty" class="form-control" min="1" value="1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Approx. Rate as per GeM (₹) <span style="color:#ef4444;">*</span></label>
          <input type="number" id="cteRate" class="form-control" step="0.01" placeholder="0.00" required />
        </div>
        <div class="form-group">
          <label class="form-label">Total Amount (₹)</label>
          <input type="text" id="cteTotalCost" class="form-control" placeholder="Auto-calculated" readonly style="background:var(--neutral-800,#1a1a2e);font-weight:700;color:#10B981;" />
        </div>
        <div class="form-group">
          <label class="form-label">Available on GeM? <span style="color:#ef4444;">*</span></label>
          <select id="cteGemAvailable" class="form-control">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Available Qty in Institute <small style="color:#999;">(In Stock)</small></label>
          <input type="number" id="cteAvailableQty" class="form-control" min="0" value="0" />
        </div>

        <!-- Statement 1 Specific: Annual Expenditure & Procurement Model -->
        <div class="form-group full-width dynamic-sec sec-stmt1">
          <label class="form-label">Total Approx Annual Capital + Recurring Exp (₹) <small style="color:#999;">(Col 9 - Statement 1)</small></label>
          <input type="number" id="cteAnnualExp" class="form-control" step="0.01" placeholder="Leave blank if no recurring cost (will use Total Amount)" />
        </div>
        <div class="form-group dynamic-sec sec-stmt1">
          <label class="form-label">Procurement Model <small style="color:#999;">(Col 10 - Statement 1)</small></label>
          <select id="cteProcModel" class="form-control">
            <option value="New Purchase">New Purchase</option>
            <option value="Rental">Rental</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <!-- Statement 1 & 2 Lifecycle & Norms Specific -->
        <div class="form-group dynamic-sec sec-lifecycle">
          <label class="form-label">Procured Against Condemn Item?</label>
          <select id="cteAgainstCondemn" class="form-control">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        <div class="form-group dynamic-sec sec-lifecycle">
          <label class="form-label">Required Qty as per Norms</label>
          <input type="number" id="cteNormQty" class="form-control" min="0" value="0" />
        </div>
        <div class="form-group dynamic-sec sec-lifecycle">
          <label class="form-label">Procurement Year of Available Item</label>
          <input type="text" id="cteProcYear" class="form-control" placeholder="e.g. 2020-21 or -" value="-" />
        </div>
        <div class="form-group dynamic-sec sec-lifecycle">
          <label class="form-label">Condition of Available Item</label>
          <select id="cteStockCond" class="form-control">
            <option value="Working">Working</option>
            <option value="Non-Working">Non-Working</option>
            <option value="Obsolete">Obsolete</option>
            <option value="Not as per requirement">Not as per requirement</option>
          </select>
        </div>
        <div class="form-group dynamic-sec sec-lifecycle">
          <label class="form-label">Estimated Lifespan</label>
          <select id="cteLifespan" class="form-control">
            <option value="10 Years">10 Years</option>
            <option value="7 Years">7 Years</option>
            <option value="5-7 Years">5-7 Years (IT)</option>
            <option value="5 Years">5 Years</option>
            <option value="3 Years">3 Years</option>
            <option value="15 Years">15 Years</option>
          </select>
        </div>

        <!-- Statement 2 IT Specific Fields -->
        <div class="form-group full-width dynamic-sec sec-stmt2">
          <label class="form-label">Old Equipment Disposal Procedure <small style="color:#999;">(Col 15 - Statement 2)</small></label>
          <input type="text" id="cteDisposalProc" class="form-control" value="Through Institute Scrap / Condemnation Committee" placeholder="What procedures have been followed for the disposal of old equipment?" />
        </div>
        <div class="form-group dynamic-sec sec-stmt2">
          <label class="form-label">Is Standard Software? <small style="color:#999;">(Col 16 - Statement 2)</small></label>
          <select id="cteIsStdSoftware" class="form-control">
            <option value="N/A">N/A (Hardware / Equipment)</option>
            <option value="Yes">Yes (Standard Software)</option>
            <option value="No">No (Custom / Specialized Software)</option>
          </select>
        </div>
        <div class="form-group dynamic-sec sec-stmt2">
          <label class="form-label">Software Type <small style="color:#999;">(Col 17 - Statement 2)</small></label>
          <select id="cteSoftwareType" class="form-control">
            <option value="N/A">N/A (Hardware / Equipment)</option>
            <option value="Educational">Educational</option>
            <option value="Office Work">Office Work</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Statement 1 & 2 Operation, Maintenance & Usage -->
        <div class="form-group full-width dynamic-sec sec-lifecycle">
          <label class="form-label">Operation & Maintenance Plan</label>
          <input type="text" id="cteMaintPlan" class="form-control" value="Through Department Technical Staff & AMC" placeholder="How operation and maintenance will be carried out" />
        </div>
        <div class="form-group full-width dynamic-sec sec-lifecycle">
          <label class="form-label">Approximate Usage of Demanded Item</label>
          <input type="text" id="cteApproxUsage" class="form-control" value="For UG/PG Laboratory & Research Practicals" placeholder="Target courses, laboratory practicals, or research usage" />
        </div>

        <!-- Detailed Justification (All Statements) -->
        <div class="form-group full-width">
          <label class="form-label">Detailed Justification <span style="color:#ef4444;">*</span></label>
          <textarea id="cteJustification" class="form-control" required rows="3" placeholder="Academic necessity, GTU/AICTE norms compliance, class/lab requirements..."></textarea>
        </div>

        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary" style="padding:10px 24px;font-weight:600;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Submit CTE Demand Entry
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('cte')}
    ${formHtml}

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Submitted Annual CTE Proposals</h3>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-01', 'xlsx')"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Statement 1 (Excel)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-01', 'docx')">Statement 1 (Word)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-02', 'xlsx')"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Statement 2 (IT Excel)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-02', 'docx')">Statement 2 (IT Word)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-03', 'xlsx')"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Statement 3 (Furniture Excel)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-03', 'docx')">Statement 3 (Furniture Word)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-04', 'xlsx')"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Statement 4 (Books Excel)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-04', 'docx')">Statement 4 (Books Word)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-05', 'xlsx')"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Statement 5 (Maint Excel)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-05', 'docx')">Statement 5 (Maint Word)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-06', 'xlsx')"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Summary IT (Excel)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-06', 'docx')">Summary IT (Word)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-07', 'xlsx')"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Summary (Excel)</button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadDocFromCentre('DOC-07', 'docx')">Summary (Word)</button>
          <a href="#/documents" class="btn btn-primary btn-sm">All Documents →</a>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Category</th>
              <th>Department</th>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Unit Rate (₹)</th>
              <th>Total Cost (₹)</th>
              <th>GeM</th>
              <th>Grant Head</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${demands.map(d => `
              <tr>
                <td>${d.fin_year}</td>
                <td><span class="badge badge-info">${d.category}</span></td>
                <td>${d.dept_code || d.dept_name || ''}</td>
                <td><strong>${d.item_name}</strong></td>
                <td>${d.qty}</td>
                <td>₹${parseFloat(d.unit_rate).toLocaleString('en-IN')}</td>
                <td><strong>₹${parseFloat(d.total_cost).toLocaleString('en-IN')}</strong></td>
                <td>${d.gem_available ? 'Yes' : 'No'}</td>
                <td>${d.grant_head}</td>
                <td><span class="badge badge-success">${d.status || 'Submitted'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindCteEvents() {
  const qtyEl = document.getElementById('cteQty');
  const rateEl = document.getElementById('cteRate');
  const totalEl = document.getElementById('cteTotalCost');
  const catEl = document.getElementById('cteCategory');
  const badgeEl = document.getElementById('cteBadge');

  const grpText = document.getElementById('grpItemNameText');
  const grpIT = document.getElementById('grpItemNameIT');
  const itemNameInput = document.getElementById('cteItemName');
  const itemSelectEl = document.getElementById('cteItemNameSelect');
  const customInputGrp = document.getElementById('grpCustomITInput');
  const customItemInput = document.getElementById('cteCustomItemName');
  const addBtn = document.getElementById('btnAddNewITItem');

  const DEFAULT_IT_ITEMS = [
    'Desktop Computer',
    'Work Stations',
    'Servers',
    'Laptop',
    'Softwares (Educational)',
    'A4 Size Printer',
    'A3 Size Printer',
    'Copier Machine',
    'CCTV Camera',
    'Network Switch',
    'UPS',
    'Multi Media Projector',
    'Smart/Interactive Board',
    'Miscellaneous (Routers, Access Points, Computer Accessories etc.)'
  ];

  function getITItemsMaster() {
    try {
      const saved = localStorage.getItem('ldce_it_items_master');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return [...DEFAULT_IT_ITEMS];
  }

  function saveITItemsMaster(items) {
    try {
      localStorage.setItem('ldce_it_items_master', JSON.stringify(items));
    } catch (e) { }
  }

  function populateITSelect(selectedVal = '') {
    if (!itemSelectEl) return;
    const items = getITItemsMaster();
    itemSelectEl.innerHTML = items.map(it => `<option value="${it}">${it}</option>`).join('') +
      `<option value="__CUSTOM__">+ Add Custom / Other IT Item...</option>`;
    if (selectedVal && items.includes(selectedVal)) {
      itemSelectEl.value = selectedVal;
    }
  }

  populateITSelect();

  itemSelectEl?.addEventListener('change', () => {
    if (itemSelectEl.value === '__CUSTOM__') {
      if (customInputGrp) customInputGrp.style.display = 'block';
      if (customItemInput) { customItemInput.required = true; customItemInput.focus(); }
    } else {
      if (customInputGrp) customInputGrp.style.display = 'none';
      if (customItemInput) { customItemInput.required = false; }
    }
  });

  addBtn?.addEventListener('click', () => {
    const newItem = prompt('Enter new standard IT item name to add (Store Officer):');
    if (newItem && newItem.trim()) {
      const trimmed = newItem.trim();
      const current = getITItemsMaster();
      if (!current.includes(trimmed)) {
        current.push(trimmed);
        saveITItemsMaster(current);
      }
      populateITSelect(trimmed);
      itemSelectEl.value = trimmed;
      if (customInputGrp) customInputGrp.style.display = 'none';
      if (customItemInput) { customItemInput.required = false; }
    }
  });

  function calcTotal() {
    const q = parseFloat(qtyEl?.value) || 0;
    const r = parseFloat(rateEl?.value) || 0;
    if (totalEl) {
      totalEl.value = '₹' + (q * r).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }
  qtyEl?.addEventListener('input', calcTotal);
  rateEl?.addEventListener('input', calcTotal);

  function updateCategoryFields() {
    const cat = catEl?.value;
    const stmt1Secs = document.querySelectorAll('.sec-stmt1');
    const stmt2Secs = document.querySelectorAll('.sec-stmt2');
    const lifecycleSecs = document.querySelectorAll('.sec-lifecycle');

    if (cat === 'Non-IT Equipment') {
      if (badgeEl) badgeEl.innerText = 'Statement 1: 19 Government Columns';
      stmt1Secs.forEach(el => el.style.display = '');
      stmt2Secs.forEach(el => el.style.display = 'none');
      lifecycleSecs.forEach(el => el.style.display = '');
      if (grpText) grpText.style.display = 'block';
      if (grpIT) grpIT.style.display = 'none';
      if (itemNameInput) itemNameInput.required = true;
      if (itemSelectEl) itemSelectEl.required = false;
    } else if (cat === 'IT Equipment') {
      if (badgeEl) badgeEl.innerText = 'Statement 2: 20 Government Columns (Official IT Master)';
      stmt1Secs.forEach(el => el.style.display = 'none');
      stmt2Secs.forEach(el => el.style.display = '');
      lifecycleSecs.forEach(el => el.style.display = '');
      if (grpText) grpText.style.display = 'none';
      if (grpIT) grpIT.style.display = 'block';
      if (itemNameInput) itemNameInput.required = false;
      if (itemSelectEl) itemSelectEl.required = true;
    } else if (cat === 'Furniture') {
      if (badgeEl) badgeEl.innerText = 'Statement 3: 9 Government Columns';
      stmt1Secs.forEach(el => el.style.display = 'none');
      stmt2Secs.forEach(el => el.style.display = 'none');
      lifecycleSecs.forEach(el => el.style.display = 'none');
      if (grpText) grpText.style.display = 'block';
      if (grpIT) grpIT.style.display = 'none';
      if (itemNameInput) itemNameInput.required = true;
      if (itemSelectEl) itemSelectEl.required = false;
    } else if (cat === 'Books') {
      if (badgeEl) badgeEl.innerText = 'Statement 4: 5 Government Columns (Books)';
      stmt1Secs.forEach(el => el.style.display = 'none');
      stmt2Secs.forEach(el => el.style.display = 'none');
      lifecycleSecs.forEach(el => el.style.display = 'none');
      if (grpText) grpText.style.display = 'block';
      if (grpIT) grpIT.style.display = 'none';
      if (itemNameInput) itemNameInput.required = true;
      if (itemSelectEl) itemSelectEl.required = false;
    } else if (cat === 'Maintenance') {
      if (badgeEl) badgeEl.innerText = 'Statement 5: 7 Government Columns (Maintenance & AMC)';
      stmt1Secs.forEach(el => el.style.display = 'none');
      stmt2Secs.forEach(el => el.style.display = 'none');
      lifecycleSecs.forEach(el => el.style.display = 'none');
      if (grpText) grpText.style.display = 'block';
      if (grpIT) grpIT.style.display = 'none';
      if (itemNameInput) itemNameInput.required = true;
      if (itemSelectEl) itemSelectEl.required = false;
    } else {
      if (badgeEl) badgeEl.innerText = `${cat} Annual Proposal`;
      stmt1Secs.forEach(el => el.style.display = 'none');
      stmt2Secs.forEach(el => el.style.display = 'none');
      lifecycleSecs.forEach(el => el.style.display = 'none');
      if (grpText) grpText.style.display = 'block';
      if (grpIT) grpIT.style.display = 'none';
      if (itemNameInput) itemNameInput.required = true;
      if (itemSelectEl) itemSelectEl.required = false;
    }
  }

  catEl?.addEventListener('change', updateCategoryFields);
  updateCategoryFields();

  document.getElementById('cteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let finalItemName = document.getElementById('cteItemName')?.value;
    if (catEl?.value === 'IT Equipment') {
      if (itemSelectEl?.value === '__CUSTOM__') {
        finalItemName = customItemInput?.value?.trim() || 'Custom IT Item';
        const current = getITItemsMaster();
        if (!current.includes(finalItemName)) {
          current.push(finalItemName);
          saveITItemsMaster(current);
        }
      } else {
        finalItemName = itemSelectEl?.value || finalItemName;
      }
    }

    const payload = {
      fin_year: document.getElementById('cteFinYear').value,
      category: document.getElementById('cteCategory').value,
      dept_id: document.getElementById('cteDept').value,
      grant_head: document.getElementById('cteGrantHead').value,
      item_name: finalItemName,
      qty: document.getElementById('cteQty').value,
      unit_rate: document.getElementById('cteRate').value,
      annual_expenditure: document.getElementById('cteAnnualExp')?.value || null,
      gem_available: document.getElementById('cteGemAvailable').value === 'Yes',
      procurement_model: document.getElementById('cteProcModel')?.value || 'New Purchase',
      against_condemn: document.getElementById('cteAgainstCondemn')?.value === 'Yes',
      norm_qty: document.getElementById('cteNormQty')?.value || 0,
      available_qty: document.getElementById('cteAvailableQty')?.value || 0,
      procurement_year: document.getElementById('cteProcYear')?.value || '-',
      stock_condition: document.getElementById('cteStockCond')?.value || 'Working',
      lifespan: document.getElementById('cteLifespan')?.value || (catEl?.value === 'IT Equipment' ? '5-7 Years' : '10 Years'),
      disposal_procedure: document.getElementById('cteDisposalProc')?.value || 'Through Institute Scrap / Condemnation Committee',
      is_standard_software: document.getElementById('cteIsStdSoftware')?.value || 'N/A',
      software_type: document.getElementById('cteSoftwareType')?.value || 'N/A',
      maint_plan: document.getElementById('cteMaintPlan')?.value || 'Through Department Staff & AMC',
      approx_usage: document.getElementById('cteApproxUsage')?.value || 'For Laboratory & Classroom Practicals',
      justification: document.getElementById('cteJustification').value
    };
    try {
      await api.createCteDemand(payload);
      alert('CTE Demand recorded successfully with all specifications!');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

// ----------------------------------------------------
// 4. PURCHASE INDENTS VIEW (FORM-03 & 04)
// ----------------------------------------------------
function renderIndentsView(depts, indents) {
  const formHtml = canCreate('indents') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Initiate New Purchase Indent (FORM-03)</h3>
      </div>
      <form id="indentForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Fund Type</label>
          <select id="fundType" class="form-control">
            <option value="Govt Fund">Govt Fund (TED-5 / TED-11)</option>
            <option value="Non-Govt Fund">Non-Govt Fund (Welfare/Gymkhana/CoE)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Budget Head</label>
          <input type="text" id="budgetHead" class="form-control" value="State Grant (TED-5)" required />
        </div>
        <div class="form-group">
          <label class="form-label">Department</label>
          <select id="indentDept" class="form-control">
            ${depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Item Title</label>
          <input type="text" id="indentTitle" class="form-control" placeholder="e.g. High Performance Server" required />
        </div>
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input type="number" id="indentQty" class="form-control" value="1" min="1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Estimated Unit Cost (₹)</label>
          <input type="number" id="indentCost" class="form-control" placeholder="0.00" step="0.01" required />
        </div>
        <div class="form-group full-width">
          <label class="form-label">Item Description & GeM Details</label>
          <textarea id="indentDesc" class="form-control" required placeholder="Detailed description & parameters searched on GeM..."></textarea>
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Submit Purchase Indent
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('indents')}
    ${formHtml}

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Purchase Indents Lifecycle Tracker</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Indent No</th>
              <th>Dept</th>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Total Cost (₹)</th>
              <th>Fund Type</th>
              <th>Status</th>
              <th>Download Documents</th>
            </tr>
          </thead>
          <tbody>
            ${indents.map(i => `
              <tr>
                <td><strong>${i.indent_no}</strong></td>
                <td>${i.dept_code}</td>
                <td>${i.item_name}</td>
                <td>${i.quantity}</td>
                <td>₹${parseFloat(i.total_cost).toLocaleString('en-IN')}</td>
                <td><span class="badge badge-info">${i.fund_type}</span></td>
                <td><span class="badge badge-warning">${i.status}</span></td>
                <td>
                  <div style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button class="btn btn-primary btn-sm" title="Purchase Indent (Govt. Fund)" onclick="handleDownloadDoc('DOC-12', '${i.id}')">Purchase Indent</button>
                    <button class="btn btn-secondary btn-sm" title="Technical Specification Sheet" onclick="handleDownloadDoc('DOC-14', '${i.id}')">Specs Sheet</button>
                    <button class="btn btn-secondary btn-sm" title="Terms & Conditions (ATC)" onclick="handleDownloadDoc('DOC-15', '${i.id}')">Terms &amp; ATC</button>
                    <button class="btn btn-warning btn-sm" title="Gujarati Note Sheet" onclick="handleDownloadDoc('DOC-17', '${i.id}')">Gujarati Note</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindIndentsEvents() {
  document.getElementById('indentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      fund_type: document.getElementById('fundType').value,
      budget_head: document.getElementById('budgetHead').value,
      dept_id: document.getElementById('indentDept').value,
      item_name: document.getElementById('indentTitle').value,
      quantity: document.getElementById('indentQty').value,
      unit_cost: document.getElementById('indentCost').value,
      item_description: document.getElementById('indentDesc').value
    };
    try {
      await api.createIndent(payload);
      alert('Purchase Indent created successfully!');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

// ----------------------------------------------------
// 5. GUJARATI NOTE SHEETS VIEW (FORM-06)
// ----------------------------------------------------
function renderNotesView(indents) {
  const formHtml = canCreate('notes') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Gujarati Administrative Note Sheet Generator & Live Canvas</h3>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div>
          <form id="noteForm" class="form-grid">
            <div class="form-group full-width">
              <label class="form-label">Select Associated Purchase Indent</label>
              <select id="noteIndentId" class="form-control">
                ${indents.map(i => `<option value="${i.id}">${i.indent_no} - ${i.item_name} (₹${parseFloat(i.total_cost).toLocaleString('en-IN')})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">યોજના / સ્કીમ</label>
              <input type="text" id="noteScheme" class="form-control gujarati-text" value="વિકાસલક્ષી યોજના - ૨૦૨૬-૨૭" required />
            </div>
            <div class="form-group">
              <label class="form-label">સાધન / આઇટમ નુ નામ (ગુજરાતી)</label>
              <input type="text" id="noteItemGuj" class="form-control gujarati-text" value="હાઇ એન્ડ કમ્પ્યુટર સિસ્ટમ" required />
            </div>
            <div class="form-group">
              <label class="form-label">જથ્થો</label>
              <input type="text" id="noteQtyStr" class="form-control gujarati-text" value="૦૫ નંગ" required />
            </div>
            <div class="form-group">
              <label class="form-label">અંદાજિત રકમ (₹)</label>
              <input type="number" id="noteAmount" class="form-control" value="750000.00" required />
            </div>
            <div class="form-group full-width">
              <label class="form-label">રકમ અક્ષરે (ગુજરાતી)</label>
              <input type="text" id="noteWordsGuj" class="form-control gujarati-text" value="રૂપિયા સાત લાખ પચાસ હજાર પૂરા" required />
            </div>
            <div class="form-group full-width">
              <label class="form-label">ખરીદી ની પદ્ધતિ</label>
              <select id="noteProcMode" class="form-control">
                <option value="GeM Custom Bid">GeM Custom Bid</option>
                <option value="GeM Direct Purchase">GeM Direct Purchase</option>
                <option value="GeM BOQ Bid">GeM BOQ Bid</option>
              </select>
            </div>
            <div class="form-group full-width">
              <button type="submit" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save & Update Live Note Sheet
              </button>
            </div>
          </form>
        </div>

        <div>
          <div class="card-header">
            <h4 style="color:var(--accent-gold)">Live Editable Canvas (Gujarati)</h4>
            <div style="display:flex; gap:0.5rem;">
              <button id="downloadDocxBtn" class="btn btn-warning" style="padding:0.4rem 0.75rem; font-size:0.8rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export .docx
              </button>
              <button onclick="window.print()" class="btn btn-secondary" style="padding:0.4rem 0.75rem; font-size:0.8rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print
              </button>
            </div>
          </div>
          <div class="note-sheet-canvas">
            <h2>એલ. ડી. એન્જિનિયરિંગ કોલેજ, અમદાવાદ</h2>
            <h3>સ્ટોર અને ખરીદ શાખા - કાર્યાલય નોંધ</h3>
            <table class="note-meta-table">
              <tr>
                <td><b>વિભાગ:</b> કોમ્પ્યુટર એન્જિનિયરિંગ</td>
                <td><b>તારીખ:</b> ${new Date().toLocaleDateString('en-GB')}</td>
              </tr>
              <tr>
                <td><b>ગ્રાન્ટ હેડ:</b> State Grant (TED-5)</td>
                <td><b>નોંધ નંબર:</b> LDCE/NOTE/2026/001</td>
              </tr>
            </table>
            <p><b>વિષય:</b> સાધન સામગ્રી ખરીદવા અંગે મંજૂરી મેળવવાની કાર્યાલય નોંધ.</p>
            <div id="editableContentArea" class="note-content-editable" contenteditable="true">
              ઉપરોક્ત વિષય અન્વયે જણાવવાનું કે કોમ્પ્યુટર એન્જિનિયરિંગ વિભાગ માટે હાઇ એન્ડ કમ્પ્યુટર સિસ્ટમ (૦૫ નંગ) ખરીદવા જરૂરી છે. આ માટે નો અંદાજિત ખર્ચ રૂ. ૭,૫૦,૦૦૦.૦૦ (રૂપિયા સાત લાખ પચાસ હજાર પૂરા) થાય છે. સદર ખરીદી GeM (Government e-Marketplace) પોર્ટલ મારફતે હાથ ધરવા મંજૂરી અર્થે રજૂ કરેલ છે.
            </div>
            <div style="margin-top:2rem; display:flex; justify-content:space-between;">
              <span>વિભાગીય પ્રતિનિધિ (સહી)</span>
              <span>વિભાગીય વડા (HOD)</span>
              <span>આચાર્યશ્રી (મંજૂર/નામંજૂર)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('notes')}
    ${formHtml}
  `;
}

function bindNotesEvents() {
  document.getElementById('noteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const indentId = document.getElementById('noteIndentId').value;
    const payload = {
      dept_id: 4,
      scheme_year: document.getElementById('noteScheme').value,
      item_name_guj: document.getElementById('noteItemGuj').value,
      qty_str: document.getElementById('noteQtyStr').value,
      total_amount: document.getElementById('noteAmount').value,
      amount_words_guj: document.getElementById('noteWordsGuj').value,
      procurement_mode: document.getElementById('noteProcMode').value,
      budget_head: 'State Grant (TED-5)',
      content_guj: document.getElementById('editableContentArea').innerText
    };
    try {
      await api.saveNoteSheet(indentId, payload);
      alert('Gujarati Note Sheet saved to PostgreSQL DB!');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  document.getElementById('downloadDocxBtn')?.addEventListener('click', () => {
    const indentId = document.getElementById('noteIndentId').value;
    handleDownloadDoc('DOC-17', indentId);
  });
}

// ----------------------------------------------------
// 6. EMD & e-PBG FINANCIAL LEDGER VIEW (FORM-07)
// ----------------------------------------------------
// ----------------------------------------------------
// 6. EMD & e-PBG FINANCIAL LEDGER VIEW (FORM-07)
// ----------------------------------------------------

function convertNumberToWordsINR(amount) {
  if (!amount || isNaN(amount)) return '';
  const num = Math.floor(Math.abs(Number(amount)));
  if (num === 0) return 'Zero Rupees Only';

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

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  if (crore > 0) result += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) result += convertThreeDigits(lakh) + ' Lakh ';
  if (thousand > 0) result += convertThreeDigits(thousand) + ' Thousand ';
  if (remainder > 0) result += convertThreeDigits(remainder);

  return (result.trim() ? result.trim() + ' Rupees Only' : '');
}

function renderFinTableRows(items) {
  if (!items || items.length === 0) {
    return `<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--neutral-400);">No financial instruments recorded yet.</td></tr>`;
  }
  return items.map((i, idx) => {
    const isEmd = (i.instrument_type || '').toUpperCase().includes('EMD');
    const badgeClass = isEmd ? 'badge-info' : 'badge-purple';
    const statusBadge = i.status === 'Deposited in Account' ? 'badge-success'
      : i.status === 'Refunded to Vendor' ? 'badge-warning'
        : i.status === 'Forfeited' ? 'badge-danger' : 'badge-secondary';

    const ddDateStr = i.dd_date ? new Date(i.dd_date).toLocaleDateString('en-GB') : '-';
    const inwardDateStr = i.inward_date ? new Date(i.inward_date).toLocaleDateString('en-GB') : '';
    const bankDisplay = i.other_bank_specify ? `${i.bank_name || ''} (${i.other_bank_specify})` : (i.bank_name || '-');
    const amountNum = parseFloat(i.amount || 0);

    return `
      <tr data-sr="${i.sr_no || ''}" data-type="${i.instrument_type || ''}" data-status="${i.status || ''}" data-search="${(String(i.sr_no || '') + ' ' + (i.bid_order_no || '') + ' ' + (i.vendor_name || '') + ' ' + (i.department || '') + ' ' + (i.item_service_name || '') + ' ' + (i.dd_number || '')).toLowerCase()}">
        <td><strong>${i.sr_no || (idx + 1)}</strong></td>
        <td><span class="badge ${badgeClass}">${i.instrument_type || 'EMD'}</span></td>
        <td>
          <div style="font-weight: 600; color: var(--primary-800);">${i.bid_order_no || '-'}</div>
          <div style="font-size: 0.775rem; color: var(--neutral-600); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${i.item_service_name || ''}">
            ${i.item_service_name || '-'}
          </div>
          ${i.bid_start_date ? `<div style="font-size: 0.7rem; color: var(--neutral-400);">Start: ${new Date(i.bid_start_date).toLocaleDateString('en-GB')}${i.bid_end_date ? ' | End: ' + new Date(i.bid_end_date).toLocaleDateString('en-GB') : ''}</div>` : ''}
        </td>
        <td>
          <span style="font-size: 0.8rem; font-weight: 500;">${i.department || '-'}</span>
          ${i.email_address ? `<div style="font-size: 0.7rem; color: var(--neutral-400);">${i.email_address}</div>` : ''}
        </td>
        <td>
          <div style="font-weight: 600; color: var(--neutral-800);">${i.vendor_name || '-'}</div>
          <div style="font-size: 0.75rem; color: var(--neutral-500); max-width: 230px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${i.vendor_address || ''}">
            ${i.vendor_address || '-'}
          </div>
        </td>
        <td>
          <div style="font-weight: 600;">No: ${i.dd_number || '-'}</div>
          <div style="font-size: 0.75rem; color: var(--neutral-500);">Dt: ${ddDateStr}</div>
          <div style="font-size: 0.75rem; color: var(--neutral-600);">${bankDisplay}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary-700);">₹${amountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          ${i.amount_in_rupees ? `<div style="font-size: 0.7rem; color: var(--neutral-500); font-style: italic; max-width: 180px;">${i.amount_in_rupees}</div>` : ''}
        </td>
        <td>
          ${inwardDateStr ? `<div style="font-size: 0.75rem;"><strong>Inward:</strong> ${inwardDateStr}</div>` : ''}
          ${i.remarks ? `<span class="badge badge-secondary" style="font-size: 0.7rem; margin-top: 2px;">${i.remarks}</span>` : ''}
          ${i.remarks_2 ? `<div style="font-size: 0.7rem; color: var(--neutral-500);">${i.remarks_2}</div>` : ''}
        </td>
        <td><span class="badge ${statusBadge}">${i.status || 'Held in Store'}</span></td>
      </tr>
    `;
  }).join('');
}

function renderFinancialView(items = [], depts = []) {
  const deptOptions = [
    'Biomedical engg.',
    'IC engg.',
    'Central Store',
    'Mechanical engg.',
    'Civil engg.',
    'Computer engg.',
    'Information Technology',
    'Electrical engg.',
    'Chemical engg.',
    'Textile engg.',
    'Applied Mechanics',
    'Science & Humanities',
    'Hostel Section',
    'Rubber Technology',
    'Plastic Technology',
    'Automobile engg.',
    'Environment engg.'
  ];
  if (depts && depts.length) {
    depts.forEach(d => {
      if (d.name && !deptOptions.includes(d.name)) deptOptions.push(d.name);
    });
  }

  const formHtml = canCreate('financial') || canManage('financial') ? `
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header" style="border-bottom: 1px solid var(--neutral-200); padding-bottom: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 class="card-title" style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.15rem; color: var(--primary-900);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-600);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>
              Register EMD / e-PBG Financial Instrument
            </h3>
            <p style="font-size: 0.8rem; color: var(--neutral-500); margin-top: 0.2rem;">
              Complete 20-field entry matching the official LDCE Excel Register format (<code>LDCE-Bid EMD_e-PBG details-2025-26.xlsx</code>)
            </p>
          </div>
          <span class="badge badge-primary">Official LDCE Register Format</span>
        </div>
      </div>

      <form id="finForm" style="padding-top: 1.25rem;">
        <!-- SECTION 1: GeM Bid & Department Details -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--primary-800); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.75rem; border-left: 3px solid var(--primary-600); padding-left: 0.5rem;">
            1. GeM Bid & Department Details
          </h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Department <span style="color: var(--red-500);">*</span></label>
              <input list="deptList" id="finDept" class="form-control" placeholder="Select or type department" required />
              <datalist id="deptList">
                ${deptOptions.map(opt => `<option value="${opt}">`).join('')}
              </datalist>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address <span style="color: var(--red-500);">*</span></label>
              <input type="email" id="finEmail" class="form-control" placeholder="e.g. bhavin.bme@ldce.ac.in" required />
            </div>
            <div class="form-group">
              <label class="form-label">Name of Item / Service <span style="color: var(--red-500);">*</span></label>
              <input type="text" id="finItemName" class="form-control" placeholder="e.g. PIC Development Board Trainer Kit" required />
            </div>
            <div class="form-group">
              <label class="form-label">Bid Number <span style="color: var(--red-500);">*</span></label>
              <input type="text" id="finBidNo" class="form-control" placeholder="e.g. GEM/2025/B/6425148" required />
            </div>
            <div class="form-group">
              <label class="form-label">Bid Start Date</label>
              <input type="date" id="finBidStartDate" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Bid End Date</label>
              <input type="date" id="finBidEndDate" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Bid Estimated Value (₹)</label>
              <input type="number" id="finBidEstValue" class="form-control" step="0.01" placeholder="e.g. 60000.00" />
            </div>
          </div>
        </div>

        <!-- SECTION 2: Details of Party with Complete Address -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--primary-800); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.75rem; border-left: 3px solid var(--primary-600); padding-left: 0.5rem;">
            2. Details of Party with Complete Address
          </h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Party / Vendor Legal Name <span style="color: var(--red-500);">*</span></label>
              <input type="text" id="finVendor" class="form-control" placeholder="e.g. ROYAL ELECTRONICS SALES AND SERVICES" required />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Details of Party with Complete Address <span style="color: var(--red-500);">*</span></label>
              <textarea id="finVendorAddress" class="form-control" placeholder="e.g. 2ND FLOOR, ROYAL HOUSE, VADODARA - 390012. Ph: 9825000000" rows="2" required></textarea>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Financial Instrument (EMD / e-PBG) Details -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--primary-800); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.75rem; border-left: 3px solid var(--primary-600); padding-left: 0.5rem;">
            3. Financial Instrument (EMD / e-PBG D.D.) Details
          </h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nature of Document <span style="color: var(--red-500);">*</span></label>
              <select id="finType" class="form-control" required>
                <option value="EMD">EMD (Earnest Money Deposit)</option>
                <option value="e-PBG / Security Deposit">e-PBG / Security Deposit</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">EMD / e-PBG Number (D.D./PBG No) <span style="color: var(--red-500);">*</span></label>
              <input type="text" id="finDdNo" class="form-control" placeholder="e.g. 1396" required />
            </div>
            <div class="form-group">
              <label class="form-label">EMD / e-PBG Date (D.D. dt) <span style="color: var(--red-500);">*</span></label>
              <input type="date" id="finDdDate" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Amount of EMD/e-PBG submitted by Party (₹) <span style="color: var(--red-500);">*</span></label>
              <input type="number" id="finAmount" class="form-control" step="0.01" placeholder="e.g. 1800.00" required />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Amount in Rupees (Words) <span style="font-weight: normal; color: var(--neutral-400);">(Auto-generated on amount entry, editable)</span></label>
              <input type="text" id="finAmountWords" class="form-control" placeholder="e.g. One Thousand Eight Hundred Only" />
            </div>
            <div class="form-group">
              <label class="form-label">Name of Bank <span style="color: var(--red-500);">*</span></label>
              <input list="bankList" id="finBank" class="form-control" placeholder="Select or type bank name" required />
              <datalist id="bankList">
                <option value="HDFC Bank">
                <option value="State Bank of India">
                <option value="ICICI Bank">
                <option value="Bank of Baroda">
                <option value="Axis Bank">
                <option value="IDFC FIRST BANK">
                <option value="AU Bank">
                <option value="Kotak Mahindra Bank">
                <option value="IDBI Bank">
                <option value="IndusInd Bank">
                <option value="Federal Bank">
                <option value="Punjab National Bank">
                <option value="Canara Bank">
                <option value="Other">
              </datalist>
            </div>
            <div class="form-group">
              <label class="form-label">If other bank then Specify</label>
              <input type="text" id="finOtherBank" class="form-control" placeholder="e.g. Baroda - UP Bank" />
            </div>
          </div>
        </div>

        <!-- SECTION 4: Inward Submission & Tracking -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--primary-800); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.75rem; border-left: 3px solid var(--primary-600); padding-left: 0.5rem;">
            4. Hard Copy Submission & Remarks
          </h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Date of Inward Original Hard Copy <span style="font-weight: normal; color: var(--neutral-400);">(EMD must be before end date)</span></label>
              <input type="date" id="finInwardDate" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Remarks <span style="font-weight: normal; color: var(--neutral-400);">(e.g. L1, Inward No., etc.)</span></label>
              <input type="text" id="finRemarks" class="form-control" placeholder="e.g. L1, 1172" />
            </div>
            <div class="form-group">
              <label class="form-label">Remarks-2</label>
              <input type="text" id="finRemarks2" class="form-control" placeholder="Additional tracking notes" />
            </div>
            <div class="form-group">
              <label class="form-label">Current Ledger Status</label>
              <select id="finStatus" class="form-control">
                <option value="Held in Store">Held in Store</option>
                <option value="Deposited in Account">Deposited in Account</option>
                <option value="Refunded to Vendor">Refunded to Vendor</option>
                <option value="Forfeited">Forfeited</option>
              </select>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--neutral-200);">
          <button type="reset" class="btn btn-secondary">Reset Form</button>
          <button type="submit" class="btn btn-primary" style="padding: 0.65rem 1.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Record in Financial Ledger
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('financial')}
    ${formHtml}

    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--neutral-200);">
        <div>
          <h3 class="card-title" style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.15rem; color: var(--primary-900);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--green-600);"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            EMD & Security Deposit Ledger Records
          </h3>
          <p style="font-size: 0.8rem; color: var(--neutral-500); margin-top: 0.2rem;">
            Official LDCE Register • ${items.length} records registered
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <button id="exportExcelBtn" class="btn btn-success" title="Download official Excel Register (.xlsx)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>
            Export Excel Register (.xlsx)
          </button>
        </div>
      </div>

      <!-- Filter / Search Controls -->
      <div style="display: flex; gap: 0.75rem; padding: 1rem 0; flex-wrap: wrap; align-items: center;">
        <div style="flex: 1; min-width: 240px;">
          <input type="text" id="finSearchInput" class="form-control" placeholder="Search by Bid No, Vendor, Department, DD No, Item..." />
        </div>
        <div style="min-width: 160px;">
          <select id="finTypeFilter" class="form-control">
            <option value="">All Document Types</option>
            <option value="EMD">EMD Only</option>
            <option value="e-PBG">e-PBG Only</option>
          </select>
        </div>
        <div style="min-width: 160px;">
          <select id="finStatusFilter" class="form-control">
            <option value="">All Statuses</option>
            <option value="Held in Store">Held in Store</option>
            <option value="Deposited in Account">Deposited in Account</option>
            <option value="Refunded to Vendor">Refunded to Vendor</option>
            <option value="Forfeited">Forfeited</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table" id="finTable">
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Type</th>
              <th>Bid No. & Item</th>
              <th>Department</th>
              <th>Vendor Details</th>
              <th>D.D. / PBG Details</th>
              <th>Amount (₹)</th>
              <th>Inward Dt & Remarks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="finTableBody">
            ${renderFinTableRows(items)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindFinancialEvents(items = []) {
  // Auto-convert numeric Amount to Words
  const amountInput = document.getElementById('finAmount');
  const wordsInput = document.getElementById('finAmountWords');
  amountInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      wordsInput.value = convertNumberToWordsINR(val);
    } else {
      wordsInput.value = '';
    }
  });

  // Export Excel
  document.getElementById('exportExcelBtn')?.addEventListener('click', async () => {
    try {
      await api.exportFinancialExcel();
    } catch (err) {
      alert('Error exporting Excel register: ' + err.message);
    }
  });

  // Client-side filtering
  const searchInput = document.getElementById('finSearchInput');
  const typeFilter = document.getElementById('finTypeFilter');
  const statusFilter = document.getElementById('finStatusFilter');

  function applyFilters() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    const selectedType = (typeFilter?.value || '').toLowerCase();
    const selectedStatus = (statusFilter?.value || '').toLowerCase();

    const rows = document.querySelectorAll('#finTableBody tr');
    rows.forEach(row => {
      const searchData = (row.getAttribute('data-search') || '').toLowerCase();
      const rowType = (row.getAttribute('data-type') || '').toLowerCase();
      const rowStatus = (row.getAttribute('data-status') || '').toLowerCase();

      const matchesSearch = !query || searchData.includes(query);
      const matchesType = !selectedType || rowType.includes(selectedType);
      const matchesStatus = !selectedStatus || rowStatus === selectedStatus;

      if (matchesSearch && matchesType && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  searchInput?.addEventListener('input', applyFilters);
  typeFilter?.addEventListener('change', applyFilters);
  statusFilter?.addEventListener('change', applyFilters);

  // Form submission
  document.getElementById('finForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      email_address: document.getElementById('finEmail')?.value.trim() || null,
      department: document.getElementById('finDept')?.value.trim() || null,
      item_service_name: document.getElementById('finItemName')?.value.trim() || null,
      bid_order_no: document.getElementById('finBidNo')?.value.trim(),
      bid_start_date: document.getElementById('finBidStartDate')?.value || null,
      bid_end_date: document.getElementById('finBidEndDate')?.value || null,
      bid_estimated_value: document.getElementById('finBidEstValue')?.value || null,
      instrument_type: document.getElementById('finType')?.value,
      dd_number: document.getElementById('finDdNo')?.value.trim(),
      dd_date: document.getElementById('finDdDate')?.value,
      amount: document.getElementById('finAmount')?.value,
      amount_in_rupees: document.getElementById('finAmountWords')?.value.trim() || null,
      bank_name: document.getElementById('finBank')?.value.trim(),
      other_bank_specify: document.getElementById('finOtherBank')?.value.trim() || null,
      vendor_name: document.getElementById('finVendor')?.value.trim(),
      vendor_address: document.getElementById('finVendorAddress')?.value.trim() || '',
      inward_date: document.getElementById('finInwardDate')?.value || null,
      remarks: document.getElementById('finRemarks')?.value.trim() || null,
      remarks_2: document.getElementById('finRemarks2')?.value.trim() || null,
      status: document.getElementById('finStatus')?.value || 'Held in Store'
    };

    try {
      await api.createFinancialInstrument(payload);
      alert('Financial Instrument logged in PostgreSQL ledger!');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

// ----------------------------------------------------
// 7. TECHNICAL SCRUTINY MATRIX (FORM-08)
// ----------------------------------------------------
const DEFAULT_SCRUTINY_PARAMS = [
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

function getBidScrutinyParams(bid) {
  if (!bid) return DEFAULT_SCRUTINY_PARAMS;
  if (Array.isArray(bid.scrutiny_params) && bid.scrutiny_params.length > 0) {
    return bid.scrutiny_params;
  }
  if (typeof bid.scrutiny_params === 'string') {
    try {
      const parsed = JSON.parse(bid.scrutiny_params);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) { }
  }
  return DEFAULT_SCRUTINY_PARAMS;
}

function renderScrutinyView(bids, evaluations = [], selectedBidId = null) {
  const currentBid = bids.find(b => String(b.id) === String(selectedBidId)) || bids[0] || null;
  const activeBidId = currentBid ? currentBid.id : '';
  const activeParams = getBidScrutinyParams(currentBid);

  const formHtml = canCreate('scrutiny') && currentBid ? `
    <div class="card">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3 class="card-title">Add / Evaluate Bidder (FORM-08)</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
            Evaluate the bidder on each parameter below (Yes/No). If all parameters are 'Yes', the bidder is Qualified. If any parameter is 'No', the bidder is Disqualified.
          </p>
        </div>
      </div>
      <form id="scrutinyForm" class="form-grid">
        <input type="hidden" id="scrutinyBidId" value="${activeBidId}" />

        <div class="form-group">
          <label class="form-label">Bidder / Party Name (e.g. M/s Tech Solutions)</label>
          <input type="text" id="scrutinyVendor" class="form-control" placeholder="M/s Vendor Name Pvt Ltd" required />
        </div>

        <div class="form-group">
          <label class="form-label">Bidder / Party Address</label>
          <input type="text" id="scrutinyAddress" class="form-control" placeholder="City, State / Full Address" />
        </div>

        <div class="form-group full-width" style="margin-top:0.5rem;">
          <h4 style="font-size:0.95rem; font-weight:600; margin-bottom:0.75rem; color:var(--text-primary);">
            Scrutiny Parameters Evaluation (${activeParams.length} criteria):
          </h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.75rem;">
            ${activeParams.map((pName, idx) => `
              <div style="background:var(--bg-secondary); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-color);">
                <label style="font-size:0.82rem; font-weight:500; display:block; margin-bottom:0.35rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${pName}">
                  ${idx + 1}. ${pName}
                </label>
                <select class="form-control dynamic-eval-select" data-param="${encodeURIComponent(pName)}" style="padding:0.35rem 0.6rem; font-size:0.85rem;">
                  <option value="Yes" selected>Yes (Compliant)</option>
                  <option value="No">No (Non-Compliant)</option>
                </select>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="form-group full-width">
          <div id="evalStatusPreview" style="padding:0.6rem 0.8rem; border-radius:6px; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); color:var(--accent-green); font-size:0.88rem; font-weight:600; margin-bottom:0.5rem;">
            Calculated Status: Qualified (All parameters are Yes)
          </div>
        </div>

        <div class="form-group full-width" id="reasonGrp" style="display:none;">
          <label class="form-label" style="color:var(--accent-red);">Reason for Disqualification (Required when any parameter is 'No')</label>
          <textarea id="scrutinyReason" class="form-control" placeholder="Specify exact non-compliance reasons..."></textarea>
        </div>

        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Save Bidder Evaluation
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('scrutiny')}

    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div style="flex:1; min-width:240px;">
          <label class="form-label" style="font-size:0.85rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary);">Select GeM Bid to Scrutinize</label>
          <select id="activeBidSelect" class="form-control" style="font-weight:600;">
            ${bids.map(b => `<option value="${b.id}" ${String(b.id) === String(activeBidId) ? 'selected' : ''}>
              ${b.bid_no} — ${b.item_name || 'Procurement Item'} (${b.dept_name || 'LDCE'})
            </option>`).join('')}
          </select>
        </div>
        ${currentBid ? `
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-outline" onclick="handleDownloadDoc('DOC-23', ${currentBid.id})" title="Download Technical Evaluation Matrix Word Document (Actual Participating Bidders Only)">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download DOC-23 (Matrix)
            </button>
            <button class="btn btn-outline" onclick="handleDownloadDoc('DOC-24', ${currentBid.id})" title="Download Reasons for Disqualification Sheet">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download DOC-24 (Disqualification)
            </button>
          </div>
        ` : ''}
      </div>
      ${currentBid ? `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; padding:1rem; background:var(--bg-secondary); border-radius:6px; margin:0 1.25rem 1.25rem 1.25rem; font-size:0.85rem;">
          <div><span style="color:var(--text-secondary);">Item:</span> <strong>${currentBid.item_name || '-'}</strong></div>
          <div><span style="color:var(--text-secondary);">Department:</span> <strong>${currentBid.dept_name || '-'}</strong></div>
          <div><span style="color:var(--text-secondary);">Estimated Cost:</span> <strong>₹${parseFloat(currentBid.est_cost || 0).toLocaleString('en-IN')}</strong></div>
          <div><span style="color:var(--text-secondary);">Bid End Date:</span> <strong>${currentBid.bid_end_date ? new Date(currentBid.bid_end_date).toLocaleDateString('en-GB') : '-'}</strong></div>
          <div><span style="color:var(--text-secondary);">Opening Date:</span> <strong>${currentBid.bid_opening_date ? new Date(currentBid.bid_opening_date).toLocaleDateString('en-GB') : '-'}</strong></div>
        </div>
      ` : ''}
    </div>

    ${currentBid && canCreate('scrutiny') ? `
      <!-- Parameter Customization Card -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h3 class="card-title">⚙️ Customize Scrutiny Parameters for this Bid</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
              You can add, edit, or remove specific evaluation criteria for this tender (e.g., custom turnover threshold, past experience, licenses).
            </p>
          </div>
          <button id="resetParamsBtn" class="btn btn-sm btn-outline" style="font-size:0.8rem;">
            Reset to Standard Defaults
          </button>
        </div>
        <div style="padding:1.25rem;">
          <div id="paramListContainer" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
            ${activeParams.map((p, idx) => `
              <div class="param-row" style="display:flex; gap:0.5rem; align-items:center;">
                <span style="font-weight:600; font-size:0.85rem; min-width:24px; color:var(--text-secondary);">${idx + 1}.</span>
                <input type="text" class="form-control param-item-input" value="${p.replace(/"/g, '&quot;')}" style="flex:1; font-size:0.85rem;" />
                <button type="button" class="btn btn-sm btn-outline remove-param-btn" style="color:var(--accent-red); border-color:var(--accent-red); padding:0.25rem 0.5rem;" title="Remove Parameter">
                  ✖
                </button>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
            <input type="text" id="newParamInput" class="form-control" placeholder="Type new parameter name (e.g. 5 Years Experience in CNC Lathes / ISO 9001)..." style="flex:1; min-width:250px; font-size:0.85rem;" />
            <button type="button" id="addParamBtn" class="btn btn-outline" style="font-size:0.85rem;">
              ➕ Add Parameter
            </button>
          </div>

          <button type="button" id="saveParamsBtn" class="btn btn-primary" style="font-size:0.85rem;">
            💾 Save Parameters Configuration for this Bid
          </button>
        </div>
      </div>
    ` : ''}

    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header">
        <h3 class="card-title">Evaluated Bidders / Parties (${evaluations.length} recorded)</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Party Name & Address</th>
              <th>Overall Status</th>
              <th>Evaluated Criteria</th>
              <th>Disqualification Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${evaluations.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-secondary);">
                  No bidders evaluated yet for this bid. Use the form below to evaluate participating bidders.
                </td>
              </tr>
            ` : evaluations.map((e, idx) => {
    let dynMap = e.param_evaluations;
    if (typeof dynMap === 'string') {
      try { dynMap = JSON.parse(dynMap); } catch (_) { }
    }
    const hasDyn = dynMap && Object.keys(dynMap).length > 0;
    const entries = hasDyn ? Object.entries(dynMap) : [
      ['Turnover', e.param_turnover || 'Yes'],
      ['Specs', e.param_specs || 'Yes'],
      ['ATC', e.param_atc || 'Yes']
    ];

    return `
                <tr>
                  <td><strong>${idx + 1}</strong></td>
                  <td>
                    <strong>${e.bidder_name}</strong>
                    ${e.bidder_address ? `<div style="font-size:0.75rem; color:var(--text-secondary);">${e.bidder_address}</div>` : ''}
                  </td>
                  <td>
                    <span class="badge ${e.final_tech_status === 'Qualified' ? 'badge-success' : 'badge-danger'}">
                      ${e.final_tech_status}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex; flex-wrap:wrap; gap:0.3rem; max-width:400px;">
                      ${entries.map(([k, v]) => `
                        <span class="badge ${v === 'No' ? 'badge-danger' : 'badge-success'}" style="font-size:0.72rem;" title="${k}">
                          ${k.length > 25 ? k.substring(0, 22) + '...' : k}: ${v}
                        </span>
                      `).join('')}
                    </div>
                  </td>
                  <td style="font-size:0.82rem; max-width:200px;">${e.disqualify_reason || '-'}</td>
                  <td>
                    <button class="btn btn-sm btn-outline delete-eval-btn" data-id="${e.id}" style="color:var(--accent-red); border-color:var(--accent-red); padding:0.2rem 0.5rem; font-size:0.75rem;">
                      Delete
                    </button>
                  </td>
                </tr>
              `;
  }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${formHtml}
  `;
}

function bindScrutinyEvents(bids = []) {
  const bidSelect = document.getElementById('activeBidSelect');
  const activeBidId = bidSelect?.value;
  const currentBid = bids.find(b => String(b.id) === String(activeBidId)) || bids[0] || null;

  bidSelect?.addEventListener('change', async (e) => {
    const newBidId = e.target.value;
    try {
      const evalRes = await api.getEvaluations(newBidId);
      const appEl = document.getElementById('app');
      appEl.innerHTML = renderAppShell(renderScrutinyView(bids, evalRes.data || [], newBidId), 'scrutiny');
      bindScrutinyEvents(bids);
    } catch (err) {
      alert('Error fetching evaluations: ' + err.message);
    }
  });

  // Parameter Configuration Handlers
  const addParamBtn = document.getElementById('addParamBtn');
  const newParamInput = document.getElementById('newParamInput');
  const paramListContainer = document.getElementById('paramListContainer');
  const saveParamsBtn = document.getElementById('saveParamsBtn');
  const resetParamsBtn = document.getElementById('resetParamsBtn');

  function bindParamRemoveButtons() {
    document.querySelectorAll('.remove-param-btn').forEach(btn => {
      btn.onclick = (e) => {
        const row = e.target.closest('.param-row');
        if (paramListContainer && paramListContainer.children.length <= 1) {
          alert('At least one scrutiny parameter is required.');
          return;
        }
        row?.remove();
      };
    });
  }
  bindParamRemoveButtons();

  addParamBtn?.addEventListener('click', () => {
    const val = newParamInput?.value?.trim();
    if (!val) {
      alert('Please type a parameter name first');
      return;
    }
    if (paramListContainer) {
      const count = paramListContainer.children.length + 1;
      const row = document.createElement('div');
      row.className = 'param-row';
      row.style.cssText = 'display:flex; gap:0.5rem; align-items:center;';
      row.innerHTML = `
        <span style="font-weight:600; font-size:0.85rem; min-width:24px; color:var(--text-secondary);">${count}.</span>
        <input type="text" class="form-control param-item-input" value="${val.replace(/"/g, '&quot;')}" style="flex:1; font-size:0.85rem;" />
        <button type="button" class="btn btn-sm btn-outline remove-param-btn" style="color:var(--accent-red); border-color:var(--accent-red); padding:0.25rem 0.5rem;" title="Remove Parameter">
          ✖
        </button>
      `;
      paramListContainer.appendChild(row);
      newParamInput.value = '';
      bindParamRemoveButtons();
    }
  });

  resetParamsBtn?.addEventListener('click', async () => {
    if (confirm('Reset parameters to the standard 10 LDCE criteria?')) {
      if (activeBidId) {
        try {
          await api.updateBidParams(activeBidId, DEFAULT_SCRUTINY_PARAMS);
          alert('Parameters reset to standard defaults!');
          // Update local bid object
          if (currentBid) currentBid.scrutiny_params = DEFAULT_SCRUTINY_PARAMS;
          const evalRes = await api.getEvaluations(activeBidId);
          const appEl = document.getElementById('app');
          appEl.innerHTML = renderAppShell(renderScrutinyView(bids, evalRes.data || [], activeBidId), 'scrutiny');
          bindScrutinyEvents(bids);
        } catch (err) {
          alert('Error resetting parameters: ' + err.message);
        }
      }
    }
  });

  saveParamsBtn?.addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.param-item-input');
    const params = Array.from(inputs).map(inp => inp.value.trim()).filter(Boolean);
    if (params.length === 0) {
      alert('Please add at least one scrutiny parameter');
      return;
    }
    if (activeBidId) {
      try {
        await api.updateBidParams(activeBidId, params);
        alert('Scrutiny parameters configuration saved for this bid!');
        if (currentBid) currentBid.scrutiny_params = params;
        const evalRes = await api.getEvaluations(activeBidId);
        const appEl = document.getElementById('app');
        appEl.innerHTML = renderAppShell(renderScrutinyView(bids, evalRes.data || [], activeBidId), 'scrutiny');
        bindScrutinyEvents(bids);
      } catch (err) {
        alert('Error saving parameters: ' + err.message);
      }
    }
  });

  // Dynamic preview update for all parameters in form
  const dynamicSelects = document.querySelectorAll('.dynamic-eval-select');
  const previewBox = document.getElementById('evalStatusPreview');
  const reasonGrp = document.getElementById('reasonGrp');
  const reasonInput = document.getElementById('scrutinyReason');

  function updateStatusPreview() {
    let hasNo = false;
    dynamicSelects.forEach(sel => {
      if (sel.value === 'No') hasNo = true;
    });

    if (hasNo) {
      if (previewBox) {
        previewBox.style.background = 'rgba(239,68,68,0.1)';
        previewBox.style.borderColor = 'rgba(239,68,68,0.3)';
        previewBox.style.color = 'var(--accent-red)';
        previewBox.innerText = 'Calculated Status: Disqualified (One or more parameters are "No")';
      }
      if (reasonGrp) reasonGrp.style.display = 'block';
      if (reasonInput) reasonInput.required = true;
    } else {
      if (previewBox) {
        previewBox.style.background = 'rgba(34,197,94,0.1)';
        previewBox.style.borderColor = 'rgba(34,197,94,0.3)';
        previewBox.style.color = 'var(--accent-green)';
        previewBox.innerText = 'Calculated Status: Qualified (All parameters are "Yes")';
      }
      if (reasonGrp) reasonGrp.style.display = 'none';
      if (reasonInput) reasonInput.required = false;
    }
  }

  dynamicSelects.forEach(sel => sel.addEventListener('change', updateStatusPreview));

  // Form submission
  document.getElementById('scrutinyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bidId = document.getElementById('scrutinyBidId')?.value;
    const vendor = document.getElementById('scrutinyVendor')?.value?.trim();
    const address = document.getElementById('scrutinyAddress')?.value?.trim();
    const reason = document.getElementById('scrutinyReason')?.value?.trim();

    if (!bidId || !vendor) {
      alert('Please select a bid and enter bidder name');
      return;
    }

    const paramEvaluations = {};
    dynamicSelects.forEach(sel => {
      const pName = decodeURIComponent(sel.getAttribute('data-param') || '');
      if (pName) {
        paramEvaluations[pName] = sel.value;
      }
    });

    const payload = {
      bid_id: parseInt(bidId, 10),
      bidder_name: vendor,
      bidder_address: address || null,
      param_evaluations: paramEvaluations,
      disqualify_reason: reason || null
    };

    try {
      await api.createEvaluation(payload);
      alert(`Bidder evaluation for "${vendor}" saved successfully!`);
      const evalRes = await api.getEvaluations(bidId);
      const appEl = document.getElementById('app');
      appEl.innerHTML = renderAppShell(renderScrutinyView(bids, evalRes.data || [], bidId), 'scrutiny');
      bindScrutinyEvents(bids);
    } catch (err) {
      alert('Error saving evaluation: ' + err.message);
    }
  });

  // Delete evaluation handler
  document.querySelectorAll('.delete-eval-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const evalId = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this bidder evaluation?')) {
        try {
          await api.deleteEvaluation(evalId);
          const evalRes = await api.getEvaluations(activeBidId);
          const appEl = document.getElementById('app');
          appEl.innerHTML = renderAppShell(renderScrutinyView(bids, evalRes.data || [], activeBidId), 'scrutiny');
          bindScrutinyEvents(bids);
        } catch (err) {
          alert('Error deleting evaluation: ' + err.message);
        }
      }
    });
  });
}

// ----------------------------------------------------
// 8. COMMITTEE SANCTIONS & MULTI-DOC FILL & DOWNLOAD HUB (FORM-09 & DOC-25 to 35)
// ----------------------------------------------------
let activeCommitteeDocTab = 'DOC-25';

function renderCommitteeView(meetings = [], indents = [], bids = [], selectedMeetingId = null, activeDocId = null) {
  const currentMeeting = meetings.find(m => String(m.id) === String(selectedMeetingId)) || meetings[0] || null;
  const activeMeetingId = currentMeeting ? currentMeeting.id : '';
  const isDPC = currentMeeting?.committee_type === 'DPC';

  if (activeDocId) {
    activeCommitteeDocTab = activeDocId;
  } else if (isDPC && !['DOC-30', 'DOC-31', 'DOC-32', 'DOC-33', 'DOC-34'].includes(activeCommitteeDocTab)) {
    activeCommitteeDocTab = 'DOC-30';
  } else if (!isDPC && !['DOC-25', 'DOC-25A', 'DOC-26', 'DOC-27', 'DOC-28', 'DOC-29'].includes(activeCommitteeDocTab)) {
    activeCommitteeDocTab = 'DOC-25';
  }

  let agenda = currentMeeting?.agenda_data || {};
  if (typeof agenda === 'string') {
    try { agenda = JSON.parse(agenda); } catch (_) { }
  }

  // Pre-fill fallbacks
  const defaultOfficeName = agenda.office_name || 'એલ.ડી કોલેજ ઓફ એન્જીનિયરીંગ, અમદાવાદ\nસેન્ટ્રલ સ્ટોર';
  const defaultAgendaRef = agenda.agenda_ref || currentMeeting?.meeting_ref || 'LDCE/DLPC/2026-27/01';
  const defaultAgendaDate = agenda.agenda_date || (currentMeeting?.meeting_date ? new Date(currentMeeting.meeting_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const defaultPurchaseType = agenda.purchase_type || 'Bid';
  const defaultItemName = agenda.item_name || currentMeeting?.item_name || '';
  const defaultQty = agenda.qty || 'As per Bid';
  const defaultEstCost = agenda.est_cost || currentMeeting?.l1_amount || '';
  const defaultAdminApproval = agenda.admin_approval || 'તા. 01/04/2026 ની નોંધ ઉપર આચાર્યશ્રી ની મંજુરી મળેલ છે.';
  const defaultGrantHead = agenda.grant_head || 'Office Expenses/Contingency';
  const defaultL1Vendor = agenda.l1_vendor || currentMeeting?.l1_vendor || '';
  const defaultL1Amount = agenda.l1_amount || currentMeeting?.l1_amount || '';
  const defaultConsignee = agenda.consignee || 'Principal, L.D. College of Engineering, Ahmedabad';
  const defaultTotalParts = agenda.total_participants || '03';
  const defaultQualCount = agenda.qualified_count || '03';
  const defaultDisqualReasons = agenda.disqualified_reasons || 'લાગુ પડતું નથી';
  const defaultBidDuration = agenda.bid_duration || '૧૧ દિવસ';

  // Define DLPC & DPC documents list
  const dlpcDocs = [
    { id: 'DOC-25', name: 'DLPC Agenda & Proposal', nameGuj: 'ગુજરાતી એજન્ડા નોંધ (3-Page Checklist Format)', desc: 'Official 2-column Gujarati proposal with 20-point checklist for DLPC sanction.' },
    { id: 'DOC-25A', name: 'GeM Agenda Format – DLPC', nameGuj: 'GeM એજન્ડા નોંધ (DLPC 9-Point Format)', desc: 'Official 9-point GeM purchase agenda format with customizable right column.' },
    { id: 'DOC-26', name: 'Certificate for reasonability of rate', nameGuj: 'ભાવ વ્યાજબીપણા પ્રમાણપત્ર', desc: 'Official Rate Reasonability Certificate signed by Head of Department.' },
    { id: 'DOC-27', name: 'DLPC Minutes of Meeting (MOM)', nameGuj: 'ડી.એલ.પી.સી. બેઠકની કાર્યવાહી નોંધ', desc: 'Formal minutes with attendee details, deliberations, and resolution order.' },
    { id: 'DOC-28', name: 'Checklist B – Final Approval Package', nameGuj: 'તપાસ યાદી - બી (આખરી મંજૂરી ફાઇલ)', desc: '11-point verification checklist before placing GeM purchase order.' },
    { id: 'DOC-29', name: 'Note – Direct Purchase Against Bid', nameGuj: 'ડાયરેક્ટ પર્ચેઝ દરખાસ્ત નોંધ', desc: 'Internal note for sanction and placement of PO with L1 vendor.' }
  ];

  const dpcDocs = [
    { id: 'DOC-30', name: 'DPC Proposal Document Index', nameGuj: 'ડી.પી.સી. દરખાસ્ત અનુક્રમણિકા', desc: 'Document index for tenders above ₹ 5.00 Lakhs submitted to Directorate.' },
    { id: 'DOC-31', name: 'DPC Forwarding Letter to Directorate', nameGuj: 'ડી.ટી.ઇ. દરખાસ્ત પત્ર', desc: 'Official Gujarati forwarding letter with Government of Gujarat letterhead.' },
    { id: 'DOC-32', name: 'GeM Agenda Format – DPC', nameGuj: 'ડી.પી.સી. એજન્ડા ફોર્મેટ', desc: 'Comprehensive agenda proposal submitted to state DPC committee.' },
    { id: 'DOC-26', name: 'Certificate for reasonability of rate', nameGuj: 'ભાવ વ્યાજબીપણા પ્રમાણપત્ર', desc: 'Official Rate Reasonability Certificate signed by Head of Department.' },
    { id: 'DOC-33', name: 'Institute BID Certificate', nameGuj: 'સંસ્થા બિડ પ્રમાણપત્ર', desc: 'Non-division and compliance certificate issued by the institute.' },
    { id: 'DOC-34', name: 'L1 INFO Sheet for DPC', nameGuj: 'એલ-૧ માહિતી પત્રક', desc: 'L1 vendor specifications, financials, and comparison sheet.' }
  ];

  const currentDocs = isDPC ? dpcDocs : dlpcDocs;

  const newMeetingForm = canCreate('committee') ? `
    <div class="card" id="newMeetingCard" style="display:none; margin-bottom:1.5rem;">
      <div class="card-header">
        <h3 class="card-title">Schedule / Record New Committee Sanction (FORM-09)</h3>
      </div>
      <form id="committeeForm" class="form-grid" style="padding:1.25rem;">
        <div class="form-group">
          <label class="form-label">Committee Type</label>
          <select id="committeeType" class="form-control">
            <option value="DLPC">DLPC (District Level Purchase Committee — ≤ ₹ 5.00 Lakhs)</option>
            <option value="DPC">DPC (Departmental Purchase Committee — > ₹ 5.00 Lakhs)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Meeting Ref No</label>
          <input type="text" id="committeeRef" class="form-control" placeholder="e.g. LDCE/DLPC/2026-27/01" required />
        </div>
        <div class="form-group">
          <label class="form-label">Meeting Date</label>
          <input type="date" id="committeeDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Associated Purchase Indent</label>
          <select id="committeeIndentId" class="form-control">
            <option value="">-- None / Direct --</option>
            ${indents.map(i => `<option value="${i.id}">${i.indent_no} — ${i.item_name} (₹${parseFloat(i.est_cost || 0).toLocaleString('en-IN')})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Associated GeM Bid</label>
          <select id="committeeBidId" class="form-control">
            <option value="">-- None / Non-Bid --</option>
            ${bids.map(b => `<option value="${b.id}">${b.bid_no} — ${b.item_name || 'Item'}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">L1 Vendor Name</label>
          <input type="text" id="committeeL1" class="form-control" placeholder="M/s Vendor Name" required />
        </div>
        <div class="form-group">
          <label class="form-label">L1 Final Amount (₹)</label>
          <input type="number" id="committeeAmount" class="form-control" step="0.01" required />
        </div>
        <div class="form-group full-width">
          <label class="form-label">Rate Reasonability Certification</label>
          <textarea id="committeeReasonability" class="form-control" rows="2" required>The L1 rate quoted is verified against market survey and found reasonable.</textarea>
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 18V6"/><path d="M16 10a4 4 0 0 0-8 0"/></svg>
            Save Resolution & Register Meeting
          </button>
        </div>
      </form>
    </div>
  ` : '';

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

  return `
    ${renderAccessBanner('committee')}

    <!-- Top Meeting Bar -->
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div style="flex:1; min-width:260px;">
          <label class="form-label" style="font-size:0.85rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary);">Select Committee Meeting</label>
          <select id="activeMeetingSelect" class="form-control" style="font-weight:600;">
            ${meetings.map(m => `<option value="${m.id}" ${String(m.id) === String(activeMeetingId) ? 'selected' : ''}>
              [${m.committee_type}] ${m.meeting_ref} — ${m.item_name || m.l1_vendor || 'Meeting'} (₹${parseFloat(m.l1_amount || 0).toLocaleString('en-IN')})
            </option>`).join('')}
          </select>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          ${canCreate('committee') ? `
            <button id="toggleNewMeetingBtn" class="btn btn-outline">
              ➕ New Meeting Sanction
            </button>
          ` : ''}
        </div>
      </div>
      ${currentMeeting ? `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; padding:1rem; background:var(--bg-secondary); border-radius:6px; margin:0 1.25rem 1.25rem 1.25rem; font-size:0.85rem;">
          <div><span style="color:var(--text-secondary);">Committee:</span> <strong>${currentMeeting.committee_type} (${isDPC ? '> ₹ 5.00 L' : '≤ ₹ 5.00 L'})</strong></div>
          <div><span style="color:var(--text-secondary);">Ref No:</span> <strong>${currentMeeting.meeting_ref}</strong></div>
          <div><span style="color:var(--text-secondary);">L1 Vendor:</span> <strong>${currentMeeting.l1_vendor}</strong></div>
          <div><span style="color:var(--text-secondary);">Sanction Amount:</span> <strong>₹${parseFloat(currentMeeting.l1_amount || 0).toLocaleString('en-IN')}</strong></div>
          <div><span style="color:var(--text-secondary);">Meeting Date:</span> <strong>${currentMeeting.meeting_date ? new Date(currentMeeting.meeting_date).toLocaleDateString('en-GB') : '-'}</strong></div>
          <div><span style="color:var(--text-secondary);">Status:</span> <span class="badge badge-success">${currentMeeting.status || 'Sanctioned'}</span></div>
        </div>
      ` : ''}
    </div>

    ${newMeetingForm}

    ${currentMeeting ? `
      <!-- DOCUMENTS PACKAGE GRID (FILL & DOWNLOAD OPTIONS) -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h3 class="card-title" style="font-size:1.05rem; font-weight:700;">
              📂 ${currentMeeting.committee_type} Official Documents Package (${currentDocs.length} Documents)
            </h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
              Click <strong>"📝 Fill & Download"</strong> to customize fields or <strong>"📥 Download"</strong> to get the generated .docx file.
            </p>
          </div>
        </div>
        <div style="padding:1rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:0.85rem;">
          ${currentDocs.map(doc => {
    const isActive = activeCommitteeDocTab === doc.id;
    return `
              <div class="doc-package-card" style="border:1.5px solid ${isActive ? 'var(--accent-primary, #6366F1)' : 'var(--border-color)'}; background:${isActive ? 'rgba(99,102,241,0.04)' : 'var(--bg-primary)'}; padding:0.9rem; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between; gap:0.6rem; transition:all 0.2s ease;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.35rem;">
                    <span class="badge ${isActive ? 'badge-primary' : 'badge-info'}" style="font-weight:700; font-size:0.75rem;">${doc.id}</span>
                    <span style="font-size:0.75rem; color:var(--text-secondary);">${doc.nameGuj}</span>
                  </div>
                  <h4 style="font-size:0.92rem; font-weight:600; color:var(--text-primary); margin-bottom:0.25rem;">${doc.name}</h4>
                  <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.35; margin:0;">${doc.desc}</p>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                  <button type="button" class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'} doc-tab-btn" data-doc="${doc.id}" style="flex:1; font-size:0.8rem; padding:0.35rem 0.6rem;">
                    ${['DOC-26', 'DOC-27', 'DOC-28', 'DOC-29', 'DOC-30', 'DOC-31', 'DOC-33', 'DOC-34'].includes(doc.id) ? '👁️ View' : '📝 Fill &amp; Customize'}
                  </button>
                  <button type="button" class="btn btn-sm btn-outline" onclick="handleDownloadDoc('${doc.id}', ${currentMeeting.id})" title="Instant Download .docx" style="font-size:0.8rem; padding:0.35rem 0.6rem;">
                    📥 Download
                  </button>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      </div>

      <!-- ACTIVE FILL & DOWNLOAD WORKSPACE -->
      <div id="committeeWorkspace">
        ${activeCommitteeDocTab === 'DOC-30' ? `
          <!-- DOC-30: DPC PROPOSAL DOCUMENT INDEX PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-30: DPC Proposal Document Index
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Official DPC proposal document index for tenders above ₹ 5.00 Lakhs submitted to Directorate.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-30', ${currentMeeting.id})" style="font-size:0.85rem;">
                  📥 Download DOC-30 (.docx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center;">
              <div style="width:100%; max-width:850px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:3.5rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Verdana, Arial, sans-serif;">
                
                <!-- Center Header -->
                <div style="text-align:center; margin-bottom:0.75rem;">
                  <h2 style="font-size:1.35rem; font-weight:700; margin:0; color:#0f172a;">
                    L.D College of Engineering, Ahmedabad
                  </h2>
                </div>

                <!-- Bid No Subtitle -->
                <div style="text-align:center; margin-bottom:2rem; font-size:1.05rem; font-weight:700; color:#0f172a;">
                  (Bid No. ${currentMeeting.bid_no || agenda.bid_no || 'GEM/2026/B/7586906'}${currentMeeting.bid_opening_date || currentMeeting.bid_publish_date ? `, dt.${new Date(currentMeeting.bid_opening_date || currentMeeting.bid_publish_date).toLocaleDateString('en-GB')}` : ', dt.26/05/2026'})
                </div>

                <!-- 3-Column Table -->
                <table style="width:100%; border-collapse:collapse; border:1px solid #334155; font-size:0.95rem; margin-bottom:1.5rem;">
                  <thead>
                    <tr style="border-bottom:1px solid #334155; background:#f8fafc; font-weight:700;">
                      <th style="width:12%; padding:0.75rem; text-align:center; border-right:1px solid #334155;">ક્રમ</th>
                      <th style="width:73%; padding:0.75rem; text-align:left; border-right:1px solid #334155;">બિડને લગતા દસ્તાવેજ</th>
                      <th style="width:15%; padding:0.75rem; text-align:center;">પેજ નં.</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${[
          { sr: '1', title: 'સંસ્થા કક્ષાએ આંતરીક કિમટીની રચના અંગેનો કચેરી આદેશ', page: '1-1' },
          { sr: '2', title: 'બીડને લગતી શરતો / સ્પેશિફીકેશન (કોરીજડમની વિગતો જો લાગુ પડતી હોય તો)', page: '5-17' },
          { sr: '3', title: 'બીડ ડોક્યુમેન્ટ', page: '19-25' },
          { sr: '4', title: 'ટેકનીકલ ઈવેલ્યુએશનની વિગતો', page: '27-101' },
          { sr: '5', title: 'ફાયનાન્સિયલ ઈવેલ્યુએશનની વિગતો', page: '103-111' },
          { sr: '6', title: 'જો કોઈ બીડરને અમાન્ય કરેલ હોઈ તો અમાન્ય કરવાના કારણોની વિગતો', page: '113-113' },
          { sr: '7', title: 'GeM મારફત ખરીદી માટે ખરીદ સિમિત સમક્ષ રજુ કરવાની એજન્ડા નોંધ', page: '115-115' }
        ].map(row => `
                      <tr style="border-bottom:1px solid #334155;">
                        <td style="padding:0.75rem; text-align:center; border-right:1px solid #334155; font-weight:500;">${row.sr}</td>
                        <td style="padding:0.75rem; border-right:1px solid #334155; font-family:'Shruti', 'Gujarati Sangam MN', sans-serif;">${row.title}</td>
                        <td style="padding:0.75rem; text-align:center; font-weight:500;">${row.page}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ DPC Proposal Index is generated matching the official DPC format.
              </span>
              <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-30', ${currentMeeting.id})">
                📥 Download DOC-30 (.docx)
              </button>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-31' ? `
          <!-- DOC-31: DPC FORWARDING LETTER PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-31: DPC Forwarding Letter to Directorate
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Official Gujarati forwarding letter to Directorate of Technical Education with Government of Gujarat letterhead.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-31', ${currentMeeting.id})" style="font-size:0.85rem;">
                  📥 Download DOC-31 (.docx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center;">
              <div style="width:100%; max-width:850px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:3.5rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Verdana, Arial, sans-serif;">
                
                <!-- Official Letterhead -->
                <div style="display:flex; align-items:center; justify-content:center; gap:1.5rem; border-bottom:2.5px solid #e05a47; padding-bottom:1.25rem; margin-bottom:1.5rem;">
                  <div style="text-align:center; flex-shrink:0;">
                    <img src="/src/assets/ldce_logo.png" alt="LDCE Logo" style="width:75px; height:75px; object-fit:contain;" />
                    <div style="font-size:0.78rem; font-weight:700; color:#e05a47; margin-top:0.25rem; letter-spacing:0.05em;">EST:1948</div>
                  </div>
                  <div style="text-align:center; flex:1;">
                    <div style="font-size:1.25rem; font-family:Georgia, serif; color:#e05a47;">Government of Gujarat</div>
                    <div style="font-size:1.35rem; font-family:Georgia, serif; font-weight:700; color:#e05a47; margin:0.2rem 0;">L. D. College of Engineering, Ahmedabad</div>
                    <div style="font-size:0.85rem; color:#2980b9; line-height:1.4;">Opp. Gujarat University, Navrangpura<br/>Ahmedabad, Gujarat – 380 015</div>
                    <div style="font-size:0.82rem; color:#2980b9; margin-top:0.15rem;">Email: ldce-abad-dte@gujarat.gov.in &nbsp; Website: www.ldce.ac.in</div>
                    <div style="font-size:0.82rem; color:#2980b9;">Phone: Office – 079 26302887</div>
                  </div>
                </div>

                <!-- Ref & Date Row -->
                <div style="display:flex; justify-content:space-between; font-size:0.95rem; margin-bottom:1.5rem; color:#0f172a;">
                  <div>ક્રમાંક:એલડીસીઈ/ખરીદી/ડીપીસી/૨૦૨૬-૨૭/${currentMeeting.meeting_ref || agenda.agenda_ref || ''}</div>
                  <div>તા. ${currentMeeting.meeting_date ? new Date(currentMeeting.meeting_date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</div>
                </div>

                <!-- Addressee Block -->
                <div style="font-size:0.95rem; line-height:1.6; margin-bottom:1.5rem; color:#0f172a;">
                  <div>પ્રતિ,</div>
                  <div>નિયામકશ્રી,</div>
                  <div>ટેકનીકલ શિક્ષણની કચેરી,</div>
                  <div>બ્લોક નંબર-૦૨, છઠ્ઠો માળ,</div>
                  <div>કર્મયોગીભાવન,સેક્ટર-૧૦એ,</div>
                  <div>ગાંધીનગર-૩૮૨૦૧૦</div>
                </div>

                <!-- Subject -->
                <div style="font-size:0.95rem; font-weight:600; margin-bottom:1rem; color:#0f172a;">
                  વિષય: સંસ્થા ખાતે જરૂરી સાધન/સેવાની ખરીદી બાબતે મંજુરી આપવા બાબત.
                </div>

                <!-- Reference -->
                <div style="font-size:0.9rem; line-height:1.5; margin-bottom:1.5rem; color:#334155;">
                  <div>સંદર્ભ: Gujarat State Procurement Policy-2024, Resolution No. SPO-102021-188460-CH</div>
                  <div style="padding-left:3.2rem;">dt.14/03/2024 of Industry &amp; Mines Department, Govt. of Gujarat.</div>
                </div>

                <!-- Salutation -->
                <div style="font-size:0.95rem; margin-bottom:1rem; color:#0f172a;">
                  માનનીય સાહેબ,
                </div>

                <!-- Body Paragraph -->
                <div style="text-align:justify; font-size:0.95rem; line-height:2; margin-bottom:4rem; color:#1e293b;">
                  અત્રેની સંસ્થા ખાતે જરૂરી <strong>${agenda.item_name || currentMeeting.item_name || 'Handling & Shifting Services'}</strong> માટે બીડ પ્રસિદ્ધ કરવામાં આવેલ જે અન્વયે તબક્કાવારની પ્રક્રિયાને અંતે લાયક ઠરેલ સૌથી ઓછા ભાવ આપનાર <strong>L1 પેઢી ${agenda.l1_vendor || currentMeeting.l1_vendor || 'Tousman Ventures Pvt. Ltd. અમદાવાદ'}</strong> તરફથી રૂ.<strong>${(agenda.l1_amount || currentMeeting.l1_amount) ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') + '/-' : '૫,૪૯,૦૦૦/-'}</strong> અંકે રૂપિયા <strong>${numToGujaratiWords(agenda.l1_amount || currentMeeting.l1_amount || 549000)} પુરા</strong> ના ભાવ મળેલ છે. સદર મંજૂરી માટે DPC સ્તરે સત્તા પ્રદાન થયેલ હોવાથી મંજુરી આપવા ઘટતી કાર્યવાહી કરવા વિનંતી.
                </div>

                <!-- Right-aligned Signature -->
                <div style="text-align:right; margin-top:3rem; font-size:1.05rem; font-weight:600; color:#0f172a;">
                  આચાર્ય
                </div>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ DPC Forwarding Letter is locked and ready for official download.
              </span>
              <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-31', ${currentMeeting.id})">
                📥 Download DOC-31 (.docx)
              </button>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-27' ? `
          <!-- DOC-27: DLPC MINUTES OF MEETING (MOM) PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-27: DLPC Minutes of Meeting (MOM)
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Official Minutes of Meeting format matching LDCE DLPC specifications.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-27', ${currentMeeting.id})" style="font-size:0.85rem;">
                  📥 Download DOC-27 (.docx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center;">
              <div style="width:100%; max-width:850px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:3.5rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Verdana, Arial, sans-serif;">
                
                <!-- Center Header -->
                <div style="text-align:center; margin-bottom:2rem;">
                  <h2 style="font-size:1.35rem; font-weight:700; margin:0; color:#0f172a;">
                    L.D College of Engineering, Ahmedabad
                  </h2>
                </div>

                <!-- Top Right Meta -->
                <div style="text-align:right; margin-bottom:2rem; font-size:1rem; line-height:1.6; color:#0f172a;">
                  <div>${(currentMeeting.dept_name || 'Department').endsWith('Department') ? currentMeeting.dept_name : `${currentMeeting.dept_name || 'Department'} Department`}</div>
                  <div>DLPC No. <strong>${currentMeeting.meeting_ref || '.........'}</strong></div>
                  <div>DLPC Date: <strong>${currentMeeting.meeting_date ? new Date(currentMeeting.meeting_date).toLocaleDateString('en-GB') : '...............'}</strong></div>
                </div>

                <!-- Gujarati Body Paragraph -->
                <div style="text-align:justify; margin-bottom:2rem; font-size:1.05rem; line-height:1.9; color:#1e293b;">
                  એલ.ડી. એન્જીનિયરીંગ કોલેજની વિવિધ વિદ્યાશાખામાં જરૂરી સાધન <strong>${agenda.item_name || currentMeeting.item_name || 'સાધન'}</strong> Qty. <strong>${agenda.qty || currentMeeting.indent_qty || '1'}</strong> No. ની ખરીદી બાબતે આંતરિક સમિતિ દ્વારા સાધનાના સ્પેસીફીકેશન તથા બીડની બોલીઓ અને શરતો નક્કી કરી GeM Portal ઉપર બીડ પ્રસિદ્ધ કરવામાં આવેલ. તબક્કાવારની ખરીદ પ્રક્રિયાને અંતે સૌથી ઓછા ભાવ આપતી l1 પેઢી <strong>${agenda.l1_vendor || currentMeeting.l1_vendor || 'Party Name'}${currentMeeting.vendor_address ? ', ' + currentMeeting.vendor_address : ''}</strong> ના ભાવ રૂ.. <strong>${(agenda.l1_amount || currentMeeting.l1_amount) ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') + '/-' : '0/-'}</strong> અંકે રૂપિયા <strong>${numToGujaratiWords(agenda.l1_amount || currentMeeting.l1_amount)}</strong> પુરા જીલ્લા કક્ષાની સત્તાધિકાર સમિતિ (DLPC) દ્વારા સર્વાનુમતે ખરીદી માટે માન્ય રાખવામાં આવેછે.
                </div>

                <!-- Committee Heading -->
                <div style="margin-bottom:1rem; font-weight:700; font-size:1.05rem; color:#0f172a;">
                  જીલ્લા કક્ષાની સત્તાધિકાર ખરીદ સમિતિ (DLPC):
                </div>

                <!-- Committee 4-Column Table -->
                <table style="width:100%; border-collapse:collapse; border:1px solid #334155; font-size:0.92rem; margin-bottom:1rem;">
                  <tbody>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="width:7%; padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૧</td>
                      <td style="width:55%; padding:0.6rem; border-right:1px solid #334155;">આચાર્યશ્રી,એલ.ડી. કોલેજ ઓફ એન્જી. ,અમદાવાદ.</td>
                      <td style="width:15%; padding:0.6rem; text-align:center; border-right:1px solid #334155;">અધ્યક્ષ</td>
                      <td style="width:23%; padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૨</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">હિસાબી અધિકારીશ્રી જિલ્લા પંચાયત અમદાવાદ</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૩</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">જિલ્લા ઉદ્યોગ કેન્દ્રના જનરલ મેનેજરશ્રી,અમદાવાદ</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૪</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">હિસાબી અધિકારીશ્રી,એલ.ડી.કોલેજ ઓફ એન્જી., અમદાવાદ</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય સચિવ</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૫.૧</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">પ્રાધ્યાપક,મીકેનીકલ એન્જી., સ્ટોર અને ખરીદી શાખાનાં વડા</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૫.૨</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">પ્રાધ્યાપક,કોમ્પ્યુટર એન્જી.</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૫.૩</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">પ્રાધ્યાપક, સિવિલ એન્જી.</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૫.૪</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">પ્રાધ્યાપક,કેમિકલ એન્જી.</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૫.૫</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">પ્રાધ્યાપક, ઈલેક્ટ્રીકલ એન્જી.</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૫.૬</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">સહપ્રાધ્યાપક, મીકેનીકલ એન્જી. , સ્ટોર ઓફિસર</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                    <tr>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155; font-weight:600;">૫.૭</td>
                      <td style="padding:0.6rem; border-right:1px solid #334155;">સહપ્રાધ્યાપક, ટેક્ષટાઈલ ટેકનોલોજી, સ્ટોર ઓફિસર</td>
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid #334155;">સભ્ય</td>
                      <td style="padding:0.6rem;"></td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ MOM details are auto-populated from database. Click below to download the official .docx format.
              </span>
              <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-27', ${currentMeeting.id})">
                📥 Download DOC-27 (.docx)
              </button>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-28' ? `
          <!-- DOC-28: CHECKLIST B PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-28: Checklist B - Final Approval
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Official Check list–B-R3 for final approval of procurement proposal.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-28', ${currentMeeting.id})" style="font-size:0.85rem;">
                  📥 Download DOC-28 (.docx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center;">
              <div style="width:100%; max-width:850px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:3rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Arial, sans-serif;">
                
                <!-- Center Header -->
                <div style="text-align:center; margin-bottom:2rem;">
                  <h3 style="font-size:1.2rem; font-weight:700; margin:0; color:#0f172a; text-decoration:underline;">
                    Check list–B-R3 (For final approval)
                  </h3>
                </div>

                <!-- 17 Points Table -->
                <table style="width:100%; border-collapse:collapse; border:1px solid #94a3b8; font-size:0.9rem; margin-bottom:2rem;">
                  <tbody>
                    ${[
          '1. Sanction on Note (Admin Approval for Purchase)',
          '2. Grant Order along with details of allocation of Grant of current FY under relevant Major Head',
          '3. Copy of Purchase Indent Sheet with Spec.',
          '4. Copy of Published Bid with Terms and conditions',
          '5. Copy of Bid Extension (if any)',
          '6. List of participant Bidders',
          '7. Minutes of Meeting of primary scrutiny committee (Technical Evaluation)',
          '8. Technical Scrutiny (Primary) with compliance statement & relevant documents of Bidders',
          '9. Details of MSE / MII benefits provided to L1 / Any Bidders (if any)',
          '10. Clarification (Representation / Challenge) submitted by Bidders & Remarks of Department',
          '11. Reason for rejection of technically disqualified bidders & copy of representation / rejection reply',
          '12. Minutes of Meeting of Final Scrutiny Committee',
          '13. Final Technical Scrutiny report with compliance statement & technical approval',
          '14. Financial comparison sheet / L1 details from GeM (Before / After RA)',
          '15. Financial statement of all qualified bidders',
          '16. Certificate for reasonability of rate by competent authority (DOC-26)',
          '17. DLPC / DPC Sanction Agenda & Minutes of Meeting (DOC-25 / DOC-27)'
        ].map((item, idx) => `
                      <tr style="border-bottom:1px solid #94a3b8; background:${idx % 2 === 1 ? '#f8fafc' : '#fff'};">
                        <td style="padding:0.55rem 0.85rem; border-right:1px solid #94a3b8;">${item}</td>
                        <td style="width:20%; padding:0.55rem 0.85rem; text-align:center; font-weight:600; color:#16a34a;">[ ✔ Attached ]</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

                <!-- Signatures -->
                <div style="display:flex; justify-content:space-between; margin-top:3rem; padding-top:1.5rem; border-top:1px dashed #cbd5e1; font-weight:600; font-size:0.95rem;">
                  <div>Store Officer</div>
                  <div>Head of Department</div>
                  <div>Principal</div>
                </div>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ Checklist B is verified and ready for final approval.
              </span>
              <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-28', ${currentMeeting.id})">
                📥 Download DOC-28 (.docx)
              </button>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-26' ? `
          <!-- DOC-26: RATE REASONABILITY CERTIFICATE PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-26: Certificate for reasonability of rate
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  This official certificate is generated from verified Indent, Bid Scrutiny, and Sanction records in the database.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-26', ${currentMeeting.id})" style="font-size:0.85rem;">
                  📥 Download DOC-26 (.docx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center;">
              <div style="width:100%; max-width:820px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:3.5rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Arial, sans-serif;">
                
                <!-- Top-Right Department Name (Underlined) -->
                <div style="text-align:right; margin-bottom:3rem;">
                  <span style="text-decoration:underline; font-size:1.15rem; font-weight:600; color:#0f172a;">
                    ${(currentMeeting.dept_name || 'Department').endsWith('Department') ? currentMeeting.dept_name : `${currentMeeting.dept_name || 'Department'} Department`}
                  </span>
                </div>

                <!-- Center Title (Bold & Underlined) -->
                <div style="text-align:center; margin-bottom:3rem;">
                  <h2 style="font-size:1.25rem; font-weight:700; text-decoration:underline; margin:0; color:#0f172a; letter-spacing:0.02em;">
                    Certificate for reasonability of rate
                  </h2>
                </div>

                <!-- Body Paragraph -->
                <div style="text-align:justify; margin-bottom:5rem; font-size:1.15rem; line-height:2; color:#1e293b;">
                  This is to Certify that after subsequent process for purchase of <strong>${agenda.item_name || currentMeeting.item_name || 'Item Name'}</strong> Qty <strong>${agenda.qty || currentMeeting.indent_qty || 'As per Bid'}</strong> No(s). , the L1 rate of Rs. <strong>${(agenda.l1_amount || currentMeeting.l1_amount) ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') + '/-' : '0/-'}</strong> from <strong>${agenda.l1_vendor || currentMeeting.l1_vendor || 'L1 Vendor'}${currentMeeting.vendor_address ? ', ' + currentMeeting.vendor_address : ''}</strong> is found reasonable as per our market survey.
                </div>

                <!-- Right-Aligned Signature -->
                <div style="text-align:right; margin-top:4rem;">
                  <div style="font-size:1.15rem; font-weight:600; color:#0f172a;">Head of the Department</div>
                </div>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ All certificate parameters are locked and automatically linked to <strong>${currentMeeting.committee_type} (${currentMeeting.meeting_ref})</strong>.
              </span>
              <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-26', ${currentMeeting.id})">
                📥 Download DOC-26 (.docx)
              </button>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-29' ? `
          <!-- DOC-29: NOTE - DIRECT PURCHASE AGAINST BID PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-29: Note – Direct Purchase Against Bid
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Official Gujarati note sheet for approving purchase at institute level up to ₹25,000/-.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-29', ${currentMeeting.id})" style="font-size:0.85rem;">
                  📥 Download DOC-29 (.docx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center;">
              <div style="width:100%; max-width:820px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:3.5rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Verdana, Arial, sans-serif;">
                
                <!-- Top Right Meta -->
                <div style="text-align:right; margin-bottom:2.5rem; font-size:1.05rem; line-height:1.6; color:#0f172a;">
                  <div>${currentMeeting.dept_name ? currentMeeting.dept_name.replace(/department/i, '').trim() : 'મિકેનિકલ એન્જી.'}</div>
                  <div>એલ.ડી કોલેજ ઓફ એન્જી., અમદાવાદ</div>
                  <div>તા.${agenda.agenda_date || (currentMeeting.meeting_date ? new Date(currentMeeting.meeting_date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'))}</div>
                </div>

                <!-- Left Heading -->
                <div style="margin-bottom:1.5rem; font-weight:700; font-size:1.15rem; color:#0f172a;">
                  સાદર રજુ:
                </div>

                <!-- Gujarati Body Paragraph -->
                <div style="text-align:justify; margin-bottom:4rem; font-size:1.05rem; line-height:2; color:#1e293b;">
                  અત્રેની સંસ્થા ખાતે વિકાસલક્ષી યોજના-${agenda.fin_year || '૨૦૨૩-૨૪'} અંતર્ગત નવી બાબત હેઠળની સાધન સામગ્રીની ખરીદી અન્વયે <strong>${currentMeeting.dept_name ? currentMeeting.dept_name.replace(/department/i, '').trim() : 'મિકેનિકલ એન્જી.'}</strong> વિદ્યાશાખામાં જરૂરી સાધન <strong>${agenda.item_name || currentMeeting.item_name || 'સાધન'} - ${agenda.qty || currentMeeting.indent_qty || '01'} No.</strong> ખરીદવા GeM Portal પર બીડ પ્રસિદ્ધ કરવામાં આવેલ. તબક્કાવારની પ્રક્રિયાને અંતે લાયક ઠરેલ પેઢીઓના ભાવ ખોલતા સૌથી ઓછા L1 ભાવ રૂ. <strong>${(agenda.l1_amount || currentMeeting.l1_amount) ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') + '/-' : '૨૩,૩૫૦/-'}</strong> આપનાર પેઢી તરીકે <strong>${agenda.l1_vendor || currentMeeting.l1_vendor || 'L1 Vendor'}</strong> લાયક ઠરેલ છે. સદર આઈટમની અંદાજીત કિંમત રૂ. <strong>${(agenda.est_cost || currentMeeting.est_cost) ? parseFloat(agenda.est_cost || currentMeeting.est_cost).toLocaleString('en-IN') + '/-' : '૪૫,૦૦૦/-'}</strong> આંકવામાં આવી હતી પરંતુ L1 ભાવ રૂ.૨૫ હજારની મર્યાદામાં આવેલ હોવાથી સરકારશ્રીના પ્રવર્તમાન નિયમોનુસર રૂ. ૨૫ હજાર સુધીની ખરીદી માટે સંસ્થા સ્તરેથી નોંધ મંજુર કરી ખરીદાદેશ આપી શકાય તેમછે. પ્રસ્તુત બાબતે L1 રૂ. <strong>${(agenda.l1_amount || currentMeeting.l1_amount) ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') + '/-' : '૨૩,૩૫૦/-'}</strong> ના ભાવે <strong>${agenda.l1_vendor || currentMeeting.l1_vendor || 'L1 Vendor'}</strong> ને ખરીદાદેશ આપવા મંજુરી અર્થે રજુ કરેલ છે.
                </div>

                <!-- Left-aligned Signatures with spacing -->
                <div style="display:flex; flex-direction:column; gap:4rem; font-size:1.1rem; font-weight:600; color:#0f172a; margin-top:2rem;">
                  <div>Store Officer</div>
                  <div>Head, Purchase &amp; Store</div>
                  <div>Principal</div>
                </div>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ Direct Purchase Note is locked and ready for download.
              </span>
              <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-29', ${currentMeeting.id})">
                📥 Download DOC-29 (.docx)
              </button>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-32' ? `
          <!-- DOC-32: GeM AGENDANOTE DPC (STATIC GUJARATI LEFT & FILLABLE RIGHT) -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05)); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <h3 class="card-title" style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">
                  📝 DOC-32: GeM મારફત ખરીદી માટે ખરીદ સમિતિ સમક્ષ રજુ કરવાની એજન્ડાનોંધ (DPC)
                </h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Left column is official static Gujarati text. The right column contains editable fields auto-populated from database. Click <strong>"Save &amp; Download DOC-32"</strong> below.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" id="saveAndDownloadDoc32Btn" class="btn btn-primary" style="font-size:0.85rem;">
                  💾 Save &amp; Download DOC-32 (.docx)
                </button>
                <button type="button" id="saveGeMAgendaTopBtn" class="btn btn-outline" style="font-size:0.85rem;">
                  💾 Save Draft to DB
                </button>
              </div>
            </div>

            <form id="gemAgendaForm" style="padding:1.25rem;">
              <!-- Header Meta Box -->
              <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:1rem; margin-bottom:1.25rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; align-items:center;">
                <div>
                  <label style="font-size:0.82rem; font-weight:600; color:var(--text-primary); display:block; margin-bottom:0.35rem;">નાણાકીય વર્ષ (Financial Year)</label>
                  <input type="text" id="ag_gem_fin_year" class="form-control" value="${agenda.gem_fin_year || currentMeeting.fin_year || '૨૦૨૬ -૨૭'}" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label style="font-size:0.82rem; font-weight:600; color:var(--text-primary); display:block; margin-bottom:0.35rem;">DPC No.</label>
                  <input type="text" id="ag_gem_meeting_ref" class="form-control" value="${agenda.gem_meeting_ref || agenda.agenda_ref || currentMeeting.meeting_ref || ''}" placeholder="e.g. LDCE/DPC/2026-27/01" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label style="font-size:0.82rem; font-weight:600; color:var(--text-primary); display:block; margin-bottom:0.35rem;">તારીખ (DPC Date)</label>
                  <input type="text" id="ag_gem_meeting_date" class="form-control" value="${agenda.gem_meeting_date || agenda.agenda_date || (currentMeeting.meeting_date ? new Date(currentMeeting.meeting_date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'))}" placeholder="DD/MM/YYYY" style="font-size:0.85rem;" />
                </div>
              </div>

              <!-- Two-Column 9-Point Agenda Table -->
              <div class="table-responsive" style="margin-bottom:1.5rem; border:1px solid var(--border-color); border-radius:8px; overflow:hidden;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                  <thead>
                    <tr style="background:var(--bg-secondary);">
                      <th style="width:7%; padding:0.85rem; font-size:0.9rem; text-align:center; border-right:1px solid var(--border-color);">ક્રમ</th>
                      <th style="width:48%; padding:0.85rem; font-size:0.9rem; text-align:left; border-right:1px solid var(--border-color);">સત્તાવાર વિગત / પ્રશ્નો (Static Gujarati)</th>
                      <th style="width:45%; padding:0.85rem; font-size:0.9rem; text-align:left;">કચેરી દ્વારા વિગતો (Editable Right Column)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 1 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૧ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદકર્તા કચેરીનું નામ
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_dept_name" class="form-control" value="${agenda.gem_dept_name || `${(currentMeeting.dept_name ? currentMeeting.dept_name.replace(/department/i, '').trim() : 'ઇન્ફોર્મેશન ટેકનોલોજી')}, એલ.ડી. કોલેજ ઓફ એન્જિનીયરીંગ, અમદાવાદ`}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 2 -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૨ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદીનો પ્રકાર ( સામાન્ય / બ્રાન્ડેડ ( PAC))
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_purchase_type" class="form-control" value="${agenda.gem_purchase_type || agenda.purchase_type || 'સામાન્ય'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 3 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૩ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદી હેઠળની ચીજવસ્તુ
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.6rem;">
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૧) નામ</label>
                            <input type="text" id="ag_gem_item_name" class="form-control" value="${agenda.gem_item_name || agenda.item_name || currentMeeting.item_name || ''}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૨) જથ્થો</label>
                            <input type="text" id="ag_gem_qty" class="form-control" value="${agenda.gem_qty || agenda.qty || (currentMeeting.indent_qty ? `${currentMeeting.indent_qty} Nos.` : '01 Nos.')}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૩) અંદાજીત કિંમત</label>
                            <input type="text" id="ag_gem_est_cost" class="form-control" value="${agenda.gem_est_cost || (agenda.est_cost || currentMeeting.est_cost ? `Rs. ${parseFloat(agenda.est_cost || currentMeeting.est_cost).toLocaleString('en-IN')}` : (currentMeeting.l1_amount ? `Rs. ${parseFloat(currentMeeting.l1_amount).toLocaleString('en-IN')}` : ''))}" placeholder="Rs. xx,xx,xxx" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૪) સરકારશ્રીના વહીવટી મંજૂરીનો ક્રમાંક અને તારીખ</label>
                            <textarea id="ag_gem_admin_approval" class="form-control" rows="3" style="font-size:0.85rem;">${agenda.gem_admin_approval || agenda.admin_approval || '૧) સીટીઈ/નબા ૨૦૨૪-૨૫/ટીઈડી-૫/Non-IT Infra./છ(આ)\n૨) સીટીઈ/નબા ૨૦૨૪-૨૫/ટીઈડી-૧૧/Non-IT Infra./છ(આ)\nતા.૨૦/૦૫/૨૦૨૪'}</textarea>
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૫) ખરીદી માટે જરૂરી ગ્રાન્ટ ઉપલબ્ધતાની વિગત</label>
                            <input type="text" id="ag_gem_grant_avail" class="form-control" value="${agenda.gem_grant_avail || agenda.grant_avail || 'ગ્રાન્ટ ઉપલબ્ધ છે.'}" style="font-size:0.85rem;" />
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- 4 -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૪ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદવાની ચીજવસ્તુઓની પસંદગી પ્રક્રિયા
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.6rem;">
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૧) આંતરિક કમિટીની રચના અંગેની વિગત</label>
                            <input type="text" id="ag_gem_internal_comm" class="form-control" value="${agenda.gem_internal_comm || agenda.internal_comm || 'LDCE/Dept/Committee/2026-27/1664,\nતા.૧૪/૦૫/૨૦૨૬'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૨) આંતરિક કમિટી દ્વારા ચીજવસ્તુઓના ટેકનિકલ સ્પેસિફિકેશન નક્કી કરેલ છે કે કેમ ? (નકલ જોડવી)</label>
                            <input type="text" id="ag_gem_specs_det" class="form-control" value="${agenda.gem_specs_det || agenda.specs_det || 'હા, નકલ સામેલ છે.'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૩) GeM પર રાખેલ ટેકનિકલ સ્પેસિફિકેશન કમિટીએ નક્કી કર્યા મુજબના છે કે કેમ તેની વિગત</label>
                            <input type="text" id="ag_gem_specs_gem_match" class="form-control" value="${agenda.gem_specs_gem_match || agenda.specs_gem_match || 'હા'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૪) GeM પર બીડીંગ માટે બીડર પેઢીના પૂર્વ લાયકાતના ધોરણો કે અન્ય શરતો રાખેલ હોય તો તેની વિગતો (નકલ જોડવી)</label>
                            <input type="text" id="ag_gem_pre_qual_terms" class="form-control" value="${agenda.gem_pre_qual_terms || agenda.pre_qual_terms || 'નકલ સામેલ છે.'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૫) કચેરીએ બીડીંગ માટે પ્રાથમિક/ટેકનિકલ ચકાસણીમાં કોઈ પેઢીઓને અમાન્ય કરેલ છે કે કેમ તેની વિગત. જો કોઈ બીડરપેઢીને અમાન્ય કરેલ હોય તો અમાન્ય કરવાના કારણોની વિગતો.</label>
                            <textarea id="ag_gem_disqual_details" class="form-control" rows="2" style="font-size:0.85rem;">${agenda.gem_disqual_details || agenda.disqual_details || (currentMeeting.disqualified_count ? `${currentMeeting.disqualified_count} પેઢી(ઓ)\nપેઢી(ઓ)ને અમાન્ય કરવાના કારણોની નકલ સામેલ છે.` : 'લાગુ પડતું નથી')}</textarea>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- 5 (અ) -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid var(--border-color);">૫ (અ)</td>
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        GeM પર ખરીદી માટે અપનાવેલ પધ્ધતિ
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૧)</td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>૧.૧ GeM પર સરખામણી (Comparison) કર્યા બાદ GeM Recommended L1 પેઢીનું નામ તથા મળેલ ભાવ</strong><br/>
                        <span style="color:var(--text-secondary);">૧.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)</span>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_comp_l1" class="form-control" value="${agenda.gem_comp_l1 || agenda.comp_l1 || 'પેઢી: લાગુ પડતું નથી\nભાવ: લાગુ પડતું નથી'}" placeholder="GeM Recommended L1 પેઢી તથા ભાવ" style="font-size:0.85rem;" />
                          <input type="text" id="ag_gem_comp_count" class="form-control" value="${agenda.gem_comp_count || agenda.comp_count || 'લાગુ પડતું નથી'}" placeholder="ભાગ લેનાર પેઢીઓની સંખ્યા" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૨)</td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>૨.૧ GeM પર બીડીંગ કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ</strong><br/>
                        <span style="color:var(--text-secondary);">૨.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)</span><br/>
                        <span style="color:var(--text-secondary);">૨.૩ બીડીંગનો સમયગાળો ઓછામાં ઓછો ૭(સાત) દિવસ છે કે કેમ?</span>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_l1_vendor" class="form-control" value="${agenda.gem_l1_vendor || agenda.l1_vendor || currentMeeting.l1_vendor || ''}" placeholder="L1 પેઢીનું નામ" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_l1_amount" class="form-control" value="${agenda.gem_l1_amount || (agenda.l1_amount || currentMeeting.l1_amount ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') : '')}" placeholder="L1 ભાવ (₹)" style="font-size:0.85rem;" />
                          </div>
                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_part_count" class="form-control" value="${agenda.gem_part_count || agenda.part_count || (currentMeeting.total_participants ? `${currentMeeting.total_participants} પેઢીઓ` : '03 પેઢીઓ')}" placeholder="ભાગ લેનાર પેઢીઓની સંખ્યા" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_bid_days" class="form-control" value="${agenda.gem_bid_days || agenda.bid_duration || '૧૧ દિવસ'}" placeholder="સમયગાળો (e.g. ૧૧ દિવસ)" style="font-size:0.85rem;" />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૩)</td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>૩.૧ રીવર્સ ઓક્શન કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ</strong><br/>
                        <span style="color:var(--text-secondary);">૩.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)</span><br/>
                        <span style="color:var(--text-secondary);">૩.૩ રીવર્સ ઓક્શનનો સમયગાળો</span>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_ra_l1" class="form-control" value="${agenda.gem_ra_l1 || agenda.ra_l1 || 'પેઢી: લાગુ પડતું નથી\nભાવ: લાગુ પડતું નથી'}" placeholder="RA L1 પેઢી તથા ભાવ" style="font-size:0.85rem;" />
                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_ra_count" class="form-control" value="${agenda.gem_ra_count || agenda.ra_count || 'લાગુ પડતું નથી'}" placeholder="RA ભાગ લેનાર સંખ્યા" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_ra_days" class="form-control" value="${agenda.gem_ra_days || agenda.ra_duration || 'લાગુ પડતું નથી'}" placeholder="RA સમયગાળો" style="font-size:0.85rem;" />
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- 5 (બ) -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid var(--border-color);">૫ . (બ)</td>
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        GeM પર ખરીદીની આખરી વિગતો
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;"></td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.7; border-right:1px solid var(--border-color); vertical-align:top;">
                        ૧) L1 પેઢીનું નામ<br/>
                        ૨) મળેલ ભાવ (પ્રતિ નંગ)<br/>
                        ૩) જથ્થો<br/>
                        ૪) કુલ કિંમત<br/>
                        ૫) અગાઉ કરેલ ખરીદીની વિગત
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_final_l1_vendor" class="form-control" value="${agenda.gem_final_l1_vendor || agenda.l1_vendor || currentMeeting.l1_vendor || ''}" placeholder="૧) L1 પેઢીનું નામ" style="font-size:0.85rem;" />
                          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_unit_price" class="form-control" value="${agenda.gem_unit_price || (agenda.l1_amount || currentMeeting.l1_amount ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') : '')}" placeholder="૨) ભાવ પ્રતિ નંગ" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_final_qty" class="form-control" value="${agenda.gem_final_qty || agenda.qty || (currentMeeting.indent_qty ? `${currentMeeting.indent_qty} Nos.` : '01 Nos.')}" placeholder="૩) જથ્થો" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_final_l1_amount" class="form-control" value="${agenda.gem_final_l1_amount || (agenda.l1_amount || currentMeeting.l1_amount ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') : '')}" placeholder="૪) કુલ કિંમત" style="font-size:0.85rem;" />
                          </div>
                          <textarea id="ag_gem_prev_purchase" class="form-control" rows="3" placeholder="૫) અગાઉ કરેલ ખરીદીની વિગત" style="font-size:0.85rem;">${agenda.gem_prev_purchase || agenda.prev_purchase || 'ખરીદ ભાવ: Rs. *****\nજથ્થો: *********\nબીડર પેઢીનું નામ: ********'}</textarea>
                        </div>
                      </td>
                    </tr>

                    <!-- 6 -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid var(--border-color);">૬ .</td>
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        બ્રાન્ડેડ / PAC આધારે ખરીદી હોય તો :
                      </td>
                    </tr>
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;"></td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.7; border-right:1px solid var(--border-color); vertical-align:top;">
                        ૧) ખરીદી હેઠળની ચીજ - વસ્તુ GeM પર PAC આઇટમ તરીકે વર્ગીકૃત થયેલ છે (દા.ત. ઓરિજલ વિડીયો)<br/>
                        <span style="padding-left:1.5rem; font-style:italic;">અથવા</span><br/>
                        PAC આઇટમ તરીકે વર્ગીકૃત નથી, પરંતુ PAC આઇટમ તરીકે ખરીદવાની માંગણી છે.<br/>
                        ૨) PAC સર્ટીફીકેટના વિગત (નકલ જોડવી)<br/>
                        ૩) સપ્લાયરનું નામ અને સરનામું<br/>
                        ૪) મળેલ ભાવ (પ્રતિ નંગ)<br/>
                        ૫) જથ્થો<br/>
                        ૬) કુલ કિંમત<br/>
                        ૭) ભાવનું વ્યાજબીપણું (Reasonability) ની વિગત<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;(૧) માર્કેટ સર્વેની વિગતો (૨) અગાઉની ખરીદીની વિગતો
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_pac_1" class="form-control" value="${agenda.gem_pac_1 || agenda.pac_1 || 'ના\n\n\nના'}" placeholder="૧) PAC વર્ગીકૃત" style="font-size:0.85rem;" />
                          <input type="text" id="ag_gem_pac_2" class="form-control" value="${agenda.gem_pac_2 || agenda.pac_2 || 'લાગુ પડતું નથી'}" placeholder="૨) PAC સર્ટીફિકેટ" style="font-size:0.85rem;" />
                          <input type="text" id="ag_gem_pac_3" class="form-control" value="${agenda.gem_pac_3 || agenda.pac_3 || 'લાગુ પડતું નથી'}" placeholder="૩) સપ્લાયર વિગત" style="font-size:0.85rem;" />
                          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_pac_4" class="form-control" value="${agenda.gem_pac_4 || agenda.pac_4 || 'લાગુ પડતું નથી'}" placeholder="૪) ભાવ પ્રતિ નંગ" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_pac_5" class="form-control" value="${agenda.gem_pac_5 || agenda.pac_5 || 'લાગુ પડતું નથી'}" placeholder="૫) જથ્થો" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_pac_6" class="form-control" value="${agenda.gem_pac_6 || agenda.pac_6 || 'લાગુ પડતું નથી'}" placeholder="૬) કુલ કિંમત" style="font-size:0.85rem;" />
                          </div>
                          <input type="text" id="ag_gem_pac_7" class="form-control" value="${agenda.gem_pac_7 || agenda.pac_7 || 'લાગુ પડતું નથી'}" placeholder="૭) ભાવનું વ્યાજબીપણું" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- 7 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૭ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદી/બીડીંગ દરમ્યાન મળેલ રજુઆતોની વિગત
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_representations" class="form-control" value="${agenda.gem_representations || agenda.representations || 'કોઈ રજુઆત મળેલ નથી'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 8 -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૮ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ચીજ - વસ્તુ મળ્યા બાદ તે ટેકનિકલ સ્પેસિફિકેશન મુજબ છે કે કેમ ?<br/>તેની ચકાસણી માટે પધ્ધતિ નિયત કરેલ હોય તો તેની વિગતો
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_inspect_method" class="form-control" value="${agenda.gem_inspect_method || agenda.inspect_method || 'તજજ્ઞ સમિતિ દ્વારા ઇન્સ્પેક્શન કરવામાં આવે છે.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 9 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૯ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        રીમાર્ક્સ/વિશેષ નોંધ
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_special_remarks" class="form-control" value="${agenda.gem_special_remarks || agenda.special_remarks || '-'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Signatures Representation Block -->
              <div style="background:var(--bg-secondary); border:1px dashed var(--border-color); border-radius:8px; padding:1.25rem; margin-bottom:1.5rem;">
                <div style="margin-bottom:1.5rem; font-weight:600; font-size:0.95rem; color:var(--text-primary);">
                  અધ્યક્ષશ્રી
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1.5rem; font-size:0.9rem; font-weight:600; color:var(--text-primary); margin-bottom:1rem;">
                  <div>
                    ખાતાના વડાની સહી
                  </div>
                  <div style="text-align:right; line-height:1.4;">
                    <div>સભ્ય સચિવ અને</div>
                    <div>અધિક ઉદ્યોગ કમિશનર (ખ.ખા.)</div>
                    <div>ગાંધીનગર-૨૦</div>
                  </div>
                </div>
                <div style="font-size:0.82rem; color:var(--text-secondary); border-top:1px solid var(--border-color); padding-top:0.75rem;">
                  બિડાણ : ઉપર દર્શાવેલ વિગતોના ઉપલબ્ધ આધાર/પુરાવાની નકલો જોડવાની રહે છે.
                </div>
              </div>

              <!-- Footer Actions -->
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                <span style="font-size:0.85rem; color:var(--text-secondary);">
                  ℹ️ Click Save to update database values and instantly generate official <strong>DOC-32 (.docx)</strong>.
                </span>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <button type="button" id="saveGeMAgendaBottomBtn" class="btn btn-outline">
                    💾 Save Draft
                  </button>
                  <button type="button" id="saveAndDownloadDoc32BtnBottom" class="btn btn-primary">
                    💾 Save &amp; Download DOC-32 (.docx)
                  </button>
                </div>
              </div>
            </form>
          </div>
        ` : activeCommitteeDocTab === 'DOC-33' ? `
          <!-- DOC-33: INSTITUTE BID CERTIFICATE PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-33: Institute BID Certificate
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  સંસ્થા દ્વારા GeM બીડ ખરીદી અંગે નિયત નમૂનાનું પ્રમાણપત્ર.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-33', ${currentMeeting.id})" style="font-size:0.85rem;">
                  📥 Download DOC-33 (.docx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center;">
              <div style="width:100%; max-width:850px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:3.5rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Verdana, Arial, sans-serif;">
                
                <!-- Center Header -->
                <div style="text-align:center; margin-bottom:2.5rem; font-size:1.05rem; color:#475569; font-family:'Shruti', sans-serif;">
                  ( સંસ્થાનો લેટરહેડ )
                </div>

                <!-- Certificate Title -->
                <div style="text-align:center; margin-bottom:3rem;">
                  <h3 style="font-size:1.35rem; font-weight:700; margin:0; color:#0f172a; text-decoration:underline; font-family:'Shruti', sans-serif;">
                    પ્રમાણપત્ર
                  </h3>
                </div>

                <!-- Certificate Body Text -->
                <div style="text-align:justify; font-size:1.1rem; line-height:2.4; margin-bottom:6rem; color:#1e293b; font-family:'Shruti', sans-serif;">
                  સંસ્થા <strong>${currentMeeting.institute_name || 'એલ. ડી. કોલેજ ઓફ એન્જિનિયરિંગ, અમદાવાદ'}</strong> દ્વારા (હાઉસકીપીંગ સેવા/મેનપાવર આઉટસોર્સિંગ સેવા/ સાધન સામગ્રી/ફર્નિચર/અન્ય) <strong>${agenda.item_name || currentMeeting.item_name || 'Handling & Shifting Services'}</strong> ની ખરીદી માટે GeM પોર્ટલ પર બીડ નંબર <strong>${currentMeeting.bid_no || agenda.bid_no || 'GEM/2026/B/7586906'}</strong> થી પ્રસિદ્ધ કરવામાં આવેલ બીડ તેમજ સદર બીડમાં આવેલ L1 બીડર સરકારશ્રી દ્વારા પ્રસિદ્ધ કરવામાં આવેલ પ્રવર્તમાન ઠરાવો, પરિપત્રો, ખરીદ નીતિ સાથે તેમજ GeM પોર્ટલના પ્રવર્તમાન નિયમો સાથે સુસંગત છે તે બાબતને હું પ્રમાણિત કરું છું.
                </div>

                <!-- Right-aligned Signature -->
                <div style="text-align:right; margin-top:4rem; font-size:1.05rem; font-weight:700; color:#0f172a; font-family:'Shruti', sans-serif;">
                  આચાર્યની સહી તથા સિક્કો
                </div>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ Institute BID Certificate is locked and ready for official download.
              </span>
              <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-33', ${currentMeeting.id})">
                📥 Download DOC-33 (.docx)
              </button>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-34' ? `
          <!-- DOC-34: L1 INFO SHEET FOR DPC PREVIEW -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                    📜 DOC-34: L1 INFO Sheet for DPC
                  </h3>
                  <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official Format</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Official 6-column EMD and NSIC compliance statement for L1 bidder (Word &amp; Excel).
                </p>
              </div>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-34', ${currentMeeting.id}, { format: 'docx' })" style="font-size:0.85rem;">
                  📥 Download DOC-34 (.docx)
                </button>
                <button type="button" class="btn btn-success" onclick="handleDownloadDoc('DOC-34', ${currentMeeting.id}, { format: 'xlsx' })" style="font-size:0.85rem; background:#10b981; border-color:#10b981; color:#fff;">
                  📊 Download DOC-34 (.xlsx)
                </button>
              </div>
            </div>

            <div style="padding:2.5rem; background:var(--bg-primary); display:flex; justify-content:center; overflow-x:auto;">
              <div style="width:100%; max-width:960px; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:2.5rem; box-shadow:0 4px 25px rgba(0,0,0,0.08); font-family:Verdana, Arial, sans-serif;">
                
                <!-- 6-Column Official Excel/Doc Table -->
                <table style="width:100%; border-collapse:collapse; border:1.5px solid #334155; font-size:0.88rem; margin-bottom:1.5rem;">
                  <thead>
                    <tr style="background:#f8fafc; font-weight:700; text-align:center; font-family:'Shruti', sans-serif;">
                      <th style="width:6%; padding:0.75rem 0.4rem; border:1px solid #334155;">ક્રમ</th>
                      <th style="width:20%; padding:0.75rem 0.5rem; border:1px solid #334155;">સંસ્થાનું નામ</th>
                      <th style="width:18%; padding:0.75rem 0.5rem; border:1px solid #334155;">બીડ નંબર</th>
                      <th style="width:18%; padding:0.75rem 0.5rem; border:1px solid #334155;">બીડમાં Earnest Money Deposit (EMD) ભરનાર પેઢીઓની સંખ્યા</th>
                      <th style="width:18%; padding:0.75rem 0.5rem; border:1px solid #334155;">બીડમાં NSIC સર્ટીફીકેટ ધરાવતી પેઢીઓની સંખ્યા</th>
                      <th style="width:20%; padding:0.75rem 0.5rem; border:1px solid #334155;">L1 જાહેર થયેલ પેઢીનું NSIC સર્ટીફીકેટ અથવા પેઢીએ ભરેલ EMD ની વિગતો.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="text-align:center;">
                      <td style="padding:1rem 0.4rem; border:1px solid #334155; font-weight:600;">1</td>
                      <td style="padding:1rem 0.5rem; border:1px solid #334155;">${currentMeeting.institute_name || 'L.D College of Engg., Ahmedabad'}</td>
                      <td style="padding:1rem 0.5rem; border:1px solid #334155; font-weight:600;">${currentMeeting.bid_no || agenda.bid_no || 'GEM/2026/B/7586906'}</td>
                      <td style="padding:1rem 0.5rem; border:1px solid #334155; font-size:0.95rem; font-weight:600;">${agenda.emd_bidders_count || '2'}</td>
                      <td style="padding:1rem 0.5rem; border:1px solid #334155; font-size:0.95rem; font-weight:600;">${agenda.nsic_bidders_count || '3'}</td>
                      <td style="padding:1rem 0.5rem; border:1px solid #334155; line-height:1.5;">
                        ${(agenda.l1_emd_details || "Demand Draft No. '084779 of<br/>Rs.15,300/- of<br/>kotak Mahindra Bank").replace(/\n/g, '<br/>')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Bottom Right Instructions Box -->
                <div style="display:flex; justify-content:flex-end;">
                  <div style="border:1.5px solid #334155; padding:0.85rem 1.25rem; font-family:'Shruti', sans-serif; font-size:0.85rem; font-weight:700; line-height:1.6; max-width:480px; background:#fafafa;">
                    <div>(૧) સંસ્થાના વડાની સહી તેમજ સંસ્થાના સિક્કા સાથે પ્રમાણિત કરવું</div>
                    <div>(૨) L1 જાહેર થયેલ પેઢીના NSIC સર્ટીફિકેટ/ L1 પેઢી દ્વારા ભરેલ EMD ની નકલ જોડવી</div>
                  </div>
                </div>

              </div>
            </div>

            <div class="card-footer" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem;">
              <span style="font-size:0.85rem; color:var(--text-secondary);">
                ℹ️ L1 INFO Sheet is locked and ready for official download in Word (.docx) and Excel (.xlsx) formats.
              </span>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary" onclick="handleDownloadDoc('DOC-34', ${currentMeeting.id}, { format: 'docx' })">
                  📥 Download DOC-34 (.docx)
                </button>
                <button type="button" class="btn btn-success" onclick="handleDownloadDoc('DOC-34', ${currentMeeting.id}, { format: 'xlsx' })" style="background:#10b981; border-color:#10b981; color:#fff;">
                  📊 Download DOC-34 (.xlsx)
                </button>
              </div>
            </div>
          </div>
        ` : activeCommitteeDocTab === 'DOC-25A' ? `
          <!-- DOC-25A: GeM AGENDANOTE DLPC (STATIC GUJARATI LEFT & FILLABLE RIGHT) -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05)); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <h3 class="card-title" style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">
                  📝 DOC-25A: GeM મારફત ખરીદી માટે ખરીદ સમિતિ સમક્ષ રજુ કરવાની એજન્ડાનોંધ (DLPC)
                </h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Left column is official static Gujarati text. The right column contains editable fields auto-populated from database. Click <strong>"Save &amp; Download DOC-25A"</strong> below.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" id="saveAndDownloadDoc25ABtn" class="btn btn-primary" style="font-size:0.85rem;">
                  💾 Save &amp; Download DOC-25A (.docx)
                </button>
                <button type="button" id="saveGeMAgendaTopBtn" class="btn btn-outline" style="font-size:0.85rem;">
                  💾 Save Draft to DB
                </button>
              </div>
            </div>

            <form id="gemAgendaForm" style="padding:1.25rem;">
              <!-- Header Meta Box -->
              <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:1rem; margin-bottom:1.25rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; align-items:center;">
                <div>
                  <label style="font-size:0.82rem; font-weight:600; color:var(--text-primary); display:block; margin-bottom:0.35rem;">નાણાકીય વર્ષ (Financial Year)</label>
                  <input type="text" id="ag_gem_fin_year" class="form-control" value="${agenda.gem_fin_year || currentMeeting.fin_year || '૨૦૨૬ -૨૭'}" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label style="font-size:0.82rem; font-weight:600; color:var(--text-primary); display:block; margin-bottom:0.35rem;">DLPC No.</label>
                  <input type="text" id="ag_gem_meeting_ref" class="form-control" value="${agenda.gem_meeting_ref || agenda.agenda_ref || currentMeeting.meeting_ref || ''}" placeholder="e.g. LDCE/DLPC/2026-27/01" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label style="font-size:0.82rem; font-weight:600; color:var(--text-primary); display:block; margin-bottom:0.35rem;">તારીખ (DLPC Date)</label>
                  <input type="text" id="ag_gem_meeting_date" class="form-control" value="${agenda.gem_meeting_date || agenda.agenda_date || (currentMeeting.meeting_date ? new Date(currentMeeting.meeting_date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'))}" placeholder="DD/MM/YYYY" style="font-size:0.85rem;" />
                </div>
              </div>

              <!-- Two-Column 9-Point Agenda Table -->
              <div class="table-responsive" style="margin-bottom:1.5rem; border:1px solid var(--border-color); border-radius:8px; overflow:hidden;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                  <thead>
                    <tr style="background:var(--bg-secondary);">
                      <th style="width:7%; padding:0.85rem; font-size:0.9rem; text-align:center; border-right:1px solid var(--border-color);">ક્રમ</th>
                      <th style="width:48%; padding:0.85rem; font-size:0.9rem; text-align:left; border-right:1px solid var(--border-color);">સત્તાવાર વિગત / પ્રશ્નો (Static Gujarati)</th>
                      <th style="width:45%; padding:0.85rem; font-size:0.9rem; text-align:left;">કચેરી દ્વારા વિગતો (Editable Right Column)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 1 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૧ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદકર્તા કચેરીનું નામ
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_dept_name" class="form-control" value="${agenda.gem_dept_name || `${(currentMeeting.dept_name ? currentMeeting.dept_name.replace(/department/i, '').trim() : 'ઇન્ફોર્મેશન ટેકનોલોજી')}, એલ.ડી. કોલેજ ઓફ એન્જિનીયરીંગ, અમદાવાદ`}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 2 -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૨ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદીનો પ્રકાર ( સામાન્ય / બ્રાન્ડેડ ( PAC))
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_purchase_type" class="form-control" value="${agenda.gem_purchase_type || agenda.purchase_type || 'સામાન્ય'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 3 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૩ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદી હેઠળની ચીજવસ્તુ
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.6rem;">
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૧) નામ</label>
                            <input type="text" id="ag_gem_item_name" class="form-control" value="${agenda.gem_item_name || agenda.item_name || currentMeeting.item_name || ''}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૨) જથ્થો</label>
                            <input type="text" id="ag_gem_qty" class="form-control" value="${agenda.gem_qty || agenda.qty || currentMeeting.indent_qty || '01'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૩) અંદાજીત કિંમત</label>
                            <input type="text" id="ag_gem_est_cost" class="form-control" value="${agenda.gem_est_cost || (agenda.est_cost || currentMeeting.est_cost ? parseFloat(agenda.est_cost || currentMeeting.est_cost).toLocaleString('en-IN') : '')}" placeholder="Rs. xx,xx,xxx/-" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૪) સરકારશ્રીની વહીવટી મંજૂરીનો ક્રમાંક અને તારીખ</label>
                            <textarea id="ag_gem_admin_approval" class="form-control" rows="3" style="font-size:0.85rem;">${agenda.gem_admin_approval || agenda.admin_approval || '૧) સીટીઈ / નબા ૨૦૨૬ - ૨૭ / ટીઈડી - ૫ / Non-IT Infra./ છ ( આ )\n૨) સીટીઈ / નબા ૨૦૨૬ - ૨૭ / ટીઈડી - ૧૧ / Non-IT Infra./ છ ( આ ) તા.૨૦/૦૫/૨૦૨૬\n3) તા.........................ની નોંધ ઉપર આચાર્યશ્રીની મંજુરી મળેલ છે.'}</textarea>
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">(૫) ખરીદી માટે જરૂરી ગ્રાન્ટ ઉપલબ્ધતાની વિગત</label>
                            <input type="text" id="ag_gem_grant_avail" class="form-control" value="${agenda.gem_grant_avail || agenda.grant_avail || 'ગ્રાન્ટ ઉપલબ્ધ છે.'}" style="font-size:0.85rem;" />
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- 4 -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૪ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદવાની ચીજવસ્તુઓની પસંદગી પ્રક્રિયા
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.6rem;">
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૧ ) આંતરિક કમિટીની રચના અંગેની વિગત</label>
                            <input type="text" id="ag_gem_internal_comm" class="form-control" value="${agenda.gem_internal_comm || agenda.internal_comm || 'LDCE/Pur/Dept/Committee/2026-27/1664 dt. 14/05/2026'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૨ ) આંતરિક કમિટી દ્વારા ચીજવસ્તુઓના ટેક્નીકલ સ્પેસીફીકેશન નક્કી કરેલ છે કે કેમ ? ( નકલ જોડવી)</label>
                            <input type="text" id="ag_gem_specs_det" class="form-control" value="${agenda.gem_specs_det || agenda.specs_det || 'હા , નકલ સામેલ છે.'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૩ ) GeM પર રાખેલ ટેકનિકલ સ્પેશીફિકેશન કમિટીએ નક્કી કર્યા મુજબના છે કે કેમ તેની વિગત</label>
                            <input type="text" id="ag_gem_specs_gem_match" class="form-control" value="${agenda.gem_specs_gem_match || agenda.specs_gem_match || 'હા, સમિતિએ નક્કી કર્યા મુજબના છે.'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૪ ) GeM પર બીડીંગ માટે બીડર પેઢીના પૂર્વ લાયકાતના ધોરણો કે અન્ય શરતો રાખેલ હોય તો તેની વિગતો ( નકલ જોડવી)</label>
                            <input type="text" id="ag_gem_pre_qual_terms" class="form-control" value="${agenda.gem_pre_qual_terms || agenda.pre_qual_terms || 'હા , નકલ સામેલ છે.'}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">૫ ) કચેરીએ બીડીંગ માટે પ્રાથમિક/ટેક્નીકલ ચકાસણીમાં કોઇ પેઢીઓને અમાન્ય કરેલ છે કે કેમ તેની વિગત જો કોઇ બીડરપેઢીને અમાન્ય કરેલ હોય તો અમાન્ય કરવાના કારણોની વિગતો .</label>
                            <textarea id="ag_gem_disqual_details" class="form-control" rows="2" style="font-size:0.85rem;">${agenda.gem_disqual_details || agenda.disqual_details || (currentMeeting.disqualified_count ? `${currentMeeting.disqualified_count} પેઢી(ઓ) અમાન્ય થયેલ છે.` : 'લાગુ પડતું નથી')}</textarea>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- 5 (અ) -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid var(--border-color);">૫ (અ)</td>
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        GeM પર ખરીદી માટે અપનાવેલ પધ્ધતિ
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૧)</td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>૧.૧ GeM પર સરખામણી ( Comparison) કર્યા બાદ GeM Recommended L1 પેઢીનું નામ તથા મળેલ ભાવ</strong><br/>
                        <span style="color:var(--text-secondary);">૧.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)</span>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_comp_l1" class="form-control" value="${agenda.gem_comp_l1 || agenda.comp_l1 || 'પેઢી : લાગુ પડતું નથી | ભાવ : લાગુ પડતું નથી'}" placeholder="GeM Recommended L1 પેઢી તથા ભાવ" style="font-size:0.85rem;" />
                          <input type="text" id="ag_gem_comp_count" class="form-control" value="${agenda.gem_comp_count || agenda.comp_count || 'લાગુ પડતું નથી'}" placeholder="ભાગ લેનાર પેઢીઓની સંખ્યા" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૨ )</td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>૨.૧ GeM પર બીડીંગ કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ</strong><br/>
                        <span style="color:var(--text-secondary);">૨.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)</span><br/>
                        <span style="color:var(--text-secondary);">૨.૩ બીડીંગનો સમયગાળો ઓછામાં ઓછો ૭ ( સાત ) દિવસ છે કે કેમ ?</span>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_l1_vendor" class="form-control" value="${agenda.gem_l1_vendor || agenda.l1_vendor || currentMeeting.l1_vendor || ''}" placeholder="L1 પેઢીનું નામ" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_l1_amount" class="form-control" value="${agenda.gem_l1_amount || (agenda.l1_amount || currentMeeting.l1_amount ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') : '')}" placeholder="L1 ભાવ (₹)" style="font-size:0.85rem;" />
                          </div>
                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_part_count" class="form-control" value="${agenda.gem_part_count || agenda.part_count || (currentMeeting.total_participants ? `${currentMeeting.total_participants} પેઢીઓ` : '03 પેઢીઓ')}" placeholder="ભાગ લેનાર પેઢીઓની સંખ્યા" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_bid_days" class="form-control" value="${agenda.gem_bid_days || agenda.bid_duration || '૧૧ દિવસ'}" placeholder="સમયગાળો (e.g. ૧૧ દિવસ)" style="font-size:0.85rem;" />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૩ )</td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>૩.૧ રીવર્સ ઓક્શન કર્યા બાદ મળેલ L1 પેઢીનું નામ તથા મળેલ ભાવ</strong><br/>
                        <span style="color:var(--text-secondary);">૩.૨ કેટલી પેઢીઓ દ્વારા ભાગ લેવામાં આવેલ છે તેની વિગત (સંખ્યા)</span><br/>
                        <span style="color:var(--text-secondary);">૩.૩ રીવર્સ ઓક્શનનો સમયગાળો</span>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_ra_l1" class="form-control" value="${agenda.gem_ra_l1 || agenda.ra_l1 || 'પેઢી : લાગુ પડતું નથી | ભાવ : લાગુ પડતું નથી'}" placeholder="RA L1 પેઢી તથા ભાવ" style="font-size:0.85rem;" />
                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_ra_count" class="form-control" value="${agenda.gem_ra_count || agenda.ra_count || 'લાગુ પડતું નથી'}" placeholder="RA ભાગ લેનાર સંખ્યા" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_ra_days" class="form-control" value="${agenda.gem_ra_days || agenda.ra_duration || 'લાગુ પડતું નથી'}" placeholder="RA સમયગાળો" style="font-size:0.85rem;" />
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- 5 (બ) -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid var(--border-color);">૫ (બ)</td>
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        GeM પર ખરીદી ની આખરી વિગતો
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;"></td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.7; border-right:1px solid var(--border-color); vertical-align:top;">
                        ૧ ) L1 પેઢીનું નામ<br/>
                        ૨) મળેલ ભાવ (પ્રતિ નંગ)<br/>
                        ૩) જથ્થો<br/>
                        ૪) કુલ કિંમત<br/>
                        ૫) અગાઉ કરેલ ખરીદીની વિગત
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_final_l1_vendor" class="form-control" value="${agenda.gem_final_l1_vendor || agenda.l1_vendor || currentMeeting.l1_vendor || ''}" placeholder="૧) L1 પેઢીનું નામ" style="font-size:0.85rem;" />
                          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_unit_price" class="form-control" value="${agenda.gem_unit_price || (agenda.l1_amount || currentMeeting.l1_amount ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') : '')}" placeholder="૨) ભાવ પ્રતિ નંગ" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_final_qty" class="form-control" value="${agenda.gem_final_qty || agenda.qty || currentMeeting.indent_qty || '01'}" placeholder="૩) જથ્થો" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_final_l1_amount" class="form-control" value="${agenda.gem_final_l1_amount || (agenda.l1_amount || currentMeeting.l1_amount ? parseFloat(agenda.l1_amount || currentMeeting.l1_amount).toLocaleString('en-IN') : '')}" placeholder="૪) કુલ કિંમત" style="font-size:0.85rem;" />
                          </div>
                          <textarea id="ag_gem_prev_purchase" class="form-control" rows="2" placeholder="૫) અગાઉ કરેલ ખરીદીની વિગત" style="font-size:0.85rem;">${agenda.gem_prev_purchase || agenda.prev_purchase || 'ખરીદ ભાવ : Rs. -\nજ્થ્થો : -\nબીડર પેઢીનું નામ : -'}</textarea>
                        </div>
                      </td>
                    </tr>

                    <!-- 6 -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td style="padding:0.6rem; text-align:center; border-right:1px solid var(--border-color);">૬ .</td>
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        બ્રાન્ડેડ / PAC આધારે ખરીદી હોય તો :
                      </td>
                    </tr>
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;"></td>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.7; border-right:1px solid var(--border-color); vertical-align:top;">
                        ૧ ) ખરીદી હેઠળની ચીજ - વસ્તુ GeM પર PAC આઇટમ તરીકે વર્ગીકૃત થયેલ છે અથવા PAC આઇટમ તરીકે ખરીદવાની માંગણી છે.<br/>
                        ૨ ) PAC સર્ટીફિકેટની વિગત ( નકલ જોડવી)<br/>
                        ૩ ) સપ્લાયરનું નામ અને સરનામું<br/>
                        ૪ ) મળેલ ભાવ ( પ્રતિ નંગ )<br/>
                        ૫ ) જથ્થો<br/>
                        ૬ ) કુલ કિંમત<br/>
                        ૭ ) ભાવ નું વ્યાજબીપણું (Reasonability) ની વિગત (૧) માર્કેટ સર્વેની વિગતો (૨) અગાઉની ખરીદી ની વિગતો
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_gem_pac_1" class="form-control" value="${agenda.gem_pac_1 || agenda.pac_1 || 'ના'}" placeholder="૧) PAC વર્ગીકૃત" style="font-size:0.85rem;" />
                          <input type="text" id="ag_gem_pac_2" class="form-control" value="${agenda.gem_pac_2 || agenda.pac_2 || 'લાગુ પડતું નથી'}" placeholder="૨) PAC સર્ટીફિકેટ" style="font-size:0.85rem;" />
                          <input type="text" id="ag_gem_pac_3" class="form-control" value="${agenda.gem_pac_3 || agenda.pac_3 || 'લાગુ પડતું નથી'}" placeholder="૩) સપ્લાયર વિગત" style="font-size:0.85rem;" />
                          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.4rem;">
                            <input type="text" id="ag_gem_pac_4" class="form-control" value="${agenda.gem_pac_4 || agenda.pac_4 || 'લાગુ પડતું નથી'}" placeholder="૪) ભાવ પ્રતિ નંગ" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_pac_5" class="form-control" value="${agenda.gem_pac_5 || agenda.pac_5 || 'લાગુ પડતું નથી'}" placeholder="૫) જથ્થો" style="font-size:0.85rem;" />
                            <input type="text" id="ag_gem_pac_6" class="form-control" value="${agenda.gem_pac_6 || agenda.pac_6 || 'લાગુ પડતું નથી'}" placeholder="૬) કુલ કિંમત" style="font-size:0.85rem;" />
                          </div>
                          <input type="text" id="ag_gem_pac_7" class="form-control" value="${agenda.gem_pac_7 || agenda.pac_7 || 'લાગુ પડતું નથી'}" placeholder="૭) ભાવનું વ્યાજબીપણું" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- 7 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૭ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ખરીદી/ બીડીંગ દરમિયાન મળેલ રજુઆતોની વિગત
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_representations" class="form-control" value="${agenda.gem_representations || agenda.representations || 'કોઈ રજુઆત મળેલ નથી.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 8 -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૮ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        ચીજ - વસ્તુ મળ્યા બાદ તે ટેકનીકલ સ્પેશીફિકેશન મુજબ છે કે કેમ ? તેની ચકાસણી માટે પધ્ધતિ નિયત કરેલ હોય તો તેની વિગતો
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_inspect_method" class="form-control" value="${agenda.gem_inspect_method || agenda.inspect_method || 'તજજ્ઞ સમિતિ દ્વારા ઇન્સ્પેકસન કરવામાં આવે છે.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 9 -->
                    <tr>
                      <td style="padding:0.85rem; text-align:center; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">૯ .</td>
                      <td style="padding:0.85rem; font-size:0.88rem; font-weight:600; border-right:1px solid var(--border-color); vertical-align:top;">
                        રીમાર્ક્સ/વિશેષ નોંધ
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_gem_special_remarks" class="form-control" value="${agenda.gem_special_remarks || agenda.special_remarks || '-'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Footer Actions -->
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                <span style="font-size:0.85rem; color:var(--text-secondary);">
                  ℹ️ Click Save to update database values and instantly generate official <strong>DOC-25A (.docx)</strong>.
                </span>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <button type="button" id="saveGeMAgendaBottomBtn" class="btn btn-outline">
                    💾 Save Draft
                  </button>
                  <button type="button" id="saveAndDownloadDoc25ABtnBottom" class="btn btn-primary">
                    💾 Save &amp; Download DOC-25A (.docx)
                  </button>
                </div>
              </div>
            </form>
          </div>
        ` : activeCommitteeDocTab === 'DOC-25' ? `
          <!-- DOC-25: DLPC AGENDA (STATIC GUJARATI LEFT & FILLABLE RIGHT) -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05)); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <h3 class="card-title" style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">
                  📝 DOC-25: GeM મારફત ખરીદી માટે DLPC સમક્ષ રજુ કરવાનો એજન્ડા
                </h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Left column is official static Gujarati text. Fill the right column responses below and click <strong>"Save &amp; Download DOC-25"</strong>.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" id="saveAndDownloadDoc25Btn" class="btn btn-primary" style="font-size:0.85rem;">
                  💾 Save &amp; Download DOC-25 (.docx)
                </button>
                <button type="button" id="saveAgendaTopBtn" class="btn btn-outline" style="font-size:0.85rem;">
                  💾 Save Draft to DB
                </button>
              </div>
            </div>

            <form id="agendaForm" style="padding:1.25rem;">
              <!-- Two-Column Agenda Table -->
              <div class="table-responsive" style="margin-bottom:1.5rem; border:1px solid var(--border-color); border-radius:8px; overflow:hidden;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                  <thead>
                    <tr style="background:var(--bg-secondary);">
                      <th style="width:52%; padding:0.85rem; font-size:0.9rem; text-align:left; border-right:1px solid var(--border-color);">
                        રાજ્ય સરકારનું સત્તાવાર પ્રશ્નપત્ર / નિયત મુદ્દાઓ (Static Gujarati)
                      </th>
                      <th style="width:48%; padding:0.85rem; font-size:0.9rem; text-align:left;">
                        કચેરી દ્વારા વિગતો / જવાબો (Customizable / Editable Response)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 1 -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>1. રાજ્ય સરકારની ખરીદકર્તા કચેરીનું નામ</strong><br/>
                        સરનામુ , ફોન નંબર , ઇ - મેઇલ એડ્રેસ<br/>
                        <small style="color:var(--text-secondary);">( સ્થાનિક સ્વરાજ્યની સંસ્થાને રાજ્ય સરકારે સોંપેલી પ્રવૃત્તિ અને તેનું ભંડોળ આપેલ હોય તો જ DLPC / DPC માં પ્રકરણ મોકલવા તે સિવાયનાં કિસ્સામાં તેમની સક્ષમ સમિતિની મંજૂરી મેળવવી . તેવી જ રીતે બોર્ડ / નિગમ / સોસાયટી / સ્વાયત સંસ્થાઓએ તેમની સક્ષમ સમિતિની મંજૂરી મેળવવી )</small>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <textarea id="ag_office_name" class="form-control" rows="3" style="font-size:0.85rem;">${defaultOfficeName}</textarea>
                      </td>
                    </tr>

                    <!-- 2 -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>2. સંબંધિત કચેરીનાં એજન્ડા ક્રમ અને તારીખ</strong><br/>
                        <small style="color:var(--text-secondary);">( દરેક કચેરીએ ખરીદીનું રજિસ્ટર નિભાવવુ સલાહભર્યુ છે , આ રજિસ્ટર પર જે ક્રમ આવે તે મુજબ એજન્ડા ક્રમ રાખવો )</small>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                          <input type="text" id="ag_agenda_ref" class="form-control" value="${defaultAgendaRef}" placeholder="એજન્ડા ક્રમ (e.g. 01)" style="flex:1; min-width:140px; font-size:0.85rem;" />
                          <input type="date" id="ag_agenda_date" class="form-control" value="${defaultAgendaDate}" style="width:140px; font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- 3 -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; line-height:1.5; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>3. ખરીદીનો પ્રકાર</strong><br/>
                        <small style="color:var(--text-secondary);">( ભારત સરકારનાં DO Ltr No. 222/CEO-GeM/2022, dt.08-07-2022 મુજબ GeM પર જે કેટગરી ઉપલબ્ધ છે તેમાં BoQ /Custom Bid કરવાની મનાઇ છે )</small>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <select id="ag_purchase_type" class="form-control" style="font-size:0.85rem;">
                          <option value="Bid" ${defaultPurchaseType === 'Bid' ? 'selected' : ''}>Bid ( Rs. 1 lac થી વધુની ખરીદીમાં ફરજીયાત )</option>
                          <option value="GeM Suggested L1" ${defaultPurchaseType === 'GeM Suggested L1' ? 'selected' : ''}>GeM Suggested L1</option>
                          <option value="RA" ${defaultPurchaseType === 'RA' ? 'selected' : ''}>RA (Reverse Auction)</option>
                        </select>
                      </td>
                    </tr>

                    <!-- SECTION 4 HEADER -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        4. ખરીદી હેઠળ ચીજ વસ્તુઓ / સેવાની વિગત
                      </td>
                    </tr>

                    <!-- 4A -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>A. વસ્તુ / સેવાનું નામ</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_item_name" class="form-control" value="${defaultItemName}" placeholder="Item / Service Name" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 4B -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>B. જથ્થો</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_qty" class="form-control" value="${defaultQty}" placeholder="e.g. 05 Nos / As per Bid" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 4C -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>C. અંદાજીત કિંમત / બીડ વેલ્યુ</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_est_cost" class="form-control" value="${defaultEstCost}" placeholder="e.g. 3,50,000/-" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 4D -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>D. સરકારશ્રીની વહીવટી મંજૂરીનો ક્રમાંક અને તારીખ</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_admin_approval" class="form-control" value="${defaultAdminApproval}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 4E -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>E. ખરીદી માટે જરૂરી ગ્રાન્ટ ઉપલબ્ધતાની વિગત અને મેજર હેડ ફરજીયાત લખવો</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_grant_head" class="form-control" value="${defaultGrantHead}" placeholder="Major Head / Budget Head" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 4F -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>F. જે વસ્તુ ખરીદ કરવાની છે તે MSE માટે અનામત રાખેલ વસ્તુઓની યાદીમાં સમાવેશ થાય છે ?</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <select id="ag_mse_reserved" class="form-control" style="font-size:0.85rem;">
                          <option value="false" ${agenda.mse_reserved ? '' : 'selected'}>ના / જો ‘ હા ’ તો ફક્ત MSE પાસેથી જ ખરીદી કરવાની છે</option>
                          <option value="true" ${agenda.mse_reserved ? 'selected' : ''}>હા. ફક્ત MSE પાસેથી જ ખરીદી કરવાની છે.</option>
                        </select>
                      </td>
                    </tr>

                    <!-- 4G -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>G. Rate Contract નાં બીડમાં SPC અથવા સક્ષમ સત્તાધિકારીની મંજૂરી છે ?</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_spc_approval" class="form-control" value="${agenda.spc_approval || 'લાગુ પડતું નથી.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 4H -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>H. Rate Contract નો સમયગાળો ( એક વર્ષનો જ હોવો જોઇએ . )</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_rc_period" class="form-control" value="${agenda.rc_period || 'લાગુ પડતું નથી.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- SECTION 5 HEADER -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        5. જે વસ્તુની ખરીદી કરવાની છે તે છેલ્લે કયારે ખરીદ કરવામાં આવી તેની વિગતો
                      </td>
                    </tr>

                    <!-- 5A -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>A. કઇ રીતે ખરીદી કરેલ હતી ?</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <select id="ag_last_purchase_mode" class="form-control" style="font-size:0.85rem;">
                          <option value="gem_bid" ${(!agenda.last_purchase_mode || agenda.last_purchase_mode === 'gem_bid') ? 'selected' : ''}>GeM Bid</option>
                          <option value="vendor" ${agenda.last_purchase_mode === 'vendor' ? 'selected' : ''}>માન્ય વેન્ડર પાસેથી વિના ટેન્ડર</option>
                          <option value="direct" ${agenda.last_purchase_mode === 'direct' ? 'selected' : ''}>GeM Direct Purchase / Comparison</option>
                        </select>
                      </td>
                    </tr>

                    <!-- 5B -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>B. જે વસ્તુ કે સેવા ખરીદ કરેલ હોય તેના જથ્થો અને રકમ</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                          <input type="text" id="ag_last_qty" class="form-control" value="${agenda.last_qty || defaultQty}" placeholder="જથ્થો" style="flex:1; min-width:120px; font-size:0.85rem;" />
                          <input type="text" id="ag_last_amount" class="form-control" value="${agenda.last_amount || defaultL1Amount}" placeholder="રકમ (₹)" style="flex:1; min-width:120px; font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- 5C -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>C. L1 નું નામ અને સરનામું</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_l1_vendor" class="form-control" value="${defaultL1Vendor}" placeholder="L1 Vendor Name & Address" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 5D -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>D. Consignee નું નામ અને તેની વિગત</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_consignee" class="form-control" value="${defaultConsignee}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- SECTION 6 HEADER -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        6. બીડ ડોક્યુમેન્ટમાં સમાવેશ કરેલ વિગતો
                      </td>
                    </tr>

                    <!-- 6A -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>A. આંતરીક સમિતિ દ્વારા ચીજવસ્તુઓના ટેકનીકલ સ્પેસીફીકેશન નક્કી કરેલ છે કે કેમ ?</strong><br/>
                        <small style="color:var(--text-secondary);">( નકલ જોડવી ) (Bureau of Indian Standard ને સ્પેસિફીકશન હોવા જોઇએ .)</small>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_spec_committee" class="form-control" value="${agenda.spec_committee || 'હા. , નકલ સામેલ છે.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 6B -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>B. GeM પર રાખેલ ટેકનીકલ સ્પેસીફીકેશન સમિતિએ નક્કી કર્યા મુજબના છે કે કેમ ?</strong><br/>
                        <small style="color:var(--text-secondary);">તેની વિગત (Golden Parameter ને અગ્રતા આપવી )</small>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_spec_gem" class="form-control" value="${agenda.spec_gem || 'હા.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 6C -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>C. ખરીદીમાં જરૂરી નોંધણી હોવાની શરતો રાખેલી છે ?</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem;">
                          <label><input type="checkbox" id="ag_reg_udyam" ${agenda.reg_udyam ?? true ? 'checked' : ''} /> UDYAM Registration as MSE</label>
                          <label><input type="checkbox" id="ag_reg_cspo" ${agenda.reg_cspo ?? true ? 'checked' : ''} /> CSPO Registration as MSE</label>
                          <label><input type="checkbox" id="ag_reg_nsic" ${agenda.reg_nsic ?? true ? 'checked' : ''} /> NSIC Registration as MSE</label>
                          <label><input type="checkbox" id="ag_reg_dpiit" ${agenda.reg_dpiit ?? true ? 'checked' : ''} /> Start-ups recognized by DPIIT</label>
                          <label><input type="checkbox" id="ag_reg_startup" ${agenda.reg_startup ?? true ? 'checked' : ''} /> Start-up registered as MSE under CSPO and NSIC</label>
                        </div>
                      </td>
                    </tr>

                    <!-- 6D -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>D. GeM પર બીડીંગ માટે બીડર પેઢીના પૂર્વ લાયકાતના ધોરણો કે અન્ય શરતો રાખેલ હોય તો તેની વિગતો</strong><br/>
                        <small style="color:var(--text-secondary);">( આ શરતો સ્પર્ધા મર્યાદિત કરે તેવી અને ખરીદનીતિ - ૨૦૨૪ની જોગવાઇની વિરૂદ્ધની ન હોવી જોઇએ )</small>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_pre_qual_terms" class="form-control" value="${agenda.pre_qual_terms || 'હા , નકલ સામેલ છે.'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 6E & 6F -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>E. Earnest Money Deposit – 3%</strong><br/>
                        <strong>F. Security Deposit – 3% or 5%</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.5rem;">
                          <input type="text" id="ag_emd_terms" class="form-control" value="${agenda.emd_terms || 'હા , નકલ સામેલ છે.'}" placeholder="EMD શરત" style="font-size:0.85rem;" />
                          <input type="text" id="ag_sd_terms" class="form-control" value="${agenda.sd_terms || 'હા. બીડ અનુસાર e-PBG ની શરત રાખેલ છે.'}" placeholder="Security Deposit શરત" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- 6G -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>G. બિડમાં પાછલા નાણાકીય વર્ષમાં પુરા થતા ત્રણ વર્ષનાં ટર્નઓવર / સરેરાશ વાસ્તવિક ઉત્પાદન બિડ વેલ્યુનાં બે ગણાની શરત રાખેલ છે કે કેમ અને તેની રકમ</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_turnover_terms" class="form-control" value="${agenda.turnover_terms || 'હા.....રૂ. ૧૦ લાખ'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 6H -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>H. Make in India અને સ્થાનિક સામગ્રી સંદર્ભે Bid Splitting નો વિકલ્પ રાખેલ છે ?</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_splitting_option" class="form-control" value="${agenda.splitting_option || 'લાગુ પડતું નથી'}" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- 6I -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>I. Make in India અંતર્ગત રૂ . ૫.૦૦ લાખથી ઉપરની ખરીદીમાં સ્થાનિક સામગ્રીનાં સંદર્ભમાં પસંદગી ક્રમ</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem;">
                          <label><input type="checkbox" id="ag_mii_c1_guj" ${agenda.mii_c1_guj ?? true ? 'checked' : ''} /> Class-1 Guj MSE</label>
                          <label><input type="checkbox" id="ag_mii_c1_local" ${agenda.mii_c1_local ?? true ? 'checked' : ''} /> Class-1 Local Supplier</label>
                          <label><input type="checkbox" id="ag_mii_c2_guj" ${agenda.mii_c2_guj ?? true ? 'checked' : ''} /> Class-2 Guj MSE</label>
                          <label><input type="checkbox" id="ag_mii_c2_local" ${agenda.mii_c2_local ?? true ? 'checked' : ''} /> Class-2 Local Supplier</label>
                          <label><input type="checkbox" id="ag_mii_non_local" ${agenda.mii_non_local ?? false ? 'checked' : ''} /> Non Local Supplier</label>
                        </div>
                      </td>
                    </tr>

                    <!-- 6J -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>J. બીડનો સમયગાળો ઓછામાં ઓછો GeM Portal પર દર્શાવ્યા મુજબ છે ? ( ઓછામાં ઓછો સમયગાળો ૧૫ દિવસનો રાખવો )</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <input type="text" id="ag_bid_duration" class="form-control" value="${defaultBidDuration}" placeholder="e.g. ૧૧ દિવસ / ૧૫ દિવસ" style="font-size:0.85rem;" />
                      </td>
                    </tr>

                    <!-- SECTION 7 HEADER -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        7. ટેકનીકલ ઇવોલ્યુશનઃ
                      </td>
                    </tr>

                    <!-- 7A, 7B, 7C -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>A. ખરીદીમાં ભાગ લેનાર ઉત્પાદક / સપ્લાયરની સંખ્યા (ઓછામાં ઓછા 3)</strong><br/>
                        <strong>B. તેમાંથી ક્વોલીફાઇડ થયેલ સંખ્યા</strong><br/>
                        <strong>C. ડીસ્કવોલીફાઇડ કર્યા હોય તેનાં કારણો</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.5rem;">
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">કુલ સંખ્યા (Participants)</label>
                            <input type="text" id="ag_total_participants" class="form-control" value="${defaultTotalParts}" style="font-size:0.85rem;" />
                          </div>
                          <div>
                            <label style="font-size:0.78rem; color:var(--text-secondary);">ક્વોલીફાઇડ સંખ્યા</label>
                            <input type="text" id="ag_qualified_count" class="form-control" value="${defaultQualCount}" style="font-size:0.85rem;" />
                          </div>
                        </div>
                        <div>
                          <label style="font-size:0.78rem; color:var(--text-secondary);">ડીસ્કવોલીફાઇડ કારણો</label>
                          <input type="text" id="ag_disqualified_reasons" class="form-control" value="${defaultDisqualReasons}" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- 7D, 7E, 7F -->
                    <tr style="background:var(--bg-secondary);">
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>D. સ્થાનિક સામગ્રી અંગે પ્રમાણપત્રોની ચકાસણી કરવામાં આવેલ છે ?</strong><br/>
                        <strong>E. MSE નોંધણીનાં આધાર પુરાવા સામેલ છે ?</strong><br/>
                        <strong>F. OEM નાં અધિકૃતિપત્ર (Authorization) છે ?</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_local_cert_verified" class="form-control" value="${agenda.local_cert_verified || 'હા.'}" placeholder="D. પ્રમાણપત્ર ચકાસણી" style="font-size:0.85rem;" />
                          <input type="text" id="ag_mse_proof_attached" class="form-control" value="${agenda.mse_proof_attached || 'હા.'}" placeholder="E. MSE પુરાવા" style="font-size:0.85rem;" />
                          <input type="text" id="ag_oem_auth_letter" class="form-control" value="${agenda.oem_auth_letter || 'હા.'}" placeholder="F. OEM ઓથોરાઇઝેશન" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- 7G, 7H, 7I, 7J, 7K -->
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>G. ખરીદનીતિ ૨૦૨૪ મુજબ EMD ભરેલી છે ?</strong><br/>
                        <strong>H. 3 વર્ષનાં ટર્નઓવર 2 ગણા છે ?</strong><br/>
                        <strong>I. પૂર્વ લાયકાત શરતોની વિગતો ?</strong><br/>
                        <strong>J. ‘હાર્ડવેર ઇન્સ્ટોલેશન રીપોર્ટ’ મળ્યા બાદ ચૂકવણુ શરત છે ?</strong><br/>
                        <strong>K. અન્ય બાબતો</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                          <input type="text" id="ag_emd_paid" class="form-control" value="${agenda.emd_paid || 'હા / Exempted'}" placeholder="G. EMD વિગત" style="font-size:0.85rem;" />
                          <input type="text" id="ag_turnover_fulfilled" class="form-control" value="${agenda.turnover_fulfilled || 'હા.'}" placeholder="H. ટર્નઓવર પૂરી કરે છે?" style="font-size:0.85rem;" />
                          <input type="text" id="ag_pre_qual_details" class="form-control" value="${agenda.pre_qual_details || 'બીડ અનુસાર શરતો રાખેલ છે.'}" placeholder="I. પૂર્વ લાયકાત વિગત" style="font-size:0.85rem;" />
                          <input type="text" id="ag_install_report_terms" class="form-control" value="${agenda.install_report_terms || 'હા.'}" placeholder="J. ઇન્સ્ટોલેશન રીપોર્ટ શરત" style="font-size:0.85rem;" />
                          <input type="text" id="ag_other_matters" class="form-control" value="${agenda.other_matters || '-'}" placeholder="K. અન્ય બાબતો" style="font-size:0.85rem;" />
                        </div>
                      </td>
                    </tr>

                    <!-- FINANCIAL BID OPENING -->
                    <tr style="background:rgba(99,102,241,0.08); font-weight:700;">
                      <td colspan="2" style="padding:0.6rem 0.85rem; color:var(--text-primary); font-size:0.88rem;">
                        નાણાકીય બીડ ઓપન કરવાનો સમય અને તારીખ ( OTP વાળો ઈમેલ મુકવો)
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0.85rem; font-size:0.85rem; border-right:1px solid var(--border-color); vertical-align:top;">
                        <strong>Financial Bid Opening Details</strong>
                      </td>
                      <td style="padding:0.85rem; vertical-align:top;">
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                          <div style="flex:1; min-width:140px;">
                            <label style="font-size:0.78rem; color:var(--text-secondary);">ઓપન તારીખ</label>
                            <input type="date" id="ag_fin_bid_open_date" class="form-control" value="${agenda.fin_bid_open_date || defaultAgendaDate}" style="font-size:0.85rem;" />
                          </div>
                          <div style="flex:1; min-width:120px;">
                            <label style="font-size:0.78rem; color:var(--text-secondary);">ઓપન સમય</label>
                            <input type="text" id="ag_fin_bid_open_time" class="form-control" value="${agenda.fin_bid_open_time || '11:00 AM'}" placeholder="e.g. 11:30 AM" style="font-size:0.85rem;" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 20-Point Checklist -->
              <div class="card" style="background:var(--bg-secondary); border:1px solid var(--border-color); margin-bottom:1.5rem;">
                <div class="card-header">
                  <h4 class="card-title" style="font-size:0.95rem; font-weight:700; color:var(--text-primary);">
                    📋 DLPC ની ફાઈલ નીચે મુજબના ક્રમમાં તૈયાર કરવી (Tick as applicable - 20 Points Checklist)
                  </h4>
                </div>
                <div style="padding:1rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:0.6rem;">
                  ${checklistItems.map((item, idx) => {
          const isChecked = agenda[`chk_${idx + 1}`] ?? true;
          return `
                      <div style="display:flex; align-items:flex-start; gap:0.5rem; background:var(--bg-primary); padding:0.5rem 0.75rem; border-radius:6px; border:1px solid var(--border-color);">
                        <input type="checkbox" id="ag_chk_${idx + 1}" class="agenda-chk" data-idx="${idx + 1}" ${isChecked ? 'checked' : ''} style="margin-top:0.2rem; cursor:pointer;" />
                        <label for="ag_chk_${idx + 1}" style="font-size:0.82rem; cursor:pointer; line-height:1.35;">
                          ${item}
                        </label>
                      </div>
                    `;
        }).join('')}
                </div>
              </div>

              <!-- Save Button Bottom -->
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                <button type="button" id="saveAndDownloadDoc25BtnBottom" class="btn btn-primary" style="font-size:0.95rem; padding:0.65rem 1.5rem;">
                  💾 Save &amp; Download DOC-25 (.docx)
                </button>
                <button type="button" id="saveAgendaBottomBtn" class="btn btn-outline">
                  💾 Save Draft to DB
                </button>
              </div>
            </form>
          </div>
        ` : `
          <!-- GENERIC FILL & DOWNLOAD FORM FOR OTHER COMMITTEE DOCS -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                  📝 ${activeCommitteeDocTab} — ${currentDocs.find(d => d.id === activeCommitteeDocTab)?.name || 'Document Parameters'}
                </h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                  Review / customize fields for this document and click <strong>"Save &amp; Download"</strong>.
                </p>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-primary generic-save-download-btn" data-doc="${activeCommitteeDocTab}" style="font-size:0.85rem;">
                  💾 Save &amp; Download ${activeCommitteeDocTab} (.docx)
                </button>
              </div>
            </div>
            <div style="padding:1.25rem;">
              <form class="form-grid generic-doc-form" data-doc="${activeCommitteeDocTab}">
                <div class="form-group">
                  <label class="form-label">Meeting Reference No</label>
                  <input type="text" id="gen_meeting_ref" class="form-control" value="${currentMeeting.meeting_ref}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Item / Service Name</label>
                  <input type="text" id="gen_item_name" class="form-control" value="${currentMeeting.item_name || ''}" />
                </div>
                <div class="form-group">
                  <label class="form-label">L1 Vendor Legal Name</label>
                  <input type="text" id="gen_l1_vendor" class="form-control" value="${currentMeeting.l1_vendor || ''}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Sanction / L1 Amount (₹)</label>
                  <input type="number" id="gen_l1_amount" class="form-control" step="0.01" value="${currentMeeting.l1_amount || ''}" />
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Committee Remarks / Rate Reasonability Justification</label>
                  <textarea id="gen_reasonability" class="form-control" rows="3">${currentMeeting.rate_reasonability || 'The L1 rate quoted is verified against market survey and found reasonable.'}</textarea>
                </div>
                <div class="form-group full-width" style="display:flex; gap:0.5rem; justify-content:flex-end;">
                  <button type="button" class="btn btn-outline" onclick="handleDownloadDoc('${activeCommitteeDocTab}', ${currentMeeting.id})">
                    📥 Download Existing .docx
                  </button>
                  <button type="button" class="btn btn-primary generic-save-download-btn" data-doc="${activeCommitteeDocTab}">
                    💾 Save &amp; Download ${activeCommitteeDocTab} (.docx)
                  </button>
                </div>
              </form>
            </div>
          </div>
        `}
      </div>
    ` : `
      <div class="card" style="padding:2rem; text-align:center; color:var(--text-secondary);">
        No committee meetings recorded yet. Click <strong>"➕ New Meeting Sanction"</strong> above to register a DLPC or DPC meeting.
      </div>
    `}
  `;
}

function bindCommitteeEvents(meetings = [], indents = [], bids = []) {
  const activeMeetingSelect = document.getElementById('activeMeetingSelect');
  const activeMeetingId = activeMeetingSelect?.value;

  // Toggle New Meeting Form
  const toggleBtn = document.getElementById('toggleNewMeetingBtn');
  const newMeetingCard = document.getElementById('newMeetingCard');
  toggleBtn?.addEventListener('click', () => {
    if (newMeetingCard) {
      newMeetingCard.style.display = newMeetingCard.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Switch Active Meeting
  activeMeetingSelect?.addEventListener('change', (e) => {
    const newId = e.target.value;
    const appEl = document.getElementById('app');
    appEl.innerHTML = renderAppShell(renderCommitteeView(meetings, indents, bids, newId), 'committee');
    bindCommitteeEvents(meetings, indents, bids);
  });

  // Switch Active Document Tab
  document.querySelectorAll('.doc-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const docId = e.target.getAttribute('data-doc');
      if (docId) {
        activeCommitteeDocTab = docId;
        const appEl = document.getElementById('app');
        appEl.innerHTML = renderAppShell(renderCommitteeView(meetings, indents, bids, activeMeetingId, docId), 'committee');
        bindCommitteeEvents(meetings, indents, bids);
      }
    });
  });

  // Handle New Meeting Creation
  document.getElementById('committeeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('committeeType')?.value;
    const ref = document.getElementById('committeeRef')?.value?.trim();
    const date = document.getElementById('committeeDate')?.value;
    const indentId = document.getElementById('committeeIndentId')?.value || null;
    const bidId = document.getElementById('committeeBidId')?.value || null;
    const l1 = document.getElementById('committeeL1')?.value?.trim();
    const amount = document.getElementById('committeeAmount')?.value;
    const reasonability = document.getElementById('committeeReasonability')?.value?.trim();

    if (!ref || !l1 || !amount) {
      alert('Please fill all mandatory fields');
      return;
    }

    const payload = {
      committee_type: type,
      meeting_ref: ref,
      meeting_date: date,
      indent_id: indentId ? parseInt(indentId, 10) : null,
      bid_id: bidId ? parseInt(bidId, 10) : null,
      l1_vendor: l1,
      l1_amount: parseFloat(amount),
      rate_reasonability: reasonability,
      recommendation: 'Approved by DLPC/DPC'
    };

    try {
      const res = await api.createMeeting(payload);
      alert(`Committee meeting "${ref}" registered successfully!`);
      const newMeetingsRes = await api.getMeetings();
      const updatedMeetings = newMeetingsRes.data || [];
      const appEl = document.getElementById('app');
      appEl.innerHTML = renderAppShell(renderCommitteeView(updatedMeetings, indents, bids, res.data?.id), 'committee');
      bindCommitteeEvents(updatedMeetings, indents, bids);
    } catch (err) {
      alert('Error creating meeting: ' + err.message);
    }
  });

  // Helper to collect agenda data
  function getAgendaPayload() {
    const agendaData = {
      office_name: document.getElementById('ag_office_name')?.value?.trim() || '',
      agenda_ref: document.getElementById('ag_agenda_ref')?.value?.trim() || '',
      agenda_date: document.getElementById('ag_agenda_date')?.value || '',
      purchase_type: document.getElementById('ag_purchase_type')?.value || 'Bid',
      item_name: document.getElementById('ag_item_name')?.value?.trim() || '',
      qty: document.getElementById('ag_qty')?.value?.trim() || '',
      est_cost: document.getElementById('ag_est_cost')?.value?.trim() || '',
      admin_approval: document.getElementById('ag_admin_approval')?.value?.trim() || '',
      grant_head: document.getElementById('ag_grant_head')?.value?.trim() || '',
      mse_reserved: document.getElementById('ag_mse_reserved')?.value === 'true',
      spc_approval: document.getElementById('ag_spc_approval')?.value?.trim() || '',
      rc_period: document.getElementById('ag_rc_period')?.value?.trim() || '',
      last_purchase_mode: document.getElementById('ag_last_purchase_mode')?.value || 'gem_bid',
      last_qty: document.getElementById('ag_last_qty')?.value?.trim() || '',
      last_amount: document.getElementById('ag_last_amount')?.value?.trim() || '',
      l1_vendor: document.getElementById('ag_l1_vendor')?.value?.trim() || '',
      consignee: document.getElementById('ag_consignee')?.value?.trim() || '',
      spec_committee: document.getElementById('ag_spec_committee')?.value?.trim() || '',
      spec_gem: document.getElementById('ag_spec_gem')?.value?.trim() || '',
      reg_udyam: document.getElementById('ag_reg_udyam')?.checked ?? true,
      reg_cspo: document.getElementById('ag_reg_cspo')?.checked ?? true,
      reg_nsic: document.getElementById('ag_reg_nsic')?.checked ?? true,
      reg_dpiit: document.getElementById('ag_reg_dpiit')?.checked ?? true,
      reg_startup: document.getElementById('ag_reg_startup')?.checked ?? true,
      pre_qual_terms: document.getElementById('ag_pre_qual_terms')?.value?.trim() || '',
      emd_terms: document.getElementById('ag_emd_terms')?.value?.trim() || '',
      sd_terms: document.getElementById('ag_sd_terms')?.value?.trim() || '',
      turnover_terms: document.getElementById('ag_turnover_terms')?.value?.trim() || '',
      splitting_option: document.getElementById('ag_splitting_option')?.value?.trim() || '',
      mii_c1_guj: document.getElementById('ag_mii_c1_guj')?.checked ?? true,
      mii_c1_local: document.getElementById('ag_mii_c1_local')?.checked ?? true,
      mii_c2_guj: document.getElementById('ag_mii_c2_guj')?.checked ?? true,
      mii_c2_local: document.getElementById('ag_mii_c2_local')?.checked ?? true,
      mii_non_local: document.getElementById('ag_mii_non_local')?.checked ?? false,
      bid_duration: document.getElementById('ag_bid_duration')?.value?.trim() || '',
      total_participants: document.getElementById('ag_total_participants')?.value?.trim() || '',
      qualified_count: document.getElementById('ag_qualified_count')?.value?.trim() || '',
      disqualified_reasons: document.getElementById('ag_disqualified_reasons')?.value?.trim() || '',
      local_cert_verified: document.getElementById('ag_local_cert_verified')?.value?.trim() || '',
      mse_proof_attached: document.getElementById('ag_mse_proof_attached')?.value?.trim() || '',
      oem_auth_letter: document.getElementById('ag_oem_auth_letter')?.value?.trim() || '',
      emd_paid: document.getElementById('ag_emd_paid')?.value?.trim() || '',
      turnover_fulfilled: document.getElementById('ag_turnover_fulfilled')?.value?.trim() || '',
      pre_qual_details: document.getElementById('ag_pre_qual_details')?.value?.trim() || '',
      install_report_terms: document.getElementById('ag_install_report_terms')?.value?.trim() || '',
      other_matters: document.getElementById('ag_other_matters')?.value?.trim() || '',
      fin_bid_open_date: document.getElementById('ag_fin_bid_open_date')?.value || '',
      fin_bid_open_time: document.getElementById('ag_fin_bid_open_time')?.value?.trim() || ''
    };

    for (let i = 1; i <= 20; i++) {
      const chk = document.getElementById(`ag_chk_${i}`);
      agendaData[`chk_${i}`] = chk ? chk.checked : true;
    }
    return agendaData;
  }

  // Helper to collect GeM Agenda (DOC-25A) data
  function getGeMAgendaPayload() {
    return {
      gem_fin_year: document.getElementById('ag_gem_fin_year')?.value?.trim() || '૨૦૨૬ -૨૭',
      gem_meeting_ref: document.getElementById('ag_gem_meeting_ref')?.value?.trim() || '',
      gem_meeting_date: document.getElementById('ag_gem_meeting_date')?.value?.trim() || '',
      gem_dept_name: document.getElementById('ag_gem_dept_name')?.value?.trim() || '',
      gem_purchase_type: document.getElementById('ag_gem_purchase_type')?.value?.trim() || 'સામાન્ય',
      gem_item_name: document.getElementById('ag_gem_item_name')?.value?.trim() || '',
      gem_qty: document.getElementById('ag_gem_qty')?.value?.trim() || '',
      gem_est_cost: document.getElementById('ag_gem_est_cost')?.value?.trim() || '',
      gem_admin_approval: document.getElementById('ag_gem_admin_approval')?.value?.trim() || '',
      gem_grant_avail: document.getElementById('ag_gem_grant_avail')?.value?.trim() || '',
      gem_internal_comm: document.getElementById('ag_gem_internal_comm')?.value?.trim() || '',
      gem_specs_det: document.getElementById('ag_gem_specs_det')?.value?.trim() || '',
      gem_specs_gem_match: document.getElementById('ag_gem_specs_gem_match')?.value?.trim() || '',
      gem_pre_qual_terms: document.getElementById('ag_gem_pre_qual_terms')?.value?.trim() || '',
      gem_disqual_details: document.getElementById('ag_gem_disqual_details')?.value?.trim() || '',
      gem_comp_l1: document.getElementById('ag_gem_comp_l1')?.value?.trim() || '',
      gem_comp_count: document.getElementById('ag_gem_comp_count')?.value?.trim() || '',
      gem_l1_vendor: document.getElementById('ag_gem_l1_vendor')?.value?.trim() || '',
      gem_l1_amount: document.getElementById('ag_gem_l1_amount')?.value?.trim() || '',
      gem_part_count: document.getElementById('ag_gem_part_count')?.value?.trim() || '',
      gem_bid_days: document.getElementById('ag_gem_bid_days')?.value?.trim() || '',
      gem_ra_l1: document.getElementById('ag_gem_ra_l1')?.value?.trim() || '',
      gem_ra_count: document.getElementById('ag_gem_ra_count')?.value?.trim() || '',
      gem_ra_days: document.getElementById('ag_gem_ra_days')?.value?.trim() || '',
      gem_final_l1_vendor: document.getElementById('ag_gem_final_l1_vendor')?.value?.trim() || '',
      gem_unit_price: document.getElementById('ag_gem_unit_price')?.value?.trim() || '',
      gem_final_qty: document.getElementById('ag_gem_final_qty')?.value?.trim() || '',
      gem_final_l1_amount: document.getElementById('ag_gem_final_l1_amount')?.value?.trim() || '',
      gem_prev_purchase: document.getElementById('ag_gem_prev_purchase')?.value?.trim() || '',
      gem_pac_1: document.getElementById('ag_gem_pac_1')?.value?.trim() || '',
      gem_pac_2: document.getElementById('ag_gem_pac_2')?.value?.trim() || '',
      gem_pac_3: document.getElementById('ag_gem_pac_3')?.value?.trim() || '',
      gem_pac_4: document.getElementById('ag_gem_pac_4')?.value?.trim() || '',
      gem_pac_5: document.getElementById('ag_gem_pac_5')?.value?.trim() || '',
      gem_pac_6: document.getElementById('ag_gem_pac_6')?.value?.trim() || '',
      gem_pac_7: document.getElementById('ag_gem_pac_7')?.value?.trim() || '',
      gem_representations: document.getElementById('ag_gem_representations')?.value?.trim() || '',
      gem_inspect_method: document.getElementById('ag_gem_inspect_method')?.value?.trim() || '',
      gem_special_remarks: document.getElementById('ag_gem_special_remarks')?.value?.trim() || ''
    };
  }

  // Save Agenda Form handler (DOC-25)
  async function saveAgenda(downloadAfter = false) {
    if (!activeMeetingId) {
      alert('No meeting selected.');
      return;
    }

    const agendaData = getAgendaPayload();

    try {
      await api.updateMeetingAgenda(activeMeetingId, agendaData);
      const meetingObj = meetings.find(m => String(m.id) === String(activeMeetingId));
      if (meetingObj) {
        meetingObj.agenda_data = { ...(meetingObj.agenda_data || {}), ...agendaData };
      }
      if (downloadAfter) {
        await handleDownloadDoc('DOC-25', activeMeetingId);
      } else {
        alert('DLPC Agenda responses saved successfully to DB!');
      }
    } catch (err) {
      alert('Error saving agenda: ' + err.message);
    }
  }

  // Save GeM Agenda Form handler (DOC-25A / DOC-32)
  async function saveGeMAgenda(downloadAfter = false, explicitDoc = null) {
    if (!activeMeetingId) {
      alert('No meeting selected.');
      return;
    }

    const gemData = getGeMAgendaPayload();

    try {
      await api.updateMeetingAgenda(activeMeetingId, gemData);
      const meetingObj = meetings.find(m => String(m.id) === String(activeMeetingId));
      if (meetingObj) {
        meetingObj.agenda_data = { ...(meetingObj.agenda_data || {}), ...gemData };
      }
      if (downloadAfter) {
        const targetDocId = explicitDoc || (activeCommitteeDocTab === 'DOC-32' ? 'DOC-32' : 'DOC-25A');
        await handleDownloadDoc(targetDocId, activeMeetingId);
      } else {
        alert('GeM Agenda responses saved successfully to DB!');
      }
    } catch (err) {
      alert('Error saving GeM agenda: ' + err.message);
    }
  }

  document.getElementById('saveAgendaTopBtn')?.addEventListener('click', () => saveAgenda(false));
  document.getElementById('saveAgendaBottomBtn')?.addEventListener('click', () => saveAgenda(false));
  document.getElementById('saveAndDownloadDoc25Btn')?.addEventListener('click', () => saveAgenda(true));
  document.getElementById('saveAndDownloadDoc25BtnBottom')?.addEventListener('click', () => saveAgenda(true));

  document.getElementById('saveGeMAgendaTopBtn')?.addEventListener('click', () => saveGeMAgenda(false));
  document.getElementById('saveGeMAgendaBottomBtn')?.addEventListener('click', () => saveGeMAgenda(false));
  document.getElementById('saveAndDownloadDoc25ABtn')?.addEventListener('click', () => saveGeMAgenda(true, 'DOC-25A'));
  document.getElementById('saveAndDownloadDoc25ABtnBottom')?.addEventListener('click', () => saveGeMAgenda(true, 'DOC-25A'));
  document.getElementById('saveAndDownloadDoc32Btn')?.addEventListener('click', () => saveGeMAgenda(true, 'DOC-32'));
  document.getElementById('saveAndDownloadDoc32BtnBottom')?.addEventListener('click', () => saveGeMAgenda(true, 'DOC-32'));

  // Generic Save & Download for other committee docs
  document.querySelectorAll('.generic-save-download-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const docId = e.target.getAttribute('data-doc');
      if (!activeMeetingId || !docId) return;
      try {
        await handleDownloadDoc(docId, activeMeetingId);
      } catch (err) {
        alert('Error downloading document: ' + err.message);
      }
    });
  });
}

// ----------------------------------------------------
// 9. DELIVERY & VOUCHERS (FORM-10 & 11)
// ----------------------------------------------------
let activeDeliveryTab = 'receipt';

function renderDeliveryView(orders = [], vouchers = [], depts = []) {
  const selectedOrder = orders[0] || null;
  const initialQty = selectedOrder?.quantity || selectedOrder?.indent_qty || 2;
  const initialTotal = selectedOrder?.total_value || selectedOrder?.total_cost || 28360;
  const initialUnit = selectedOrder?.unit_price || (initialQty > 0 ? (initialTotal / initialQty) : 14180);

  const orderOpts = orders.length
    ? orders.map(o => `<option value="${o.id}">#${o.id} – ${o.order_no || 'PO'} | ${(o.item_name || '').substring(0, 35)} [₹${parseFloat(o.total_value || o.total_cost || 0).toLocaleString('en-IN')}]</option>`).join('')
    : '<option value="">— No Purchase Orders Found —</option>';

  const deptListDatalist = `
    <datalist id="deptDatalist">
      ${depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
    </datalist>
  `;

  return `
    ${renderAccessBanner('delivery')}
    ${deptListDatalist}

    <!-- Tab Bar -->
    <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
      <button type="button" class="btn ${activeDeliveryTab === 'receipt' ? 'btn-primary' : 'btn-outline'} delivery-tab-btn" data-tab="receipt">
        📋 Material Receipt Note (DOC-36)
      </button>
      <button type="button" class="btn ${activeDeliveryTab === 'inspection' ? 'btn-primary' : 'btn-outline'} delivery-tab-btn" data-tab="inspection">
        🔍 Technical Inspection Report (DOC-37)
      </button>
      <button type="button" class="btn ${activeDeliveryTab === 'voucher' ? 'btn-primary' : 'btn-outline'} delivery-tab-btn" data-tab="voucher">
        💳 Pass for Payment Voucher (DOC-38 / FORM-11)
      </button>
      <button type="button" class="btn ${activeDeliveryTab === 'checklist' ? 'btn-primary' : 'btn-outline'} delivery-tab-btn" data-tab="checklist">
        📑 Checklist D & E (DOC-39)
      </button>
    </div>

    ${activeDeliveryTab === 'receipt' ? `
      <!-- MATERIAL RECEIPT NOTE (DOC-36) FORM & PREVIEW -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                📜 DOC-36: Department Material Receipt Note
              </h3>
              <span class="badge badge-success" style="font-size:0.75rem;">🔒 Official LDCE Format</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
              Official 2-tier receipt form for Central Store and Department verification.
            </p>
          </div>
          <div class="flex gap-2">
            <button type="button" id="downloadReceiptNoteTopBtn" class="btn btn-primary btn-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download DOC-36 (.docx)
            </button>
          </div>
        </div>

        <form id="receiptNoteForm" class="form-grid" style="padding:1.5rem; gap:1.25rem;">
          <!-- Order Auto-populate Selector -->
          <div class="form-group full-width" style="background:var(--bg-secondary); padding:1rem; border-radius:8px; border:1px solid var(--border-color);">
            <label class="form-label" style="font-weight:600; color:var(--primary); margin-bottom:0.4rem;">
              ⚡ Auto-populate from Active Purchase Order:
            </label>
            <select id="mrOrderSelect" class="form-control" style="font-weight:500;">
              <option value="">-- Choose Purchase Order to Pre-Fill Data --</option>
              ${orders.map(o => `
                <option value="${o.id}">
                  PO #${o.order_no || o.id} - ${o.item_name || 'Item'} (${o.supplier_name || 'Vendor'}) - ₹${Number(o.total_value || o.total_cost || 0).toLocaleString('en-IN')}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Section 1: Store Data -->
          <div class="form-group full-width">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); border-bottom:2px solid var(--primary); padding-bottom:0.35rem; margin-bottom:0.75rem;">
              1. Central Store Details
            </h4>
          </div>

          <div class="form-group">
            <label class="form-label">Name & Address of Supplier</label>
            <input type="text" id="mr_supplier_name" class="form-control" placeholder="e.g. M/s Earth Syscom Private Limited" required />
          </div>

          <div class="form-group">
            <label class="form-label">Supplier Address</label>
            <input type="text" id="mr_supplier_address" class="form-control" placeholder="201-208, Palak Prime, Ahmedabad-380058" />
          </div>

          <div class="form-group">
            <label class="form-label">Supply Order No.</label>
            <input type="text" id="mr_order_no" class="form-control" placeholder="e.g. DTE/0215/08/2025" required />
          </div>

          <div class="form-group">
            <label class="form-label">Supply Order Date</label>
            <input type="date" id="mr_order_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Description of Stores (Item Name)</label>
            <input type="text" id="mr_item_name" class="form-control" placeholder="e.g. A4 size Duplex Scanner (Canon -DR-C230)" required />
          </div>

          <div class="form-group">
            <label class="form-label">Rate / Unit Price (₹)</label>
            <input type="number" id="mr_unit_price" class="form-control" step="0.01" />
          </div>

          <div class="form-group">
            <label class="form-label">Total Price (₹)</label>
            <input type="number" id="mr_total_price" class="form-control" step="0.01" />
          </div>

          <div class="form-group">
            <label class="form-label">P.O. Quantity (Nos.)</label>
            <input type="number" id="mr_qty" class="form-control" value="2" />
          </div>

          <div class="form-group">
            <label class="form-label">Qty Received in Good Condition</label>
            <input type="number" id="mr_qty_received" class="form-control" value="2" />
          </div>

          <div class="form-group">
            <label class="form-label">General Purchase Reg. No. / Pg No.</label>
            <input type="text" id="mr_gpr_no" class="form-control" placeholder="e.g. GPR-2026/Pg.42" />
          </div>

          <!-- Section 2: End User Department -->
          <div class="form-group full-width" style="margin-top:0.5rem;">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); border-bottom:2px solid var(--primary); padding-bottom:0.35rem; margin-bottom:0.75rem;">
              2. End User Department Details
            </h4>
          </div>

          <div class="form-group">
            <label class="form-label">Department Name</label>
            <select id="mr_dept_name" class="form-control">
              ${depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Date of Receipt in Dept.</label>
            <input type="date" id="mr_receipt_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Date of Installation</label>
            <input type="date" id="mr_installation_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Dead Stock Reg. No. / Pg No. / Sr. No.</label>
            <input type="text" id="mr_dead_stock_no" class="form-control" placeholder="e.g. DSR/IT/2026/Pg.15/Sr.02" />
          </div>

          <div class="form-group">
            <label class="form-label">Receiver's Name</label>
            <input type="text" id="mr_receiver_name" class="form-control" placeholder="e.g. Prof. A. K. Shah" />
          </div>

          <div class="form-group">
            <label class="form-label">Receiver's Designation</label>
            <input type="text" id="mr_receiver_designation" class="form-control" placeholder="e.g. Assistant Professor, IT Dept." />
          </div>

          <div class="form-group full-width flex justify-end items-center" style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
            <button type="button" id="downloadReceiptNoteBottomBtn" class="btn btn-primary flex items-center gap-1">
              📥 Download Material Receipt Note (.docx)
            </button>
          </div>
        </form>
      </div>
    ` : activeDeliveryTab === 'inspection' ? `
      <!-- TECHNICAL INSPECTION REPORT (DOC-37) FORM & PREVIEW -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
              </div>

              <div>
                <label class="form-label" style="font-size:0.82rem; font-weight:600;">Party Address</label>
                <textarea id="insp_supplier_address" class="form-control" rows="2" style="font-size:0.85rem;">${selectedOrder?.supplier_address || '201-208, Palak Prime, Opp. Hotel Double Tree by Hilton,\nISCON-Ambali Road, Ahmedabad-380058, Gujarat'}</textarea>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Order No.</label>
                  <input type="text" id="insp_order_no" class="form-control" value="${selectedOrder?.order_no || 'DTE/0215/08/2025'}" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Order Date</label>
                  <input type="date" id="insp_order_date" class="form-control" value="${selectedOrder?.order_date ? new Date(selectedOrder.order_date).toISOString().split('T')[0] : '2025-08-26'}" style="font-size:0.85rem;" />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Order Qty. for Institute</label>
                  <input type="text" id="insp_qty_inst" class="form-control" value="${initialQty ? `${String(initialQty).padStart(2, '0')} Nos.` : '02 Nos.'}" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Allocated Qty. to Dept.</label>
                  <input type="text" id="insp_qty_dept" class="form-control" value="Allocated Qty. to Dept. 01 No." style="font-size:0.85rem;" />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Due date for supply</label>
                  <input type="text" id="insp_due_date" class="form-control" value="As per P.O" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Date of receipt in dept.</label>
                  <input type="date" id="insp_receipt_date" class="form-control" value="${new Date().toISOString().split('T')[0]}" style="font-size:0.85rem;" />
                </div>
              </div>

              <div>
                <label class="form-label" style="font-size:0.82rem; font-weight:600;">Total Order Amount (₹)</label>
                <input type="number" id="insp_total_amount" class="form-control" value="${initialTotal}" style="font-size:0.85rem;" />
              </div>
            </div>

            <!-- Column 2: Inspection Findings & Signatures -->
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:1.25rem; display:flex; flex-direction:column; gap:0.9rem;">
              <h4 style="font-size:0.95rem; font-weight:700; color:var(--accent-green, #10b981); margin:0 0 0.5rem 0; padding-bottom:0.5rem; border-bottom:1px solid var(--border-color);">
                🔍 Technical Inspection Findings &amp; Committee
              </h4>

              <div>
                <label class="form-label" style="font-size:0.82rem; font-weight:600;">Inspection Remarks (Observations / Test Results)</label>
                <textarea id="insp_remarks" class="form-control" rows="3" style="font-size:0.85rem;" placeholder="Material inspected, tested, and found in working condition.">All units physically verified and matched with technical specifications. Working test completed successfully.</textarea>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:0.75rem;">
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Any Deviation?</label>
                  <select id="insp_deviation_select" class="form-control" style="font-size:0.85rem;">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Deviation Details (if yes)</label>
                  <input type="text" id="insp_deviation_text" class="form-control" placeholder="Mention deviation if any" style="font-size:0.85rem;" />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Not Accepted / Accepted</label>
                  <select id="insp_acceptance_status" class="form-control" style="font-size:0.85rem; font-weight:700; color:var(--accent-green);">
                    <option value="Accepted">Accepted</option>
                    <option value="Not Accepted">Not Accepted</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" style="font-size:0.82rem; font-weight:600;">Date of Inspection</label>
                  <input type="date" id="insp_date" class="form-control" value="${new Date().toISOString().split('T')[0]}" style="font-size:0.85rem;" />
                </div>
              </div>

              <h5 style="font-size:0.88rem; font-weight:700; margin:0.5rem 0 0.2rem 0; color:var(--text-primary); border-top:1px dashed var(--border-color); padding-top:0.6rem;">
                👥 Inspected By (Panel Signatories)
              </h5>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
                <div>
                  <label class="form-label" style="font-size:0.8rem; font-weight:600;">Inspector 1 Name</label>
                  <input type="text" id="insp_member1_name" class="form-control" placeholder="e.g. Prof. K. A. Dave" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label class="form-label" style="font-size:0.8rem; font-weight:600;">Inspector 1 Designation</label>
                  <input type="text" id="insp_member1_desig" class="form-control" placeholder="e.g. Assistant Professor, IT" style="font-size:0.85rem;" />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
                <div>
                  <label class="form-label" style="font-size:0.8rem; font-weight:600;">Inspector 2 Name</label>
                  <input type="text" id="insp_member2_name" class="form-control" placeholder="e.g. Prof. M. N. Shah" style="font-size:0.85rem;" />
                </div>
                <div>
                  <label class="form-label" style="font-size:0.8rem; font-weight:600;">Inspector 2 Designation</label>
                  <input type="text" id="insp_member2_desig" class="form-control" placeholder="e.g. Store Officer / Lab In-charge" style="font-size:0.85rem;" />
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Action Bar -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
            <span style="font-size:0.85rem; color:var(--text-secondary);">
              ℹ️ Click Download to generate the official <strong>Technical Inspection Report (.docx)</strong> instantly.
            </span>
            <button type="button" id="downloadInspectionReportBottomBtn" class="btn btn-primary">
              📥 Download Inspection Report (.docx)
            </button>
          </div>
        </form>
      </div>
    ` : activeDeliveryTab === 'voucher' ? `
      <!-- PASS FOR PAYMENT CERTIFICATE (DOC-38 / FORM-11) -->
      <div class="card">
        <div class="card-header flex justify-between items-center" style="background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(59,130,246,0.03)); border-bottom: 1px solid var(--border-color); padding: 1rem 1.25rem;">
          <div>
            <h3 class="card-title" style="font-size:1.15rem; font-weight:700; color:var(--text-primary); margin:0;">
              Pass for Payment Certificate for Purchase from GeM (DOC-38 / FORM-11)
            </h3>
            <p class="text-muted text-sm" style="margin:4px 0 0 0;">
              Official 24-row verification certificate for Central Store, Department, and Accounts Clearance.
            </p>
          </div>
          <div class="flex gap-2">
            <button type="button" id="downloadPassReportTopBtn" class="btn btn-primary btn-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download DOC-38 (.docx)
            </button>
          </div>
        </div>

        <form id="passReportForm" class="form-grid" style="padding:1.5rem; gap:1.25rem;">
          <!-- Order Auto-populate Selector -->
          <div class="form-group full-width" style="background:var(--bg-secondary); padding:1rem; border-radius:8px; border:1px solid var(--border-color);">
            <label class="form-label" style="font-weight:600; color:var(--primary); margin-bottom:0.4rem;">
              ⚡ Auto-populate from Active Purchase Order:
            </label>
            <select id="passOrderSelect" class="form-control" style="font-weight:500;">
              <option value="">-- Choose Purchase Order to Pre-Fill Data --</option>
              ${orders.map(o => `
                <option value="${o.id}">
                  PO #${o.order_no || o.id} - ${o.item_name || 'Item'} (${o.supplier_name || 'Vendor'}) - ₹${Number(o.total_value || o.total_cost || 0).toLocaleString('en-IN')}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Section 1: Item & Approval Info -->
          <div class="form-group full-width">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); border-bottom:2px solid var(--primary); padding-bottom:0.35rem; margin-bottom:0.75rem;">
              1. Item & Administrative Approval Details
            </h4>
          </div>

          <div class="form-group">
            <label class="form-label">Name of Item</label>
            <input type="text" id="pass_item_name" class="form-control" placeholder="e.g. A4 size Duplex Scanner (Canon -DR-C230)" required />
          </div>

          <div class="form-group">
            <label class="form-label">Buyer & user Dept.</label>
            <select id="pass_dept_name" class="form-control">
              ${depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Admin. Approval Mode & Date (Note)</label>
            <input type="text" id="pass_approval_note" class="form-control" value="તા ..................... ની નોંધ ઉપર આચાર્યશ્રીની મંજૂરી મળેલ છે." />
          </div>

          <div class="form-group">
            <label class="form-label">Admin. Approval Authority</label>
            <input type="text" id="pass_approval_authority" class="form-control" value="Principal, L.D.C.E" />
          </div>

          <div class="form-group">
            <label class="form-label">Ordered Qty</label>
            <input type="text" id="pass_ordered_qty" class="form-control" placeholder="e.g. 02 No(s)." />
          </div>

          <div class="form-group">
            <label class="form-label">GeM e-bid No.</label>
            <input type="text" id="pass_bid_no" class="form-control" placeholder="e.g. GEM/2026/B/1234567" />
          </div>

          <div class="form-group">
            <label class="form-label">GeM e-bid Date</label>
            <input type="date" id="pass_bid_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">GeM Contract No.</label>
            <input type="text" id="pass_contract_no" class="form-control" placeholder="e.g. GEMC-5116877-987654321" />
          </div>

          <div class="form-group">
            <label class="form-label">GeM Contract Date</label>
            <input type="date" id="pass_contract_date" class="form-control" />
          </div>

          <div class="form-group full-width">
            <label class="form-label">GeM Contract Amount (₹)</label>
            <input type="number" id="pass_contract_amount" class="form-control" step="0.01" placeholder="e.g. 28360" />
          </div>

          <!-- Section 2: Seller & Bank Details -->
          <div class="form-group full-width" style="margin-top:0.5rem;">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); border-bottom:2px solid var(--primary); padding-bottom:0.35rem; margin-bottom:0.75rem;">
              2. Name of Seller & Bank Details
            </h4>
          </div>

          <div class="form-group">
            <label class="form-label">Name of Seller</label>
            <input type="text" id="pass_seller_name" class="form-control" placeholder="e.g. M/s Earth Syscom Private Limited" />
          </div>

          <div class="form-group">
            <label class="form-label">City</label>
            <input type="text" id="pass_seller_city" class="form-control" value="Ahmedabad" />
          </div>

          <div class="form-group">
            <label class="form-label">State</label>
            <input type="text" id="pass_seller_state" class="form-control" value="Gujarat" />
          </div>

          <div class="form-group">
            <label class="form-label">Name of Bank</label>
            <input type="text" id="pass_seller_bank" class="form-control" placeholder="e.g. State Bank of India" />
          </div>

          <div class="form-group">
            <label class="form-label">Bank Account No.</label>
            <input type="text" id="pass_seller_acc" class="form-control" placeholder="e.g. 123456789012" />
          </div>

          <div class="form-group">
            <label class="form-label">IFSC Code</label>
            <input type="text" id="pass_seller_ifsc" class="form-control" placeholder="e.g. SBIN0001234" />
          </div>

          <div class="form-group full-width">
            <label class="form-label">PAN No.</label>
            <input type="text" id="pass_seller_pan" class="form-control" placeholder="e.g. ABCDE1234F" />
          </div>

          <!-- Section 3: Delivery, Billing & Registers -->
          <div class="form-group full-width" style="margin-top:0.5rem;">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); border-bottom:2px solid var(--primary); padding-bottom:0.35rem; margin-bottom:0.75rem;">
              3. Delivery, CRAC, Invoice & Payment Details
            </h4>
          </div>

          <div class="form-group">
            <label class="form-label">Date of Delivery</label>
            <input type="date" id="pass_delivery_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Delivery Challan No. & Qty</label>
            <input type="text" id="pass_challan_no_qty" class="form-control" placeholder="e.g. DC/2026/89    Qty. 02 No(s)." />
          </div>

          <div class="form-group">
            <label class="form-label">CRAC No.</label>
            <input type="text" id="pass_crac_no" class="form-control" placeholder="e.g. GEMCRAC-5116877-001" />
          </div>

          <div class="form-group">
            <label class="form-label">CRAC Date</label>
            <input type="date" id="pass_crac_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">GeM Invoice No.</label>
            <input type="text" id="pass_invoice_no" class="form-control" placeholder="e.g. GEM-INV-2026-99" />
          </div>

          <div class="form-group">
            <label class="form-label">GeM Invoice Date</label>
            <input type="date" id="pass_invoice_date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Invoice Amount (₹)</label>
            <input type="number" id="pass_invoice_amount" class="form-control" step="0.01" />
          </div>

          <div class="form-group">
            <label class="form-label">Penalty / LD Charges</label>
            <input type="text" id="pass_penalty_text" class="form-control" value="@0.5% per week or a part of week for xx Week(s) Nil" />
          </div>

          <div class="form-group">
            <label class="form-label">Net Payment to Seller (₹)</label>
            <input type="number" id="pass_net_payment" class="form-control" step="0.01" />
          </div>

          <div class="form-group">
            <label class="form-label">Register Type</label>
            <input type="text" id="pass_register_type" class="form-control" value="Dead Stock Register" />
          </div>

          <div class="form-group">
            <label class="form-label">Register Page No.</label>
            <input type="text" id="pass_page_no" class="form-control" placeholder="e.g. 45" />
          </div>

          <div class="form-group">
            <label class="form-label">Register Sr.No.</label>
            <input type="text" id="pass_sr_no" class="form-control" placeholder="e.g. 12" />
          </div>

          <div class="form-group full-width">
            <label class="form-label">Grant Head</label>
            <input type="text" id="pass_grant_head" class="form-control" value="GOG / CTE / Head of Account" />
          </div>

          <!-- Section 4: Central Store & Accounts Details -->
          <div class="form-group full-width" style="margin-top:0.5rem;">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); border-bottom:2px solid var(--primary); padding-bottom:0.35rem; margin-bottom:0.75rem;">
              4. Central Store & Account Department Registers
            </h4>
          </div>

          <div class="form-group">
            <label class="form-label">Central Dead Stock Reg. No.</label>
            <input type="text" id="pass_store_reg_no" class="form-control" placeholder="e.g. CDSR-2026/04" />
          </div>

          <div class="form-group">
            <label class="form-label">Central Dead Stock Pg & Sr</label>
            <input type="text" id="pass_store_pg_sr" class="form-control" placeholder="e.g. Pg 88, Sr 14" />
          </div>

          <div class="form-group">
            <label class="form-label">General Purchase Reg. (GPR) No.</label>
            <input type="text" id="pass_store_gpr_no" class="form-control" placeholder="e.g. GPR/2026/102" />
          </div>

          <div class="form-group">
            <label class="form-label">GPR Pg & Sr No.</label>
            <input type="text" id="pass_store_gpr_pg_sr" class="form-control" placeholder="e.g. Pg 32, Sr 08" />
          </div>

          <div class="form-group">
            <label class="form-label">Account Payment Detail</label>
            <input type="text" id="pass_account_detail" class="form-control" placeholder="e.g. Cleared for RTGS / PFMS" />
          </div>

          <div class="form-group">
            <label class="form-label">RTGS/NEFT Ref. No & Date</label>
            <input type="text" id="pass_account_rtgs" class="form-control" placeholder="e.g. UTR123456789 dt. 07/09/2026" />
          </div>

          <!-- Submission & Download -->
          <div class="form-group full-width flex justify-between items-center" style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
            <button type="submit" class="btn btn-success flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
              Save & Process Payment Voucher
            </button>
            <button type="button" id="downloadPassReportBottomBtn" class="btn btn-primary flex items-center gap-1">
              📥 Download Pass for Payment (.docx)
            </button>
          </div>
        </form>
      </div>
    ` : activeDeliveryTab === 'checklist' ? `
      <!-- CHECKLIST D & E (DOC-39) VIEW-ONLY -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 class="card-title" style="font-size:1.1rem; font-weight:700;">
                📑 DOC-39: Official Verification Checklists (Check list–D & Check list–E)
              </h3>
              <span class="badge badge-success" style="font-size:0.75rem;">🔒 View Only</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
              Official bill verification checklist templates for Central Store (Set-1) and Accounts Department (Sets-2 & 3). Generated together in a single document.
            </p>
          </div>
          <div class="flex gap-2">
            <button type="button" id="downloadChecklistTopBtn" class="btn btn-primary btn-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download Complete Checklist D & E (.docx)
            </button>
          </div>
        </div>

        <div style="padding:1.5rem; display:flex; flex-direction:column; gap:1.5rem;">
          <!-- Dual Checklist Document Preview -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap:1.5rem;">
            
            <!-- Check list-D Preview Card -->
            <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="text-align:center; margin-bottom:1.25rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
                <h4 style="font-size:1rem; font-weight:700; text-decoration:underline; margin:0 0 0.3rem 0;">L.D College of Engineering, Ahmedabad</h4>
                <div style="font-size:1.05rem; font-weight:700; margin:0.2rem 0;">Check list–D</div>
                <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">(Pass for Payment - Set-1: Store Copy)</div>
              </div>

              <table style="width:100%; font-size:0.85rem; border-collapse:collapse; margin-bottom:1rem;">
                <tbody>
                  ${[
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
      ].map((item, i) => `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.05);">
                      <td style="padding:0.4rem 0.5rem; line-height:1.4;">${i + 1}. ${item}</td>
                      <td style="padding:0.4rem 0.5rem; text-align:center; width:35px;">
                        <span style="display:inline-block; width:18px; height:18px; border:1.5px solid var(--text-secondary); border-radius:2px;"></span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.75rem;">
                *Sr.No.2 Document is required only for Purchase through Bid.
              </div>

              <div style="font-size:0.8rem; line-height:1.4; margin-bottom:1.5rem; background:var(--bg-secondary); padding:0.6rem; border-radius:4px;">
                I have checked that the above documents are signed and stamp by the concerned officers/Staff & there is no any missing.
              </div>

              <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; border-top:1px dashed var(--border-color); padding-top:0.75rem;">
                <div>
                  <div>Sign: Dept. Representative</div>
                  <div style="margin-top:0.25rem;">Name:</div>
                </div>
                <div style="text-align:right;">
                  HOD, Sign & Stamp
                </div>
              </div>
              <div style="text-align:right; font-size:0.75rem; font-style:italic; color:var(--text-secondary); margin-top:0.75rem;">
                LDCE/Pur/2024-25
              </div>
            </div>

            <!-- Check list-E Preview Card -->
            <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="text-align:center; margin-bottom:1.25rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
                <h4 style="font-size:1rem; font-weight:700; text-decoration:underline; margin:0 0 0.3rem 0;">L.D College of Engineering, Ahmedabad</h4>
                <div style="font-size:1.05rem; font-weight:700; margin:0.2rem 0;">Check list–E</div>
                <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">(Pass for Payment - Set-2: A/C Copy-1 & Set- 3: A/C Copy-2)</div>
              </div>

              <table style="width:100%; font-size:0.85rem; border-collapse:collapse; margin-bottom:1rem;">
                <tbody>
                  ${[
        'Pass for payment form with sign and stamp',
        'Copy of form approved by DLPC/DPC/SDPC/SPC',
        'Copy of note approved by the Principal',
        'GeM Invoice with sign & Stamp of HOD',
        'Seller payment details generated from GeM',
        'CRAC with sign & Stamp of HOD',
        'Contract Order with sign & Stamp of HOD',
        'Inspection report'
      ].map((item, i) => `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.05);">
                      <td style="padding:0.4rem 0.5rem; line-height:1.4;">${i + 1}. ${item}</td>
                      <td style="padding:0.4rem 0.5rem; text-align:center; width:35px;">
                        <span style="display:inline-block; width:18px; height:18px; border:1.5px solid var(--text-secondary); border-radius:2px;"></span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.75rem;">
                *Sr.No.2 Document is required only for Purchase through Bid.
              </div>

              <div style="font-size:0.8rem; line-height:1.4; margin-bottom:1.5rem; background:var(--bg-secondary); padding:0.6rem; border-radius:4px;">
                I have checked that the above documents are signed and stamp by the concerned officers/Staff & there is no any missing in the file.
              </div>

              <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; border-top:1px dashed var(--border-color); padding-top:0.75rem;">
                <div>
                  <div>Sign: Dept. Representative</div>
                  <div style="margin-top:0.25rem;">Name:</div>
                </div>
                <div style="text-align:right;">
                  HOD, Sign & Stamp
                </div>
              </div>
              <div style="text-align:right; font-size:0.75rem; font-style:italic; color:var(--text-secondary); margin-top:0.75rem;">
                LDCE/Pur/2024-25
              </div>
            </div>

          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex justify-between items-center" style="padding-top:1rem; border-top:1px solid var(--border-color);">
            <div style="font-size:0.85rem; color:var(--text-secondary);">
              ℹ️ Output contains <strong>both Check list–D and Check list–E</strong> combined in a single Word (.docx) file.
            </div>
            <button type="button" id="downloadChecklistBottomBtn" class="btn btn-primary flex items-center gap-1">
              📥 Download Complete Checklist D & E (.docx)
            </button>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

function bindDeliveryEvents(orders = [], vouchers = [], depts = []) {
  // Tab Switcher
  document.querySelectorAll('.delivery-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.getAttribute('data-tab');
      if (tab) {
        activeDeliveryTab = tab;
        const appEl = document.getElementById('app');
        appEl.innerHTML = renderAppShell(renderDeliveryView(orders, vouchers, depts), 'delivery');
        bindDeliveryEvents(orders, vouchers, depts);
      }
    });
  });

  // Order Dropdown Auto-Fill for Material Receipt
  const mrOrderSelect = document.getElementById('mrOrderSelect');
  mrOrderSelect?.addEventListener('change', (e) => {
    const ordId = e.target.value;
    const ord = orders.find(o => String(o.id) === String(ordId));
    if (ord) {
      const qty = ord.quantity || ord.indent_qty || 2;
      const total = ord.total_value || ord.total_cost || 28360;
      const unit = ord.unit_price || (qty > 0 ? (total / qty) : 14180);

      const supName = document.getElementById('mr_supplier_name');
      const supAddr = document.getElementById('mr_supplier_address');
      const ordNo = document.getElementById('mr_order_no');
      const ordDate = document.getElementById('mr_order_date');
      const itemName = document.getElementById('mr_item_name');
      const unitPrice = document.getElementById('mr_unit_price');
      const totalPrice = document.getElementById('mr_total_price');
      const poQty = document.getElementById('mr_qty');
      const qtyRec = document.getElementById('mr_qty_received');
      const deptName = document.getElementById('mr_dept_name');

      if (supName && ord.supplier_name) supName.value = ord.supplier_name;
      if (supAddr && ord.supplier_address) supAddr.value = ord.supplier_address;
      if (ordNo && ord.order_no) ordNo.value = ord.order_no;
      if (ordDate && ord.order_date) ordDate.value = new Date(ord.order_date).toISOString().split('T')[0];
      if (itemName && ord.item_name) itemName.value = ord.item_name;
      if (unitPrice) unitPrice.value = unit;
      if (totalPrice) totalPrice.value = total;
      if (poQty) poQty.value = qty;
      if (qtyRec) qtyRec.value = qty;
      if (deptName && ord.dept_name) deptName.value = ord.dept_name;
    }
  });

  // Material Receipt Download handler
  async function downloadMaterialReceipt() {
    const orderId = document.getElementById('mrOrderSelect')?.value;
    const extra = {
      supplier_name: document.getElementById('mr_supplier_name')?.value?.trim() || '',
      supplier_address: document.getElementById('mr_supplier_address')?.value?.trim() || '',
      order_no: document.getElementById('mr_order_no')?.value?.trim() || '',
      order_date: document.getElementById('mr_order_date')?.value || '',
      item_name: document.getElementById('mr_item_name')?.value?.trim() || '',
      make_model: document.getElementById('mr_make_model')?.value?.trim() || '',
      unit_price: parseFloat(document.getElementById('mr_unit_price')?.value || 0),
      total_price: parseFloat(document.getElementById('mr_total_price')?.value || 0),
      qty: parseInt(document.getElementById('mr_qty')?.value || 1, 10),
      dept_name: document.getElementById('mr_dept_name')?.value?.trim() || '',
      receipt_date: document.getElementById('mr_receipt_date')?.value || '',
      installation_date: document.getElementById('mr_installation_date')?.value || '',
      qty_received: parseInt(document.getElementById('mr_qty_received')?.value || 1, 10),
      dead_stock_no: document.getElementById('mr_dead_stock_no')?.value?.trim() || '',
      remarks: document.getElementById('mr_remarks')?.value?.trim() || '',
      receiver_name: document.getElementById('mr_receiver_name')?.value?.trim() || '',
      receiver_designation: document.getElementById('mr_receiver_designation')?.value?.trim() || ''
    };

    try {
      await api.downloadDocument('DOC-36', orderId, extra);
    } catch (err) {
      alert('Error downloading Material Receipt Note: ' + err.message);
    }
  }

  document.getElementById('downloadMaterialReceiptTopBtn')?.addEventListener('click', downloadMaterialReceipt);
  document.getElementById('downloadMaterialReceiptBottomBtn')?.addEventListener('click', downloadMaterialReceipt);

  // Order Dropdown Auto-Fill for Inspection Report
  const inspOrderSelect = document.getElementById('inspOrderSelect');
  inspOrderSelect?.addEventListener('change', (e) => {
    const ordId = e.target.value;
    const ord = orders.find(o => String(o.id) === String(ordId));
    if (ord) {
      const qty = ord.quantity || ord.indent_qty || 2;
      const total = ord.total_value || ord.total_cost || 28360;

      const itemName = document.getElementById('insp_item_name');
      const deptName = document.getElementById('insp_consignee_dept');
      const supName = document.getElementById('insp_supplier_name');
      const supAddr = document.getElementById('insp_supplier_address');
      const ordNo = document.getElementById('insp_order_no');
      const ordDate = document.getElementById('insp_order_date');
      const qtyInst = document.getElementById('insp_qty_inst');
      const totalAmount = document.getElementById('insp_total_amount');

      if (itemName && ord.item_name) itemName.value = ord.item_name;
      if (deptName && ord.dept_name) deptName.value = ord.dept_name;
      if (supName && ord.supplier_name) supName.value = ord.supplier_name;
      if (supAddr && ord.supplier_address) supAddr.value = ord.supplier_address;
      if (ordNo && ord.order_no) ordNo.value = ord.order_no;
      if (ordDate && ord.order_date) ordDate.value = new Date(ord.order_date).toISOString().split('T')[0];
      if (qtyInst) qtyInst.value = `${String(qty).padStart(2, '0')} Nos.`;
      if (totalAmount) totalAmount.value = total;
    }
  });

  // Inspection Report Download handler
  async function downloadInspectionReport() {
    const orderId = document.getElementById('inspOrderSelect')?.value;
    const devSelect = document.getElementById('insp_deviation_select')?.value || 'No';
    const devText = document.getElementById('insp_deviation_text')?.value?.trim() || '';
    const deviationVal = devSelect === 'Yes' && devText ? `Yes - ${devText}` : devSelect;

    const extra = {
      item_name: document.getElementById('insp_item_name')?.value?.trim() || '',
      make_model: document.getElementById('insp_make_model')?.value?.trim() || '',
      consignee_dept: document.getElementById('insp_consignee_dept')?.value?.trim() || '',
      supplier_name: document.getElementById('insp_supplier_name')?.value?.trim() || '',
      supplier_address: document.getElementById('insp_supplier_address')?.value?.trim() || '',
      order_no: document.getElementById('insp_order_no')?.value?.trim() || '',
      order_date: document.getElementById('insp_order_date')?.value || '',
      order_qty_institute: document.getElementById('insp_qty_inst')?.value?.trim() || '',
      allocated_qty_dept: document.getElementById('insp_qty_dept')?.value?.trim() || '',
      due_date: document.getElementById('insp_due_date')?.value?.trim() || 'As per P.O',
      receipt_date: document.getElementById('insp_receipt_date')?.value || '',
      total_order_amount: parseFloat(document.getElementById('insp_total_amount')?.value || 0),
      inspection_remarks: document.getElementById('insp_remarks')?.value?.trim() || '',
      deviation: deviationVal,
      acceptance_status: document.getElementById('insp_acceptance_status')?.value || 'Accepted',
      inspection_date: document.getElementById('insp_date')?.value || '',
      insp1_name: document.getElementById('insp_member1_name')?.value?.trim() || '',
      insp1_designation: document.getElementById('insp_member1_desig')?.value?.trim() || '',
      insp2_name: document.getElementById('insp_member2_name')?.value?.trim() || '',
      insp2_designation: document.getElementById('insp_member2_desig')?.value?.trim() || ''
    };

    try {
      await api.downloadDocument('DOC-37', orderId, extra);
    } catch (err) {
      alert('Error downloading Technical Inspection Report: ' + err.message);
    }
  }

  document.getElementById('downloadInspectionReportTopBtn')?.addEventListener('click', downloadInspectionReport);
  document.getElementById('downloadInspectionReportBottomBtn')?.addEventListener('click', downloadInspectionReport);

  // Pass for Payment Order Dropdown Auto-Fill
  const passOrderSelect = document.getElementById('passOrderSelect');
  passOrderSelect?.addEventListener('change', (e) => {
    const ordId = e.target.value;
    const ord = orders.find(o => String(o.id) === String(ordId));
    if (ord) {
      const qty = ord.quantity || ord.indent_qty || 2;
      const total = ord.total_value || ord.total_cost || 28360;

      const itemName = document.getElementById('pass_item_name');
      const deptName = document.getElementById('pass_dept_name');
      const ordQty = document.getElementById('pass_ordered_qty');
      const contractNo = document.getElementById('pass_contract_no');
      const contractDate = document.getElementById('pass_contract_date');
      const contractAmount = document.getElementById('pass_contract_amount');
      const sellerName = document.getElementById('pass_seller_name');
      const challanQty = document.getElementById('pass_challan_no_qty');
      const cracNo = document.getElementById('pass_crac_no');
      const invAmount = document.getElementById('pass_invoice_amount');
      const netPayment = document.getElementById('pass_net_payment');

      if (itemName && ord.item_name) itemName.value = ord.item_name;
      if (deptName && ord.dept_name) deptName.value = ord.dept_name;
      if (ordQty) ordQty.value = `${String(qty).padStart(2, '0')} No(s).`;
      if (contractNo && ord.order_no) contractNo.value = ord.order_no;
      if (contractDate && ord.order_date) contractDate.value = new Date(ord.order_date).toISOString().split('T')[0];
      if (contractAmount) contractAmount.value = total;
      if (sellerName && ord.supplier_name) sellerName.value = ord.supplier_name;
      if (challanQty) challanQty.value = `DC/${new Date().getFullYear()}/01    Qty. ${String(qty).padStart(2, '0')} No(s).`;
      if (cracNo) cracNo.value = `GEMCRAC-${ord.order_no ? ord.order_no.replace(/[^a-zA-Z0-9]/g, '') : '5116877001'}`;
      if (invAmount) invAmount.value = total;
      if (netPayment) netPayment.value = total;
    }
  });

  // Pass for Payment Download handler
  async function downloadPassReport() {
    const orderId = document.getElementById('passOrderSelect')?.value;

    const extra = {
      item_name: document.getElementById('pass_item_name')?.value?.trim() || '',
      dept_name: document.getElementById('pass_dept_name')?.value?.trim() || '',
      admin_approval_note: document.getElementById('pass_approval_note')?.value?.trim() || '',
      admin_approval_authority: document.getElementById('pass_approval_authority')?.value?.trim() || '',
      ordered_qty: document.getElementById('pass_ordered_qty')?.value?.trim() || '',
      gem_bid_no: document.getElementById('pass_bid_no')?.value?.trim() || '',
      gem_bid_date: document.getElementById('pass_bid_date')?.value || '',
      gem_contract_no: document.getElementById('pass_contract_no')?.value?.trim() || '',
      gem_contract_date: document.getElementById('pass_contract_date')?.value || '',
      contract_amount: parseFloat(document.getElementById('pass_contract_amount')?.value || 0),
      seller_name: document.getElementById('pass_seller_name')?.value?.trim() || '',
      seller_city: document.getElementById('pass_seller_city')?.value?.trim() || '',
      seller_state: document.getElementById('pass_seller_state')?.value?.trim() || '',
      seller_bank_name: document.getElementById('pass_seller_bank')?.value?.trim() || '',
      seller_bank_acc: document.getElementById('pass_seller_acc')?.value?.trim() || '',
      seller_bank_ifsc: document.getElementById('pass_seller_ifsc')?.value?.trim() || '',
      seller_pan: document.getElementById('pass_seller_pan')?.value?.trim() || '',
      delivery_date: document.getElementById('pass_delivery_date')?.value || '',
      challan_no: document.getElementById('pass_challan_no_qty')?.value?.trim() || '',
      crac_no: document.getElementById('pass_crac_no')?.value?.trim() || '',
      crac_date: document.getElementById('pass_crac_date')?.value || '',
      gem_invoice_no: document.getElementById('pass_invoice_no')?.value?.trim() || '',
      gem_invoice_date: document.getElementById('pass_invoice_date')?.value || '',
      invoice_amount: parseFloat(document.getElementById('pass_invoice_amount')?.value || 0),
      penalty_text: document.getElementById('pass_penalty_text')?.value?.trim() || '',
      net_payment: parseFloat(document.getElementById('pass_net_payment')?.value || 0),
      register_type: document.getElementById('pass_register_type')?.value?.trim() || '',
      page_no: document.getElementById('pass_page_no')?.value?.trim() || '',
      sr_no: document.getElementById('pass_sr_no')?.value?.trim() || '',
      grant_head: document.getElementById('pass_grant_head')?.value?.trim() || '',
      store_reg_no: document.getElementById('pass_store_reg_no')?.value?.trim() || '',
      store_pg_no: document.getElementById('pass_store_pg_sr')?.value?.trim() || '',
      store_gpr_no: document.getElementById('pass_store_gpr_no')?.value?.trim() || '',
      store_gpr_pg: document.getElementById('pass_store_gpr_pg_sr')?.value?.trim() || '',
      account_payment_detail: document.getElementById('pass_account_detail')?.value?.trim() || '',
      account_rtgs_ref: document.getElementById('pass_account_rtgs')?.value?.trim() || ''
    };

    try {
      await api.downloadDocument('DOC-38', orderId || (orders[0]?.id || '1'), extra);
    } catch (err) {
      alert('Error downloading Pass for Payment Certificate: ' + err.message);
    }
  }

  document.getElementById('downloadPassReportTopBtn')?.addEventListener('click', downloadPassReport);
  document.getElementById('downloadPassReportBottomBtn')?.addEventListener('click', downloadPassReport);

  // Voucher / Pass form submission
  document.getElementById('passReportForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Pass for Payment Certificate saved and processed successfully!');
  });

  // Checklist D & E Download handler (View-Only / Direct Download)
  async function downloadChecklist() {
    try {
      await api.downloadDocument('DOC-39', orders[0]?.id || '1', { fin_year: '2024-25' });
    } catch (err) {
      alert('Error downloading Checklist D & E: ' + err.message);
    }
  }

  document.getElementById('downloadChecklistTopBtn')?.addEventListener('click', downloadChecklist);
  document.getElementById('downloadChecklistBottomBtn')?.addEventListener('click', downloadChecklist);
}

// ----------------------------------------------------
// 10. REPAIRS & NON-WORKING EQUIPMENT (FORM-12), INQUIRY LETTER (DOC-41) & COMPARATIVE STATEMENT (DOC-42)
// ----------------------------------------------------
let inquiryFormItems = [
  { item_name: '', qty: '', remarks: '' }
];

let compFundType = 'Govt Fund';
let compVendors = [
  { name: 'AKSH Services', address: "1-Anand Bhavan, Abadnagar Bopal, A'bad", rate: '2500.00', tax: '450.00', other: '0.00', total: '2950.00', tc: 'Payment within 30 days' },
  { name: 'FAST Services', address: "I-2, GF-Kumkum Residency B/h Satyam Hospital, Chandkheda A'bad", rate: '2800.00', tax: '504.00', other: '0.00', total: '3304.00', tc: '1 Year Warranty' },
  { name: 'KARAN Enterprise', address: "C-10 Appts, Central jail road, Subhashbridge, A'bad", rate: '3100.00', tax: '558.00', other: '0.00', total: '3658.00', tc: 'Doorstep service' }
];
let compItems = [
  { item_name: 'CAMC of Canon IR 2002 Copier machine', qty: '01 No.', remarks: '' }
];

function renderRepairsView(depts, requests) {
  // Navigation Tabs
  const navTabs = `
    <div style="display:flex;gap:0.5rem;border-bottom:2px solid var(--neutral-700,#333);margin-bottom:1.5rem;padding-bottom:0.25rem;flex-wrap:wrap;">
      <button type="button" class="btn ${activeRepairsTab === 'register' ? 'btn-primary' : 'btn-secondary'}" id="tabBtnRepairsRegister" style="border-radius:6px 6px 0 0;padding:0.6rem 1.1rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>
        <span>Equipment Repair Register (FORM-12)</span>
      </button>
      <button type="button" class="btn ${activeRepairsTab === 'inquiry' ? 'btn-primary' : 'btn-secondary'}" id="tabBtnRepairsInquiry" style="border-radius:6px 6px 0 0;padding:0.6rem 1.1rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>✉️ Official Inquiry Letter (DOC-41)</span>
      </button>
      <button type="button" class="btn ${activeRepairsTab === 'comp' ? 'btn-primary' : 'btn-secondary'}" id="tabBtnRepairsComp" style="border-radius:6px 6px 0 0;padding:0.6rem 1.1rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        <span>📊 Comparative Statement (DOC-42)</span>
      </button>
      <button type="button" class="btn ${activeRepairsTab === 'doc43' ? 'btn-primary' : 'btn-secondary'}" id="tabBtnRepairsDoc43" style="border-radius:6px 6px 0 0;padding:0.6rem 1.1rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;">
        <span>📜</span>
        <span>PO &amp; Work Order (DOC-43)</span>
      </button>
      <button type="button" class="btn ${activeRepairsTab === 'doc45' ? 'btn-primary' : 'btn-secondary'}" id="tabBtnRepairsDoc45" style="border-radius:6px 6px 0 0;padding:0.6rem 1.1rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;">
        <span>📝</span>
        <span>Note for Approval (DOC-45)</span>
      </button>
      <button type="button" class="btn ${activeRepairsTab === 'doc46' ? 'btn-primary' : 'btn-secondary'}" id="tabBtnRepairsDoc46" style="border-radius:6px 6px 0 0;padding:0.6rem 1.1rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;">
        <span>📋</span>
        <span>Note for WO (DOC-46)</span>
      </button>
      <button type="button" class="btn ${activeRepairsTab === 'doc47' ? 'btn-primary' : 'btn-secondary'}" id="tabBtnRepairsDoc47" style="border-radius:6px 6px 0 0;padding:0.6rem 1.1rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;">
        <span>💳</span>
        <span>Pass for Payment (DOC-47)</span>
      </button>
    </div>
  `;

  // COMPARATIVE STATEMENT (DOC-42) TAB
  if (activeRepairsTab === 'comp') {
    return `
      ${renderAccessBanner('repairs')}
      ${navTabs}

      <div style="display:grid;grid-template-columns:minmax(380px, 500px) 1fr;gap:1.5rem;align-items:start;" class="comp-grid-layout">
        
        <!-- LEFT: Comparative Statement Form & Controls -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="border-bottom:1px solid var(--neutral-200,#333);padding-bottom:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h3 class="card-title" style="display:flex;align-items:center;gap:0.5rem;">
                <span>📊</span> Comparative Statement
              </h3>
              <span class="badge badge-primary">Official DOC-42</span>
            </div>
            <p style="font-size:0.8rem;color:var(--neutral-400,#888);margin-top:0.25rem;">
              Compare vendor quotations with statutory HOD certificate &amp; 7-member purchase committee signatures.
            </p>
          </div>

          <form id="compStatementForm" style="padding-top:1rem;">
            
            <!-- Fund Selection (Govt vs Non-Govt) -->
            <div style="background:var(--neutral-850,#1a1a2e);padding:0.85rem;border-radius:6px;margin-bottom:1.25rem;border:1.5px solid var(--primary-500,#6366f1);">
              <label class="form-label" style="font-size:0.82rem;font-weight:700;color:var(--primary-300,#a5b4fc);margin-bottom:0.5rem;display:block;">
                🏛️ SELECT FUND CATEGORY (Sets Committee Members)
              </label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                <label style="display:flex;align-items:center;gap:0.75rem;background:var(--neutral-800,#222);padding:0.75rem 1rem;border-radius:6px;cursor:pointer;border:1.5px solid ${compFundType === 'Govt Fund' ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)'};">
                  <input type="radio" name="comp_fund_radio" value="Govt Fund" ${compFundType === 'Govt Fund' ? 'checked' : ''} style="cursor:pointer;width:18px;height:18px;" />
                  <div>
                    <div style="font-weight:700;font-size:0.92rem;color:#ffffff;">Govt Fund</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">Mamtora &amp; Khasiya roster</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:0.75rem;background:var(--neutral-800,#222);padding:0.75rem 1rem;border-radius:6px;cursor:pointer;border:1.5px solid ${compFundType === 'Non-Govt Fund' ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)'};">
                  <input type="radio" name="comp_fund_radio" value="Non-Govt Fund" ${compFundType === 'Non-Govt Fund' ? 'checked' : ''} style="cursor:pointer;width:18px;height:18px;" />
                  <div>
                    <div style="font-weight:700;font-size:0.92rem;color:#ffffff;">Non-Govt Fund</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">Thakkar &amp; Sanghvi roster</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Quick Pre-fills -->
            <div style="background:var(--neutral-800,#222);padding:0.75rem;border-radius:6px;margin-bottom:1.25rem;border:1px dashed var(--neutral-600,#444);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                <label class="form-label" style="font-size:0.78rem;color:var(--accent-orange,#f59e0b);font-weight:700;margin:0;">⚡ Quick Load Examples</label>
                <button type="button" class="btn btn-xs btn-outline-warning" id="btnLoadCanonExample" style="font-size:0.72rem;padding:2px 8px;">Load Canon CAMC Example</button>
              </div>
              <select id="comp_autofill_eq" class="form-control" style="font-size:0.82rem;">
                <option value="">— Or select registered equipment to populate —</option>
                ${requests.map(r => `<option value="${r.id}">#${r.id} – ${r.equipment_name} (${r.dept_name || 'Dept'})</option>`).join('')}
              </select>
            </div>

            <!-- SECTION 1: Statement Meta -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-primary,#6366f1);padding-left:0.5rem;">
                1. Inquiry &amp; Reference Details
              </h4>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label">Comparative Statement For <span style="color:var(--red-500);">*</span></label>
                <input type="text" id="comp_statement_for" class="form-control" value="CAMC of Canon IR 2002 Copier machine" placeholder="e.g. CAMC of Canon IR 2002 Copier machine" required />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Inquiry No. <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="comp_inq_no" class="form-control" value="LDCE/store/CAMC-Canon/2019-20/337" placeholder="e.g. LDCE/store/CAMC-Canon/2019-20/337" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Inquiry Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="comp_inq_date" class="form-control" value="2020-01-31" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Last Date of Receipt <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="comp_last_date" class="form-control" value="2020-06-12" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Date of Opening (Optional)</label>
                  <input type="date" id="comp_opening_date" class="form-control" />
                </div>
              </div>
            </div>

            <!-- SECTION 2: Item Description -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-green,#10b981);padding-left:0.5rem;">
                2. Item &amp; Quantity
              </h4>
              <div style="display:grid;grid-template-columns:1fr 100px;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Description of Item <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="comp_item_desc" class="form-control" value="CAMC of Canon IR 2002 Copier machine" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Qty. <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="comp_item_qty" class="form-control" value="01 No." required />
                </div>
              </div>
            </div>

            <!-- SECTION 3: 3 Vendors & Rates -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-orange,#f59e0b);padding-left:0.5rem;">
                3. Vendor Quotations &amp; Rates (All in Rs.)
              </h4>
              <div id="compVendorsFormContainer" style="display:flex;flex-direction:column;gap:0.75rem;">
                <!-- Vendor 1, 2, 3 cards injected here -->
              </div>
            </div>

            <div style="display:flex;gap:0.75rem;padding-top:1rem;border-top:1px solid var(--neutral-700,#444);">
              <button type="button" class="btn btn-secondary" id="compResetBtn" style="flex:1;">Reset</button>
              <button type="submit" class="btn btn-primary" id="btnDownloadCompDoc" style="flex:2;font-weight:700;">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Official DOC-42 (.docx)
              </button>
            </div>
          </form>
        </div>

        <!-- RIGHT: Live Official Document Preview -->
        <div class="card" style="background:#ffffff;color:#111827;border:1px solid #d1d5db;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:1.75rem 1.5rem;position:sticky;top:1rem;font-family:'Times New Roman',Times,serif;overflow-x:auto;">
          
          <div style="font-size:0.75rem;color:#6b7280;text-align:right;margin-bottom:0.5rem;font-family:sans-serif;font-weight:600;">
            LIVE DOCUMENT PREVIEW (<span id="prev_comp_fund_badge" style="color:#2563eb;">GOVT FUND</span>)
          </div>

          <!-- Document Header -->
          <div style="text-align:center;font-weight:700;font-size:1.18rem;margin-bottom:4px;color:#000;">
            L. D. College of Engineering, Ahmedabad–380015.
          </div>
          <div style="text-align:center;font-size:1.02rem;margin-bottom:12px;color:#000;">
            Comparative statement for<span id="prev_comp_statement_for">CAMC of Canon IR 2002 Copier machine</span>
          </div>

          <!-- Metadata Row -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:0.92rem;margin-bottom:12px;color:#000;line-height:1.4;">
            <div>
              <span>Inq No :</span> <span id="prev_comp_inq_no" style="background:#fef08a;padding:0 2px;">LDCE/store/CAMC-Canon/2019-20/337</span>
              <span>Dated:</span> <span id="prev_comp_inq_date" style="background:#fef08a;padding:0 2px;">31/01/2020</span>
            </div>
            <div style="text-align:right;">
              <div>Last date of receipt: <span id="prev_comp_last_date" style="background:#fef08a;padding:0 2px;">12/06/2020</span></div>
              <div>Date of opening: <span id="prev_comp_opening_date"></span></div>
            </div>
          </div>

          <!-- Comparative Table (7 columns) -->
          <table style="width:100%;border-collapse:collapse;font-size:0.86rem;color:#000;border:1.5px solid #000;margin-bottom:16px;">
            <thead>
              <tr style="border:1px solid #000;text-align:center;">
                <th rowspan="2" style="border:1px solid #000;padding:4px 3px;width:5%;">Sr.<br/>No</th>
                <th rowspan="2" style="border:1px solid #000;padding:4px 6px;width:24%;">Description of Item</th>
                <th rowspan="2" style="border:1px solid #000;padding:4px 3px;width:8%;">Qty.</th>
                <th colspan="3" style="border:1px solid #000;padding:4px;width:54%;text-align:center;">All rates are in Rupees</th>
                <th rowspan="2" style="border:1px solid #000;padding:4px 4px;width:9%;">Remarks</th>
              </tr>
              <tr id="prev_comp_vendor_headers" style="border:1px solid #000;font-size:0.8rem;text-align:center;">
                <!-- Vendor subheaders injected here -->
              </tr>
            </thead>
            <tbody>
              <!-- Item Row 1 -->
              <tr style="min-height:50px;">
                <td style="border:1px solid #000;padding:6px 3px;text-align:center;">1</td>
                <td id="prev_comp_row_desc" style="border:1px solid #000;padding:6px;">CAMC of Canon IR 2002 Copier machine</td>
                <td id="prev_comp_row_qty" style="border:1px solid #000;padding:6px 3px;text-align:center;">01 No.</td>
                <td id="prev_comp_v1_rate" style="border:1px solid #000;padding:6px;text-align:center;">2,500.00</td>
                <td id="prev_comp_v2_rate" style="border:1px solid #000;padding:6px;text-align:center;">2,800.00</td>
                <td id="prev_comp_v3_rate" style="border:1px solid #000;padding:6px;text-align:center;">3,100.00</td>
                <td id="prev_comp_row_remarks" style="border:1px solid #000;padding:6px;text-align:center;"></td>
              </tr>
              <!-- Govt Tax -->
              <tr>
                <td colspan="2" style="border:1px solid #000;padding:4px 6px;">Govt. Tax</td>
                <td style="border:1px solid #000;"></td>
                <td id="prev_comp_v1_tax" style="border:1px solid #000;padding:4px;text-align:center;">450.00</td>
                <td id="prev_comp_v2_tax" style="border:1px solid #000;padding:4px;text-align:center;">504.00</td>
                <td id="prev_comp_v3_tax" style="border:1px solid #000;padding:4px;text-align:center;">558.00</td>
                <td style="border:1px solid #000;"></td>
              </tr>
              <!-- Other charges -->
              <tr>
                <td colspan="2" style="border:1px solid #000;padding:4px 6px;">Other charges</td>
                <td style="border:1px solid #000;"></td>
                <td id="prev_comp_v1_other" style="border:1px solid #000;padding:4px;text-align:center;">0.00</td>
                <td id="prev_comp_v2_other" style="border:1px solid #000;padding:4px;text-align:center;">0.00</td>
                <td id="prev_comp_v3_other" style="border:1px solid #000;padding:4px;text-align:center;">0.00</td>
                <td style="border:1px solid #000;"></td>
              </tr>
              <!-- Grand total -->
              <tr style="font-weight:700;">
                <td colspan="2" style="border:1px solid #000;padding:4px 6px;">Grand total</td>
                <td style="border:1px solid #000;"></td>
                <td id="prev_comp_v1_total" style="border:1px solid #000;padding:4px;text-align:center;font-weight:700;">2,950.00</td>
                <td id="prev_comp_v2_total" style="border:1px solid #000;padding:4px;text-align:center;font-weight:700;">3,304.00</td>
                <td id="prev_comp_v3_total" style="border:1px solid #000;padding:4px;text-align:center;font-weight:700;">3,658.00</td>
                <td style="border:1px solid #000;"></td>
              </tr>
              <!-- Terms & Condition -->
              <tr>
                <td colspan="2" style="border:1px solid #000;padding:4px 6px;font-weight:700;line-height:1.2;">
                  Terms &amp; Condition<br/>(Party wise if any)
                </td>
                <td style="border:1px solid #000;"></td>
                <td id="prev_comp_v1_tc" style="border:1px solid #000;padding:4px;text-align:center;font-size:0.75rem;">Payment within 30 days</td>
                <td id="prev_comp_v2_tc" style="border:1px solid #000;padding:4px;text-align:center;font-size:0.75rem;">1 Year Warranty</td>
                <td id="prev_comp_v3_tc" style="border:1px solid #000;padding:4px;text-align:center;font-size:0.75rem;">Doorstep service</td>
                <td style="border:1px solid #000;"></td>
              </tr>
            </tbody>
          </table>

          <!-- Prepared By & Checked By -->
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:0.92rem;margin:16px 0 12px 0;">
            <div>Prepared By:</div>
            <div>Checked By: 1)</div>
            <div>2)</div>
          </div>

          <!-- Certificate by HOD -->
          <div style="font-size:0.88rem;line-height:1.35;margin-bottom:14px;">
            <div style="font-weight:700;margin-bottom:3px;">Certificate by Head of Department:</div>
            <p style="text-indent:2rem;margin:0 0 8px 0;text-align:justify;">
              The lowest rate quoted by the party for the above items, which are encircled by the red ink and initialed by the undersigned are lowest price quoted for the items and these items are as per specifications mentioned in said inquiry. Hence it is hereby recommended to purchase item(s) from the respective party. It is also certified that lowest price quoted by the party for the above items are found reasonable as per the current market survey.
            </p>
            <div style="font-weight:700;margin-top:6px;">Head of the department</div>
          </div>

          <!-- Committee Members Heading -->
          <div style="font-weight:700;font-size:0.92rem;margin-bottom:6px;">
            Committee Members:
          </div>

          <!-- Dynamic 7-Box Committee Members Table -->
          <table style="width:100%;border-collapse:collapse;font-size:0.82rem;color:#000;border:1.5px solid #000;margin-bottom:14px;text-align:center;">
            <tbody>
              <tr id="prev_comp_committee_row" style="height:55px;vertical-align:bottom;">
                <!-- 7 member cells injected here -->
              </tr>
            </tbody>
          </table>

          <!-- Page Footer -->
          <div style="text-align:center;font-size:0.82rem;color:#4b5563;margin-top:10px;">
            01 of 01
          </div>

        </div>
      </div>
    `;
  }

  if (activeRepairsTab === 'inquiry') {
    return `
      ${renderAccessBanner('repairs')}
      ${navTabs}

      <div style="display:grid;grid-template-columns:minmax(360px, 480px) 1fr;gap:1.5rem;align-items:start;" class="inquiry-grid-layout">
        
        <!-- LEFT: Inquiry Letter Form & Controls -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="border-bottom:1px solid var(--neutral-200,#333);padding-bottom:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h3 class="card-title" style="display:flex;align-items:center;gap:0.5rem;">
                <span>✉️</span> Generate Inquiry Letter
              </h3>
              <span class="badge badge-primary">Official DOC-41</span>
            </div>
            <p style="font-size:0.8rem;color:var(--neutral-400,#888);margin-top:0.25rem;">
              Fill details below to generate the official quotation invitation document for local purchase or equipment repairs.
            </p>
          </div>

          <form id="inquiryLetterForm" style="padding-top:1rem;">
            
            <!-- Quick Pre-fill -->
            <div style="background:var(--neutral-800,#222);padding:0.75rem;border-radius:6px;margin-bottom:1rem;border:1px dashed var(--neutral-600,#444);">
              <label class="form-label" style="font-size:0.78rem;color:var(--accent-primary,#6366f1);font-weight:700;">⚡ Quick Pre-Fill From Registered Equipment</label>
              <select id="inq_autofill_eq" class="form-control" style="font-size:0.82rem;">
                <option value="">— Select registered equipment to auto-fill —</option>
                ${requests.map(r => `<option value="${r.id}">#${r.id} – ${r.equipment_name} (${r.dept_name || 'Dept'})</option>`).join('')}
              </select>
            </div>

            <!-- SECTION 1: Reference & Header Meta -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-primary,#6366f1);padding-left:0.5rem;">
                1. Reference & Department Details
              </h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Department <span style="color:var(--red-500);">*</span></label>
                  <select id="inq_dept" class="form-control" required>
                    ${depts.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Financial Year <span style="color:var(--red-500);">*</span></label>
                  <select id="inq_fin_year" class="form-control" required>
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                    <option value="2021-22">2021-22</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Inquiry No. / Suffix</label>
                  <input type="text" id="inq_ref_no" class="form-control" placeholder="e.g. 104 or leave blank" />
                </div>
                <div class="form-group">
                  <label class="form-label">Letter Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="inq_date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
                </div>
              </div>
            </div>

            <!-- SECTION 2: To Vendor / Recipient Details -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-orange,#f59e0b);padding-left:0.5rem;">
                2. Addressee / Vendor Details (Optional)
              </h4>
              <div style="display:grid;grid-template-columns:1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Vendor / Firm Name</label>
                  <input type="text" id="inq_vendor_name" class="form-control" placeholder="Leave blank for M/s _____________________" />
                </div>
                <div class="form-group">
                  <label class="form-label">Vendor Address</label>
                  <input type="text" id="inq_vendor_address" class="form-control" placeholder="Leave blank for Address: _________________" />
                </div>
              </div>
            </div>

            <!-- SECTION 3: Subject & Quotation Items -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-green,#10b981);padding-left:0.5rem;">
                3. Subject & Items Required
              </h4>
              <div class="form-group" style="margin-bottom:0.75rem;">
                <label class="form-label">Subject: Quotation for <span style="color:var(--red-500);">*</span></label>
                <input type="text" id="inq_subject" class="form-control" value="stationary items for library" placeholder="e.g. stationary items for library, repair of Lathe Machine" required />
              </div>

              <!-- Dynamic Items Table -->
              <div style="margin-top:0.75rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                  <label class="form-label" style="margin:0;font-weight:700;">Quotation Items List</label>
                  <button type="button" class="btn btn-sm btn-secondary" id="btnAddInquiryItem" style="font-size:0.75rem;padding:3px 8px;">+ Add Item Row</button>
                </div>
                <div id="inquiryItemsContainer" style="display:flex;flex-direction:column;gap:0.5rem;">
                  <!-- Dynamic Item Rows Injected Here -->
                </div>
              </div>
            </div>

            <!-- SECTION 4: Conditions & Submission Deadlines -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-blue,#06b6d4);padding-left:0.5rem;">
                4. Conditions &amp; Submission Deadline
              </h4>
              <div style="display:grid;grid-template-columns:1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">1. Superscribed Envelope Text</label>
                  <input type="text" id="inq_superscribed" class="form-control" value="Quotation for stationary items for library" placeholder="e.g. Quotation for stationary items for library" />
                </div>
                <div class="form-group">
                  <label class="form-label">2. Last Date for Receiving Quotations <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="inq_last_date" class="form-control" required />
                </div>
              </div>
            </div>

            <div style="display:flex;gap:0.75rem;padding-top:1rem;border-top:1px solid var(--neutral-700,#444);">
              <button type="button" class="btn btn-secondary" id="inquiryResetBtn" style="flex:1;">Reset</button>
              <button type="submit" class="btn btn-primary" id="btnDownloadInquiryDoc" style="flex:2;font-weight:700;">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Official .docx
              </button>
            </div>
          </form>
        </div>

        <!-- RIGHT: Live Official Letterhead Preview Card -->
        <div class="card" style="background:#ffffff;color:#111827;border:1px solid #d1d5db;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:1.75rem 2rem;position:sticky;top:1rem;">
          
          <div style="font-size:0.75rem;color:#6b7280;text-align:right;margin-bottom:0.5rem;font-family:sans-serif;font-weight:600;">
            LIVE DOCUMENT PREVIEW (OFFICIAL FORMAT)
          </div>

          <!-- Letterhead Header (3 columns) -->
          <div style="display:grid;grid-template-columns:90px 1fr 90px;align-items:center;gap:0.5rem;text-align:center;">
            <!-- Left Logo -->
            <div style="text-align:center;">
              <img src="${ldceLogoImg}" alt="LDCE Logo" style="width:70px;height:60px;object-fit:contain;display:block;margin:0 auto;" />
              <div style="color:#C0392B;font-weight:700;font-size:0.82rem;font-family:'Times New Roman',serif;margin-top:2px;">L.D.C.E</div>
            </div>

            <!-- Center Heading -->
            <div>
              <div style="color:#C0392B;font-size:0.95rem;font-family:Georgia,serif;line-height:1.2;">Government of Gujarat</div>
              <div style="color:#C0392B;font-weight:700;font-size:1.18rem;font-family:Georgia,serif;line-height:1.2;margin:2px 0;">L. D. College of Engineering, Ahmedabad</div>
              <div style="color:#204A87;font-size:0.8rem;font-family:Verdana,sans-serif;line-height:1.2;">Opp. Gujarat University, Navrangpura</div>
              <div style="color:#204A87;font-size:0.8rem;font-family:Verdana,sans-serif;line-height:1.2;">Ahmedabad - 380 015</div>
              <div style="color:#204A87;font-size:0.72rem;font-family:Verdana,sans-serif;line-height:1.2;margin-top:2px;">Phone : Office - 079 26306752, Principal - 079 26302887</div>
              <div style="color:#204A87;font-size:0.72rem;font-family:Verdana,sans-serif;line-height:1.2;">Email : ldce-abad-dte@gujarat.gov.in &nbsp; Website : www.ldce.ac.in</div>
            </div>

            <!-- Right Gandhi 150 Logo -->
            <div style="text-align:center;">
              <img src="${gandhiLogoImg}" alt="150 Years of Mahatma" style="width:85px;height:65px;object-fit:contain;display:block;margin:0 auto;" />
            </div>
          </div>

          <!-- Red Line Below Header -->
          <div style="height:2px;background:#C0392B;margin:8px 0 12px 0;"></div>

          <!-- Reference & Date Line -->
          <div style="display:flex;justify-content:space-between;align-items:center;font-family:'Times New Roman',serif;font-size:0.95rem;margin-bottom:8px;">
            <div>
              No. LDCE/Purchase/<span id="prev_ref_dept_fin" style="color:#C0392B;font-weight:700;">Library/2021-22/</span><span id="prev_ref_inq_no" style="font-weight:700;"></span>
            </div>
            <div>
              Dated: <span id="prev_date_display">  /  /2021</span>
            </div>
          </div>

          <!-- Confidential -->
          <div style="text-align:center;font-weight:700;text-decoration:underline;font-family:'Times New Roman',serif;font-size:1.05rem;margin:10px 0 6px 0;">
            Confidential
          </div>

          <!-- To Section -->
          <div style="font-family:'Times New Roman',serif;font-size:0.95rem;margin-bottom:8px;">
            <div style="font-weight:700;text-decoration:underline;">To,</div>
            <div id="prev_vendor_details" style="min-height:22px;color:#374151;margin-top:2px;"></div>
          </div>

          <!-- Subject Line -->
          <div style="font-family:'Times New Roman',serif;font-size:0.95rem;margin-bottom:8px;">
            <strong>Sub:</strong> Quotation for <span id="prev_sub_display" style="color:#204A87;text-decoration:underline;">stationary items for library</span>.
          </div>

          <!-- Body Text -->
          <div style="font-family:'Times New Roman',serif;font-size:0.95rem;margin-bottom:10px;">
            We are pleased to invite quotations for the following items.
          </div>

          <!-- Table of Items -->
          <div style="margin-bottom:12px;">
            <table style="width:100%;border-collapse:collapse;font-family:'Times New Roman',serif;font-size:0.88rem;color:#000;">
              <thead>
                <tr style="border:1.5px solid #000;">
                  <th style="border:1px solid #000;padding:4px 6px;text-align:center;width:10%;text-decoration:underline;">Sr.No.</th>
                  <th style="border:1px solid #000;padding:4px 8px;text-align:left;width:55%;">Description of Item</th>
                  <th style="border:1px solid #000;padding:4px 6px;text-align:center;width:15%;">Qty</th>
                  <th style="border:1px solid #000;padding:4px 8px;text-align:left;width:20%;">Remarks</th>
                </tr>
              </thead>
              <tbody id="prev_items_tbody">
                <!-- Live Preview Rows Injected Here -->
              </tbody>
            </table>
          </div>

          <!-- Conditions List -->
          <div style="font-family:'Times New Roman',serif;font-size:0.9rem;line-height:1.35;margin-bottom:14px;">
            <div style="font-weight:700;margin-bottom:4px;">Conditions:</div>
            <div style="margin-bottom:3px;">
              1) The quotation should be sent to Principal, L.D Engineering College,Navrangpura <span style="color:#204A87;text-decoration:underline;">Ahmedabad in</span> a sealed cover duly superscripted as <strong id="prev_superscripted_display" style="color:#C0392B;font-style:italic;">"Quotation for stationary items for library"</strong>
            </div>
            <div style="margin-bottom:3px;">
              2) The last date for receiving the quotation is <strong id="prev_last_date_display" style="color:#C0392B;">.....................................</strong>
            </div>
            <div style="margin-bottom:3px;">
              3) Your rates should be F.O.R. inclusive of all charges.
            </div>
            <div style="margin-bottom:3px;">
              4) Government taxes may admissible.
            </div>
            <div style="margin-bottom:3px;">
              5) The validity period for the quotation should be 3 months from the due date of receipt.
            </div>
            <div style="margin-bottom:3px;">
              6) This office reserves the right to reject any or all quotations without assigning any reasons.
            </div>
          </div>

          <!-- Principal Signature -->
          <div style="text-align:right;font-family:'Times New Roman',serif;font-weight:700;font-size:1.05rem;margin:20px 0 16px 0;">
            Principal
          </div>

          <!-- Red Line Above Footer -->
          <div style="height:2px;background:#C0392B;margin:12px 0 8px 0;"></div>

          <!-- Footer Accreditation Text -->
          <div style="text-align:center;color:#204A87;font-family:'Times New Roman',serif;font-size:0.75rem;line-height:1.25;">
            <div>Civil Engineering, Mechanical Engineering and Electrical Engineering programs accredited by NBA</div>
            <div>Best Engineering College Award - 2019 by ISTE</div>
          </div>

        </div>
      </div>
    `;
  }

  // NOTE FOR APPROVAL OF REPAIRING (DOC-45) TAB
  if (activeRepairsTab === 'doc45') {
    return `
      ${renderAccessBanner('repairs')}
      ${navTabs}

      <div style="display:grid;grid-template-columns:minmax(360px, 480px) 1fr;gap:1.5rem;align-items:start;" class="doc45-grid-layout">
        
        <!-- LEFT: Approval Note Form & Controls -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="border-bottom:1px solid var(--neutral-200,#333);padding-bottom:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h3 class="card-title" style="display:flex;align-items:center;gap:0.5rem;">
                <span>📝</span> Note for Approval of Repairing
              </h3>
              <span class="badge badge-primary">Official DOC-45</span>
            </div>
            <p style="font-size:0.8rem;color:var(--neutral-400,#888);margin-top:0.25rem;">
              Gujarati statutory note (મંજુરી નોંધ) for Principal approval of non-working equipment repairs under Contingency / PLA budget.
            </p>
          </div>

          <form id="doc45Form" style="padding-top:1rem;">
            
            <!-- Quick Pre-fill -->
            <div style="background:var(--neutral-800,#222);padding:0.75rem;border-radius:6px;margin-bottom:1rem;border:1px dashed var(--neutral-600,#444);">
              <label class="form-label" style="font-size:0.78rem;color:var(--accent-primary,#6366f1);font-weight:700;">⚡ Quick Pre-Fill From Registered Equipment</label>
              <select id="doc45_autofill_eq" class="form-control" style="font-size:0.82rem;">
                <option value="">— Select registered equipment to auto-fill —</option>
                ${requests.map(r => `<option value="${r.id}">#${r.id} – ${r.equipment_name} (${r.dept_name || 'Dept'})</option>`).join('')}
              </select>
            </div>

            <!-- SECTION 1: Department & Date -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-primary,#6366f1);padding-left:0.5rem;">
                1. Department &amp; Date
              </h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Department <span style="color:var(--red-500);">*</span></label>
                  <select id="doc45_dept" class="form-control" required>
                    ${depts.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Note Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="doc45_date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
                </div>
              </div>
            </div>

            <!-- SECTION 2: Equipment & Cost Estimates -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-orange,#f59e0b);padding-left:0.5rem;">
                2. Equipment &amp; Estimated Repair Cost
              </h4>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label">Equipment / Instruments Name <span style="color:var(--red-500);">*</span></label>
                <input type="text" id="doc45_eq_name" class="form-control" placeholder="e.g. Lathe Machine, Oscilloscope, Canon IR 2002 Copier machine" required />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Estimated Cost (Rs.) <span style="color:var(--red-500);">*</span></label>
                  <input type="number" step="0.01" id="doc45_cost" class="form-control" placeholder="0.00" required />
                </div>
                <div class="form-group">
                  <label class="form-label">In Words (Gujarati) <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="doc45_cost_words" class="form-control" placeholder="e.g. પાંચ હજાર રૂપિયા પુરા" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">GeM Portal Availability</label>
                <select id="doc45_gem" class="form-control">
                  <option value="ઉપલબ્ધ નથી.">GeM Portal ઉપર ઉપલબ્ધ નથી. (Not Available)</option>
                  <option value="છે.">GeM Portal ઉપર ઉપલબ્ધ છે. (Available)</option>
                </select>
              </div>
            </div>

            <!-- SECTION 3: Reason & Principal Budget Allocation -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-green,#10b981);padding-left:0.5rem;">
                3. Reason &amp; Budget Head
              </h4>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label">Reason for Repairing <span style="color:var(--red-500);">*</span></label>
                <textarea id="doc45_reason" class="form-control" rows="2" placeholder="e.g. વિદ્યાર્થીઓનાં લેબ પ્રેક્ટિકલ તથા શૈક્ષણિક કાર્ય અર્થે" required>વિદ્યાર્થીઓનાં શૈક્ષણિક તથા પ્રેક્ટિકલ કાર્ય અર્થે</textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Budget Head</label>
                  <select id="doc45_budget_head" class="form-control">
                    <option value="Contingency">Contingency (આકસ્મિક ખર્ચ)</option>
                    <option value="PLA">PLA (પી.એલ.એ.)</option>
                    <option value="Other">Other Fund (અન્ય ફંડ)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Other Fund Mention (If any)</label>
                  <input type="text" id="doc45_other_fund" class="form-control" placeholder="e.g. DTE Grant / SSIP" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Remarks (Optional)</label>
                <input type="text" id="doc45_remarks" class="form-control" placeholder="e.g. Rate survey done" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:0.75rem;justify-content:flex-end;padding-top:1rem;border-top:1px solid var(--neutral-700,#444);">
              <button type="button" class="btn btn-secondary" id="doc45ResetBtn">Reset</button>
              <button type="submit" class="btn btn-primary" id="btnDownloadDoc45" style="padding:0.65rem 1.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Approval Note (.docx)
              </button>
            </div>
          </form>
        </div>

        <!-- RIGHT: Live Document Preview (Official Gujarati Word Layout) -->
        <div style="background:#fff;color:#000;border-radius:6px;padding:2.5rem 3rem;box-shadow:0 8px 30px rgba(0,0,0,0.3);min-height:680px;font-family:'Nirmala UI','Shruti',Arial,sans-serif;" id="doc45WordPreview">
          
          <!-- Top Right Dept & Date -->
          <div style="text-align:right;font-size:0.95rem;line-height:1.5;margin-bottom:1.5rem;">
            <div><strong id="prev_doc45_dept">Library ડીપાર્ટમેન્ટ</strong></div>
            <div>એલ.ડી. કોલેજ ઓફ એન્જી.,અમદાવાદ</div>
            <div>તા.<span id="prev_doc45_date">07/09/2026</span></div>
          </div>

          <!-- Left Subheading -->
          <div style="font-weight:700;font-size:1.05rem;margin-bottom:1rem;">
            સાદર રજુ:
          </div>

          <!-- Gujarati Body -->
          <div style="font-size:0.98rem;line-height:2.2;text-align:justify;margin-bottom:2.5rem;">
            અત્રેની સંસ્થાનાં <u style="font-weight:700;" id="prev_doc45_dept_body">Library</u> વિભાગ/વિદ્યાશાખાનાં આ સાથે સામેલ પત્રક મુજબનાં <u style="font-weight:700;" id="prev_doc45_eq">Canon IR 2002 Copier machine</u> સાધન/સાધનોનાં રીપેરીંગ માટે અંદાજીત કુલ રૂ. <u style="font-weight:700;" id="prev_doc45_cost">₹5,000/-</u> અંકે રૂપિયા <u style="font-weight:700;" id="prev_doc45_words">પાંચ હજાર રૂપિયા પુરા</u> ખર્ચ થાય તેમ છે. ઉક્ત સાધન/સાધનોનાં રીપેરીંગ ની સેવાઓ GeM Portal ઉપર <span id="prev_doc45_gem">ઉપલબ્ધ નથી.</span> સદર સાધનોનું રીપેરીંગ <u style="font-weight:700;" id="prev_doc45_reason">વિદ્યાર્થીઓનાં શૈક્ષણિક તથા પ્રેક્ટિકલ કાર્ય અર્થે</u> ને કારણે અનિવાર્ય છે. ઉક્ત વિગતો ધ્યાને લઇ જરૂરી રીપેરીંગ કરાવવા મંજુરી આપવા વિનંતી.
          </div>

          <!-- Signatures (3 tiers) -->
          <div style="font-family:'Times New Roman',serif;font-weight:700;font-size:0.95rem;margin-bottom:1.8rem;">
            Head of department
          </div>
          <div style="font-family:'Times New Roman',serif;font-weight:700;font-size:0.95rem;margin-bottom:1.8rem;">
            Store Officer
          </div>
          <div style="font-family:'Times New Roman',serif;font-weight:700;font-size:0.95rem;margin-bottom:2.5rem;">
            Head Store &amp; Purchase/ Purchase Committee
          </div>

          <!-- Section: Approval of Principal -->
          <div style="text-align:center;font-family:'Times New Roman',serif;font-weight:700;font-style:italic;text-decoration:underline;font-size:1.05rem;margin-bottom:0.75rem;">
            Approval of Principal
          </div>
          <div style="font-family:'Times New Roman',serif;font-size:0.92rem;margin-bottom:0.4rem;">
            Expenditure to be incurred under following (√) marked budget head:
          </div>
          <div style="font-family:'Times New Roman',serif;font-size:0.95rem;margin-bottom:0.75rem;display:flex;gap:2rem;align-items:center;">
            <span id="prev_doc45_head_cont" style="font-weight:700;">☑ Contingency</span>
            <span>/</span>
            <span id="prev_doc45_head_pla">☐ PLA</span>
          </div>
          <div style="font-family:'Times New Roman',serif;font-size:0.92rem;margin-bottom:0.75rem;">
            Please mention if any other fund: <span id="prev_doc45_other_fund" style="border-bottom:1px dotted #888;display:inline-block;min-width:180px;"></span>
          </div>
          <div style="font-family:'Times New Roman',serif;font-size:0.92rem;margin-bottom:2rem;">
            Remarks: <span id="prev_doc45_remarks" style="border-bottom:1px dotted #888;display:inline-block;min-width:250px;"></span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;font-family:'Times New Roman',serif;font-size:0.95rem;">
            <div>Approved / Not Approved</div>
            <div style="font-weight:700;font-size:1.05rem;">Principal</div>
          </div>

        </div>
      </div>
    `;
  }

  // NOTE FOR WORK ORDER (WO – REPAIRING) (DOC-46) TAB
  if (activeRepairsTab === 'doc46') {
    return `
      ${renderAccessBanner('repairs')}
      ${navTabs}

      <div style="display:grid;grid-template-columns:minmax(360px, 480px) 1fr;gap:1.5rem;align-items:start;" class="doc46-grid-layout">
        
        <!-- LEFT: Work Order Note Form & Controls -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="border-bottom:1px solid var(--neutral-200,#333);padding-bottom:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h3 class="card-title" style="display:flex;align-items:center;gap:0.5rem;">
                <span>📋</span> Note for Work Order (WO – Repairing)
              </h3>
              <span class="badge badge-primary">Official DOC-46</span>
            </div>
            <p style="font-size:0.8rem;color:var(--neutral-400,#888);margin-top:0.25rem;">
              Gujarati statutory note (વર્ક ઓર્ડર મંજુરી નોંધ) for issuance of Work Order to L1 vendor following quotation scrutiny &amp; purchase committee meeting.
            </p>
          </div>

          <form id="doc46Form" style="padding-top:1rem;">
            
            <!-- Quick Pre-fill -->
            <div style="background:var(--neutral-800,#222);padding:0.75rem;border-radius:6px;margin-bottom:1rem;border:1px dashed var(--neutral-600,#444);">
              <label class="form-label" style="font-size:0.78rem;color:var(--accent-primary,#6366f1);font-weight:700;">⚡ Quick Pre-Fill From Registered Equipment</label>
              <select id="doc46_autofill_eq" class="form-control" style="font-size:0.82rem;">
                <option value="">— Select registered equipment to auto-fill —</option>
                ${requests.map(r => `<option value="${r.id}">#${r.id} – ${r.equipment_name} (${r.dept_name || 'Dept'})</option>`).join('')}
              </select>
            </div>

            <!-- SECTION 1: Note Reference & Department -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-primary,#6366f1);padding-left:0.5rem;">
                1. Previous Note Reference &amp; Department
              </h4>
              <div style="display:grid;grid-template-columns:100px 1fr 1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Prev. Page <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="doc46_prev_page" class="form-control" value="૧" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Department <span style="color:var(--red-500);">*</span></label>
                  <select id="doc46_dept" class="form-control" required>
                    ${depts.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="doc46_wo_date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
                </div>
              </div>
            </div>

            <!-- SECTION 2: Equipment & Quotation Process -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-orange,#f59e0b);padding-left:0.5rem;">
                2. Equipment &amp; Quotation Details
              </h4>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label">Equipment / Instruments Name <span style="color:var(--red-500);">*</span></label>
                <input type="text" id="doc46_eq_name" class="form-control" placeholder="e.g. Lathe Machine, Canon IR 2002 Copier machine" required />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Quotation Last Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="doc46_last_date" class="form-control" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Committee Meeting Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="doc46_meeting_date" class="form-control" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Lowest Rate / L1 Vendor Name &amp; Address <span style="color:var(--red-500);">*</span></label>
                <input type="text" id="doc46_l1_vendor" class="form-control" placeholder="e.g. M/s AKSH Services, Ahmedabad" required />
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:0.75rem;justify-content:flex-end;padding-top:1rem;border-top:1px solid var(--neutral-700,#444);">
              <button type="button" class="btn btn-secondary" id="doc46ResetBtn">Reset</button>
              <button type="submit" class="btn btn-primary" id="btnDownloadDoc46" style="padding:0.65rem 1.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download WO Note (.docx)
              </button>
            </div>
          </form>
        </div>

        <!-- RIGHT: Live Document Preview (Official Gujarati Word Layout) -->
        <div style="background:#fff;color:#000;border-radius:6px;padding:2.5rem 3rem;box-shadow:0 8px 30px rgba(0,0,0,0.3);min-height:650px;font-family:'Nirmala UI','Shruti',Arial,sans-serif;" id="doc46WordPreview">
          
          <!-- Top Right Dept & Date -->
          <div style="text-align:right;font-size:0.95rem;line-height:1.5;margin-bottom:1.5rem;">
            <div><strong id="prev_doc46_dept">Library ડીપાર્ટમેન્ટ</strong></div>
            <div>એલ.ડી. કોલેજ ઓફ એન્જી.,અમદાવાદ</div>
            <div>તા.<span id="prev_doc46_date">07/09/2026</span></div>
          </div>

          <!-- Left Subheading -->
          <div style="font-weight:700;font-size:1.05rem;margin-bottom:1rem;">
            સાદર રજુ:
          </div>

          <!-- Gujarati Body -->
          <div style="font-size:0.98rem;line-height:2.2;text-align:justify;margin-bottom:2.5rem;">
            પુર્વ પૃષ્ઠ <u style="font-weight:700;" id="prev_doc46_page">૧</u> ની નોંધ ઉપર આચાર્યા શ્રી તરફથી મળેલ મંજુરી અન્વયે અત્રેની સંસ્થાનાં <u style="font-weight:700;" id="prev_doc46_dept_body">Library</u> વિભાગ/વિદ્યાશાખાનાં <u style="font-weight:700;" id="prev_doc46_eq">Canon IR 2002 Copier machine</u> સાધન/સાધનોનાં રીપેરીંગ માટે તા. <u style="font-weight:700;" id="prev_doc46_lastdate">15/07/2026</u> સુધીમાં વિવિધ પેઢીઓ પાસેથી ભાવપત્રક મંગાવવામાં આવેલ. સમય મર્યાદામાં મળેલ ભાવપત્રકોનાં તુલનાત્મક પત્રક મુજબ જરૂરી રીપેરીંગ માટે સૌથી ઓછા ભાવ આપનાર પાર્ટી <u style="font-weight:700;" id="prev_doc46_l1">M/s AKSH Services, Ahmedabad</u> છે. / આ સાથે સામેલ પત્રક મુજબ છે. પેઢી/પેઢીઓ દ્વારા આપવામાં આવેલ ભાવ વ્યાજબી જણાય છે. આ સાથે ખરીદ સમિતિની તા. <u style="font-weight:700;" id="prev_doc46_mtgdate">20/07/2026</u> ની બેઠકની કાર્યવાહી નોંધ સામેલ છે. સદર બાબતો ધ્યાને લઇ લાયક ઠરેલ પેઢી/પેઢીઓને વર્ક ઓર્ડર આપવા બાબતે રજુ કરેલ છે.
          </div>

          <!-- Signatures (3 tiers) -->
          <div style="font-family:'Times New Roman',serif;font-weight:700;font-size:0.95rem;margin-bottom:2rem;">
            Head of department
          </div>
          <div style="font-family:'Times New Roman',serif;font-weight:700;font-size:0.95rem;margin-bottom:2rem;">
            Store Officer
          </div>
          <div style="font-family:'Times New Roman',serif;font-weight:700;font-size:0.95rem;margin-bottom:2.5rem;">
            Head Store &amp; Purchase/ Purchase Committee
          </div>

          <div style="display:flex;justify-content:space-between;align-items:flex-end;font-family:'Times New Roman',serif;font-size:0.95rem;">
            <div>Approved/Not Approved</div>
            <div style="font-weight:700;font-size:1.05rem;">Principal</div>
          </div>

        </div>
      </div>
    `;
  }

  // PASS FOR PAYMENT (DOC-47) TAB — Non-GeM Purchase & Equipment Repairing
  if (activeRepairsTab === 'doc47') {
    return `
      ${renderAccessBanner('repairs')}
      ${navTabs}

      <div style="display:grid;grid-template-columns:minmax(380px, 500px) 1fr;gap:1.5rem;align-items:start;" class="doc47-grid-layout">
        
        <!-- LEFT: Pass for Payment Form & Controls -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="border-bottom:1px solid var(--neutral-200,#333);padding-bottom:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h3 class="card-title" style="display:flex;align-items:center;gap:0.5rem;">
                <span>💳</span> Certificate &amp; Pass for Payment
              </h3>
              <span class="badge badge-primary">Official DOC-47</span>
            </div>
            <p style="font-size:0.8rem;color:var(--neutral-400,#888);margin-top:0.25rem;">
              Certificate to be given along with bills (CERTIFICATE TO BE GIVEN ALONG WITH BILLS) for Non-GeM direct purchase and equipment repairing.
            </p>
          </div>

          <form id="doc47Form" style="padding-top:1rem;">
            
            <!-- Type Selection: Non-GeM Purchase vs Repairing -->
            <div style="background:var(--neutral-850,#1a1a2e);padding:0.85rem;border-radius:6px;margin-bottom:1.25rem;border:1.5px solid var(--primary-500,#6366f1);">
              <label class="form-label" style="font-size:0.82rem;font-weight:700;color:var(--primary-300,#a5b4fc);margin-bottom:0.5rem;display:block;">
                📑 SELECT PASS FOR PAYMENT CATEGORY
              </label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                <label style="display:flex;align-items:center;gap:0.75rem;background:var(--neutral-800,#222);padding:0.75rem 1rem;border-radius:6px;cursor:pointer;border:1.5px solid ${activePassForPaymentType === 'non_gem' ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)'};">
                  <input type="radio" name="doc47_type_radio" value="non_gem" ${activePassForPaymentType === 'non_gem' ? 'checked' : ''} style="cursor:pointer;width:18px;height:18px;" />
                  <div>
                    <div style="font-weight:700;font-size:0.92rem;color:#ffffff;">Non-GeM Purchase</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">11-Point Cert + Store Reg.</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:0.75rem;background:var(--neutral-800,#222);padding:0.75rem 1rem;border-radius:6px;cursor:pointer;border:1.5px solid ${activePassForPaymentType === 'repair' ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)'};">
                  <input type="radio" name="doc47_type_radio" value="repair" ${activePassForPaymentType === 'repair' ? 'checked' : ''} style="cursor:pointer;width:18px;height:18px;" />
                  <div>
                    <div style="font-weight:700;font-size:0.92rem;color:#ffffff;">Equipment Repairing</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">12-Point Cert + Parcel / Cash</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Quick Pre-fills -->
            <div style="background:var(--neutral-800,#222);padding:0.75rem;border-radius:6px;margin-bottom:1.25rem;border:1px dashed var(--neutral-600,#444);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;gap:0.5rem;">
                <label class="form-label" style="font-size:0.78rem;color:var(--accent-orange,#f59e0b);font-weight:700;margin:0;">⚡ Quick Load Examples</label>
                <div style="display:flex;gap:0.4rem;">
                  <button type="button" class="btn btn-xs btn-outline-warning" id="btnLoadSanitizerExample" style="font-size:0.72rem;padding:2px 8px;">Load Sanitizer Purchase</button>
                  <button type="button" class="btn btn-xs btn-outline-info" id="btnLoadRepairPassExample" style="font-size:0.72rem;padding:2px 8px;">Load Copier Repair</button>
                </div>
              </div>
              <select id="doc47_autofill_eq" class="form-control" style="font-size:0.82rem;">
                <option value="">— Or select registered equipment to populate —</option>
                ${requests.map(r => `<option value="${r.id}">#${r.id} – ${r.equipment_name} (${r.dept_name || 'Dept'})</option>`).join('')}
              </select>
            </div>

            <!-- SECTION 1: Bill & Party Details -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-primary,#6366f1);padding-left:0.5rem;">
                1. Bill &amp; Order Details
              </h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Ref. Bill No. <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="doc47_bill_no" class="form-control" value="16707" placeholder="e.g. 16707 or 554" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Bill Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="doc47_bill_date" class="form-control" value="2021-02-10" required />
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label">Party / Vendor Name &amp; City <span style="color:var(--red-500);">*</span></label>
                <input type="text" id="doc47_party_name" class="form-control" value="Chandkheda Medical Store, Ahmedabad" placeholder="e.g. Chandkheda Medical Store, Ahmedabad" required />
              </div>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label">For Item / Repairing Description <span style="color:var(--red-500);">*</span></label>
                <input type="text" id="doc47_item_desc" class="form-control" value="Sanitizer, Qty: 19 Bottles (500 ml each)" placeholder="e.g. Sanitizer, Qty: 19 Bottles (500 ml each) or Repairing of Copier" required />
              </div>
              <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">A.T. / Purchase Order No. <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="doc47_po_no" class="form-control" value="LDCE/Store/Covid-19/sanitizer" placeholder="e.g. LDCE/Store/Covid-19/sanitizer" required />
                </div>
                <div class="form-group">
                  <label class="form-label">P.O. / Order Date <span style="color:var(--red-500);">*</span></label>
                  <input type="date" id="doc47_po_date" class="form-control" value="2021-02-09" required />
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Department <span style="color:var(--red-500);">*</span></label>
                  <select id="doc47_dept" class="form-control" required>
                    ${depts.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group" id="grp_comp_date" style="${activePassForPaymentType === 'repair' ? '' : 'display:none;'}">
                  <label class="form-label">Comparative Statement Date</label>
                  <input type="date" id="doc47_comp_date" class="form-control" value="2021-02-05" />
                </div>
              </div>
            </div>

            <!-- SECTION 2: Certification & Payment Recommendation -->
            <div style="margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-green,#10b981);padding-left:0.5rem;">
                2. Certification, Head &amp; Payment Amount
              </h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Payment Type</label>
                  <select id="doc47_payment_type" class="form-control">
                    <option value="Full">Full</option>
                    <option value="Part">Part</option>
                    <option value="Remaining">Remaining</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Budget Head <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="doc47_budget_head" class="form-control" value="Gymkhana" placeholder="e.g. Gymkhana, Contingency, PLA" required />
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Recommended Amount (Rs.) <span style="color:var(--red-500);">*</span></label>
                  <input type="number" step="0.01" id="doc47_amount" class="form-control" value="3750" placeholder="0.00" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Amount in Words <span style="color:var(--red-500);">*</span></label>
                  <input type="text" id="doc47_amount_words" class="form-control" value="Rupees Three Thousand Seven Hundred Fifty Only" required />
                </div>
              </div>
              <div class="form-group" id="grp_deduction" style="${activePassForPaymentType === 'non_gem' ? '' : 'display:none;'}">
                <label class="form-label">Amount Deducted (Point 10)</label>
                <input type="text" id="doc47_deduction" class="form-control" value="NIL" placeholder="e.g. NIL or Rs. 150/-" />
              </div>
            </div>

            <!-- SECTION 3: Register Entries (Non-GeM specific) -->
            <div id="sec_non_gem_registers" style="${activePassForPaymentType === 'non_gem' ? '' : 'display:none;'} margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-orange,#f59e0b);padding-left:0.5rem;">
                3. Register Entries (Point 6 &amp; Store Use)
              </h4>
              <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Dept. Register Name</label>
                  <input type="text" id="doc47_dept_reg_name" class="form-control" value="Deadstock / Stationary" placeholder="e.g. Deadstock" />
                </div>
                <div class="form-group">
                  <label class="form-label">Page No.</label>
                  <input type="text" id="doc47_dept_page_no" class="form-control" value="12" placeholder="e.g. 12" />
                </div>
                <div class="form-group">
                  <label class="form-label">Sr. No.</label>
                  <input type="text" id="doc47_dept_sr_no" class="form-control" value="05" placeholder="e.g. 05" />
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Store Gen. Reg. No.</label>
                  <input type="text" id="doc47_store_reg_no" class="form-control" value="03" placeholder="e.g. 03" />
                </div>
                <div class="form-group">
                  <label class="form-label">Store Page No.</label>
                  <input type="text" id="doc47_store_page_no" class="form-control" value="45" placeholder="e.g. 45" />
                </div>
                <div class="form-group">
                  <label class="form-label">Store Sr. No.</label>
                  <input type="text" id="doc47_store_sr_no" class="form-control" value="18" placeholder="e.g. 18" />
                </div>
              </div>
            </div>

            <!-- SECTION 4: Repair Details (Parcel, Spares & Cash Memo) -->
            <div id="sec_repair_specifics" style="${activePassForPaymentType === 'repair' ? '' : 'display:none;'} margin-bottom:1.25rem;">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.5rem;border-left:3px solid var(--accent-orange,#f59e0b);padding-left:0.5rem;">
                3. Parcel Clearance &amp; Cash Memo (Optional)
              </h4>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.6rem;margin-bottom:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Parcel Agency (M/S)</label>
                  <input type="text" id="doc47_agency_name" class="form-control" placeholder="Leave blank if none" />
                </div>
                <div class="form-group">
                  <label class="form-label">RR / LR No.</label>
                  <input type="text" id="doc47_rr_lr_no" class="form-control" placeholder="e.g. RR-9821" />
                </div>
                <div class="form-group">
                  <label class="form-label">RR / LR Date</label>
                  <input type="date" id="doc47_rr_lr_date" class="form-control" />
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label">Spares Fitted In</label>
                <input type="text" id="doc47_fitted_spares" class="form-control" placeholder="e.g. Canon Copier machine" />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0.6rem;">
                <div class="form-group">
                  <label class="form-label">Cash Memo No.</label>
                  <input type="text" id="doc47_cash_bill_no" class="form-control" placeholder="e.g. 102" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cash Date</label>
                  <input type="date" id="doc47_cash_bill_date" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cash Amount</label>
                  <input type="number" step="0.01" id="doc47_cash_amount" class="form-control" placeholder="0.00" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cash Recipient</label>
                  <input type="text" id="doc47_cash_recipient" class="form-control" placeholder="Name" />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:0.75rem;padding-top:1rem;border-top:1px solid var(--neutral-700,#444);">
              <button type="button" class="btn btn-secondary" id="doc47ResetBtn" style="flex:1;">Reset</button>
              <button type="submit" class="btn btn-primary" id="btnDownloadDoc47" style="flex:2;font-weight:700;">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Official DOC-47 (.docx)
              </button>
            </div>
          </form>
        </div>

        <!-- RIGHT: Live Official Document Preview (Exact Screenshot Match) -->
        <div class="card" style="background:#ffffff;color:#111827;border:1px solid #d1d5db;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:2.2rem 2.5rem;position:sticky;top:1rem;font-family:'Times New Roman',Times,serif;min-height:850px;" id="doc47WordPreviewContainer">
          
          <div style="font-size:0.75rem;color:#6b7280;text-align:right;margin-bottom:0.75rem;font-family:sans-serif;font-weight:600;">
            LIVE DOCUMENT PREVIEW (<span id="prev_doc47_type_badge" style="color:#2563eb;">NON-GEM PURCHASE</span>)
          </div>

          <!-- Document Header -->
          <div style="text-align:center;font-weight:700;font-size:1.15rem;text-decoration:underline;margin-bottom:1.5rem;color:#000;letter-spacing:0.5px;">
            CERTIFICATE TO BE GIVEN ALONG WITH BILLS
          </div>

          <!-- 1. Ref Bill No & Party -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:0.95rem;margin-bottom:0.6rem;line-height:1.4;color:#000;">
            <div>
              <strong>1. &nbsp;Ref. Bill No</strong> <span id="prev_doc47_bill_no" style="font-weight:700;color:#dc2626;">16707</span>
              <strong>Dt</strong> <span id="prev_doc47_bill_date" style="font-weight:700;color:#dc2626;">10/02/2021</span>
              <strong>for</strong> <span id="prev_doc47_item_desc" style="font-weight:700;color:#dc2626;">Sanitizer, Qty: 19 Bottles (500 ml each)</span>
            </div>
            <div style="white-space:nowrap;margin-left:1rem;">
              <strong>Party :-</strong> <span id="prev_doc47_party_name" style="font-weight:700;color:#dc2626;">Chandkheda Medical Store, Ahmedabad</span>
            </div>
          </div>

          <!-- 2. PO / Order No -->
          <div style="font-size:0.95rem;margin-bottom:0.6rem;line-height:1.4;color:#000;">
            <strong>2 &nbsp; <span id="prev_doc47_po_label">A.T. No./Purchase Order No.</span></strong>
            <span id="prev_doc47_po_no" style="font-weight:700;color:#dc2626;">LDCE/Store/Covid-19/sanitizer</span>,
            <strong>Dated</strong> <span id="prev_doc47_po_date" style="font-weight:700;color:#dc2626;">09/02/2021</span>
          </div>

          <!-- 3. Comparative statement date (Repair only) -->
          <div id="prev_doc47_comp_row" style="${activePassForPaymentType === 'repair' ? '' : 'display:none;'} font-size:0.95rem;margin-bottom:0.6rem;color:#000;">
            <strong>3. &nbsp;Comparative Statement dated:</strong> <span id="prev_doc47_comp_date" style="font-weight:700;color:#dc2626;">05/02/2021</span>
          </div>

          <!-- Certified that: -->
          <div style="font-weight:700;font-size:0.95rem;margin-top:0.85rem;margin-bottom:0.6rem;color:#000;">
            Certified that:
          </div>

          <!-- Numbered Points List -->
          <div id="prev_doc47_points_container" style="font-size:0.92rem;line-height:1.45;color:#000;">
            <!-- Injected via JavaScript for non_gem or repair -->
          </div>

          <!-- Signatures (Department Level) -->
          <div id="prev_doc47_dept_sigs_container" style="margin-top:2.5rem;margin-bottom:1.5rem;">
            <!-- Injected via JavaScript (3 cols for non-gem, 4 cols for repair) -->
          </div>

          <!-- SOLID SEPARATOR LINE -->
          <div style="border-top:1.5px solid #000;margin:1.5rem 0;"></div>

          <!-- STORE USE ONLY BLOCK (Non-GeM) / (FOR OFFICE USE) BLOCK (Repair) -->
          <div id="prev_doc47_bottom_container">
            <!-- Injected via JavaScript -->
          </div>

        </div>
      </div>
    `;
  }

  // PURCHASE ORDER & WORK ORDER (DOC-43) TAB
  if (activeRepairsTab === 'doc43') {
    return `
      ${renderAccessBanner('repairs')}
      ${navTabs}

      <div style="display:grid;grid-template-columns:minmax(400px, 520px) 1fr;gap:1.5rem;align-items:start;" class="doc43-grid-layout">
        
        <!-- LEFT: Purchase Order / Work Order Form & Controls -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="border-bottom:1px solid var(--neutral-200,#333);padding-bottom:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h3 class="card-title" style="display:flex;align-items:center;gap:0.5rem;">
                <span>📜</span> Purchase Order &amp; Work Order Generator
              </h3>
              <span class="badge badge-primary">Official DOC-43</span>
            </div>
            <p style="font-size:0.8rem;color:var(--neutral-400,#888);margin-top:0.25rem;">
              Generate official LDCE Purchase Order (Non-GeM Goods) or Work Order (Equipment Repairing &amp; Maintenance) on letterhead.
            </p>
          </div>

          <form id="doc43Form" style="padding-top:1rem;">
            
            <!-- Type Selection: Purchase Order vs Work Order -->
            <div style="background:var(--neutral-850,#1a1a2e);padding:0.85rem;border-radius:6px;margin-bottom:1.25rem;border:1.5px solid var(--primary-500,#6366f1);">
              <label class="form-label" style="font-size:0.82rem;font-weight:700;color:var(--primary-300,#a5b4fc);margin-bottom:0.5rem;display:block;">
                📑 SELECT DOCUMENT TYPE
              </label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                <label style="display:flex;align-items:center;gap:0.75rem;background:var(--neutral-800,#222);padding:0.75rem 1rem;border-radius:6px;cursor:pointer;border:1.5px solid ${activePoType === 'purchase_order' ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)'};">
                  <input type="radio" name="doc43_type_radio" value="purchase_order" ${activePoType === 'purchase_order' ? 'checked' : ''} style="cursor:pointer;width:18px;height:18px;" />
                  <div>
                    <div style="font-weight:700;font-size:0.92rem;color:#ffffff;">Purchase Order</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">Non-GeM Goods Purchase</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:0.75rem;background:var(--neutral-800,#222);padding:0.75rem 1rem;border-radius:6px;cursor:pointer;border:1.5px solid ${activePoType === 'work_order' ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)'};">
                  <input type="radio" name="doc43_type_radio" value="work_order" ${activePoType === 'work_order' ? 'checked' : ''} style="cursor:pointer;width:18px;height:18px;" />
                  <div>
                    <div style="font-weight:700;font-size:0.92rem;color:#ffffff;">Work Order</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">Equipment Repairing</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Quick Pre-fills -->
            <div style="margin-bottom:1.25rem;">
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                <button type="button" class="btn btn-sm btn-outline-primary" id="btn_doc43_sample_po" style="font-size:0.8rem;padding:0.35rem 0.65rem;">
                  💡 Sample Purchase Order
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" id="btn_doc43_sample_wo" style="font-size:0.8rem;padding:0.35rem 0.65rem;">
                  💡 Sample Work Order
                </button>
              </div>

              <div class="form-group" style="margin-bottom:0.5rem;">
                <label class="form-label" style="font-size:0.8rem;color:var(--neutral-300,#ccc);">
                  ⚡ Auto-fill from Registered Repair Equipment:
                </label>
                <select id="doc43_autofill_eq" class="form-control" style="font-size:0.85rem;">
                  <option value="">-- Select Registered Equipment to auto-fill --</option>
                  ${requests.map(r => `<option value="${r.id}" ${window._selectedRepairForDoc43 == r.id ? 'selected' : ''}>#${r.id} – ${(r.equipment_name || 'Equipment')} (${r.dept_name || 'Dept'})</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Reference & Date Header -->
            <div style="background:var(--neutral-900,#111);padding:0.85rem;border-radius:6px;margin-bottom:1.25rem;border:1px solid var(--neutral-700,#333);">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.6rem;">
                1. Order Reference &amp; Header
              </h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Department <span style="color:var(--red-400);">*</span></label>
                  <select id="doc43_dept" class="form-control" style="font-size:0.82rem;">
                    ${depts.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Financial Year / Year <span style="color:var(--red-400);">*</span></label>
                  <input type="text" id="doc43_fin_year" class="form-control" value="2021-22" placeholder="e.g. 2021-22 or 2021" style="font-size:0.82rem;" required />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Order / Reference No. <span style="color:var(--red-400);">*</span></label>
                  <input type="text" id="doc43_ref_no" class="form-control" value="101" placeholder="e.g. 101 or Chemical/2021" style="font-size:0.82rem;" required />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Order Date <span style="color:var(--red-400);">*</span></label>
                  <input type="date" id="doc43_date" class="form-control" style="font-size:0.82rem;" required />
                </div>
              </div>
            </div>

            <!-- Recipient / Vendor Details -->
            <div style="background:var(--neutral-900,#111);padding:0.85rem;border-radius:6px;margin-bottom:1.25rem;border:1px solid var(--neutral-700,#333);">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin-bottom:0.6rem;">
                2. Vendor Details (To,)
              </h4>
              <div class="form-group" style="margin-bottom:0.6rem;">
                <label class="form-label" style="font-size:0.78rem;">Vendor / Supplier / Agency Name <span style="color:var(--red-400);">*</span></label>
                <input type="text" id="doc43_vendor_name" class="form-control" placeholder="e.g. M/s Ashish Scientific Works" style="font-size:0.82rem;" required />
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.78rem;">Vendor Full Address &amp; Contact</label>
                <textarea id="doc43_vendor_address" class="form-control" rows="2" placeholder="e.g. Opp. Kalupur Station, Relief Road, Ahmedabad - 380001" style="font-size:0.82rem;"></textarea>
              </div>
            </div>

            <!-- Work Order Specific Details (Subject & Quotation Ref) -->
            <div id="sec_doc43_wo_fields" style="background:var(--neutral-900,#111);padding:0.85rem;border-radius:6px;margin-bottom:1.25rem;border:1px solid var(--neutral-700,#333);display:${activePoType === 'work_order' ? 'block' : 'none'};">
              <h4 style="font-size:0.82rem;font-weight:700;color:var(--emerald-400,#34d399);text-transform:uppercase;margin-bottom:0.6rem;">
                3. Work Order Subject &amp; Quotation Reference
              </h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Sub: Repairing of <span style="color:var(--red-400);">*</span></label>
                  <input type="text" id="doc43_subject" class="form-control" placeholder="e.g. Heating Mantle / Lathe Machine" style="font-size:0.82rem;" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Ref. Your quotation dated: <span style="color:var(--red-400);">*</span></label>
                  <input type="text" id="doc43_quotation_date" class="form-control" placeholder="e.g. 15/02/2021 or 2021-02-15" style="font-size:0.82rem;" />
                </div>
              </div>
            </div>

            <!-- Dynamic Items Table -->
            <div style="background:var(--neutral-900,#111);padding:0.85rem;border-radius:6px;margin-bottom:1.25rem;border:1px solid var(--neutral-700,#333);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
                <h4 style="font-size:0.82rem;font-weight:700;color:var(--primary-400,#818cf8);text-transform:uppercase;margin:0;">
                  3. Line Items &amp; Charges
                </h4>
                <button type="button" class="btn btn-xs btn-outline-primary" id="btn_doc43_add_item" style="font-size:0.75rem;padding:2px 8px;">
                  + Add Item Row
                </button>
              </div>

              <div id="doc43_items_container" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.75rem;">
                <!-- Injected via JavaScript -->
              </div>

              <!-- Extra Charges & Taxes -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;border-top:1px solid var(--neutral-800,#222);padding-top:0.75rem;">
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Other charges (Rs.)</label>
                  <input type="number" id="doc43_other_charges" class="form-control" step="0.01" placeholder="0.00" style="font-size:0.82rem;" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">GST Amount / Taxes (Rs.)</label>
                  <input type="number" id="doc43_gst_amount" class="form-control" step="0.01" placeholder="0.00" style="font-size:0.82rem;" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;font-weight:700;color:var(--emerald-400,#34d399);">Grand Total (Rs.)</label>
                  <input type="number" id="doc43_grand_total" class="form-control" step="0.01" placeholder="0.00" style="font-size:0.85rem;font-weight:700;color:var(--emerald-400,#34d399);background:#062d1d;" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size:0.78rem;">Signatory Authority</label>
                  <input type="text" id="doc43_signatory" class="form-control" value="Principal" style="font-size:0.82rem;" />
                </div>
              </div>

              <div class="form-group" style="margin-top:0.5rem;">
                <label class="form-label" style="font-size:0.78rem;">Total in Words (Total Rupees)</label>
                <input type="text" id="doc43_total_words" class="form-control" placeholder="e.g. Rupees Five Thousand Only" style="font-size:0.82rem;" />
              </div>
            </div>

            <!-- Actions -->
            <div style="display:flex;gap:0.75rem;justify-content:flex-end;padding-top:1rem;border-top:1px solid var(--neutral-800,#222);">
              <button type="reset" class="btn btn-secondary" id="doc43ResetBtn">Reset Form</button>
              <button type="submit" class="btn btn-primary" id="doc43SubmitBtn" style="padding:0.65rem 1.5rem;font-weight:700;">
                📥 Download Word Document (.docx)
              </button>
            </div>
          </form>
        </div>

        <!-- RIGHT: Live Document Preview (Real Letterhead Design) -->
        <div class="card" style="background:#f8fafc;color:#111827;padding:2rem 2.25rem;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-family:'Times New Roman',serif;min-height:750px;border:1px solid #cbd5e1;position:sticky;top:1rem;">
          
          <!-- TOP BADGE -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;font-family:sans-serif;border-bottom:1px dashed #cbd5e1;padding-bottom:0.4rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span class="badge" id="prev_doc43_type_badge" style="background:#e0e7ff;color:#3730a3;font-weight:700;font-size:0.75rem;padding:3px 8px;border-radius:4px;">
                PURCHASE ORDER (NON-GEM)
              </span>
              <span style="font-size:0.75rem;color:#64748b;">Live Letterhead Preview</span>
            </div>
            <span style="font-size:0.75rem;color:#64748b;">Standard A4 Portrait</span>
          </div>

          <!-- 3-COLUMN LDCE LETTERHEAD -->
          <table style="width:100%;border-collapse:collapse;border:none;margin-bottom:0.4rem;">
            <tr>
              <td style="width:18%;vertical-align:middle;text-align:left;border:none;padding:0;">
                <img src="${ldceLogoImg}" alt="LDCE Logo" style="width:80px;height:auto;" />
              </td>
              <td style="width:64%;vertical-align:middle;text-align:center;border:none;padding:0 5px;">
                <div style="font-size:0.85rem;font-weight:700;color:#c00000;margin-bottom:1px;">Government of Gujarat</div>
                <div style="font-size:1.18rem;font-weight:700;color:#c00000;font-family:'Times New Roman',serif;line-height:1.2;margin-bottom:2px;">
                  L. D. College of Engineering, Ahmedabad
                </div>
                <div style="font-size:0.75rem;font-weight:600;color:#1e3a8a;line-height:1.25;">
                  Opp. Gujarat University, Navrangpura<br>
                  Ahmedabad - 380 015
                </div>
                <div style="font-size:0.75rem;font-weight:600;color:#1e3a8a;line-height:1.25;">
                  Phone : Office - 079 26306752, Principal - 079 26302887
                </div>
                <div style="font-size:0.7rem;color:#1e3a8a;line-height:1.25;">
                  Email : ldce-abad-dte@gujarat.gov.in &nbsp; Website : www.ldce.ac.in
                </div>
              </td>
              <td style="width:18%;vertical-align:middle;text-align:right;border:none;padding:0;">
                <img src="${gandhiLogoImg}" alt="Gandhi 150 Logo" style="width:80px;height:auto;" />
              </td>
            </tr>
          </table>

          <!-- RED SEPARATOR LINE -->
          <div style="border-top:2px solid #c00000;margin:0.35rem 0 0.75rem 0;"></div>

          <!-- REFERENCE NUMBER & DATE LINE -->
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.92rem;font-weight:600;margin-bottom:0.85rem;">
            <div id="prev_doc43_ref_line">
              No. LDCE/Purchase / <span id="prev_doc43_dept_disp">Chemical</span> / <span id="prev_doc43_fin_year_disp" style="color:#c00000;">2021-22</span>
            </div>
            <div id="prev_doc43_date_line">
              Dated: <span id="prev_doc43_date_disp">&nbsp;&nbsp;/&nbsp;&nbsp;/2021</span>
            </div>
          </div>

          <!-- DOCUMENT TITLE -->
          <div style="text-align:left;margin-bottom:0.75rem;">
            <span style="font-weight:bold;text-decoration:underline;font-size:1.05rem;font-family:'Times New Roman',serif;" id="prev_doc43_title_disp">
              Purchase Order
            </span>
          </div>

          <!-- TO / VENDOR -->
          <div style="margin-bottom:0.75rem;font-size:0.9rem;line-height:1.35;">
            <div>To,</div>
            <div id="prev_doc43_vendor_disp" style="font-weight:600;margin-left:0;">
              M/s Ashish Scientific Works<br>Ahmedabad
            </div>
          </div>

          <!-- WORK ORDER SUB & REF BLOCK (Hidden for PO) -->
          <div id="prev_doc43_wo_sub_ref" style="display:none;margin-bottom:0.75rem;font-size:0.9rem;line-height:1.4;">
            <div><strong>Sub:</strong> Repairing of <span id="prev_doc43_subject_disp">Heating Mantle</span></div>
            <div><strong>Ref.</strong> Your quotation dated: <span id="prev_doc43_quotation_date_disp">10/02/2021</span></div>
          </div>

          <!-- OPENING INTRO -->
          <div id="prev_doc43_intro_disp" style="margin-bottom:0.75rem;font-size:0.9rem;line-height:1.35;">
            We are pleased to order out the following items for our institute.
          </div>

          <!-- ITEMS TABLE -->
          <div style="margin-bottom:1.15rem;overflow-x:auto;">
            <table id="prev_doc43_table" style="width:100%;border-collapse:collapse;border:1.5px solid #000;font-size:0.85rem;background:#fff;">
              <!-- Injected via JavaScript -->
            </table>
          </div>

          <!-- CONDITIONS / TERMS AND CONDITIONS -->
          <div style="margin-bottom:1.75rem;font-size:0.83rem;line-height:1.35;">
            <div style="font-weight:bold;margin-bottom:0.35rem;" id="prev_doc43_cond_title">Terms and Conditions:</div>
            <ol style="margin:0;padding-left:1.35rem;" id="prev_doc43_cond_list">
              <li>The items should be delivered urgently on receiving this order.</li>
              <li>The items must be as per specifications mentioned above.</li>
              <li>Taxes to be pay as per govt. rules.</li>
              <li>The bill should be sent in quadruplicate.</li>
              <li>Payment will be done as soon as possible after due scrutiny &amp; Inspection.</li>
              <li>The undersigned reserves the right to cancel the order or reject one or all items which may be found of inferior quality or not as per our requirement or not as per specifications. Such items will be sent back to you at your cost.</li>
            </ol>
          </div>

          <!-- PRINCIPAL SIGN-OFF -->
          <div style="display:flex;justify-content:flex-end;margin-bottom:2rem;">
            <div style="text-align:center;min-width:180px;">
              <div style="font-weight:bold;font-size:0.95rem;" id="prev_doc43_signatory_disp">Principal</div>
            </div>
          </div>

          <!-- FOOTER WITH RED TOP LINE & ACCREDITATION -->
          <div style="border-top:1.5px solid #c00000;margin-top:auto;padding-top:0.4rem;text-align:center;font-size:0.72rem;color:#1e3a8a;line-height:1.35;">
            <div>Civil Engineering, Mechanical Engineering and Electrical Engineering programs accredited by NBA</div>
            <div>Best Engineering College Award - 2019 by ISTE</div>
          </div>

        </div>
      </div>
    `;
  }

  // REGISTER (FORM-12) TAB
  const formHtml = canCreate('repairs') ? `
    <div class="card">
      <div class="card-header" style="border-bottom: 1px solid var(--neutral-200); padding-bottom: 0.85rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
          <div>
            <h3 class="card-title">Register New Equipment — Non-Working Repairable (FORM-12)</h3>
            <p style="font-size:0.8rem;color:var(--neutral-500);margin-top:0.2rem;">
              Matches <strong>L.D. College of Engineering — List of Non Working Repairable Equipment and Instruments</strong> Excel format
            </p>
          </div>
          <span class="badge badge-warning">Official Register Format (10 Columns)</span>
        </div>
      </div>
      <form id="repairForm" style="padding-top:1.25rem;">

        <!-- SECTION 1: Department & Equipment Identity -->
        <div style="margin-bottom:1.5rem;">
          <h4 style="font-size:0.875rem;font-weight:700;color:var(--primary-800);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.75rem;border-left:3px solid var(--primary-600);padding-left:0.5rem;">
            1. Equipment Identity (Columns A – D)
          </h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Name of Department <span style="color:var(--red-500);">*</span></label>
              <select id="repairDept" class="form-control" required>
                ${depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Name of Equipment / Instruments <span style="color:var(--red-500);">*</span></label>
              <input type="text" id="repairName" class="form-control" placeholder="e.g. Lathe Machine, Oscilloscope, CRO" required />
            </div>
            <div class="form-group">
              <label class="form-label">Purchase Date <span style="color:var(--red-500);">*</span></label>
              <input type="date" id="repairPurchaseDate" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Cost of Purchase (Rs.) <span style="color:var(--red-500);">*</span></label>
              <input type="number" id="repairCost" class="form-control" step="0.01" placeholder="0.00" required />
            </div>
          </div>
        </div>

        <!-- SECTION 2: Breakdown & Non-Working Status -->
        <div style="margin-bottom:1.5rem;">
          <h4 style="font-size:0.875rem;font-weight:700;color:var(--primary-800);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.75rem;border-left:3px solid var(--accent-orange,#f59e0b);padding-left:0.5rem;">
            2. Breakdown & Non-Working Status (Columns E – H)
          </h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Date Since Non Working <span style="color:var(--red-500);">*</span></label>
              <input type="date" id="repairDate" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Weather Previously Repaired? <span style="color:var(--red-500);">*</span></label>
              <select id="repairPrevRepaired" class="form-control">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div class="form-group" id="grpLastRepairDate" style="display:none;">
              <label class="form-label">If Previously Repaired — Date of Last Repair</label>
              <input type="date" id="repairLastRepairDate" class="form-control" />
            </div>
            <div class="form-group" id="grpLastRepairAmount" style="display:none;">
              <label class="form-label">Amount of Last Repair (Rs.)</label>
              <input type="number" id="repairLastRepairAmount" class="form-control" step="0.01" placeholder="0.00" />
            </div>
          </div>
        </div>

        <!-- SECTION 3: Current Value & Repair Estimate -->
        <div style="margin-bottom:1.5rem;">
          <h4 style="font-size:0.875rem;font-weight:700;color:var(--primary-800);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.75rem;border-left:3px solid var(--accent-green,#10b981);padding-left:0.5rem;">
            3. Valuation & Repair Estimate (Columns I – J)
          </h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Prevailing Market Value (Rs.) <span style="color:var(--red-500);">*</span></label>
              <input type="number" id="repairMarketValue" class="form-control" step="0.01" placeholder="0.00" required />
            </div>
            <div class="form-group">
              <label class="form-label">Approximate Cost of Repairing (Rs.) <span style="color:var(--red-500);">*</span></label>
              <input type="number" id="repairEst" class="form-control" step="0.01" placeholder="0.00" required />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Detailed Fault Description <span style="color:var(--red-500);">*</span></label>
              <textarea id="repairDesc" class="form-control" rows="3" placeholder="Describe the nature of fault, symptoms, and non-working components in detail..." required></textarea>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:0.75rem;justify-content:flex-end;padding-top:1rem;border-top:1px solid var(--neutral-200);">
          <button type="reset" class="btn btn-secondary" id="repairResetBtn">Reset Form</button>
          <button type="submit" class="btn btn-warning" style="padding:0.65rem 1.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>
            Register in Repair Register
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('repairs')}
    ${navTabs}
    ${formHtml}

    <div class="card">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;padding-bottom:1rem;border-bottom:1px solid var(--neutral-200);">
        <div>
          <h3 class="card-title" style="display:flex;align-items:center;gap:0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent-orange,#f59e0b);"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>
            L.D.C.E. — List of Non Working Repairable Equipment &amp; Instruments
          </h3>
          <p style="font-size:0.8rem;color:var(--neutral-500);margin-top:0.2rem;">${requests.length} equipment record${requests.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div>
          <button type="button" class="btn btn-primary btn-sm" onclick="window.switchToInquiryTab()">✉️ Create Inquiry Letter →</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" style="font-size:0.82rem;">
          <thead>
            <tr>
              <th>Department</th>
              <th>Name of Equipment / Instruments</th>
              <th>Purchase Date</th>
              <th>Cost of Purchase (Rs.)</th>
              <th>Date Since Non Working</th>
              <th>Previously Repaired?</th>
              <th>Date of Last Repair</th>
              <th>Amount of Last Repair (Rs.)</th>
              <th>Prevailing Market Value (Rs.)</th>
              <th>Approx. Cost of Repairing (Rs.)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${requests.length === 0
      ? `<tr><td colspan="12" style="text-align:center;padding:2.5rem;color:var(--neutral-400);">No repair requests recorded yet. Use the form above to register equipment.</td></tr>`
      : requests.map((r, idx) => `
              <tr>
                <td>${r.dept_name || '-'}</td>
                <td><strong>${r.equipment_name}</strong></td>
                <td>${r.purchase_date ? new Date(r.purchase_date).toLocaleDateString('en-GB') : '-'}</td>
                <td>₹${parseFloat(r.original_cost || 0).toLocaleString('en-IN')}</td>
                <td>${r.breakdown_date ? new Date(r.breakdown_date).toLocaleDateString('en-GB') : '-'}</td>
                <td>${r.prev_repaired ? '<span class="badge badge-warning">Yes</span>' : '<span class="badge badge-success">No</span>'}</td>
                <td>${r.last_repair_date ? new Date(r.last_repair_date).toLocaleDateString('en-GB') : '-'}</td>
                <td>${r.last_repair_amount ? '₹' + parseFloat(r.last_repair_amount).toLocaleString('en-IN') : '-'}</td>
                <td>₹${parseFloat(r.market_value || 0).toLocaleString('en-IN')}</td>
                <td><strong>₹${parseFloat(r.est_repair_cost || 0).toLocaleString('en-IN')}</strong></td>
                <td><span class="badge badge-info">${r.status}</span></td>
                <td>
                  <div style="display:flex;gap:4px;flex-wrap:nowrap;">
                    <button type="button" class="btn btn-xs btn-outline-primary" style="padding:3px 7px;font-size:0.75rem;white-space:nowrap;" onclick="window.prefillInquiryFromRepair('${r.id}')" title="Generate Inquiry Letter (DOC-41)">
                      ✉️ Inquiry
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-info" style="padding:3px 7px;font-size:0.75rem;white-space:nowrap;" onclick="window.prefillDoc43FromRepair('${r.id}')" title="Generate Purchase Order / Work Order (DOC-43)">
                      📜 PO / WO (DOC-43)
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-secondary" style="padding:3px 7px;font-size:0.75rem;white-space:nowrap;" onclick="window.prefillDoc45FromRepair('${r.id}')" title="Edit & Generate Approval Note (DOC-45)">
                      📝 Note (DOC-45)
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-warning" style="padding:3px 7px;font-size:0.75rem;white-space:nowrap;" onclick="window.prefillDoc46FromRepair('${r.id}')" title="Edit & Generate Work Order Note (DOC-46)">
                      📋 WO Note (DOC-46)
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-success" style="padding:3px 7px;font-size:0.75rem;white-space:nowrap;" onclick="window.prefillDoc47FromRepair('${r.id}')" title="Generate Pass for Payment (DOC-47)">
                      💳 Pass (DOC-47)
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindRepairsEvents(depts = [], requests = []) {
  // Tab Switching
  document.getElementById('tabBtnRepairsRegister')?.addEventListener('click', () => {
    activeRepairsTab = 'register';
    router();
  });
  document.getElementById('tabBtnRepairsInquiry')?.addEventListener('click', () => {
    activeRepairsTab = 'inquiry';
    router();
  });
  document.getElementById('tabBtnRepairsComp')?.addEventListener('click', () => {
    activeRepairsTab = 'comp';
    router();
  });
  document.getElementById('tabBtnRepairsDoc43')?.addEventListener('click', () => {
    activeRepairsTab = 'doc43';
    router();
  });
  document.getElementById('tabBtnRepairsDoc45')?.addEventListener('click', () => {
    activeRepairsTab = 'doc45';
    router();
  });
  document.getElementById('tabBtnRepairsDoc46')?.addEventListener('click', () => {
    activeRepairsTab = 'doc46';
    router();
  });
  document.getElementById('tabBtnRepairsDoc47')?.addEventListener('click', () => {
    activeRepairsTab = 'doc47';
    router();
  });

  window.switchToInquiryTab = () => {
    activeRepairsTab = 'inquiry';
    router();
  };

  window.switchToCompTab = () => {
    activeRepairsTab = 'comp';
    router();
  };

  window.switchToDoc43Tab = () => {
    activeRepairsTab = 'doc43';
    router();
  };

  window.switchToDoc47Tab = () => {
    activeRepairsTab = 'doc47';
    router();
  };

  window.prefillInquiryFromRepair = (repairId) => {
    activeRepairsTab = 'inquiry';
    window._selectedRepairForInquiry = repairId;
    router();
  };

  window.prefillDoc43FromRepair = (repairId) => {
    activeRepairsTab = 'doc43';
    activePoType = 'work_order';
    window._selectedRepairForDoc43 = repairId;
    router();
  };

  window.prefillDoc45FromRepair = (repairId) => {
    activeRepairsTab = 'doc45';
    window._selectedRepairForDoc45 = repairId;
    router();
  };

  window.prefillDoc46FromRepair = (repairId) => {
    activeRepairsTab = 'doc46';
    window._selectedRepairForDoc46 = repairId;
    router();
  };

  window.prefillDoc47FromRepair = (repairId) => {
    activeRepairsTab = 'doc47';
    activePassForPaymentType = 'repair';
    window._selectedRepairForDoc47 = repairId;
    router();
  };

  // If in Comparative Statement tab:
  if (activeRepairsTab === 'comp') {
    const govtMembersList = [
      'Prof S P Shah', 'Prof H M Ravat', 'V P Mamtora',
      'Prof S M Shah', 'Prof M C Chudasama', 'Prof R B Khasiya', 'Prof N M Bhatt'
    ];
    const nonGovtMembersList = [
      'Prof S P Shah', 'Prof H M Ravat', 'Prof A I Thakkar',
      'Prof C S Sanghvi', 'Prof S M Shah', 'Prof M C Chudasama', 'Prof N M Bhatt'
    ];

    const statementForEl = document.getElementById('comp_statement_for');
    const inqNoEl = document.getElementById('comp_inq_no');
    const inqDateEl = document.getElementById('comp_inq_date');
    const lastDateEl = document.getElementById('comp_last_date');
    const openingDateEl = document.getElementById('comp_opening_date');
    const itemDescEl = document.getElementById('comp_item_desc');
    const itemQtyEl = document.getElementById('comp_item_qty');
    const autofillEl = document.getElementById('comp_autofill_eq');

    // Fund category radios
    document.querySelectorAll('input[name="comp_fund_radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        compFundType = e.target.value;
        updateCompPreview();
      });
    });

    // Render Vendor cards
    const renderCompVendorCards = () => {
      const container = document.getElementById('compVendorsFormContainer');
      if (!container) return;

      container.innerHTML = compVendors.map((v, idx) => `
        <div style="background:var(--neutral-850,#1a1a2e);border:1px solid var(--neutral-700,#444);border-radius:6px;padding:0.75rem;">
          <div style="font-size:0.8rem;font-weight:700;color:var(--accent-primary,#818cf8);margin-bottom:0.5rem;display:flex;justify-content:space-between;">
            <span>Vendor ${idx + 1} (${idx === 0 ? 'AKSH Services' : (idx === 1 ? 'FAST Services' : 'KARAN Enterprise')})</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;">
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Firm Name</label>
              <input type="text" class="form-control comp-v-name" value="${v.name || ''}" data-idx="${idx}" style="font-size:0.78rem;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Address</label>
              <input type="text" class="form-control comp-v-addr" value="${v.address || ''}" data-idx="${idx}" style="font-size:0.78rem;" />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;">
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Rate (Rs.)</label>
              <input type="number" step="0.01" class="form-control comp-v-rate" value="${v.rate || ''}" data-idx="${idx}" style="font-size:0.78rem;" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Govt. Tax (Rs.)</label>
              <input type="number" step="0.01" class="form-control comp-v-tax" value="${v.tax || ''}" data-idx="${idx}" style="font-size:0.78rem;" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Other Charges</label>
              <input type="number" step="0.01" class="form-control comp-v-other" value="${v.other || ''}" data-idx="${idx}" style="font-size:0.78rem;" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;font-weight:700;">Grand Total</label>
              <input type="number" step="0.01" class="form-control comp-v-total" value="${v.total || ''}" data-idx="${idx}" style="font-size:0.78rem;font-weight:700;" placeholder="0.00" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size:0.75rem;">Terms & Conditions</label>
            <input type="text" class="form-control comp-v-tc" value="${v.tc || ''}" data-idx="${idx}" style="font-size:0.78rem;" placeholder="e.g. 1 Year Warranty / Payment in 30 days" />
          </div>
        </div>
      `).join('');

      // Bind input events for vendors
      container.querySelectorAll('.comp-v-name').forEach(el => {
        el.addEventListener('input', (e) => {
          compVendors[parseInt(e.target.dataset.idx, 10)].name = e.target.value;
          updateCompPreview();
        });
      });
      container.querySelectorAll('.comp-v-addr').forEach(el => {
        el.addEventListener('input', (e) => {
          compVendors[parseInt(e.target.dataset.idx, 10)].address = e.target.value;
          updateCompPreview();
        });
      });
      container.querySelectorAll('.comp-v-rate, .comp-v-tax, .comp-v-other').forEach(el => {
        el.addEventListener('input', (e) => {
          const idx = parseInt(e.target.dataset.idx, 10);
          const rate = parseFloat(container.querySelector(`.comp-v-rate[data-idx="${idx}"]`)?.value || 0);
          const tax = parseFloat(container.querySelector(`.comp-v-tax[data-idx="${idx}"]`)?.value || 0);
          const other = parseFloat(container.querySelector(`.comp-v-other[data-idx="${idx}"]`)?.value || 0);
          const total = (rate + tax + other).toFixed(2);
          
          compVendors[idx].rate = container.querySelector(`.comp-v-rate[data-idx="${idx}"]`)?.value || '';
          compVendors[idx].tax = container.querySelector(`.comp-v-tax[data-idx="${idx}"]`)?.value || '';
          compVendors[idx].other = container.querySelector(`.comp-v-other[data-idx="${idx}"]`)?.value || '';
          compVendors[idx].total = total;
          
          const totalInput = container.querySelector(`.comp-v-total[data-idx="${idx}"]`);
          if (totalInput) totalInput.value = total;
          
          updateCompPreview();
        });
      });
      container.querySelectorAll('.comp-v-total').forEach(el => {
        el.addEventListener('input', (e) => {
          compVendors[parseInt(e.target.dataset.idx, 10)].total = e.target.value;
          updateCompPreview();
        });
      });
      container.querySelectorAll('.comp-v-tc').forEach(el => {
        el.addEventListener('input', (e) => {
          compVendors[parseInt(e.target.dataset.idx, 10)].tc = e.target.value;
          updateCompPreview();
        });
      });
    };

    const updateCompPreview = () => {
      // 1. Badge & Statement for
      const badge = document.getElementById('prev_comp_fund_badge');
      if (badge) {
        badge.textContent = compFundType.toUpperCase();
        badge.style.color = compFundType === 'Govt Fund' ? '#2563eb' : '#059669';
      }

      const stFor = statementForEl?.value?.trim() || '.............................................';
      const prevStFor = document.getElementById('prev_comp_statement_for');
      if (prevStFor) prevStFor.textContent = stFor.startsWith('.') ? stFor : ' ' + stFor;

      // 2. Inq No & Dates
      const prevInqNo = document.getElementById('prev_comp_inq_no');
      if (prevInqNo) prevInqNo.textContent = inqNoEl?.value || 'LDCE/store/CAMC-Canon/2019-20/337';

      const inqDate = inqDateEl?.value;
      const prevInqDate = document.getElementById('prev_comp_inq_date');
      if (prevInqDate) {
        if (inqDate) {
          const [yyyy, mm, dd] = inqDate.split('-');
          prevInqDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevInqDate.textContent = '31/01/2020';
        }
      }

      const lastDate = lastDateEl?.value;
      const prevLastDate = document.getElementById('prev_comp_last_date');
      if (prevLastDate) {
        if (lastDate) {
          const [yyyy, mm, dd] = lastDate.split('-');
          prevLastDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevLastDate.textContent = '12/06/2020';
        }
      }

      const openDate = openingDateEl?.value;
      const prevOpenDate = document.getElementById('prev_comp_opening_date');
      if (prevOpenDate) {
        if (openDate) {
          const [yyyy, mm, dd] = openDate.split('-');
          prevOpenDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevOpenDate.textContent = '';
        }
      }

      // 3. Item row
      const prevDesc = document.getElementById('prev_comp_row_desc');
      if (prevDesc) prevDesc.textContent = itemDescEl?.value || '';

      const prevQty = document.getElementById('prev_comp_row_qty');
      if (prevQty) prevQty.textContent = itemQtyEl?.value || '';

      // 4. Vendors Header & Rates
      const vendorHeadersEl = document.getElementById('prev_comp_vendor_headers');
      if (vendorHeadersEl) {
        vendorHeadersEl.innerHTML = compVendors.map(v => `
          <th style="border:1px solid #000;padding:4px;width:18%;text-align:center;">
            <div style="background:#fef08a;font-weight:700;padding:1px 2px;">${v.name || 'Vendor'}</div>
            <div style="font-size:0.75rem;font-weight:normal;line-height:1.2;margin-top:2px;">${v.address || ''}</div>
          </th>
        `).join('');
      }

      compVendors.forEach((v, idx) => {
        const i = idx + 1;
        const rateEl = document.getElementById(`prev_comp_v${i}_rate`);
        if (rateEl) rateEl.textContent = v.rate ? parseFloat(v.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

        const taxEl = document.getElementById(`prev_comp_v${i}_tax`);
        if (taxEl) taxEl.textContent = v.tax ? parseFloat(v.tax).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

        const otherEl = document.getElementById(`prev_comp_v${i}_other`);
        if (otherEl) otherEl.textContent = v.other ? parseFloat(v.other).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

        const totalEl = document.getElementById(`prev_comp_v${i}_total`);
        if (totalEl) totalEl.textContent = v.total ? parseFloat(v.total).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

        const tcEl = document.getElementById(`prev_comp_v${i}_tc`);
        if (tcEl) tcEl.textContent = v.tc || '';
      });

      // 5. Dynamic Committee Table (7 members)
      const commMembers = compFundType === 'Non-Govt Fund' ? nonGovtMembersList : govtMembersList;
      const commRowEl = document.getElementById('prev_comp_committee_row');
      if (commRowEl) {
        commRowEl.innerHTML = commMembers.map(m => `
          <td style="border:1px solid #000;padding:24px 3px 6px 3px;width:${(100 / commMembers.length).toFixed(1)}%;text-align:center;font-size:0.8rem;line-height:1.2;">
            ${m}
          </td>
        `).join('');
      }
    };

    // Quick fill example button
    document.getElementById('btnLoadCanonExample')?.addEventListener('click', () => {
      if (statementForEl) statementForEl.value = 'CAMC of Canon IR 2002 Copier machine';
      if (inqNoEl) inqNoEl.value = 'LDCE/store/CAMC-Canon/2019-20/337';
      if (inqDateEl) inqDateEl.value = '2020-01-31';
      if (lastDateEl) lastDateEl.value = '2020-06-12';
      if (itemDescEl) itemDescEl.value = 'CAMC of Canon IR 2002 Copier machine';
      if (itemQtyEl) itemQtyEl.value = '01 No.';

      compVendors = [
        { name: 'AKSH Services', address: "1-Anand Bhavan, Abadnagar Bopal, A'bad", rate: '2500.00', tax: '450.00', other: '0.00', total: '2950.00', tc: 'Payment within 30 days' },
        { name: 'FAST Services', address: "I-2, GF-Kumkum Residency B/h Satyam Hospital, Chandkheda A'bad", rate: '2800.00', tax: '504.00', other: '0.00', total: '3304.00', tc: '1 Year Warranty' },
        { name: 'KARAN Enterprise', address: "C-10 Appts, Central jail road, Subhashbridge, A'bad", rate: '3100.00', tax: '558.00', other: '0.00', total: '3658.00', tc: 'Doorstep service' }
      ];

      renderCompVendorCards();
      updateCompPreview();
    });

    // Autofill from equipment
    if (autofillEl) {
      autofillEl.addEventListener('change', (e) => {
        const reqId = e.target.value;
        const selected = requests.find(r => String(r.id) === String(reqId));
        if (selected) {
          if (statementForEl) statementForEl.value = `Repair of ${selected.equipment_name}`;
          if (itemDescEl) itemDescEl.value = `Repairing of ${selected.equipment_name}`;
          if (itemQtyEl) itemQtyEl.value = '01 No.';
          updateCompPreview();
        }
      });
    }

    [statementForEl, inqNoEl, inqDateEl, lastDateEl, openingDateEl, itemDescEl, itemQtyEl].forEach(input => {
      input?.addEventListener('input', updateCompPreview);
      input?.addEventListener('change', updateCompPreview);
    });

    renderCompVendorCards();
    updateCompPreview();

    // Form Submit / Download DOC-42
    document.getElementById('compStatementForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnDownloadCompDoc');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ Generating DOC-42...';

      const payload = {
        fund_type: compFundType,
        is_non_govt: compFundType === 'Non-Govt Fund',
        statement_for: statementForEl?.value?.trim() || '',
        inquiry_no: inqNoEl?.value?.trim() || '',
        inquiry_date: inqDateEl?.value || '',
        last_date: lastDateEl?.value || '',
        opening_date: openingDateEl?.value || '',
        items: [
          {
            item_name: itemDescEl?.value?.trim() || '',
            qty: itemQtyEl?.value?.trim() || '',
            rates: compVendors.map(v => v.rate ? parseFloat(v.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '')
          }
        ],
        vendors: compVendors.map(v => ({
          name: v.name || '',
          address: v.address || '',
          rate: v.rate ? parseFloat(v.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '',
          tax: v.tax ? parseFloat(v.tax).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '',
          other: v.other ? parseFloat(v.other).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '',
          total: v.total ? parseFloat(v.total).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '',
          tc: v.tc || ''
        }))
      };

      try {
        await api.downloadDocumentPost('DOC-42', payload);
      } catch (err) {
        alert('Error generating Comparative Statement: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });

    return;
  }

  // If in Inquiry Letter tab:
  if (activeRepairsTab === 'inquiry') {
    const deptEl = document.getElementById('inq_dept');
    const finYearEl = document.getElementById('inq_fin_year');
    const refNoEl = document.getElementById('inq_ref_no');
    const dateEl = document.getElementById('inq_date');
    const vendorNameEl = document.getElementById('inq_vendor_name');
    const vendorAddressEl = document.getElementById('inq_vendor_address');
    const subjectEl = document.getElementById('inq_subject');
    const superscriptedEl = document.getElementById('inq_superscribed');
    const lastDateEl = document.getElementById('inq_last_date');
    const autofillEl = document.getElementById('inq_autofill_eq');

    // Default 15 days from today for last date
    if (lastDateEl && !lastDateEl.value) {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      lastDateEl.value = d.toISOString().split('T')[0];
    }

    // Render dynamic item rows in form and update live preview
    const renderItemsFormAndPreview = () => {
      const container = document.getElementById('inquiryItemsContainer');
      if (container) {
        let rowsHeader = `
          <div style="display:grid;grid-template-columns:1fr 80px 1fr 30px;gap:0.4rem;padding:0 4px;font-size:0.75rem;font-weight:700;color:var(--neutral-400,#aaa);">
            <div>Description of Item</div>
            <div>Qty</div>
            <div>Remarks / Specs</div>
            <div></div>
          </div>
        `;
        let rowsBody = inquiryFormItems.map((item, idx) => `
          <div style="display:grid;grid-template-columns:1fr 80px 1fr 30px;gap:0.4rem;align-items:center;background:var(--neutral-850,#1a1a2e);padding:6px;border-radius:4px;border:1px solid var(--neutral-700,#333);" data-row="${idx}">
            <input type="text" class="form-control inq-item-name" style="font-size:0.78rem;padding:4px 6px;" placeholder="e.g. Register Books / Lathe Chuck" value="${item.item_name || ''}" data-idx="${idx}" />
            <input type="text" class="form-control inq-item-qty" style="font-size:0.78rem;padding:4px 6px;" placeholder="e.g. 02 Nos" value="${item.qty || ''}" data-idx="${idx}" />
            <input type="text" class="form-control inq-item-remarks" style="font-size:0.78rem;padding:4px 6px;" placeholder="e.g. As per sample" value="${item.remarks || ''}" data-idx="${idx}" />
            <button type="button" class="btn btn-sm btn-outline-danger btn-del-inq-item" style="padding:2px 5px;font-size:0.75rem;" data-idx="${idx}" title="Remove row">✕</button>
          </div>
        `).join('');

        container.innerHTML = rowsHeader + rowsBody;

        // Bind input events on rows
        container.querySelectorAll('.inq-item-name').forEach(el => {
          el.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.idx, 10);
            inquiryFormItems[idx].item_name = e.target.value;
            updateLivePreview();
          });
        });
        container.querySelectorAll('.inq-item-qty').forEach(el => {
          el.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.idx, 10);
            inquiryFormItems[idx].qty = e.target.value;
            updateLivePreview();
          });
        });
        container.querySelectorAll('.inq-item-remarks').forEach(el => {
          el.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.idx, 10);
            inquiryFormItems[idx].remarks = e.target.value;
            updateLivePreview();
          });
        });
        container.querySelectorAll('.btn-del-inq-item').forEach(el => {
          el.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx, 10);
            if (inquiryFormItems.length > 1) {
              inquiryFormItems.splice(idx, 1);
            } else {
              inquiryFormItems[0] = { item_name: '', qty: '', remarks: '' };
            }
            renderItemsFormAndPreview();
          });
        });
      }

      updateLivePreview();
    };

    const updateLivePreview = () => {
      // 1. Dept & Fin Year
      const deptVal = deptEl?.value || 'Library';
      const finYearVal = finYearEl?.value || '2021-22';
      const refNoVal = refNoEl?.value?.trim() || '';
      const prevDeptFin = document.getElementById('prev_ref_dept_fin');
      if (prevDeptFin) prevDeptFin.textContent = `${deptVal}/${finYearVal}/`;
      const prevInqNo = document.getElementById('prev_ref_inq_no');
      if (prevInqNo) prevInqNo.textContent = refNoVal;

      // 2. Date
      const dateVal = dateEl?.value;
      const prevDateDisplay = document.getElementById('prev_date_display');
      if (prevDateDisplay) {
        if (dateVal) {
          const [yyyy, mm, dd] = dateVal.split('-');
          prevDateDisplay.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevDateDisplay.textContent = '  /  /2021';
        }
      }

      // 3. To Vendor
      const vName = vendorNameEl?.value?.trim();
      const vAddr = vendorAddressEl?.value?.trim();
      const prevVendor = document.getElementById('prev_vendor_details');
      if (prevVendor) {
        if (vName || vAddr) {
          prevVendor.innerHTML = `
            ${vName ? `<div style="font-weight:700;">${vName}</div>` : ''}
            ${vAddr ? `<div>${vAddr}</div>` : ''}
          `;
        } else {
          prevVendor.innerHTML = '';
        }
      }

      // 4. Subject
      const subVal = subjectEl?.value?.trim() || 'stationary items for library';
      const prevSub = document.getElementById('prev_sub_display');
      if (prevSub) prevSub.textContent = subVal;

      // 5. Table Rows - Pad to 6 rows minimum
      const tbody = document.getElementById('prev_items_tbody');
      if (tbody) {
        const rowsCount = Math.max(inquiryFormItems.length, 6);
        let rowsHtml = '';
        for (let i = 0; i < rowsCount; i++) {
          const item = inquiryFormItems[i] || {};
          rowsHtml += `
            <tr style="height:28px;">
              <td style="border:1px solid #000;padding:4px 6px;text-align:center;">${i + 1}</td>
              <td style="border:1px solid #000;padding:4px 8px;">${item.item_name || ''}</td>
              <td style="border:1px solid #000;padding:4px 6px;text-align:center;">${item.qty || ''}</td>
              <td style="border:1px solid #000;padding:4px 8px;">${item.remarks || ''}</td>
            </tr>
          `;
        }
        tbody.innerHTML = rowsHtml;
      }

      // 6. Conditions Superscripted & Last Date
      const superVal = superscriptedEl?.value?.trim() || `Quotation for ${subVal}`;
      const prevSuper = document.getElementById('prev_superscripted_display');
      if (prevSuper) prevSuper.textContent = `"${superVal}"`;

      const lastDateVal = lastDateEl?.value;
      const prevLastDate = document.getElementById('prev_last_date_display');
      if (prevLastDate) {
        if (lastDateVal) {
          const [yyyy, mm, dd] = lastDateVal.split('-');
          prevLastDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevLastDate.textContent = '.....................................';
        }
      }
    };

    // Add item button
    document.getElementById('btnAddInquiryItem')?.addEventListener('click', () => {
      inquiryFormItems.push({ item_name: '', qty: '', remarks: '' });
      renderItemsFormAndPreview();
    });

    // Autofill dropdown
    if (autofillEl) {
      autofillEl.addEventListener('change', (e) => {
        const reqId = e.target.value;
        const selected = requests.find(r => String(r.id) === String(reqId));
        if (selected) {
          if (deptEl && selected.dept_name) {
            for (let opt of deptEl.options) {
              if (opt.value === selected.dept_name || opt.text.includes(selected.dept_name)) {
                deptEl.value = opt.value;
                break;
              }
            }
          }
          if (subjectEl) subjectEl.value = `repair of ${selected.equipment_name}`;
          if (superscriptedEl) superscriptedEl.value = `Quotation for repair of ${selected.equipment_name} for ${(selected.dept_name || 'department').toLowerCase()}`;
          inquiryFormItems = [
            {
              item_name: selected.equipment_name,
              qty: '01 No.',
              remarks: selected.fault_desc ? `Fault: ${selected.fault_desc.substring(0, 50)}` : 'Repair work'
            }
          ];
          renderItemsFormAndPreview();
        }
      });
    }

    // Handle preselection passed via window._selectedRepairForInquiry
    if (window._selectedRepairForInquiry) {
      const repId = window._selectedRepairForInquiry;
      window._selectedRepairForInquiry = null;
      if (autofillEl) {
        autofillEl.value = repId;
        autofillEl.dispatchEvent(new Event('change'));
      }
    } else {
      renderItemsFormAndPreview();
    }

    // Input listeners for preview synchronization
    [deptEl, finYearEl, refNoEl, dateEl, vendorNameEl, vendorAddressEl, subjectEl, superscriptedEl, lastDateEl].forEach(input => {
      input?.addEventListener('input', updateLivePreview);
      input?.addEventListener('change', updateLivePreview);
    });

    // Reset button
    document.getElementById('inquiryResetBtn')?.addEventListener('click', () => {
      if (subjectEl) subjectEl.value = 'stationary items for library';
      if (superscriptedEl) superscriptedEl.value = 'Quotation for stationary items for library';
      if (vendorNameEl) vendorNameEl.value = '';
      if (vendorAddressEl) vendorAddressEl.value = '';
      if (refNoEl) refNoEl.value = '';
      inquiryFormItems = [{ item_name: '', qty: '', remarks: '' }];
      renderItemsFormAndPreview();
    });

    // Submit & Download Docx
    document.getElementById('inquiryLetterForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnDownloadInquiryDoc');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = '⏳ Generating Inquiry Letter...';

      const payload = {
        dept_name: deptEl?.value || 'Library',
        fin_year: finYearEl?.value || '2021-22',
        inquiry_no: refNoEl?.value?.trim() || '',
        letter_date: dateEl?.value || '',
        vendor_name: vendorNameEl?.value?.trim() || '',
        vendor_address: vendorAddressEl?.value?.trim() || '',
        quotation_for: subjectEl?.value?.trim() || 'stationary items for library',
        superscribed_text: superscriptedEl?.value?.trim() || `Quotation for ${subjectEl?.value || 'stationary items'}`,
        last_date: lastDateEl?.value || '',
        items: inquiryFormItems.filter(it => it.item_name && it.item_name.trim())
      };

      try {
        await api.downloadDocumentPost('DOC-41', payload);
      } catch (err) {
        alert('Error generating Inquiry Letter: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });

    return;
  }

  // If in Purchase Order & Work Order (DOC-43) tab:
  if (activeRepairsTab === 'doc43') {
    const deptEl = document.getElementById('doc43_dept');
    const finYearEl = document.getElementById('doc43_fin_year');
    const refNoEl = document.getElementById('doc43_ref_no');
    const dateEl = document.getElementById('doc43_date');
    const vendorNameEl = document.getElementById('doc43_vendor_name');
    const vendorAddressEl = document.getElementById('doc43_vendor_address');
    const subjectEl = document.getElementById('doc43_subject');
    const quotationDateEl = document.getElementById('doc43_quotation_date');
    const otherChargesEl = document.getElementById('doc43_other_charges');
    const gstAmountEl = document.getElementById('doc43_gst_amount');
    const grandTotalEl = document.getElementById('doc43_grand_total');
    const totalWordsEl = document.getElementById('doc43_total_words');
    const signatoryEl = document.getElementById('doc43_signatory');
    const autofillEl = document.getElementById('doc43_autofill_eq');
    const itemsContainer = document.getElementById('doc43_items_container');

    const formatDate = (dStr) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dStr;
    };

    const toggleTypeUI = () => {
      const isWorkOrder = activePoType === 'work_order';
      const secWo = document.getElementById('sec_doc43_wo_fields');
      const prevWoSubRef = document.getElementById('prev_doc43_wo_sub_ref');
      if (secWo) secWo.style.display = isWorkOrder ? 'block' : 'none';
      if (prevWoSubRef) prevWoSubRef.style.display = isWorkOrder ? 'block' : 'none';

      document.querySelectorAll('input[name="doc43_type_radio"]').forEach(radio => {
        radio.checked = radio.value === activePoType;
        const parent = radio.closest('label');
        if (parent) {
          parent.style.borderColor = radio.checked ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)';
        }
      });

      renderItemsInputs();
      updateDoc43Preview();
    };

    const renderItemsInputs = () => {
      if (!itemsContainer) return;
      const isWorkOrder = activePoType === 'work_order';

      if (poFormItems.length === 0) {
        poFormItems.push({ item_name: '', unit_rate: '', qty: '', total_amount: '' });
      }

      itemsContainer.innerHTML = poFormItems.map((item, idx) => `
        <div style="background:var(--neutral-850,#1a1a2e);padding:0.6rem;border-radius:4px;border:1px solid var(--neutral-750,#2a2a3e);display:flex;flex-direction:column;gap:0.4rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.75rem;font-weight:700;color:var(--primary-300,#a5b4fc);">#Item ${idx + 1}</span>
            ${poFormItems.length > 1 ? `
              <button type="button" class="btn btn-xs btn-outline-danger" onclick="window.removePoItemRow(${idx})" style="padding:1px 6px;font-size:0.7rem;">✕ Remove</button>
            ` : ''}
          </div>
          <div style="display:grid;grid-template-columns:${isWorkOrder ? '2fr 1fr 1fr' : '2fr 1fr 1fr 1fr'};gap:0.5rem;align-items:center;">
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.7rem;margin-bottom:2px;">${isWorkOrder ? 'Description of repairing' : 'Description / Item Name'}</label>
              <input type="text" class="form-control po-item-name" data-idx="${idx}" value="${item.item_name || ''}" placeholder="${isWorkOrder ? 'e.g. Replacement of Heating Element' : 'e.g. Laboratory Glassware'}" style="font-size:0.8rem;padding:0.35rem 0.5rem;" />
            </div>
            ${!isWorkOrder ? `
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.7rem;margin-bottom:2px;">Unit Rate (₹)</label>
                <input type="number" step="0.01" class="form-control po-item-rate" data-idx="${idx}" value="${item.unit_rate || ''}" placeholder="0.00" style="font-size:0.8rem;padding:0.35rem 0.5rem;" />
              </div>
            ` : ''}
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.7rem;margin-bottom:2px;">Qty</label>
              <input type="text" class="form-control po-item-qty" data-idx="${idx}" value="${item.qty || ''}" placeholder="e.g. 1 or 10 Nos" style="font-size:0.8rem;padding:0.35rem 0.5rem;" />
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.7rem;margin-bottom:2px;">${isWorkOrder ? 'Amount in Rs. (₹)' : 'Total (₹)'}</label>
              <input type="number" step="0.01" class="form-control po-item-total" data-idx="${idx}" value="${item.total_amount || ''}" placeholder="0.00" style="font-size:0.8rem;padding:0.35rem 0.5rem;" />
            </div>
          </div>
        </div>
      `).join('');

      // Bind input events for item inputs
      itemsContainer.querySelectorAll('.po-item-name').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          poFormItems[idx].item_name = e.target.value;
          updateDoc43Preview();
        });
      });

      itemsContainer.querySelectorAll('.po-item-rate').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          poFormItems[idx].unit_rate = e.target.value;
          const qtyNum = parseFloat(poFormItems[idx].qty) || 1;
          const rateNum = parseFloat(e.target.value) || 0;
          if (rateNum > 0) {
            poFormItems[idx].total_amount = (rateNum * qtyNum).toFixed(2);
            const totalInput = itemsContainer.querySelector(`.po-item-total[data-idx="${idx}"]`);
            if (totalInput) totalInput.value = poFormItems[idx].total_amount;
          }
          calculateGrandTotal();
          updateDoc43Preview();
        });
      });

      itemsContainer.querySelectorAll('.po-item-qty').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          poFormItems[idx].qty = e.target.value;
          if (!isWorkOrder) {
            const qtyNum = parseFloat(e.target.value) || 1;
            const rateNum = parseFloat(poFormItems[idx].unit_rate) || 0;
            if (rateNum > 0) {
              poFormItems[idx].total_amount = (rateNum * qtyNum).toFixed(2);
              const totalInput = itemsContainer.querySelector(`.po-item-total[data-idx="${idx}"]`);
              if (totalInput) totalInput.value = poFormItems[idx].total_amount;
            }
          }
          calculateGrandTotal();
          updateDoc43Preview();
        });
      });

      itemsContainer.querySelectorAll('.po-item-total').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          poFormItems[idx].total_amount = e.target.value;
          calculateGrandTotal();
          updateDoc43Preview();
        });
      });
    };

    window.removePoItemRow = (idx) => {
      poFormItems.splice(idx, 1);
      renderItemsInputs();
      calculateGrandTotal();
      updateDoc43Preview();
    };

    document.getElementById('btn_doc43_add_item')?.addEventListener('click', () => {
      poFormItems.push({ item_name: '', unit_rate: '', qty: '', total_amount: '' });
      renderItemsInputs();
      updateDoc43Preview();
    });

    const calculateGrandTotal = () => {
      let itemsSum = 0;
      poFormItems.forEach(item => {
        itemsSum += parseFloat(item.total_amount || 0);
      });
      const other = parseFloat(otherChargesEl?.value || 0);
      const gst = parseFloat(gstAmountEl?.value || 0);
      const grand = itemsSum + other + gst;

      if (grandTotalEl) grandTotalEl.value = grand > 0 ? grand.toFixed(2) : '';
      if (totalWordsEl && grand > 0) {
        totalWordsEl.value = numToEnglishWords(grand);
      }
    };

    const updateDoc43Preview = () => {
      const isWorkOrder = activePoType === 'work_order';
      const dept = deptEl?.value || 'Chemical';
      const finYear = finYearEl?.value || (isWorkOrder ? '2021' : '2021-22');
      const refNo = refNoEl?.value || '101';
      const dateVal = dateEl?.value || '2021-03-15';
      const vendorName = vendorNameEl?.value?.trim() || 'M/s Ashish Scientific Works';
      const vendorAddress = vendorAddressEl?.value?.trim() || 'Ahmedabad';
      const subject = subjectEl?.value?.trim() || 'Heating Mantle';
      const quotationDate = quotationDateEl?.value?.trim() || '10/02/2021';
      const otherCharges = otherChargesEl?.value?.trim() || '';
      const gstAmount = gstAmountEl?.value?.trim() || '';
      const grandTotal = grandTotalEl?.value?.trim() || '0';
      const totalWords = totalWordsEl?.value?.trim() || (grandTotal ? numToEnglishWords(grandTotal) : 'Rupees Zero Only');
      const signatory = signatoryEl?.value?.trim() || 'Principal';

      // Badge
      const badge = document.getElementById('prev_doc43_type_badge');
      if (badge) {
        badge.textContent = isWorkOrder ? 'WORK ORDER (EQUIPMENT REPAIRING)' : 'PURCHASE ORDER (NON-GEM)';
        badge.style.background = isWorkOrder ? '#d1fae5' : '#e0e7ff';
        badge.style.color = isWorkOrder ? '#065f46' : '#3730a3';
      }

      // Reference Line
      const refLine = document.getElementById('prev_doc43_ref_line');
      if (refLine) {
        if (isWorkOrder) {
          refLine.innerHTML = `No. LDCE/<span style="color:#c00000;font-weight:bold;">${dept}</span> /repairing/<span style="font-weight:bold;">${finYear || '2021'}</span>/${refNo}`;
        } else {
          refLine.innerHTML = `No. LDCE/Purchase / <span style="font-weight:bold;">${dept}</span> / <span style="color:#c00000;font-weight:bold;">${finYear}</span>`;
        }
      }

      // Date Line
      const dateLine = document.getElementById('prev_doc43_date_line');
      if (dateLine) {
        const formattedDate = formatDate(dateVal) || ' &nbsp;&nbsp;/&nbsp;&nbsp;/2021';
        dateLine.innerHTML = `${isWorkOrder ? 'Date:' : 'Dated:'} <span>${formattedDate}</span>`;
      }

      // Title
      const titleEl = document.getElementById('prev_doc43_title_disp');
      if (titleEl) {
        titleEl.textContent = isWorkOrder ? 'Work Order' : 'Purchase Order';
      }

      // Vendor
      const vendorDisp = document.getElementById('prev_doc43_vendor_disp');
      if (vendorDisp) {
        vendorDisp.innerHTML = `${vendorName}<br>${vendorAddress.replace(/\n/g, '<br>')}`;
      }

      // WO Sub & Ref
      const woSubRef = document.getElementById('prev_doc43_wo_sub_ref');
      if (woSubRef) {
        woSubRef.style.display = isWorkOrder ? 'block' : 'none';
        const subDisp = document.getElementById('prev_doc43_subject_disp');
        if (subDisp) subDisp.textContent = subject;
        const qDateDisp = document.getElementById('prev_doc43_quotation_date_disp');
        if (qDateDisp) qDateDisp.textContent = quotationDate;
      }

      // Intro
      const introDisp = document.getElementById('prev_doc43_intro_disp');
      if (introDisp) {
        introDisp.textContent = isWorkOrder
          ? 'With reference to your quotation mention above the undersigned is pleased to order out the following.'
          : 'We are pleased to order out the following items for our institute.';
      }

      // Table Generation
      const tableEl = document.getElementById('prev_doc43_table');
      if (tableEl) {
        let rowsHtml = '';
        if (isWorkOrder) {
          // 4-Column Table
          rowsHtml += `
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000;padding:5px 6px;text-align:center;width:55px;">Sr. No.</th>
                <th style="border:1px solid #000;padding:5px 8px;text-align:left;">Description of repairing</th>
                <th style="border:1px solid #000;padding:5px 6px;text-align:center;width:75px;">Qty.</th>
                <th style="border:1px solid #000;padding:5px 8px;text-align:right;width:120px;">Amount in<br>Rs.</th>
              </tr>
            </thead>
            <tbody>
          `;
          const displayItems = poFormItems.length > 0 ? poFormItems : [{ item_name: '', qty: '', total_amount: '' }];
          displayItems.forEach((it, idx) => {
            rowsHtml += `
              <tr>
                <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:top;">${idx + 1}</td>
                <td style="border:1px solid #000;padding:6px;vertical-align:top;">${it.item_name || '&nbsp;'}</td>
                <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:top;">${it.qty || '&nbsp;'}</td>
                <td style="border:1px solid #000;padding:6px;text-align:right;vertical-align:top;">${it.total_amount ? parseFloat(it.total_amount).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
            `;
          });
          rowsHtml += `
              <tr>
                <td colspan="3" style="border:1px solid #000;padding:4px 8px;font-size:0.82rem;">Other charges</td>
                <td style="border:1px solid #000;padding:4px 8px;text-align:right;font-size:0.82rem;">${otherCharges ? parseFloat(otherCharges).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
              <tr>
                <td colspan="3" style="border:1px solid #000;padding:4px 8px;font-size:0.82rem;">GST</td>
                <td style="border:1px solid #000;padding:4px 8px;text-align:right;font-size:0.82rem;">${gstAmount ? parseFloat(gstAmount).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
              <tr>
                <td colspan="3" style="border:1px solid #000;padding:4px 8px;font-size:0.82rem;font-weight:600;">Grand total</td>
                <td style="border:1px solid #000;padding:4px 8px;text-align:right;font-size:0.82rem;font-weight:600;">${grandTotal ? parseFloat(grandTotal).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="3" style="border:1px solid #000;padding:5px 8px;font-weight:bold;">Total Rupees</td>
                <td style="border:1px solid #000;padding:5px 8px;text-align:right;font-weight:bold;">${grandTotal ? parseFloat(grandTotal).toLocaleString('en-IN') : '0'}</td>
              </tr>
            </tbody>
          `;
        } else {
          // 5-Column Table (PO)
          rowsHtml += `
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000;padding:5px 6px;text-align:center;width:50px;">Sr.No.</th>
                <th style="border:1px solid #000;padding:5px 8px;text-align:left;">Description</th>
                <th style="border:1px solid #000;padding:5px 8px;text-align:right;width:95px;">Unit Rate</th>
                <th style="border:1px solid #000;padding:5px 6px;text-align:center;width:65px;">Qty.</th>
                <th style="border:1px solid #000;padding:5px 8px;text-align:right;width:115px;">Total<br>Amount</th>
              </tr>
            </thead>
            <tbody>
          `;
          const displayItems = poFormItems.length > 0 ? poFormItems : [{ item_name: '', unit_rate: '', qty: '', total_amount: '' }];
          displayItems.forEach((it, idx) => {
            rowsHtml += `
              <tr>
                <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:top;">${idx + 1}</td>
                <td style="border:1px solid #000;padding:6px;vertical-align:top;">${it.item_name || '&nbsp;'}</td>
                <td style="border:1px solid #000;padding:6px;text-align:right;vertical-align:top;">${it.unit_rate ? parseFloat(it.unit_rate).toLocaleString('en-IN') : '&nbsp;'}</td>
                <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:top;">${it.qty || '&nbsp;'}</td>
                <td style="border:1px solid #000;padding:6px;text-align:right;vertical-align:top;">${it.total_amount ? parseFloat(it.total_amount).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
            `;
          });
          rowsHtml += `
              <tr>
                <td colspan="4" style="border:1px solid #000;padding:4px 8px;font-size:0.82rem;">Other charges</td>
                <td style="border:1px solid #000;padding:4px 8px;text-align:right;font-size:0.82rem;">${otherCharges ? parseFloat(otherCharges).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
              <tr>
                <td colspan="4" style="border:1px solid #000;padding:4px 8px;font-size:0.82rem;">GST</td>
                <td style="border:1px solid #000;padding:4px 8px;text-align:right;font-size:0.82rem;">${gstAmount ? parseFloat(gstAmount).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
              <tr>
                <td colspan="4" style="border:1px solid #000;padding:4px 8px;font-size:0.82rem;font-weight:600;">Grand total</td>
                <td style="border:1px solid #000;padding:4px 8px;text-align:right;font-size:0.82rem;font-weight:600;">${grandTotal ? parseFloat(grandTotal).toLocaleString('en-IN') : '&nbsp;'}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="4" style="border:1px solid #000;padding:5px 8px;font-weight:bold;">Total Rupees</td>
                <td style="border:1px solid #000;padding:5px 8px;text-align:right;font-weight:bold;">${grandTotal ? parseFloat(grandTotal).toLocaleString('en-IN') : '0'}</td>
              </tr>
            </tbody>
          `;
        }
        tableEl.innerHTML = rowsHtml;
      }

      // Conditions
      const condTitle = document.getElementById('prev_doc43_cond_title');
      const condList = document.getElementById('prev_doc43_cond_list');
      if (condTitle && condList) {
        if (isWorkOrder) {
          condTitle.textContent = 'Conditions:';
          condList.innerHTML = `
            <li>The repairing should be done within <span style="color:#c00000;font-weight:bold;">7 days</span> from the date of this order.</li>
            <li>The parts for repairing should be used of standard quality.</li>
            <li>The bill should be sent in quadruplicate.</li>
            <li>Taxes to be pay as per govt. rules.</li>
            <li>Payment will be done as soon as possible after due scrutiny &amp; Inspection.</li>
            <li>The undersigned reserves the right to cancel the order or reject the one or all items which may be found of inferior quality or not as per our requirement/suitable to machine. Such items will be sent back to you at your cost.</li>
          `;
        } else {
          condTitle.textContent = 'Terms and Conditions:';
          condList.innerHTML = `
            <li>The items should be delivered urgently on receiving this order.</li>
            <li>The items must be as per specifications mentioned above.</li>
            <li>Taxes to be pay as per govt. rules.</li>
            <li>The bill should be sent in quadruplicate.</li>
            <li>Payment will be done as soon as possible after due scrutiny &amp; Inspection.</li>
            <li>The undersigned reserves the right to cancel the order or reject one or all items which may be found of inferior quality or not as per our requirement or not as per specifications. Such items will be sent back to you at your cost.</li>
          `;
        }
      }

      // Signatory
      const signDisp = document.getElementById('prev_doc43_signatory_disp');
      if (signDisp) signDisp.textContent = signatory;
    };

    // Listeners for radio switching
    document.querySelectorAll('input[name="doc43_type_radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        activePoType = e.target.value;
        toggleTypeUI();
      });
    });

    // Sample loaders
    document.getElementById('btn_doc43_sample_po')?.addEventListener('click', () => {
      activePoType = 'purchase_order';
      if (deptEl) deptEl.value = 'Chemical Engineering';
      if (finYearEl) finYearEl.value = '2021-22';
      if (refNoEl) refNoEl.value = '101';
      if (dateEl) dateEl.value = '2021-03-15';
      if (vendorNameEl) vendorNameEl.value = 'M/s Ashish Scientific Works';
      if (vendorAddressEl) vendorAddressEl.value = 'Opp. Kalupur Station, Relief Road, Ahmedabad - 380001';
      poFormItems = [
        { item_name: 'Laboratory Glassware (Beakers 500ml, Pipettes, Burettes)', unit_rate: '250', qty: '10 Nos', total_amount: '2500' },
        { item_name: 'Digital pH Meter Calibration Buffer Solution Kit', unit_rate: '1200', qty: '2 Sets', total_amount: '2400' },
        { item_name: 'Magnetic Stirrer with Hot Plate (2 Liters Capacity)', unit_rate: '3500', qty: '1 No', total_amount: '3500' }
      ];
      if (otherChargesEl) otherChargesEl.value = '150';
      if (gstAmountEl) gstAmountEl.value = '1539';
      toggleTypeUI();
      calculateGrandTotal();
      updateDoc43Preview();
    });

    document.getElementById('btn_doc43_sample_wo')?.addEventListener('click', () => {
      activePoType = 'work_order';
      if (deptEl) deptEl.value = 'Chemical Engineering';
      if (finYearEl) finYearEl.value = '2021';
      if (refNoEl) refNoEl.value = '45';
      if (dateEl) dateEl.value = '2021-02-28';
      if (vendorNameEl) vendorNameEl.value = 'M/s Gujarat Scientific Service';
      if (vendorAddressEl) vendorAddressEl.value = 'Plot No. 12, GIDC Vatva, Ahmedabad - 382445';
      if (subjectEl) subjectEl.value = 'Heating Mantle (2 Liters)';
      if (quotationDateEl) quotationDateEl.value = '15/02/2021';
      poFormItems = [
        { item_name: 'Replacement of Heating Element & Ceramic Insulation', unit_rate: '', qty: '1 No', total_amount: '2200' },
        { item_name: 'Replacement of Energy Regulator & Wiring Servicing', unit_rate: '', qty: '1 No', total_amount: '850' }
      ];
      if (otherChargesEl) otherChargesEl.value = '0';
      if (gstAmountEl) gstAmountEl.value = '549';
      toggleTypeUI();
      calculateGrandTotal();
      updateDoc43Preview();
    });

    // Auto-fill from repair request dropdown
    autofillEl?.addEventListener('change', (e) => {
      const repId = e.target.value;
      if (!repId) return;
      const r = requests.find(item => String(item.id) === String(repId));
      if (!r) return;

      activePoType = 'work_order';
      if (deptEl && r.dept_name) {
        for (let opt of deptEl.options) {
          if (opt.value === r.dept_name || opt.text.includes(r.dept_name)) {
            deptEl.value = opt.value;
            break;
          }
        }
      }
      if (subjectEl) subjectEl.value = r.equipment_name || 'Laboratory Equipment';
      if (refNoEl) refNoEl.value = String(r.id);
      if (dateEl && !dateEl.value) {
        dateEl.value = new Date().toISOString().split('T')[0];
      }
      if (quotationDateEl && !quotationDateEl.value) {
        quotationDateEl.value = formatDate(new Date().toISOString().split('T')[0]);
      }
      if (r.est_repair_cost) {
        const est = parseFloat(r.est_repair_cost);
        poFormItems = [
          {
            item_name: `Complete Servicing, Testing & Repairing of ${r.equipment_name || 'Equipment'} (${r.fault_description || 'Fault repair'})`,
            unit_rate: '',
            qty: '1 Job',
            total_amount: (est * 0.8474).toFixed(2) // Base approx
          }
        ];
        if (gstAmountEl) gstAmountEl.value = (est * 0.1526).toFixed(2);
        if (otherChargesEl) otherChargesEl.value = '0';
      }

      toggleTypeUI();
      calculateGrandTotal();
      updateDoc43Preview();
    });

    // Input listeners for all form controls
    [deptEl, finYearEl, refNoEl, dateEl, vendorNameEl, vendorAddressEl, subjectEl, quotationDateEl, signatoryEl].forEach(el => {
      el?.addEventListener('input', updateDoc43Preview);
      el?.addEventListener('change', updateDoc43Preview);
    });

    [otherChargesEl, gstAmountEl].forEach(el => {
      el?.addEventListener('input', () => {
        calculateGrandTotal();
        updateDoc43Preview();
      });
    });

    grandTotalEl?.addEventListener('input', (e) => {
      if (totalWordsEl && e.target.value) {
        totalWordsEl.value = numToEnglishWords(e.target.value);
      }
      updateDoc43Preview();
    });

    totalWordsEl?.addEventListener('input', updateDoc43Preview);

    // Initial setup
    renderItemsInputs();
    toggleTypeUI();

    // Check pre-selection
    if (window._selectedRepairForDoc43) {
      if (autofillEl) {
        autofillEl.value = window._selectedRepairForDoc43;
        autofillEl.dispatchEvent(new Event('change'));
      }
      window._selectedRepairForDoc43 = null;
    } else {
      // Default to sample work order or sample PO
      if (activePoType === 'work_order') {
        document.getElementById('btn_doc43_sample_wo')?.click();
      } else {
        document.getElementById('btn_doc43_sample_po')?.click();
      }
    }

    // Form submission
    document.getElementById('doc43Form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('doc43SubmitBtn');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = '⏳ Generating DOC-43...';

      const isWorkOrder = activePoType === 'work_order';
      const payload = {
        order_type: activePoType,
        is_work_order: isWorkOrder,
        dept_name: deptEl?.value || 'Chemical',
        department: deptEl?.value || 'Chemical',
        fin_year: finYearEl?.value || (isWorkOrder ? '2021' : '2021-22'),
        year: finYearEl?.value || '2021',
        po_number: refNoEl?.value || '101',
        ref_no: refNoEl?.value || '101',
        order_date: dateEl?.value || '',
        vendor_name: vendorNameEl?.value || 'M/s Ashish Scientific Works',
        vendor_address: vendorAddressEl?.value || '',
        subject: subjectEl?.value || '',
        equipment_name: subjectEl?.value || '',
        quotation_date: quotationDateEl?.value || '',
        items: poFormItems.map((it, idx) => ({
          sr_no: idx + 1,
          item_name: it.item_name || '',
          description: it.item_name || '',
          unit_rate: it.unit_rate || '',
          qty: it.qty || '1',
          total_amount: it.total_amount || ''
        })),
        other_charges: otherChargesEl?.value || '',
        gst_amount: gstAmountEl?.value || '',
        grand_total: grandTotalEl?.value || '0',
        total_amount: grandTotalEl?.value || '0',
        total_words: totalWordsEl?.value || '',
        signatory: signatoryEl?.value || 'Principal'
      };

      try {
        await api.downloadDocumentPost('DOC-43', payload);
      } catch (err) {
        alert('Error generating DOC-43 document: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });

    return;
  }

  // If in Note for Approval (DOC-45) tab:
  if (activeRepairsTab === 'doc45') {
    const deptEl = document.getElementById('doc45_dept');
    const dateEl = document.getElementById('doc45_date');
    const eqNameEl = document.getElementById('doc45_eq_name');
    const costEl = document.getElementById('doc45_cost');
    const costWordsEl = document.getElementById('doc45_cost_words');
    const gemEl = document.getElementById('doc45_gem');
    const reasonEl = document.getElementById('doc45_reason');
    const budgetHeadEl = document.getElementById('doc45_budget_head');
    const otherFundEl = document.getElementById('doc45_other_fund');
    const remarksEl = document.getElementById('doc45_remarks');
    const autofillEl = document.getElementById('doc45_autofill_eq');

    const updateDoc45Preview = () => {
      const deptVal = deptEl?.value || 'Library';
      const prevDept = document.getElementById('prev_doc45_dept');
      if (prevDept) prevDept.textContent = `${deptVal} ડીપાર્ટમેન્ટ`;

      const prevDeptBody = document.getElementById('prev_doc45_dept_body');
      if (prevDeptBody) prevDeptBody.textContent = deptVal;

      const dateVal = dateEl?.value;
      const prevDate = document.getElementById('prev_doc45_date');
      if (prevDate) {
        if (dateVal) {
          const [yyyy, mm, dd] = dateVal.split('-');
          prevDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevDate.textContent = '...................';
        }
      }

      const eqVal = eqNameEl?.value?.trim() || '...................';
      const prevEq = document.getElementById('prev_doc45_eq');
      if (prevEq) prevEq.textContent = eqVal;

      const costNum = parseFloat(costEl?.value || 0);
      const costStr = costNum > 0 ? `₹${costNum.toLocaleString('en-IN')}/-` : '............';
      const prevCost = document.getElementById('prev_doc45_cost');
      if (prevCost) prevCost.textContent = costStr;

      const wordsVal = costWordsEl?.value?.trim() || (costNum > 0 ? numToGujaratiWords(costNum) : '.......................................');
      const prevWords = document.getElementById('prev_doc45_words');
      if (prevWords) prevWords.textContent = wordsVal;

      const gemVal = gemEl?.value || 'ઉપલબ્ધ નથી.';
      const prevGem = document.getElementById('prev_doc45_gem');
      if (prevGem) prevGem.textContent = gemVal;

      const reasonVal = reasonEl?.value?.trim() || '...................................................';
      const prevReason = document.getElementById('prev_doc45_reason');
      if (prevReason) prevReason.textContent = reasonVal;

      const bHead = budgetHeadEl?.value || 'Contingency';
      const headContEl = document.getElementById('prev_doc45_head_cont');
      const headPlaEl = document.getElementById('prev_doc45_head_pla');
      if (headContEl) headContEl.innerHTML = bHead === 'Contingency' ? '☑ Contingency' : '☐ Contingency';
      if (headPlaEl) headPlaEl.innerHTML = bHead === 'PLA' ? '☑ PLA' : '☐ PLA';

      const oFund = otherFundEl?.value?.trim() || '';
      const prevOtherFund = document.getElementById('prev_doc45_other_fund');
      if (prevOtherFund) prevOtherFund.textContent = oFund;

      const remVal = remarksEl?.value?.trim() || '';
      const prevRemarks = document.getElementById('prev_doc45_remarks');
      if (prevRemarks) prevRemarks.textContent = remVal;
    };

    // Auto-fill equipment handler
    const fillDoc45FromEquipment = (reqId) => {
      const selected = requests.find(r => String(r.id) === String(reqId));
      if (!selected) return;

      if (deptEl && selected.dept_name) {
        for (let opt of deptEl.options) {
          if (opt.value === selected.dept_name || opt.text.includes(selected.dept_name)) {
            deptEl.value = opt.value;
            break;
          }
        }
      }
      if (eqNameEl) eqNameEl.value = selected.equipment_name || '';
      if (costEl) costEl.value = selected.est_repair_cost || '';
      if (costWordsEl) costWordsEl.value = numToGujaratiWords(selected.est_repair_cost || 0);
      if (reasonEl) {
        reasonEl.value = selected.fault_desc ? `સાધનમાં ખામી: ${selected.fault_desc} (વિદ્યાર્થીઓનાં પ્રેક્ટિકલ કાર્ય અર્થે)` : 'વિદ્યાર્થીઓનાં શૈક્ષણિક તથા પ્રેક્ટિકલ કાર્ય અર્થે';
      }
      updateDoc45Preview();
    };

    if (autofillEl) {
      autofillEl.addEventListener('change', (e) => {
        fillDoc45FromEquipment(e.target.value);
      });
    }

    // Cost input triggers Gujarati words computation
    costEl?.addEventListener('input', () => {
      const amt = parseFloat(costEl.value || 0);
      if (amt > 0 && costWordsEl) {
        costWordsEl.value = numToGujaratiWords(amt);
      }
      updateDoc45Preview();
    });

    [deptEl, dateEl, eqNameEl, costWordsEl, gemEl, reasonEl, budgetHeadEl, otherFundEl, remarksEl].forEach(input => {
      input?.addEventListener('input', updateDoc45Preview);
      input?.addEventListener('change', updateDoc45Preview);
    });

    document.getElementById('doc45ResetBtn')?.addEventListener('click', () => {
      if (eqNameEl) eqNameEl.value = '';
      if (costEl) costEl.value = '';
      if (costWordsEl) costWordsEl.value = '';
      if (reasonEl) reasonEl.value = 'વિદ્યાર્થીઓનાં શૈક્ષણિક તથા પ્રેક્ટિકલ કાર્ય અર્થે';
      if (otherFundEl) otherFundEl.value = '';
      if (remarksEl) remarksEl.value = '';
      updateDoc45Preview();
    });

    // Handle preselection
    if (window._selectedRepairForDoc45) {
      const repId = window._selectedRepairForDoc45;
      window._selectedRepairForDoc45 = null;
      if (autofillEl) {
        autofillEl.value = repId;
      }
      fillDoc45FromEquipment(repId);
    } else if (requests.length > 0) {
      if (autofillEl) autofillEl.value = requests[0].id;
      fillDoc45FromEquipment(requests[0].id);
    } else {
      updateDoc45Preview();
    }

    // Form Submit / Download
    document.getElementById('doc45Form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnDownloadDoc45');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = '⏳ Generating DOC-45...';

      const payload = {
        dept_name: deptEl?.value || 'Library',
        department: deptEl?.value || 'Library',
        date: dateEl?.value || '',
        approval_date: dateEl?.value || '',
        equipment_name: eqNameEl?.value?.trim() || '',
        item_name: eqNameEl?.value?.trim() || '',
        est_repair_cost: costEl?.value ? parseFloat(costEl.value) : 0,
        est_cost_words: costWordsEl?.value?.trim() || '',
        cost_words: costWordsEl?.value?.trim() || '',
        gem_available: gemEl?.value || 'ઉપલબ્ધ નથી.',
        reason: reasonEl?.value?.trim() || '',
        fault_desc: reasonEl?.value?.trim() || '',
        budget_head: budgetHeadEl?.value || 'Contingency',
        other_fund: otherFundEl?.value?.trim() || '',
        remarks: remarksEl?.value?.trim() || ''
      };

      try {
        await api.downloadDocumentPost('DOC-45', payload);
      } catch (err) {
        alert('Error generating Approval Note: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });

    return;
  }

  // If in Note for Work Order (DOC-46) tab:
  if (activeRepairsTab === 'doc46') {
    const prevPageEl = document.getElementById('doc46_prev_page');
    const deptEl = document.getElementById('doc46_dept');
    const woDateEl = document.getElementById('doc46_wo_date');
    const eqNameEl = document.getElementById('doc46_eq_name');
    const lastDateEl = document.getElementById('doc46_last_date');
    const meetingDateEl = document.getElementById('doc46_meeting_date');
    const l1VendorEl = document.getElementById('doc46_l1_vendor');
    const autofillEl = document.getElementById('doc46_autofill_eq');

    const updateDoc46Preview = () => {
      const pageVal = prevPageEl?.value?.trim() || '૧';
      const prevPage = document.getElementById('prev_doc46_page');
      if (prevPage) prevPage.textContent = pageVal;

      const deptVal = deptEl?.value || 'Library';
      const prevDept = document.getElementById('prev_doc46_dept');
      if (prevDept) prevDept.textContent = `${deptVal} ડીપાર્ટમેન્ટ`;

      const prevDeptBody = document.getElementById('prev_doc46_dept_body');
      if (prevDeptBody) prevDeptBody.textContent = deptVal;

      const dateVal = woDateEl?.value;
      const prevDate = document.getElementById('prev_doc46_date');
      if (prevDate) {
        if (dateVal) {
          const [yyyy, mm, dd] = dateVal.split('-');
          prevDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevDate.textContent = '...................';
        }
      }

      const eqVal = eqNameEl?.value?.trim() || '...................';
      const prevEq = document.getElementById('prev_doc46_eq');
      if (prevEq) prevEq.textContent = eqVal;

      const lastD = lastDateEl?.value;
      const prevLastDate = document.getElementById('prev_doc46_lastdate');
      if (prevLastDate) {
        if (lastD) {
          const [yyyy, mm, dd] = lastD.split('-');
          prevLastDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevLastDate.textContent = '...................';
        }
      }

      const l1Val = l1VendorEl?.value?.trim() || '...........................................';
      const prevL1 = document.getElementById('prev_doc46_l1');
      if (prevL1) prevL1.textContent = l1Val;

      const mtgD = meetingDateEl?.value;
      const prevMtgDate = document.getElementById('prev_doc46_mtgdate');
      if (prevMtgDate) {
        if (mtgD) {
          const [yyyy, mm, dd] = mtgD.split('-');
          prevMtgDate.textContent = `${dd}/${mm}/${yyyy}`;
        } else {
          prevMtgDate.textContent = '...................';
        }
      }
    };

    // Auto-fill equipment handler
    const fillDoc46FromEquipment = (reqId) => {
      const selected = requests.find(r => String(r.id) === String(reqId));
      if (!selected) return;

      if (deptEl && selected.dept_name) {
        for (let opt of deptEl.options) {
          if (opt.value === selected.dept_name || opt.text.includes(selected.dept_name)) {
            deptEl.value = opt.value;
            break;
          }
        }
      }
      if (eqNameEl) eqNameEl.value = selected.equipment_name || '';
      
      // Default dates
      if (lastDateEl && !lastDateEl.value) {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        lastDateEl.value = d.toISOString().split('T')[0];
      }
      if (meetingDateEl && !meetingDateEl.value) {
        const d = new Date();
        d.setDate(d.getDate() - 2);
        meetingDateEl.value = d.toISOString().split('T')[0];
      }
      if (l1VendorEl && !l1VendorEl.value) {
        l1VendorEl.value = 'M/s AKSH Services, Ahmedabad';
      }

      updateDoc46Preview();
    };

    if (autofillEl) {
      autofillEl.addEventListener('change', (e) => {
        fillDoc46FromEquipment(e.target.value);
      });
    }

    [prevPageEl, deptEl, woDateEl, eqNameEl, lastDateEl, meetingDateEl, l1VendorEl].forEach(input => {
      input?.addEventListener('input', updateDoc46Preview);
      input?.addEventListener('change', updateDoc46Preview);
    });

    document.getElementById('doc46ResetBtn')?.addEventListener('click', () => {
      if (prevPageEl) prevPageEl.value = '૧';
      if (eqNameEl) eqNameEl.value = '';
      if (l1VendorEl) l1VendorEl.value = '';
      updateDoc46Preview();
    });

    // Handle preselection
    if (window._selectedRepairForDoc46) {
      const repId = window._selectedRepairForDoc46;
      window._selectedRepairForDoc46 = null;
      if (autofillEl) {
        autofillEl.value = repId;
      }
      fillDoc46FromEquipment(repId);
    } else if (requests.length > 0) {
      if (autofillEl) autofillEl.value = requests[0].id;
      fillDoc46FromEquipment(requests[0].id);
    } else {
      updateDoc46Preview();
    }

    // Form Submit / Download
    document.getElementById('doc46Form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnDownloadDoc46');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = '⏳ Generating DOC-46...';

      const payload = {
        prev_page_no: prevPageEl?.value?.trim() || '૧',
        page_no: prevPageEl?.value?.trim() || '૧',
        dept_name: deptEl?.value || 'Library',
        department: deptEl?.value || 'Library',
        wo_date: woDateEl?.value || '',
        date: woDateEl?.value || '',
        equipment_name: eqNameEl?.value?.trim() || '',
        item_name: eqNameEl?.value?.trim() || '',
        last_date: lastDateEl?.value || '',
        l1_vendor: l1VendorEl?.value?.trim() || '',
        agency_name: l1VendorEl?.value?.trim() || '',
        meeting_date: meetingDateEl?.value || '',
        committee_date: meetingDateEl?.value || ''
      };

      try {
        await api.downloadDocumentPost('DOC-46', payload);
      } catch (err) {
        alert('Error generating Work Order Note: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });

    return;
  }

  // If in Pass for Payment (DOC-47) tab:
  if (activeRepairsTab === 'doc47') {
    const billNoEl = document.getElementById('doc47_bill_no');
    const billDateEl = document.getElementById('doc47_bill_date');
    const partyNameEl = document.getElementById('doc47_party_name');
    const itemDescEl = document.getElementById('doc47_item_desc');
    const poNoEl = document.getElementById('doc47_po_no');
    const poDateEl = document.getElementById('doc47_po_date');
    const deptEl = document.getElementById('doc47_dept');
    const compDateEl = document.getElementById('doc47_comp_date');
    const paymentTypeEl = document.getElementById('doc47_payment_type');
    const budgetHeadEl = document.getElementById('doc47_budget_head');
    const amountEl = document.getElementById('doc47_amount');
    const amountWordsEl = document.getElementById('doc47_amount_words');
    const deductionEl = document.getElementById('doc47_deduction');
    const deptRegNameEl = document.getElementById('doc47_dept_reg_name');
    const deptPageNoEl = document.getElementById('doc47_dept_page_no');
    const deptSrNoEl = document.getElementById('doc47_dept_sr_no');
    const storeRegNoEl = document.getElementById('doc47_store_reg_no');
    const storePageNoEl = document.getElementById('doc47_store_page_no');
    const storeSrNoEl = document.getElementById('doc47_store_sr_no');
    const agencyNameEl = document.getElementById('doc47_agency_name');
    const rrLrNoEl = document.getElementById('doc47_rr_lr_no');
    const rrLrDateEl = document.getElementById('doc47_rr_lr_date');
    const fittedSparesEl = document.getElementById('doc47_fitted_spares');
    const cashBillNoEl = document.getElementById('doc47_cash_bill_no');
    const cashBillDateEl = document.getElementById('doc47_cash_bill_date');
    const cashAmountEl = document.getElementById('doc47_cash_amount');
    const cashRecipientEl = document.getElementById('doc47_cash_recipient');
    const autofillEl = document.getElementById('doc47_autofill_eq');

    const formatDate = (dStr) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dStr;
    };

    const toggleTypeUI = () => {
      const isNonGeM = activePassForPaymentType === 'non_gem';
      const grpComp = document.getElementById('grp_comp_date');
      const grpDeduct = document.getElementById('grp_deduction');
      const secNonGeM = document.getElementById('sec_non_gem_registers');
      const secRepair = document.getElementById('sec_repair_specifics');
      const compRow = document.getElementById('prev_doc47_comp_row');

      if (grpComp) grpComp.style.display = isNonGeM ? 'none' : '';
      if (grpDeduct) grpDeduct.style.display = isNonGeM ? '' : 'none';
      if (secNonGeM) secNonGeM.style.display = isNonGeM ? '' : 'none';
      if (secRepair) secRepair.style.display = isNonGeM ? 'none' : '';
      if (compRow) compRow.style.display = isNonGeM ? 'none' : '';

      document.querySelectorAll('input[name="doc47_type_radio"]').forEach(radio => {
        radio.checked = radio.value === activePassForPaymentType;
        const parent = radio.closest('label');
        if (parent) {
          parent.style.borderColor = radio.checked ? 'var(--primary-500,#6366f1)' : 'var(--neutral-700,#444)';
        }
      });

      updateDoc47Preview();
    };

    const updateDoc47Preview = () => {
      const isNonGeM = activePassForPaymentType === 'non_gem';

      // Badge
      const badge = document.getElementById('prev_doc47_type_badge');
      if (badge) {
        badge.textContent = isNonGeM ? 'NON-GEM PURCHASE' : 'EQUIPMENT REPAIRING';
        badge.style.color = isNonGeM ? '#2563eb' : '#059669';
      }

      // 1. Bill no & date & item & party
      const bNo = billNoEl?.value?.trim() || '16707';
      const bDate = formatDate(billDateEl?.value) || '10/02/2021';
      const itDesc = itemDescEl?.value?.trim() || 'Sanitizer, Qty: 19 Bottles (500 ml each)';
      const pName = partyNameEl?.value?.trim() || 'Chandkheda Medical Store, Ahmedabad';

      const prevBNo = document.getElementById('prev_doc47_bill_no');
      if (prevBNo) prevBNo.textContent = bNo;
      const prevBDate = document.getElementById('prev_doc47_bill_date');
      if (prevBDate) prevBDate.textContent = bDate;
      const prevItDesc = document.getElementById('prev_doc47_item_desc');
      if (prevItDesc) prevItDesc.textContent = itDesc;
      const prevPName = document.getElementById('prev_doc47_party_name');
      if (prevPName) prevPName.textContent = pName;

      // 2. PO No & Date
      const poLabel = document.getElementById('prev_doc47_po_label');
      if (poLabel) poLabel.textContent = isNonGeM ? 'A.T. No./Purchase Order No.' : 'A.T. / Order No.';
      const poNo = poNoEl?.value?.trim() || 'LDCE/Store/Covid-19/sanitizer';
      const poDate = formatDate(poDateEl?.value) || '09/02/2021';
      const prevPoNo = document.getElementById('prev_doc47_po_no');
      if (prevPoNo) prevPoNo.textContent = poNo;
      const prevPoDate = document.getElementById('prev_doc47_po_date');
      if (prevPoDate) prevPoDate.textContent = poDate;

      // 3. Comp date (repair only)
      const prevCompDate = document.getElementById('prev_doc47_comp_date');
      if (prevCompDate) prevCompDate.textContent = formatDate(compDateEl?.value) || '05/02/2021';

      // Values for points
      const dept = deptEl?.value || 'Department';
      const payType = paymentTypeEl?.value || 'Full';
      const bHead = budgetHeadEl?.value?.trim() || 'Gymkhana';
      const amtNum = parseFloat(amountEl?.value || 0);
      const amtStr = amtNum > 0 ? amtNum.toLocaleString('en-IN') : '0';
      const amtWords = amountWordsEl?.value?.trim() || (amtNum > 0 ? numToEnglishWords(amtNum) : 'Rupees Zero Only');
      const deduct = deductionEl?.value?.trim() || 'NIL';
      const deptReg = deptRegNameEl?.value?.trim() || 'Deadstock / Stationary';
      const deptPg = deptPageNoEl?.value?.trim() || '12';
      const deptSr = deptSrNoEl?.value?.trim() || '05';
      const storeReg = storeRegNoEl?.value?.trim() || '03';
      const storePg = storePageNoEl?.value?.trim() || '45';
      const storeSr = storeSrNoEl?.value?.trim() || '18';

      const agency = agencyNameEl?.value?.trim() || '____________________';
      const rrLr = rrLrNoEl?.value?.trim() || '________';
      const rrLrDate = formatDate(rrLrDateEl?.value) || '________';
      const spares = fittedSparesEl?.value?.trim() || '____________________';
      const cashBill = cashBillNoEl?.value?.trim() || '---';
      const cashDate = formatDate(cashBillDateEl?.value) || '---';
      const cashAmt = cashAmountEl?.value ? `Rs. ${parseFloat(cashAmountEl.value).toLocaleString('en-IN')}` : 'Rs. ____';
      const cashRecip = cashRecipientEl?.value?.trim() || '________';

      // Numbered Points Container
      const pointsContainer = document.getElementById('prev_doc47_points_container');
      if (pointsContainer) {
        if (isNonGeM) {
          pointsContainer.innerHTML = `
            <div style="margin-bottom:4px;">1. The procurement has been made according to the Gujarat Govt. G.R.S., norms and guidelines.</div>
            <div style="margin-bottom:4px;">2. The procurement has been made according to policies and procedures of Govt. of Gujarat.</div>
            <div style="margin-bottom:4px;">3. Certified that the material received is/are inspected, found satisfactory working condition and in accordance with the specifications of A.T (Purchase order)</div>
            <div style="margin-bottom:4px;">4. The bill is checked, verified and found correct.</div>
            <div style="margin-bottom:4px;">5. Certified the charges of GST,Insurance,Fright,Packing and forwarding etc. are admissible.</div>
            <div style="margin-bottom:4px;line-height:1.6;">6. Certified that the all materials of this bill have been correctly entered in <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${dept}</span> department <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${deptReg}</span> register on page no <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${deptPg}</span> at Sr No <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${deptSr}</span>.</div>
            <div style="margin-bottom:4px;">7. This is <strong>${payType}</strong> / Part payment.</div>
            <div style="margin-bottom:4px;">8. The amount relating to the above said bill passed as below has not been passed before.</div>
            <div style="margin-bottom:4px;">9. The budget head is <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${bHead}</span></div>
            <div style="margin-bottom:4px;">10. Certified that the amount deducted from the above bill is <span style="color:#dc2626;font-weight:700;">${deduct}</span></div>
            <div style="margin-bottom:4px;font-size:0.96rem;">11. Recommended for payment of <strong style="color:#dc2626;">Rs.${amtStr}/- (${amtWords})</strong></div>
          `;
        } else {
          pointsContainer.innerHTML = `
            <div style="margin-bottom:4px;">1. &nbsp;This is a laboring/ loading/ unloading/ carting/ service/ repairing/ printing charge of <span style="color:#dc2626;font-weight:700;">Laboratory Equipment Repairing and Maintenance of ${dept} Dept.</span></div>
            <div style="margin-bottom:4px;">2. &nbsp;The purchase process of Laboratory Equipment Repairing and Maintenance of ${dept} Dept. has been made according to the Gujarat Govt. G.R.S., norms and guidelines.</div>
            <div style="margin-bottom:4px;">3. &nbsp;The purchase process of laboring/ loading/ unloading/ carting/ service/ repairing/ printing has been made according to policies and procedures of Govt. of Gujarat.</div>
            <div style="margin-bottom:4px;">4. &nbsp;This is a cash receipt for clearing the parcel from M/S. <span style="text-decoration:underline;">${agency}</span>. The parcel has been cleared RR/LR No. <span style="text-decoration:underline;">${rrLr}</span> Date <span style="text-decoration:underline;">${rrLrDate}</span></div>
            <div style="margin-bottom:4px;">5. &nbsp;The spares are fitted in <span style="text-decoration:underline;">${spares}</span> and work has been done satisfactory.</div>
            <div style="margin-bottom:4px;">6. &nbsp;The above work has been done satisfactory as per our order and permission was taken form the Principal</div>
            <div style="margin-bottom:4px;">7. &nbsp;Items included in this bill are approved by the Principal</div>
            <div style="margin-bottom:4px;">8. &nbsp;The amount of cash memo/Bill No. <span style="text-decoration:underline;">${cashBill}</span> date <span style="text-decoration:underline;">${cashDate}</span> of <span style="text-decoration:underline;">${cashAmt}</span> has been paid cash and hence same may be given to <span style="text-decoration:underline;">${cashRecip}</span></div>
            <div style="margin-bottom:4px;">9. &nbsp;The rate seems to be reasonable.</div>
            <div style="margin-bottom:4px;">10. This is <strong>${payType}</strong> / Part /Remaining payment.</div>
            <div style="margin-bottom:4px;">11. The amount relating to the above said bill passed as below has not been passed before.</div>
            <div style="margin-bottom:4px;">12. The budget head is <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${bHead}</span></div>
            <div style="margin-top:6px;margin-bottom:4px;font-size:0.96rem;padding-left:1.5rem;">Recommended for payment of <strong style="color:#dc2626;">Rs.${amtStr}/- (${amtWords})</strong></div>
          `;
        }
      }

      // Department Signatures
      const deptSigsContainer = document.getElementById('prev_doc47_dept_sigs_container');
      if (deptSigsContainer) {
        if (isNonGeM) {
          deptSigsContainer.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:0.92rem;font-weight:700;color:#000;line-height:1.3;">
              <div>Lab Assi / Office Clerk</div>
              <div style="text-align:center;">Lab Incharge / Office In charge</div>
              <div style="text-align:right;">
                <div>Head of the Dept.</div>
                <div style="margin-top:0.75rem;">Officer in Charge</div>
                <div>Admin Officer</div>
              </div>
            </div>
          `;
        } else {
          deptSigsContainer.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:0.9rem;font-weight:700;color:#000;line-height:1.3;">
              <div>Lab Assi /Office clerk</div>
              <div style="text-align:center;">Lab /Office in charge</div>
              <div style="text-align:center;">Store Officer</div>
              <div style="text-align:right;">
                <div>Head of Department</div>
                <div>Officer in charge</div>
                <div>Admin Officer</div>
              </div>
            </div>
          `;
        }
      }

      // Bottom Container: Store + Account (Non-GeM) OR Office Use (Repair)
      const bottomContainer = document.getElementById('prev_doc47_bottom_container');
      if (bottomContainer) {
        if (isNonGeM) {
          bottomContainer.innerHTML = `
            <!-- For Store use only -->
            <div style="font-size:0.95rem;margin-bottom:1rem;color:#000;">
              <div style="margin-bottom:0.75rem;">(For Store use only)</div>
              <div style="line-height:1.6;">
                Entered in General purchase Register No.<span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${storeReg}</span> on page No. <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${storePg}</span> at Sr No. <span style="border-bottom:1px dotted #dc2626;color:#dc2626;font-weight:700;padding:0 4px;">${storeSr}</span>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.92rem;font-weight:700;margin-top:2.5rem;margin-bottom:1.5rem;color:#000;">
              <div>Store Keeper</div>
              <div>Store Officer</div>
            </div>

            <!-- DASHED SEPARATOR LINE -->
            <div style="border-top:1.5px dashed #000;margin:1.5rem 0;"></div>

            <!-- For Account use only -->
            <div style="font-size:0.95rem;margin-bottom:1rem;color:#000;">
              <div style="margin-bottom:0.75rem;">(For Account use only)</div>
              <div>
                Passed for payment of <strong style="color:#dc2626;">Rs.${amtStr}/- (${amtWords})</strong>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;font-size:0.95rem;font-weight:700;margin-top:3rem;margin-bottom:0.5rem;color:#000;">
              <div>Account Officer</div>
              <div>Principal</div>
            </div>
          `;
        } else {
          bottomContainer.innerHTML = `
            <!-- (FOR OFFICE USE) -->
            <div style="text-align:center;font-weight:700;text-decoration:underline;font-size:1.05rem;margin-bottom:1.5rem;color:#000;">
              (FOR OFFICE USE)
            </div>
            <div style="font-size:0.95rem;margin-bottom:2.5rem;color:#000;">
              Passed for payment of <strong style="color:#dc2626;">Rs. ${amtStr}/- (${amtWords})</strong>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;font-size:0.95rem;font-weight:700;margin-top:3rem;margin-bottom:0.5rem;color:#000;">
              <div>Account Officer.</div>
              <div>Principal</div>
            </div>
          `;
        }
      }
    };

    // Radios change listener
    document.querySelectorAll('input[name="doc47_type_radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        activePassForPaymentType = e.target.value;
        toggleTypeUI();
      });
    });

    // Quick fill Sanitizer Purchase example
    document.getElementById('btnLoadSanitizerExample')?.addEventListener('click', () => {
      activePassForPaymentType = 'non_gem';
      if (billNoEl) billNoEl.value = '16707';
      if (billDateEl) billDateEl.value = '2021-02-10';
      if (partyNameEl) partyNameEl.value = 'Chandkheda Medical Store, Ahmedabad';
      if (itemDescEl) itemDescEl.value = 'Sanitizer, Qty: 19 Bottles (500 ml each)';
      if (poNoEl) poNoEl.value = 'LDCE/Store/Covid-19/sanitizer';
      if (poDateEl) poDateEl.value = '2021-02-09';
      if (budgetHeadEl) budgetHeadEl.value = 'Gymkhana';
      if (amountEl) amountEl.value = '3750';
      if (amountWordsEl) amountWordsEl.value = 'Rupees Three Thousand Seven Hundred Fifty Only';
      if (deductionEl) deductionEl.value = 'NIL';
      if (deptRegNameEl) deptRegNameEl.value = 'Deadstock / Stationary';
      if (deptPageNoEl) deptPageNoEl.value = '12';
      if (deptSrNoEl) deptSrNoEl.value = '05';
      if (storeRegNoEl) storeRegNoEl.value = '03';
      if (storePageNoEl) storePageNoEl.value = '45';
      if (storeSrNoEl) storeSrNoEl.value = '18';
      toggleTypeUI();
    });

    // Quick fill Copier Repair example
    document.getElementById('btnLoadRepairPassExample')?.addEventListener('click', () => {
      activePassForPaymentType = 'repair';
      if (billNoEl) billNoEl.value = '554';
      if (billDateEl) billDateEl.value = '2026-08-25';
      if (partyNameEl) partyNameEl.value = 'AKSH Services, Ahmedabad';
      if (itemDescEl) itemDescEl.value = 'Canon IR 2002 Copier machine';
      if (poNoEl) poNoEl.value = 'LDCE/Store/Repair/2026/104';
      if (poDateEl) poDateEl.value = '2026-08-15';
      if (compDateEl) compDateEl.value = '2026-08-10';
      if (budgetHeadEl) budgetHeadEl.value = 'Gymkhana / Contingency';
      if (amountEl) amountEl.value = '2950';
      if (amountWordsEl) amountWordsEl.value = 'Rupees Two Thousand Nine Hundred Fifty Only';
      toggleTypeUI();
    });

    // Auto-fill from repair equipment
    const fillDoc47FromEquipment = (reqId) => {
      const selected = requests.find(r => String(r.id) === String(reqId));
      if (!selected) return;

      activePassForPaymentType = 'repair';
      if (deptEl && selected.dept_name) {
        for (let opt of deptEl.options) {
          if (opt.value === selected.dept_name || opt.text.includes(selected.dept_name)) {
            deptEl.value = opt.value;
            break;
          }
        }
      }
      if (itemDescEl) itemDescEl.value = selected.equipment_name || '';
      if (poNoEl) poNoEl.value = `LDCE/Store/Repair/${new Date().getFullYear()}/${selected.id}`;
      if (poDateEl) poDateEl.value = new Date().toISOString().split('T')[0];
      if (partyNameEl) partyNameEl.value = 'M/s AKSH Services, Ahmedabad';
      if (amountEl) amountEl.value = selected.est_repair_cost || 2950;
      if (amountWordsEl) amountWordsEl.value = numToEnglishWords(selected.est_repair_cost || 2950);
      toggleTypeUI();
    };

    if (autofillEl) {
      autofillEl.addEventListener('change', (e) => {
        fillDoc47FromEquipment(e.target.value);
      });
    }

    // Input listeners for preview synchronization
    amountEl?.addEventListener('input', () => {
      const amt = parseFloat(amountEl.value || 0);
      if (amt > 0 && amountWordsEl) {
        amountWordsEl.value = numToEnglishWords(amt);
      }
      updateDoc47Preview();
    });

    [
      billNoEl, billDateEl, partyNameEl, itemDescEl, poNoEl, poDateEl, deptEl, compDateEl,
      paymentTypeEl, budgetHeadEl, amountWordsEl, deductionEl, deptRegNameEl, deptPageNoEl,
      deptSrNoEl, storeRegNoEl, storePageNoEl, storeSrNoEl, agencyNameEl, rrLrNoEl,
      rrLrDateEl, fittedSparesEl, cashBillNoEl, cashBillDateEl, cashAmountEl, cashRecipientEl
    ].forEach(input => {
      input?.addEventListener('input', updateDoc47Preview);
      input?.addEventListener('change', updateDoc47Preview);
    });

    document.getElementById('doc47ResetBtn')?.addEventListener('click', () => {
      if (billNoEl) billNoEl.value = '';
      if (partyNameEl) partyNameEl.value = '';
      if (itemDescEl) itemDescEl.value = '';
      if (poNoEl) poNoEl.value = '';
      if (amountEl) amountEl.value = '';
      if (amountWordsEl) amountWordsEl.value = '';
      updateDoc47Preview();
    });

    // Handle preselection
    if (window._selectedRepairForDoc47) {
      const repId = window._selectedRepairForDoc47;
      window._selectedRepairForDoc47 = null;
      if (autofillEl) autofillEl.value = repId;
      fillDoc47FromEquipment(repId);
    } else {
      toggleTypeUI();
    }

    // Form Submit / Download
    document.getElementById('doc47Form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnDownloadDoc47');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ Generating DOC-47...';

      const amtNum = parseFloat(amountEl?.value || 0);
      const payload = {
        pass_type: activePassForPaymentType,
        type: activePassForPaymentType,
        bill_no: billNoEl?.value?.trim() || '',
        bill_date: billDateEl?.value || '',
        item_desc: itemDescEl?.value?.trim() || '',
        equipment_name: itemDescEl?.value?.trim() || '',
        party_name: partyNameEl?.value?.trim() || '',
        po_no: poNoEl?.value?.trim() || '',
        po_date: poDateEl?.value || '',
        order_no: poNoEl?.value?.trim() || '',
        order_date: poDateEl?.value || '',
        comp_date: compDateEl?.value || '',
        dept_name: deptEl?.value || 'Department',
        department: deptEl?.value || 'Department',
        payment_type: paymentTypeEl?.value || 'Full',
        budget_head: budgetHeadEl?.value?.trim() || 'Gymkhana',
        amount: amtNum,
        amount_in_words: amountWordsEl?.value?.trim() || numToEnglishWords(amtNum),
        deduction: deductionEl?.value?.trim() || 'NIL',
        dept_register_name: deptRegNameEl?.value?.trim() || '',
        dept_page_no: deptPageNoEl?.value?.trim() || '',
        dept_sr_no: deptSrNoEl?.value?.trim() || '',
        store_reg_no: storeRegNoEl?.value?.trim() || '',
        store_page_no: storePageNoEl?.value?.trim() || '',
        store_sr_no: storeSrNoEl?.value?.trim() || '',
        agency_name: agencyNameEl?.value?.trim() || '',
        rr_lr_no: rrLrNoEl?.value?.trim() || '',
        rr_lr_date: rrLrDateEl?.value || '',
        fitted_eq: fittedSparesEl?.value?.trim() || '',
        cash_bill_no: cashBillNoEl?.value?.trim() || '',
        cash_bill_date: cashBillDateEl?.value || '',
        cash_amount: cashAmountEl?.value ? parseFloat(cashAmountEl.value) : '',
        cash_recipient: cashRecipientEl?.value?.trim() || ''
      };

      try {
        await api.downloadDocumentPost('DOC-47', payload);
      } catch (err) {
        alert('Error generating Pass for Payment Certificate: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });

    return;
  }

  // Register Tab Events
  const prevRepairedEl = document.getElementById('repairPrevRepaired');
  const grpDate = document.getElementById('grpLastRepairDate');
  const grpAmt = document.getElementById('grpLastRepairAmount');
  if (prevRepairedEl) {
    const togglePrevFields = () => {
      const show = prevRepairedEl.value === 'Yes';
      if (grpDate) grpDate.style.display = show ? '' : 'none';
      if (grpAmt) grpAmt.style.display = show ? '' : 'none';
    };
    togglePrevFields();
    prevRepairedEl.addEventListener('change', togglePrevFields);
  }

  document.getElementById('repairResetBtn')?.addEventListener('click', () => {
    setTimeout(() => {
      if (grpDate) grpDate.style.display = 'none';
      if (grpAmt) grpAmt.style.display = 'none';
    }, 50);
  });

  document.getElementById('repairForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prevRepaired = document.getElementById('repairPrevRepaired')?.value === 'Yes';
    const payload = {
      dept_id: document.getElementById('repairDept')?.value,
      equipment_name: document.getElementById('repairName')?.value.trim(),
      purchase_date: document.getElementById('repairPurchaseDate')?.value,
      original_cost: document.getElementById('repairCost')?.value,
      breakdown_date: document.getElementById('repairDate')?.value,
      prev_repaired: prevRepaired,
      last_repair_date: prevRepaired ? (document.getElementById('repairLastRepairDate')?.value || null) : null,
      last_repair_amount: prevRepaired ? (document.getElementById('repairLastRepairAmount')?.value || null) : null,
      market_value: document.getElementById('repairMarketValue')?.value,
      est_repair_cost: document.getElementById('repairEst')?.value,
      fault_desc: document.getElementById('repairDesc')?.value.trim(),
      last_repair_info: prevRepaired
        ? `Dt: ${document.getElementById('repairLastRepairDate')?.value || '-'}, Amt: ₹${document.getElementById('repairLastRepairAmount')?.value || '0'}`
        : ''
    };
    try {
      await api.createRepair(payload);
      alert('Equipment registered in Repair Register! You can now generate an Inquiry Letter (DOC-41).');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

// App Initialization
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// ----------------------------------------------------
// 11. DOCUMENT CENTRE
// ----------------------------------------------------

function renderTemplatesView() {
  const templates = [
    { path: '2.Intitiating process/Check list- A while initiate process.docx', name: 'Check list A — Before Initiating GeM Bid', docId: 'DOC-19' },
    { path: '2.Intitiating process/Format-Specifications Sheet.docx', name: 'Format — Specifications Sheet', docId: 'DOC-14' },
    { path: '2.Intitiating process/Format-Terms and conditions.docx', name: 'Format — Terms and Conditions (ATC)', docId: 'DOC-15' },
    { path: '2.Intitiating process/General guidelines & Common ATC for bid.docx', name: 'General Guidelines & Common ATC for Bid', docId: 'DOC-16' },
    { path: '2.Intitiating process/Indent for Purchase format_Govt. Fund.docx', name: 'Purchase Indent (Govt. Fund)', docId: 'DOC-12' },
    { path: '2.Intitiating process/Indent for Purchase format_Non Govt. fund.docx', name: 'Purchase Indent (Non Govt. Fund)', docId: 'DOC-13' },
    { path: '2.Intitiating process/Note for Purchase-New Item-2026-27.docx', name: 'Note for Purchase — New Item (Gujarati)', docId: 'DOC-17' },
    { path: '2.Intitiating process/Note for Purchase-Other items.docx', name: 'Note for Purchase — Other Items', docId: 'DOC-18' },
    { path: '2a. Account docs/Format-EMD-return.docx', name: 'Format — EMD Return Letter', docId: 'DOC-21' },
    { path: '2a. Account docs/EMD letter-2025-26.docx', name: 'EMD Mail-Merge Letter (2025-26)', docId: null },
    { path: '2a. Account docs/Notes-SD-Submission in Account.docx', name: 'Note — SD Submission in Account (Gujarati)', docId: 'DOC-22' },
    { path: '2a. Account docs/LDCE-Bid EMD_e-PBG details-2025-26.xlsx', name: 'LDCE-Bid EMD & e-PBG Details Register (.xlsx)', docId: null },
  ];

  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Raw Document Templates (Phase 2)</h3>
        <a href="#/documents" class="btn btn-primary btn-sm">Open Document Centre →</a>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${templates.map(t => `
              <tr>
                <td><strong>${t.name}</strong><br><small>${t.path}</small></td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="window.downloadTemplate('${t.path}')">
                    Fill & Download
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDocumentsView({ indents = [], bids = [], meetings = [], orders = [], vouchers = [], repairs = [], fi = [] } = {}) {
  // Option builders
  const indentOpts = indents.length
    ? indents.map(i => `<option value="${i.id}">#${i.id} – ${(i.item_name || '').substring(0, 40)} [${i.dept_code || i.dept_name || ''}]</option>`).join('')
    : '<option value="">— No Indents Found —</option>';
  const bidOpts = bids.length
    ? bids.map(b => `<option value="${b.id}">#${b.id} – ${b.bid_no || ''}</option>`).join('')
    : '<option value="">— No Bids Found —</option>';
  const dlpcMeetings = meetings.filter(m => (m.committee_type || '').toUpperCase() === 'DLPC');
  const dpcMeetings = meetings.filter(m => (m.committee_type || '').toUpperCase() === 'DPC');

  const dlpcMeetingOpts = dlpcMeetings.length
    ? dlpcMeetings.map(m => `<option value="${m.id}">#${m.id} – ${m.committee_type || 'DLPC'} | ${m.meeting_ref || ''}</option>`).join('')
    : '<option value="">— No DLPC Meetings Found —</option>';

  const dpcMeetingOpts = dpcMeetings.length
    ? dpcMeetings.map(m => `<option value="${m.id}">#${m.id} – ${m.committee_type || 'DPC'} | ${m.meeting_ref || ''}</option>`).join('')
    : '<option value="">— No DPC Meetings Found —</option>';

  const meetingOpts = meetings.length
    ? meetings.map(m => `<option value="${m.id}">#${m.id} – ${m.committee_type || ''} | ${m.meeting_ref || ''}</option>`).join('')
    : '<option value="">— No Meetings Found —</option>';
  const orderOpts = orders.length
    ? orders.map(o => `<option value="${o.id}">#${o.id} – ${o.order_no || ''} | ${(o.item_name || '').substring(0, 30)}</option>`).join('')
    : '<option value="">— No Orders Found —</option>';
  const voucherOpts = vouchers.length
    ? vouchers.map(v => `<option value="${v.id}">#${v.id} – ${v.voucher_no || ''}</option>`).join('')
    : '<option value="">— No Vouchers Found —</option>';
  const repairOpts = repairs.length
    ? repairs.map(r => `<option value="${r.id}">#${r.id} – ${(r.equipment_name || '').substring(0, 35)} [${r.dept_name || ''}]</option>`).join('')
    : '<option value="">— No Repairs Found —</option>';
  const fiOpts = fi.length
    ? fi.map(f => `<option value="${f.id}">#${f.id} – ${f.vendor_name || ''} | ${f.dd_number || ''}</option>`).join('')
    : '<option value="">— No EMD Records Found —</option>';

  function phaseCard(phaseNum, phaseName, phaseColor, docs) {
    return `
      <div class="card" style="border-left: 4px solid ${phaseColor}; margin-bottom:1.5rem;">
        <div class="card-header" style="background:${phaseColor}18;">
          <h3 class="card-title" style="color:${phaseColor}">
            <span style="background:${phaseColor};color:#fff;padding:2px 10px;border-radius:20px;font-size:0.8rem;margin-right:8px;">Phase ${phaseNum}</span>
            ${phaseName}
          </h3>
          <span class="badge" style="color:${phaseColor};background:${phaseColor}20;">${docs.length} document${docs.length > 1 ? 's' : ''}</span>
        </div>
        <div style="padding:1rem;">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:0.75rem;">
            ${docs.map(d => docCard(d, phaseColor)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function docCard({ docId, name, selector, note, isEditable: customEditable }) {
    const isDualFormat = ['DOC-01', 'DOC-02', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-06', 'DOC-07', 'DOC-34'].includes(docId);
    const isEditable = customEditable || ['DOC-25', 'DOC-25A', 'DOC-32', 'DOC-36', 'DOC-37', 'DOC-38', 'DOC-39', 'DOC-41', 'DOC-42'].includes(docId);

    let actionBtns = '';
    if (isDualFormat) {
      actionBtns = `
        <div style="display:flex;gap:0.4rem;margin-top:0.5rem;">
          <button
            class="btn btn-primary btn-sm doc-download-btn"
            style="flex:1;justify-content:center;font-size:0.78rem;padding:6px 8px;"
            data-doc="${docId}"
            data-format="xlsx"
            onclick="window.downloadDocFromCentre('${docId}', 'xlsx')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Excel (.xlsx)
          </button>
          <button
            class="btn btn-secondary btn-sm doc-download-btn"
            style="flex:1;justify-content:center;font-size:0.78rem;padding:6px 8px;"
            data-doc="${docId}"
            data-format="docx"
            onclick="window.downloadDocFromCentre('${docId}', 'docx')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Word (.docx)
          </button>
        </div>
      `;
    } else if (isEditable) {
      actionBtns = `
        <div style="display:flex;gap:0.4rem;margin-top:0.5rem;">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            style="flex:1;justify-content:center;font-size:0.78rem;padding:6px 8px;border-color:var(--accent-primary,#6366f1);color:var(--accent-primary,#6366f1);font-weight:600;"
            onclick="window.openDocEditor('${docId}')"
            title="Open Interactive Editor & Customizer">
            📝 Fill &amp; Edit
          </button>
          <button
            class="btn btn-primary btn-sm doc-download-btn"
            style="flex:1;justify-content:center;font-size:0.78rem;padding:6px 8px;"
            data-doc="${docId}"
            onclick="window.downloadDocFromCentre('${docId}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Word (.docx)
          </button>
        </div>
      `;
    } else {
      actionBtns = `
        <button
          class="btn btn-primary btn-sm doc-download-btn"
          style="width:100%;justify-content:center;margin-top:0.5rem;"
          data-doc="${docId}"
          onclick="window.downloadDocFromCentre('${docId}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Document (.docx)
        </button>
      `;
    }

    return `
      <div class="doc-card" id="card-${docId}" style="border:1px solid var(--neutral-700,#333);border-radius:8px;padding:1rem;background:var(--neutral-850,#1a1a2e);display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.4rem;">
            <div style="font-size:0.95rem;font-weight:700;color:var(--neutral-100,#fff);line-height:1.35;">${name}</div>
            <span id="status-${docId}" style="font-size:0.75rem;font-weight:600;"></span>
          </div>
          ${note ? `<div style="font-size:0.78rem;color:var(--neutral-400,#999);margin-bottom:0.75rem;">${note}</div>` : ''}
          ${selector ? `<div style="margin-bottom:0.75rem;">${selector}</div>` : ''}
        </div>
        ${actionBtns}
      </div>
    `;
  }

  function sel(id, opts, label) {
    return `<select id="${id}" class="form-control" style="font-size:0.8rem;padding:5px 8px;background:var(--neutral-800,#111);color:var(--neutral-100,#eee);border:1px solid var(--neutral-600,#444);border-radius:5px;width:100%;" title="${label}">${opts}</select>`;
  }
  function yearSel(id) {
    return `<select id="${id}" class="form-control" style="font-size:0.8rem;padding:5px 8px;background:var(--neutral-800,#111);color:var(--neutral-100,#eee);border:1px solid var(--neutral-600,#444);border-radius:5px;width:100%;"><option value="2026-27">2026-27</option><option value="2025-26">2025-26</option></select>`;
  }

  return `
    <style>
      .doc-download-btn:disabled { opacity:0.5;cursor:not-allowed; }
      .doc-download-btn.loading { background:var(--neutral-600,#444)!important; }
    </style>

    <div style="margin-bottom:1.5rem;">
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;">
          <div style="font-size:0.85rem;color:var(--neutral-400,#888);">All 47 official procurement documents — generated live from your database data. Click any Download button to get the filled document.</div>
        </div>
        <a href="#/templates" class="btn btn-secondary btn-sm">Raw Blank Templates →</a>
      </div>
    </div>

    ${phaseCard(1, 'Committee & Governance Setup', '#8B5CF6', [
    { docId: 'DOC-08', name: 'Office Order – Dept. Representatives', note: 'Lists 2 reps per department for 2026-27', selector: yearSel('yr-08') },
    { docId: 'DOC-09', name: 'Office Order – Expert Committees', note: 'Discipline-wise expert panel orders', selector: yearSel('yr-09') },
    { docId: 'DOC-10', name: 'Office Order – Special Committees (DLPC/DPC)', note: 'Select committee type', selector: `<select id="ct-10" class="form-control" style="font-size:0.8rem;padding:5px;background:var(--neutral-800);color:var(--neutral-100);border:1px solid var(--neutral-600);border-radius:5px;width:100%;"><option value="DLPC">DLPC</option><option value="DPC">DPC</option><option value="WriteOff">Write-off Committee</option></select>` },
    { docId: 'DOC-11', name: 'Note for Change in Committee / Representatives', note: 'Fills generic change note' },
  ])}

    ${phaseCard(2, 'Annual CTE Demand Statements', '#0EA5E9', [
    { docId: 'DOC-01', name: 'Statement 1 – Non-IT Equipment', selector: yearSel('yr-01') },
    { docId: 'DOC-02', name: 'Statement 2 – IT Equipment', selector: yearSel('yr-02') },
    { docId: 'DOC-03', name: 'Statement 3 – Furniture', selector: yearSel('yr-03') },
    { docId: 'DOC-04', name: 'Statement 4 – Books & Periodicals', selector: yearSel('yr-04') },
    { docId: 'DOC-05', name: 'Statement 5 – Maintenance & AMC', selector: yearSel('yr-05') },
    { docId: 'DOC-06', name: 'Summary of IT Items (All Depts)', selector: yearSel('yr-06') },
    { docId: 'DOC-07', name: 'CTE Consolidated Summary', selector: yearSel('yr-07') },
  ])}

    ${phaseCard(3, 'Purchase Indent, Specs, ATC & Note Sheet', '#10B981', [
    { docId: 'DOC-12', name: 'Purchase Indent – Govt. Fund', note: 'Select the indent', selector: sel('ind-12', indentOpts, 'Select Indent') },
    { docId: 'DOC-13', name: 'Purchase Indent – Non-Govt. Fund', note: 'Select the indent', selector: sel('ind-13', indentOpts, 'Select Indent') },
    { docId: 'DOC-14', name: 'Specification Sheet', note: 'Select the indent', selector: sel('ind-14', indentOpts, 'Select Indent') },
    { docId: 'DOC-15', name: 'Additional Terms & Conditions (ATC)', note: 'Select the indent', selector: sel('ind-15', indentOpts, 'Select Indent') },
    { docId: 'DOC-16', name: 'General GeM Guidelines Sheet', note: 'Standard guidelines' },
    { docId: 'DOC-17', name: 'Note for Purchase – New Item (Gujarati)', note: 'Select the indent', selector: sel('ind-17', indentOpts, 'Select Indent') },
    { docId: 'DOC-18', name: 'Note for Purchase – Other Items', note: 'Select the indent', selector: sel('ind-18', indentOpts, 'Select Indent') },
    { docId: 'DOC-19', name: 'Checklist A – Before Initiating GeM Bid', note: 'Select the indent', selector: sel('ind-19', indentOpts, 'Select Indent') },
    { docId: 'DOC-20', name: 'Checklist C – Before Publishing Custom Bid/BOQ', note: 'Select the indent', selector: sel('ind-20', indentOpts, 'Select Indent') },
  ])}

    ${phaseCard(4, 'EMD & Security Deposit (e-PBG) Ledger', '#F59E0B', [
    { docId: 'DOC-21', name: 'EMD Refund Letter to Unsuccessful Bidder', note: 'Select the EMD/e-PBG record', selector: sel('fi-21', fiOpts, 'Select EMD Record') },
    { docId: 'DOC-22', name: 'Note for Security Deposit Submission to Accounts', note: 'Select the EMD/e-PBG record', selector: sel('fi-22', fiOpts, 'Select EMD Record') },
  ])}

    ${phaseCard(5, 'Technical Scrutiny & Committee Approval', '#EF4444', [
    { docId: 'DOC-23', name: 'Bid Scrutiny Report (Evaluation Matrix)', note: 'Select the bid', selector: sel('bid-23', bidOpts, 'Select Bid') },
    { docId: 'DOC-24', name: 'Reasons for Disqualification Sheet', note: 'Select the bid', selector: sel('bid-24', bidOpts, 'Select Bid') },
    { docId: 'DOC-25', name: 'DLPC Agenda & Proposal (3-Page Checklist Format)', note: 'Select the DLPC meeting', selector: sel('mtg-25', dlpcMeetingOpts, 'Select DLPC Meeting') },
    { docId: 'DOC-25A', name: 'GeM Agenda Format – DLPC (9-Point Official Table)', note: 'Select the DLPC meeting', selector: sel('mtg-25a', dlpcMeetingOpts, 'Select DLPC Meeting') },
    { docId: 'DOC-26', name: 'Certificate for reasonability of rate (DLPC & DPC)', note: 'Select the committee meeting', selector: sel('mtg-26', meetingOpts, 'Select Meeting') },
    { docId: 'DOC-27', name: 'DLPC Minutes of Meeting (MOM)', note: 'Select the DLPC meeting', selector: sel('mtg-27', dlpcMeetingOpts, 'Select DLPC Meeting') },
    { docId: 'DOC-28', name: 'Checklist B – Final Approval Package', note: 'Select the DLPC meeting', selector: sel('mtg-28', dlpcMeetingOpts, 'Select DLPC Meeting') },
    { docId: 'DOC-29', name: 'Note – Direct Purchase Against Bid (DLPC)', note: 'Select the DLPC meeting', selector: sel('mtg-29', dlpcMeetingOpts, 'Select DLPC Meeting') },
    { docId: 'DOC-30', name: 'DPC Proposal Document Index', note: 'Select the DPC meeting', selector: sel('mtg-30', dpcMeetingOpts, 'Select DPC Meeting') },
    { docId: 'DOC-31', name: 'DPC Forwarding Letter to Directorate', note: 'Select the DPC meeting', selector: sel('mtg-31', dpcMeetingOpts, 'Select DPC Meeting') },
    { docId: 'DOC-32', name: 'GeM Agenda Format – DPC', note: 'Select the DPC meeting', selector: sel('mtg-32', dpcMeetingOpts, 'Select DPC Meeting') },
    { docId: 'DOC-33', name: 'Institute BID Certificate', note: 'Select the DPC meeting', selector: sel('mtg-33', dpcMeetingOpts, 'Select DPC Meeting') },
    { docId: 'DOC-34', name: 'L1 INFO Sheet for DPC', note: 'Select the DPC meeting', selector: sel('mtg-34', dpcMeetingOpts, 'Select DPC Meeting') },
  ])}

    ${phaseCard(6, 'Goods Delivery, Inspection & Bill Passing', '#06B6D4', [
    { docId: 'DOC-36', name: 'Department Material Receipt Note', note: 'Select the purchase order', selector: sel('ord-36', orderOpts, 'Select Purchase Order') },
    { docId: 'DOC-37', name: 'Technical Inspection Report', note: 'Select the voucher', selector: sel('vch-37', voucherOpts, 'Select Voucher') },
    { docId: 'DOC-38', name: 'Pass for Payment Voucher', note: 'Select the voucher', selector: sel('vch-38', voucherOpts, 'Select Voucher') },
    { docId: 'DOC-39', name: 'Checklist D & E – Bill Verification', note: 'Select the voucher', selector: sel('vch-39', voucherOpts, 'Select Voucher') },
    { docId: 'DOC-40', name: 'Procurement Progress Status Report', note: 'Financial year', selector: yearSel('yr-40') },
  ])}

    ${phaseCard(7, 'Non-GeM, Services & Equipment Repairs', '#84CC16', [
    { docId: 'DOC-41', name: 'Inquiry Letter (Non-GeM Local Purchase)', note: 'Select the indent', selector: sel('ind-41', indentOpts, 'Select Indent') },
    { docId: 'DOC-42', name: 'Comparative Statement (Govt/Non-Govt Fund)', note: 'Official rate comparison with 7-member committee', selector: `<select id="fund-42" class="form-control" style="font-size:0.8rem;padding:0.35rem 0.5rem;"><option value="Govt Fund">🏛️ Govt Fund</option><option value="Non-Govt Fund">🏢 Non-Govt Fund</option></select>`, isEditable: true },
    { docId: 'DOC-43', name: 'Purchase Order & Work Order (Non-GeM / Repairs)', note: 'Generate official Purchase Order or Work Order on letterhead', selector: sel('ord-43', orderOpts, 'Select Purchase Order'), isEditable: true },
    { docId: 'DOC-44', name: 'Repairable Equipment Register', note: 'All repairs included automatically' },
    { docId: 'DOC-45', name: 'Note for Approval of Repairing', note: 'Select the repair request', selector: sel('rep-45', repairOpts, 'Select Repair Request'), isEditable: true },
    { docId: 'DOC-46', name: 'Work Order (WO – Repairing)', note: 'Select the repair request', selector: sel('rep-46', repairOpts, 'Select Repair Request'), isEditable: true },
    { docId: 'DOC-47', name: 'Pass for Payment (Non-GeM & Repair)', note: 'Certificate to be given along with bills (Non-GeM Purchase & Equipment Repairing)', selector: sel('rep-47', repairOpts, 'Select Repair Request'), isEditable: true },
  ])}
  `;
}

// Entity ID resolution for each doc
const DOC_ENTITY_MAP = {
  'DOC-01': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-01')?.value || '2026-27' } }),
  'DOC-02': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-02')?.value || '2026-27' } }),
  'DOC-03': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-03')?.value || '2026-27' } }),
  'DOC-04': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-04')?.value || '2026-27' } }),
  'DOC-05': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-05')?.value || '2026-27' } }),
  'DOC-06': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-06')?.value || '2026-27' } }),
  'DOC-07': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-07')?.value || '2026-27' } }),
  'DOC-08': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-08')?.value || '2026-27' } }),
  'DOC-09': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-09')?.value || '2026-27' } }),
  'DOC-10': () => ({ entityId: null, extra: { fin_year: '2026-27', committee_type: document.getElementById('ct-10')?.value || 'DLPC' } }),
  'DOC-11': () => ({ entityId: null, extra: {} }),
  'DOC-12': () => ({ entityId: document.getElementById('ind-12')?.value }),
  'DOC-13': () => ({ entityId: document.getElementById('ind-13')?.value }),
  'DOC-14': () => ({ entityId: document.getElementById('ind-14')?.value }),
  'DOC-15': () => ({ entityId: document.getElementById('ind-15')?.value }),
  'DOC-16': () => ({ entityId: null, extra: {} }),
  'DOC-17': () => ({ entityId: document.getElementById('ind-17')?.value }),
  'DOC-18': () => ({ entityId: document.getElementById('ind-18')?.value }),
  'DOC-19': () => ({ entityId: document.getElementById('ind-19')?.value }),
  'DOC-20': () => ({ entityId: document.getElementById('ind-20')?.value }),
  'DOC-21': () => ({ entityId: document.getElementById('fi-21')?.value }),
  'DOC-22': () => ({ entityId: document.getElementById('fi-22')?.value }),
  'DOC-23': () => ({ entityId: document.getElementById('bid-23')?.value }),
  'DOC-24': () => ({ entityId: document.getElementById('bid-24')?.value }),
  'DOC-25': () => ({ entityId: document.getElementById('mtg-25')?.value }),
  'DOC-25A': () => ({ entityId: document.getElementById('mtg-25a')?.value }),
  'DOC-26': () => ({ entityId: document.getElementById('mtg-26')?.value }),
  'DOC-27': () => ({ entityId: document.getElementById('mtg-27')?.value }),
  'DOC-28': () => ({ entityId: document.getElementById('mtg-28')?.value }),
  'DOC-29': () => ({ entityId: document.getElementById('mtg-29')?.value }),
  'DOC-30': () => ({ entityId: document.getElementById('mtg-30')?.value }),
  'DOC-31': () => ({ entityId: document.getElementById('mtg-31')?.value }),
  'DOC-32': () => ({ entityId: document.getElementById('mtg-32')?.value }),
  'DOC-33': () => ({ entityId: document.getElementById('mtg-33')?.value }),
  'DOC-34': () => ({ entityId: document.getElementById('mtg-34')?.value }),
  'DOC-36': () => ({ entityId: document.getElementById('ord-36')?.value }),
  'DOC-37': () => ({ entityId: document.getElementById('vch-37')?.value }),
  'DOC-38': () => ({ entityId: document.getElementById('vch-38')?.value }),
  'DOC-39': () => ({ entityId: document.getElementById('vch-39')?.value }),
  'DOC-40': () => ({ entityId: null, extra: { fin_year: document.getElementById('yr-40')?.value || '2026-27' } }),
  'DOC-41': () => ({ entityId: document.getElementById('ind-41')?.value }),
  'DOC-42': () => ({ entityId: null, extra: { fund_type: document.getElementById('fund-42')?.value || 'Govt Fund' } }),
  'DOC-43': () => ({ entityId: document.getElementById('ord-43')?.value }),
  'DOC-44': () => ({ entityId: null, extra: {} }),
  'DOC-45': () => ({ entityId: document.getElementById('rep-45')?.value }),
  'DOC-46': () => ({ entityId: document.getElementById('rep-46')?.value }),
  'DOC-47': () => ({ entityId: document.getElementById('rep-47')?.value, extra: {} }),
};

window.downloadDocFromCentre = async function (docId, format = null) {
  const btn = document.querySelector(`[data-doc="${docId}"]${format ? `[data-format="${format}"]` : ''}`) || document.querySelector(`[data-doc="${docId}"]`);
  const statusEl = document.getElementById(`status-${docId}`);
  if (!DOC_ENTITY_MAP[docId]) return;

  const { entityId, extra = {} } = DOC_ENTITY_MAP[docId]();
  if (format) {
    extra.format = format;
  }

  // Validate that required entity is selected
  if (entityId !== null && entityId !== undefined && !entityId) {
    if (statusEl) { statusEl.textContent = '⚠ Select a record first'; statusEl.style.color = '#F59E0B'; }
    return;
  }

  const origHtml = btn ? btn.innerHTML : null;
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }
  if (statusEl) { statusEl.textContent = 'Generating...'; statusEl.style.color = '#6C63FF'; }

  try {
    await api.downloadDocument(docId, entityId, extra);
    if (statusEl) { statusEl.textContent = '✓ Downloaded'; statusEl.style.color = '#10B981'; }
  } catch (err) {
    if (statusEl) { statusEl.textContent = '✗ Error: ' + err.message.substring(0, 40); statusEl.style.color = '#EF4444'; }
    console.error(`[${docId}] Download error:`, err);
  } finally {
    if (btn) {
      btn.disabled = false;
      if (origHtml) {
        btn.innerHTML = origHtml;
      } else {
        const isXlsx = format === 'xlsx' || (!format && docId === 'DOC-01');
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download ${isXlsx ? '.xlsx' : '.docx'}`;
      }
    }
  }
};

window.openDocEditor = function (docId) {
  if (['DOC-25', 'DOC-25A', 'DOC-26', 'DOC-27', 'DOC-28', 'DOC-29', 'DOC-30', 'DOC-31', 'DOC-32', 'DOC-33', 'DOC-34'].includes(docId)) {
    let selectEl = null;
    if (docId === 'DOC-25') selectEl = document.getElementById('mtg-25');
    else if (docId === 'DOC-25A') selectEl = document.getElementById('mtg-25a');
    else if (docId === 'DOC-32') selectEl = document.getElementById('mtg-32');
    else selectEl = document.getElementById(`mtg-${docId.replace('DOC-', '').toLowerCase()}`);

    const meetingId = selectEl?.value || '';
    window._targetMeetingId = meetingId;
    window._targetDocId = docId;
    window.location.hash = `#/committee${meetingId ? `?meetingId=${meetingId}&docId=${docId}` : ''}`;
  } else if (['DOC-23', 'DOC-24'].includes(docId)) {
    window.location.hash = '#/scrutiny';
  } else if (['DOC-01', 'DOC-02', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-06', 'DOC-07'].includes(docId)) {
    window.location.hash = '#/cte';
  } else if (['DOC-12', 'DOC-13', 'DOC-14', 'DOC-15', 'DOC-19', 'DOC-20'].includes(docId)) {
    window.location.hash = '#/indents';
  } else if (['DOC-17', 'DOC-18'].includes(docId)) {
    window.location.hash = '#/notes';
  } else if (['DOC-21', 'DOC-22'].includes(docId)) {
    window.location.hash = '#/financial';
  } else if (['DOC-36', 'DOC-37', 'DOC-38', 'DOC-39'].includes(docId)) {
    window.location.hash = '#/delivery';
  } else if (docId === 'DOC-42') {
    window._targetRepairsTab = 'comp';
    window.location.hash = '#/repairs?tab=comp';
  } else if (docId === 'DOC-43') {
    window._targetRepairsTab = 'doc43';
    window.location.hash = '#/repairs?tab=doc43';
  } else if (docId === 'DOC-45') {
    const selectEl = document.getElementById('rep-45');
    const repairId = selectEl?.value || '';
    window._selectedRepairForDoc45 = repairId;
    window._targetRepairsTab = 'doc45';
    window.location.hash = `#/repairs?tab=doc45${repairId ? `&repairId=${repairId}` : ''}`;
  } else if (docId === 'DOC-46') {
    const selectEl = document.getElementById('rep-46');
    const repairId = selectEl?.value || '';
    window._selectedRepairForDoc46 = repairId;
    window._targetRepairsTab = 'doc46';
    window.location.hash = `#/repairs?tab=doc46${repairId ? `&repairId=${repairId}` : ''}`;
  } else if (docId === 'DOC-47') {
    const selectEl = document.getElementById('rep-47');
    const repairId = selectEl?.value || '';
    window._selectedRepairForDoc47 = repairId;
    window._targetRepairsTab = 'doc47';
    window.location.hash = `#/repairs?tab=doc47${repairId ? `&repairId=${repairId}` : ''}`;
  } else if (docId === 'DOC-41') {
    const selectEl = document.getElementById('ind-41');
    const indentId = selectEl?.value || '';
    if (indentId) window._selectedRepairForInquiry = indentId;
    window._targetRepairsTab = 'inquiry';
    window.location.hash = '#/repairs?tab=inquiry';
  }
};

function bindDocumentsEvents() {
  // Event listeners handled via window.downloadDocFromCentre & window.openDocEditor
}


