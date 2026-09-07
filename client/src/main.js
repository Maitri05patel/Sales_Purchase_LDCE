import { api } from './api.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

window.handleDownloadDoc = async (docId, entityId, extra = {}) => {
  try {
    await api.downloadDocument(docId, entityId, extra);
  } catch (err) {
    alert('Error downloading document: ' + err.message);
  }
};

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

window.downloadTemplate = async (templatePath) => {
  try {
    await api.downloadTemplate(templatePath);
  } catch (err) {
    alert('Error downloading template: ' + err.message);
  }
};

// Current authenticated user state (from JWT login)
let currentUser = api.getStoredUser();
let currentRole = currentUser?.role || 'Principal';

const ROLES = [
  'Principal',
  'StoreOfficer',
  'HOD',
  'DeptRep',
  'ExpertMember',
  'AccountsOfficer',
  'DLPCMember'
];

// Demo credentials shown on login page with rich role metadata
const DEMO_CREDENTIALS = [
  { role: 'Principal / Director', name: 'Dr. C. H. Vithalani', email: 'principal@ldce.ac.in', dept: 'Head of Institution', badge: 'Executive Authority', color: '#1e40af' },
  { role: 'Store Officer', name: 'Prof. M. B. Patel', email: 'store@ldce.ac.in', dept: 'Central Store Section', badge: 'Procurement Incharge', color: '#b45309' },
  { role: 'Head of Department', name: 'Dr. D. A. Parikh', email: 'hod@ldce.ac.in', dept: 'Computer Eng. Dept', badge: 'Demand & Approval', color: '#047857' },
  { role: 'Dept. Representative', name: 'Prof. T. J. Raval', email: 'deptrep@ldce.ac.in', dept: 'Applied Mechanics Dept', badge: 'Indent & Verification', color: '#c2410c' },
  { role: 'Expert Committee', name: 'Prof. N. K. Patel', email: 'expert@ldce.ac.in', dept: 'Electrical / IT Committee', badge: 'Technical Scrutiny', color: '#b91c1c' },
  { role: 'Accounts Officer', name: 'Shri K. R. Vyas', email: 'accounts@ldce.ac.in', dept: 'Accounts & Finance Branch', badge: 'Financial Sanction', color: '#0f766e' },
  { role: 'DLPC / DPC Member', name: 'Prof. S. M. Desai', email: 'dlpc@ldce.ac.in', dept: 'Central Purchase Body', badge: 'Committee Member', color: '#6d28d9' },
];

// Primary default landing route tailored to each role
const ROLE_HOME_ROUTES = {
  Principal: 'dashboard',
  StoreOfficer: 'dashboard',
  HOD: 'indents',
  DeptRep: 'indents',
  ExpertMember: 'scrutiny',
  AccountsOfficer: 'financial',
  DLPCMember: 'committee'
};

function getRoleHomeRoute(role) {
  return ROLE_HOME_ROUTES[role] || 'indents';
}

// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) ENGINE
// Only strictly relevant sections are visible for each role.
// Irrelevant sections are completely removed ('hidden') from navigation.
// ============================================================
const ROLE_PERMISSIONS = {
  Principal: {
    dashboard: 'view',
    masters:   'view',
    cte:       'approve',
    indents:   'approve',
    notes:     'approve',
    financial: 'manage',
    scrutiny:  'view',
    committee: 'approve',
    delivery:  'view',
    repairs:   'view',
    templates: 'view',
    documents: 'view',
  },
  StoreOfficer: {
    dashboard: 'view',
    masters:   'manage',
    cte:       'view',
    indents:   'create',
    notes:     'create',
    financial: 'manage',
    scrutiny:  'create',
    committee: 'create',
    delivery:  'manage',
    repairs:   'manage',
    templates: 'view',
    documents: 'manage',
  },
  HOD: {
    dashboard: 'view',
    masters:   'create',
    cte:       'create',
    indents:   'create',
    notes:     'approve',
    financial: 'hidden',
    scrutiny:  'approve',
    committee: 'view',
    delivery:  'approve',
    repairs:   'hidden',
    templates: 'view',
    documents: 'view',
  },
  DeptRep: {
    dashboard: 'view',
    masters:   'view',
    cte:       'create',
    indents:   'create',
    notes:     'create',
    financial: 'hidden',
    scrutiny:  'view',
    committee: 'hidden',
    delivery:  'create',
    repairs:   'hidden',
    templates: 'view',
    documents: 'view',
  },
  ExpertMember: {
    dashboard: 'hidden',
    masters:   'view',
    cte:       'view',
    indents:   'create',
    notes:     'hidden',
    financial: 'hidden',
    scrutiny:  'create',
    committee: 'view',
    delivery:  'create',
    repairs:   'hidden',
    templates: 'view',
    documents: 'view',
  },
  AccountsOfficer: {
    dashboard: 'view',
    masters:   'view',
    cte:       'hidden',
    indents:   'hidden',
    notes:     'view',
    financial: 'manage',
    scrutiny:  'hidden',
    committee: 'view',
    delivery:  'manage',
    repairs:   'hidden',
    templates: 'view',
    documents: 'view',
  },
  DLPCMember: {
    dashboard: 'view',
    masters:   'hidden',
    cte:       'hidden',
    indents:   'hidden',
    notes:     'hidden',
    financial: 'hidden',
    scrutiny:  'view',
    committee: 'approve',
    delivery:  'hidden',
    repairs:   'hidden',
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
    hidden:  'No Access',
    view:    'Read Only',
    create:  'Create & Submit',
    approve: 'Review & Approve',
    manage:  'Full Access'
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
      <span>Viewing as <strong>${roleLabel}</strong> &mdash; ${label}. You can view data but cannot modify records.</span>
    </div>`;
  }
  if (level === 'approve') {
    return `<div class="access-banner access-banner-approve">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
      <span>Signed in as <strong>${roleLabel}</strong> &mdash; ${label}. You can review records and approve or sign.</span>
    </div>`;
  }
  if (level === 'manage') {
    return `<div class="access-banner access-banner-manage">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <span>Signed in as <strong>${roleLabel}</strong> &mdash; ${label}. You have full operational control over this module.</span>
    </div>`;
  }
  // 'create'
  return `<div class="access-banner access-banner-create">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
    <span>Signed in as <strong>${roleLabel}</strong> &mdash; ${label}. You can draft and submit new records for approval.</span>
  </div>`;
}

// Nav Items Data (route, label, icon SVG, section)
const NAV_ITEMS = [
  { section: 'Overview', items: [
    { route: 'dashboard', label: 'Dashboard', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
    { route: 'masters', label: 'Departments', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-5h6v5"/></svg>' },
  ]},
  { section: 'Procurement', items: [
    { route: 'cte', label: 'CTE Demands', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13H8"/><path d="M16 17H8"/><path d="M16 13h-2"/></svg>' },
    { route: 'indents', label: 'Purchase Indents', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>' },
    { route: 'notes', label: 'Note Sheets', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>' },
    { route: 'financial', label: 'EMD & e-PBG Ledger', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>' },
  ]},
  { section: 'Evaluation', items: [
    { route: 'scrutiny', label: 'Technical Scrutiny', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' },
    { route: 'committee', label: 'DLPC / DPC Sanctions', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  ]},
  { section: 'Post-Order', items: [
    { route: 'delivery', label: 'Inspection & Vouchers', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>' },
    { route: 'repairs', label: 'Equipment Repairs', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>' },
  ]},

  { section: 'Documents', items: [
    { route: 'documents', label: 'Document Centre', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>' },
    { route: 'templates', label: 'Raw Templates', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  ]},
];

function getDeliveryLabel(role) {
  if (role === 'ExpertMember') return 'Technical Inspection';
  if (role === 'DeptRep' || role === 'HOD') return 'Material Receipt & Inspection';
  if (role === 'AccountsOfficer') return 'Payment Vouchers';
  return 'Inspection & Vouchers';
}

function renderSidebarNav(activeRoute) {
  return NAV_ITEMS.map(section => {
    const visibleItems = section.items.filter(item => canAccess(item.route));
    if (visibleItems.length === 0) return '';
    return `
      <div class="nav-section-label">${section.section}</div>
      ${visibleItems.map(item => {
        const label = (item.route === 'delivery') ? getDeliveryLabel(currentRole) : item.label;
        return `
          <a href="#/${item.route}" class="nav-item ${activeRoute === item.route ? 'active' : ''}">
            ${item.icon}
            <span>${label}</span>
          </a>
        `;
      }).join('')}
    `;
  }).join('');
}

function renderAppShell(contentHtml, activeRoute = 'dashboard') {
  const user = currentUser || {};
  const homeRoute = getRoleHomeRoute(currentRole);
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="#/${homeRoute}" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none;">
          <div class="institution-logo">LD</div>
          <div class="institution-title">
            <h2>Store &amp; Purchase</h2>
            <p>L.D. College of Engineering</p>
          </div>
        </a>
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
        <div class="user-profile-container">
          <div class="user-profile-badge">
            <div class="user-avatar">${(user.name || 'U').charAt(0)}</div>
            <div class="user-info">
              <span class="user-name">${user.name || 'User'}</span>
              <span class="user-role-label">${formatRoleName(user.role || 'Unknown')}</span>
            </div>
          </div>
          <button id="logoutBtn" class="btn-logout" title="Sign Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
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
  if (route === 'delivery') {
    return getDeliveryLabel(currentRole);
  }
  const titles = {
    dashboard:  'Executive Dashboard',
    masters:    'Departments & Governance',
    cte:        'Annual CTE Demand Entry',
    indents:    'Purchase Indents & Specifications',
    notes:      'Gujarati Administrative Note Sheets',
    financial:  'EMD & Security Deposit Ledger',
    scrutiny:   'Technical Scrutiny Matrix',
    committee:  'DLPC / DPC Sanctions',
    delivery:   'Inspection & Payment Vouchers',
    repairs:    'Equipment Repair Requests',
    documents:  'Document Centre — All 47 Documents',
    templates:  'Raw Document Templates'
  };
  return titles[route] || 'Store & Purchase Management System';
}

// ============================================================
// LOGIN PAGE VIEW (Executive Enterprise Two-Panel Portal)
// ============================================================
function renderLoginPage() {
  return `
    <div class="login-page-wrapper">
      <!-- Left Panel: Institutional Showcase -->
      <div class="login-brand-panel">
        <div class="brand-panel-content">
          <div class="brand-header">
            <div class="brand-seal">
              <span class="seal-letter">LD</span>
            </div>
            <div class="brand-institution">
              <h2>L.D. College of Engineering</h2>
              <p class="brand-sub">Ahmedabad &bull; Established 1948 &bull; Govt. of Gujarat</p>
            </div>
          </div>

          <div class="brand-hero">
            <div class="brand-tag">
              <span class="pulse-dot"></span>
              <span>Autonomous Govt. Engineering College</span>
            </div>
            <h1 class="brand-title">Store &amp; Purchase Management System</h1>
            <p class="brand-desc">
              Integrated institutional procurement platform automating the end-to-end lifecycle—from annual CTE demand aggregation and GeM pre-bid note sheets to committee sanctions and final payment vouchers.
            </p>
          </div>

          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div class="feature-text">
                <strong>Gujarat Procurement Policy 2024 Compliant</strong>
                <span>Rigorous DLPC (&le; ₹5 Lakhs) &amp; DPC (&gt; ₹5 Lakhs) committee governance</span>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <div class="feature-text">
                <strong>GeM Portal Workflow Integration</strong>
                <span>Automatic Gujarati note sheets, ATC generation &amp; EMD/e-PBG ledger tracking</span>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="feature-text">
                <strong>Role-Based Access &amp; Audit Trail</strong>
                <span>Strict physical &amp; digital approval chains with zero unauthorized data leak</span>
              </div>
            </div>
          </div>

          <div class="brand-footer">
            <span>&copy; 2026 Store &amp; Purchase Section, L.D. College of Engineering</span>
            <span class="badge-pill">Version 2.4.0</span>
          </div>
        </div>
      </div>

      <!-- Right Panel: Authentication & Persona Selector -->
      <div class="login-auth-panel">
        <div class="auth-panel-inner">
          <div class="auth-header">
            <span class="auth-category">Sign In Portal</span>
            <h2>Institutional Authentication</h2>
            <p>Enter your institutional email or select an authorized persona below.</p>
          </div>

          <!-- Login Form -->
          <form id="loginForm" class="auth-form">
            <div class="form-field">
              <label for="loginEmail">Email Address</label>
              <div class="input-with-icon">
                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input type="email" id="loginEmail" placeholder="e.g. principal@ldce.ac.in" required autocomplete="email" />
              </div>
            </div>

            <div class="form-field">
              <div class="field-label-row">
                <label for="loginPassword">Password</label>
                <span class="field-hint">Default: <code>ldce@2026</code></span>
              </div>
              <div class="input-with-icon">
                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" id="loginPassword" placeholder="••••••••" required autocomplete="current-password" />
              </div>
            </div>

            <div id="loginError" class="auth-error-banner" style="display:none;"></div>

            <button type="submit" class="auth-submit-btn" id="loginSubmitBtn">
              <span>Sign In to System</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>

          <!-- Quick Persona Selection -->
          <div class="persona-section">
            <div class="persona-header">
              <div class="persona-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Select Role Persona (1-Click Fill)</span>
              </div>
              <span class="persona-hint">Click any role to test authorization</span>
            </div>

            <div class="persona-grid">
              ${DEMO_CREDENTIALS.map(c => `
                <div class="persona-card" data-email="${c.email}" style="--accent-border: ${c.color}">
                  <div class="persona-avatar" style="background: ${c.color}">
                    ${c.name.split(' ').map(n => n[0]).filter(ch => ch !== '.').slice(0, 2).join('')}
                  </div>
                  <div class="persona-meta">
                    <div class="persona-role-row">
                      <span class="persona-role">${c.role}</span>
                      <span class="persona-tag">${c.badge}</span>
                    </div>
                    <span class="persona-name">${c.name}</span>
                    <span class="persona-email">${c.email}</span>
                  </div>
                  <div class="persona-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Router & Controller
async function router() {
  // Sync currentUser/currentRole from stored auth
  currentUser = api.getStoredUser();
  currentRole = currentUser?.role || 'Principal';
  const roleDefault = getRoleHomeRoute(currentRole);

  const hash = window.location.hash || '#/' + roleDefault;
  const cleanHash = hash.split('?')[0];
  let route = cleanHash.replace('#/', '') || roleDefault;
  const appEl = document.getElementById('app');

  // ── Authentication Gate ──
  if (route === 'login' || !api.isAuthenticated()) {
    if (!api.isAuthenticated()) {
      window.location.hash = '#/login';
    }
    appEl.innerHTML = renderLoginPage();
    bindLoginEvents();
    return;
  }

  // If the user lands on or attempts to access a route not permitted for their role,
  // silently and immediately redirect them to their primary authorized section!
  if (!canAccess(route)) {
    const target = getRoleHomeRoute(currentRole);
    if (route !== target) {
      window.location.hash = '#/' + target;
      return;
    }
  }

  try {
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
        } catch (_) {}
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
      const depts = await api.getDepartments();
      const requests = await api.getRepairs();
      appEl.innerHTML = renderAppShell(renderRepairsView(depts.data, requests.data), 'repairs');
      bindRepairsEvents();
    }
  } catch (err) {
    appEl.innerHTML = renderAppShell(`<div class="card"><h3 style="color:var(--red-500)">Error loading view: ${err.message}</h3></div>`, route);
  }

  // Bind logout
  bindLogoutEvent();
}

function bindLoginEvents() {
  // Login form submission
  const form = document.getElementById('loginForm');
  if (form && !form.hasAttribute('data-bound')) {
    form.setAttribute('data-bound', 'true');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      const submitBtn = document.getElementById('loginSubmitBtn');

      errorEl.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="login-spinner"></span> <span>Signing in...</span>';

      try {
        await api.login(email, password);
        currentUser = api.getStoredUser();
        currentRole = currentUser?.role || 'Principal';
        // Navigate directly to the role's tailored primary section
        window.location.hash = '#/' + getRoleHomeRoute(currentRole);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Sign In to System</span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
      }
    });
  }

  // Quick-fill persona cards
  const cards = document.querySelectorAll('.persona-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const emailInput = document.getElementById('loginEmail');
      const pwdInput = document.getElementById('loginPassword');
      if (emailInput && pwdInput) {
        emailInput.value = card.dataset.email;
        pwdInput.value = 'ldce@2026';
        emailInput.focus();
      }
    });
  });
}

function bindLogoutEvent() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && !logoutBtn.hasAttribute('data-bound')) {
    logoutBtn.setAttribute('data-bound', 'true');
    logoutBtn.addEventListener('click', () => {
      api.logout();
      currentUser = null;
      currentRole = 'Principal';
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
    } catch (e) {}
    return [...DEFAULT_IT_ITEMS];
  }

  function saveITItemsMaster(items) {
    try {
      localStorage.setItem('ldce_it_items_master', JSON.stringify(items));
    } catch (e) {}
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
    } catch (_) {}
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
                try { dynMap = JSON.parse(dynMap); } catch (_) {}
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
  } else if (isDPC && !['DOC-30','DOC-31','DOC-32','DOC-33','DOC-34'].includes(activeCommitteeDocTab)) {
    activeCommitteeDocTab = 'DOC-30';
  } else if (!isDPC && !['DOC-25','DOC-25A','DOC-26','DOC-27','DOC-28','DOC-29'].includes(activeCommitteeDocTab)) {
    activeCommitteeDocTab = 'DOC-25';
  }

  let agenda = currentMeeting?.agenda_data || {};
  if (typeof agenda === 'string') {
    try { agenda = JSON.parse(agenda); } catch (_) {}
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
    ? orders.map(o => `<option value="${o.id}">#${o.id} – ${o.order_no || 'PO'} | ${(o.item_name || '').substring(0,35)} [₹${parseFloat(o.total_value || o.total_cost || 0).toLocaleString('en-IN')}]</option>`).join('')
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
// 10. REPAIRS & NON-WORKING EQUIPMENT (FORM-12)
// ----------------------------------------------------
function renderRepairsView(depts, requests) {
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
        <a href="#/documents" class="btn btn-secondary btn-sm">Generate DOC-44/45/46 →</a>
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
            </tr>
          </thead>
          <tbody>
            ${requests.length === 0
              ? `<tr><td colspan="11" style="text-align:center;padding:2.5rem;color:var(--neutral-400);">No repair requests recorded yet. Use the form above to register equipment.</td></tr>`
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
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindRepairsEvents() {
  // Toggle previous repair date/amount fields
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

  // Reset button re-toggles conditional fields
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
      dept_id:            document.getElementById('repairDept')?.value,
      equipment_name:     document.getElementById('repairName')?.value.trim(),
      purchase_date:      document.getElementById('repairPurchaseDate')?.value,
      original_cost:      document.getElementById('repairCost')?.value,
      breakdown_date:     document.getElementById('repairDate')?.value,
      prev_repaired:      prevRepaired,
      last_repair_date:   prevRepaired ? (document.getElementById('repairLastRepairDate')?.value || null) : null,
      last_repair_amount: prevRepaired ? (document.getElementById('repairLastRepairAmount')?.value || null) : null,
      market_value:       document.getElementById('repairMarketValue')?.value,
      est_repair_cost:    document.getElementById('repairEst')?.value,
      fault_desc:         document.getElementById('repairDesc')?.value.trim(),
      last_repair_info:   prevRepaired
        ? `Dt: ${document.getElementById('repairLastRepairDate')?.value || '-'}, Amt: ₹${document.getElementById('repairLastRepairAmount')?.value || '0'}`
        : ''
    };
    try {
      await api.createRepair(payload);
      alert('Equipment registered in Repair Register! Generate DOC-44/45/46 from Document Centre.');
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
    ? indents.map(i => `<option value="${i.id}">#${i.id} – ${(i.item_name||'').substring(0,40)} [${i.dept_code||i.dept_name||''}]</option>`).join('')
    : '<option value="">— No Indents Found —</option>';
  const bidOpts = bids.length
    ? bids.map(b => `<option value="${b.id}">#${b.id} – ${b.bid_no||''}</option>`).join('')
    : '<option value="">— No Bids Found —</option>';
  const dlpcMeetings = meetings.filter(m => (m.committee_type || '').toUpperCase() === 'DLPC');
  const dpcMeetings = meetings.filter(m => (m.committee_type || '').toUpperCase() === 'DPC');

  const dlpcMeetingOpts = dlpcMeetings.length
    ? dlpcMeetings.map(m => `<option value="${m.id}">#${m.id} – ${m.committee_type||'DLPC'} | ${m.meeting_ref||''}</option>`).join('')
    : '<option value="">— No DLPC Meetings Found —</option>';

  const dpcMeetingOpts = dpcMeetings.length
    ? dpcMeetings.map(m => `<option value="${m.id}">#${m.id} – ${m.committee_type||'DPC'} | ${m.meeting_ref||''}</option>`).join('')
    : '<option value="">— No DPC Meetings Found —</option>';

  const meetingOpts = meetings.length
    ? meetings.map(m => `<option value="${m.id}">#${m.id} – ${m.committee_type||''} | ${m.meeting_ref||''}</option>`).join('')
    : '<option value="">— No Meetings Found —</option>';
  const orderOpts = orders.length
    ? orders.map(o => `<option value="${o.id}">#${o.id} – ${o.order_no||''} | ${(o.item_name||'').substring(0,30)}</option>`).join('')
    : '<option value="">— No Orders Found —</option>';
  const voucherOpts = vouchers.length
    ? vouchers.map(v => `<option value="${v.id}">#${v.id} – ${v.voucher_no||''}</option>`).join('')
    : '<option value="">— No Vouchers Found —</option>';
  const repairOpts = repairs.length
    ? repairs.map(r => `<option value="${r.id}">#${r.id} – ${(r.equipment_name||'').substring(0,35)} [${r.dept_name||''}]</option>`).join('')
    : '<option value="">— No Repairs Found —</option>';
  const fiOpts = fi.length
    ? fi.map(f => `<option value="${f.id}">#${f.id} – ${f.vendor_name||''} | ${f.dd_number||''}</option>`).join('')
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

  function docCard({ docId, name, selector, note }) {
    const isDualFormat = ['DOC-01', 'DOC-02', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-06', 'DOC-07', 'DOC-34'].includes(docId);
    const isEditable = ['DOC-25', 'DOC-25A', 'DOC-32', 'DOC-36', 'DOC-37', 'DOC-38', 'DOC-39'].includes(docId);

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
      { docId:'DOC-08', name:'Office Order – Dept. Representatives', note:'Lists 2 reps per department for 2026-27', selector: yearSel('yr-08') },
      { docId:'DOC-09', name:'Office Order – Expert Committees', note:'Discipline-wise expert panel orders', selector: yearSel('yr-09') },
      { docId:'DOC-10', name:'Office Order – Special Committees (DLPC/DPC)', note:'Select committee type', selector:`<select id="ct-10" class="form-control" style="font-size:0.8rem;padding:5px;background:var(--neutral-800);color:var(--neutral-100);border:1px solid var(--neutral-600);border-radius:5px;width:100%;"><option value="DLPC">DLPC</option><option value="DPC">DPC</option><option value="WriteOff">Write-off Committee</option></select>` },
      { docId:'DOC-11', name:'Note for Change in Committee / Representatives', note:'Fills generic change note' },
    ])}

    ${phaseCard(2, 'Annual CTE Demand Statements', '#0EA5E9', [
      { docId:'DOC-01', name:'Statement 1 – Non-IT Equipment', selector: yearSel('yr-01') },
      { docId:'DOC-02', name:'Statement 2 – IT Equipment', selector: yearSel('yr-02') },
      { docId:'DOC-03', name:'Statement 3 – Furniture', selector: yearSel('yr-03') },
      { docId:'DOC-04', name:'Statement 4 – Books & Periodicals', selector: yearSel('yr-04') },
      { docId:'DOC-05', name:'Statement 5 – Maintenance & AMC', selector: yearSel('yr-05') },
      { docId:'DOC-06', name:'Summary of IT Items (All Depts)', selector: yearSel('yr-06') },
      { docId:'DOC-07', name:'CTE Consolidated Summary', selector: yearSel('yr-07') },
    ])}

    ${phaseCard(3, 'Purchase Indent, Specs, ATC & Note Sheet', '#10B981', [
      { docId:'DOC-12', name:'Purchase Indent – Govt. Fund', note:'Select the indent', selector: sel('ind-12', indentOpts, 'Select Indent') },
      { docId:'DOC-13', name:'Purchase Indent – Non-Govt. Fund', note:'Select the indent', selector: sel('ind-13', indentOpts, 'Select Indent') },
      { docId:'DOC-14', name:'Specification Sheet', note:'Select the indent', selector: sel('ind-14', indentOpts, 'Select Indent') },
      { docId:'DOC-15', name:'Additional Terms & Conditions (ATC)', note:'Select the indent', selector: sel('ind-15', indentOpts, 'Select Indent') },
      { docId:'DOC-16', name:'General GeM Guidelines Sheet', note:'Standard guidelines' },
      { docId:'DOC-17', name:'Note for Purchase – New Item (Gujarati)', note:'Select the indent', selector: sel('ind-17', indentOpts, 'Select Indent') },
      { docId:'DOC-18', name:'Note for Purchase – Other Items', note:'Select the indent', selector: sel('ind-18', indentOpts, 'Select Indent') },
      { docId:'DOC-19', name:'Checklist A – Before Initiating GeM Bid', note:'Select the indent', selector: sel('ind-19', indentOpts, 'Select Indent') },
      { docId:'DOC-20', name:'Checklist C – Before Publishing Custom Bid/BOQ', note:'Select the indent', selector: sel('ind-20', indentOpts, 'Select Indent') },
    ])}

    ${phaseCard(4, 'EMD & Security Deposit (e-PBG) Ledger', '#F59E0B', [
      { docId:'DOC-21', name:'EMD Refund Letter to Unsuccessful Bidder', note:'Select the EMD/e-PBG record', selector: sel('fi-21', fiOpts, 'Select EMD Record') },
      { docId:'DOC-22', name:'Note for Security Deposit Submission to Accounts', note:'Select the EMD/e-PBG record', selector: sel('fi-22', fiOpts, 'Select EMD Record') },
    ])}

    ${phaseCard(5, 'Technical Scrutiny & Committee Approval', '#EF4444', [
      { docId:'DOC-23', name:'Bid Scrutiny Report (Evaluation Matrix)', note:'Select the bid', selector: sel('bid-23', bidOpts, 'Select Bid') },
      { docId:'DOC-24', name:'Reasons for Disqualification Sheet', note:'Select the bid', selector: sel('bid-24', bidOpts, 'Select Bid') },
      { docId:'DOC-25', name:'DLPC Agenda & Proposal (3-Page Checklist Format)', note:'Select the DLPC meeting', selector: sel('mtg-25', dlpcMeetingOpts, 'Select DLPC Meeting') },
      { docId:'DOC-25A', name:'GeM Agenda Format – DLPC (9-Point Official Table)', note:'Select the DLPC meeting', selector: sel('mtg-25a', dlpcMeetingOpts, 'Select DLPC Meeting') },
      { docId:'DOC-26', name:'Certificate for reasonability of rate (DLPC & DPC)', note:'Select the committee meeting', selector: sel('mtg-26', meetingOpts, 'Select Meeting') },
      { docId:'DOC-27', name:'DLPC Minutes of Meeting (MOM)', note:'Select the DLPC meeting', selector: sel('mtg-27', dlpcMeetingOpts, 'Select DLPC Meeting') },
      { docId:'DOC-28', name:'Checklist B – Final Approval Package', note:'Select the DLPC meeting', selector: sel('mtg-28', dlpcMeetingOpts, 'Select DLPC Meeting') },
      { docId:'DOC-29', name:'Note – Direct Purchase Against Bid (DLPC)', note:'Select the DLPC meeting', selector: sel('mtg-29', dlpcMeetingOpts, 'Select DLPC Meeting') },
      { docId:'DOC-30', name:'DPC Proposal Document Index', note:'Select the DPC meeting', selector: sel('mtg-30', dpcMeetingOpts, 'Select DPC Meeting') },
      { docId:'DOC-31', name:'DPC Forwarding Letter to Directorate', note:'Select the DPC meeting', selector: sel('mtg-31', dpcMeetingOpts, 'Select DPC Meeting') },
      { docId:'DOC-32', name:'GeM Agenda Format – DPC', note:'Select the DPC meeting', selector: sel('mtg-32', dpcMeetingOpts, 'Select DPC Meeting') },
      { docId:'DOC-33', name:'Institute BID Certificate', note:'Select the DPC meeting', selector: sel('mtg-33', dpcMeetingOpts, 'Select DPC Meeting') },
      { docId:'DOC-34', name:'L1 INFO Sheet for DPC', note:'Select the DPC meeting', selector: sel('mtg-34', dpcMeetingOpts, 'Select DPC Meeting') },
    ])}

    ${phaseCard(6, 'Goods Delivery, Inspection & Bill Passing', '#06B6D4', [
      { docId:'DOC-36', name:'Department Material Receipt Note', note:'Select the purchase order', selector: sel('ord-36', orderOpts, 'Select Purchase Order') },
      { docId:'DOC-37', name:'Technical Inspection Report', note:'Select the voucher', selector: sel('vch-37', voucherOpts, 'Select Voucher') },
      { docId:'DOC-38', name:'Pass for Payment Voucher', note:'Select the voucher', selector: sel('vch-38', voucherOpts, 'Select Voucher') },
      { docId:'DOC-39', name:'Checklist D & E – Bill Verification', note:'Select the voucher', selector: sel('vch-39', voucherOpts, 'Select Voucher') },
      { docId:'DOC-40', name:'Procurement Progress Status Report', note:'Financial year', selector: yearSel('yr-40') },
    ])}

    ${phaseCard(7, 'Non-GeM, Services & Equipment Repairs', '#84CC16', [
      { docId:'DOC-41', name:'Inquiry Letter (Non-GeM Local Purchase)', note:'Select the indent', selector: sel('ind-41', indentOpts, 'Select Indent') },
      { docId:'DOC-42', name:'Comparative Statement (Govt/Non-Govt Fund)', note:'Generic comparative statement' },
      { docId:'DOC-43', name:'Purchase Order (Non-GeM / Local)', note:'Select the purchase order', selector: sel('ord-43', orderOpts, 'Select Purchase Order') },
      { docId:'DOC-44', name:'Repairable Equipment Register', note:'All repairs included automatically' },
      { docId:'DOC-45', name:'Note for Approval of Repairing', note:'Select the repair request', selector: sel('rep-45', repairOpts, 'Select Repair Request') },
      { docId:'DOC-46', name:'Work Order (WO – Repairing)', note:'Select the repair request', selector: sel('rep-46', repairOpts, 'Select Repair Request') },
      { docId:'DOC-47', name:'Pass for Payment (Non-GeM & Repair)', note:'Generic pass for payment (repair)' },
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
  'DOC-42': () => ({ entityId: null, extra: {} }),
  'DOC-43': () => ({ entityId: document.getElementById('ord-43')?.value }),
  'DOC-44': () => ({ entityId: null, extra: {} }),
  'DOC-45': () => ({ entityId: document.getElementById('rep-45')?.value }),
  'DOC-46': () => ({ entityId: document.getElementById('rep-46')?.value }),
  'DOC-47': () => ({ entityId: null, extra: {} }),
};

window.downloadDocFromCentre = async function(docId, format = null) {
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

window.openDocEditor = function(docId) {
  if (['DOC-25', 'DOC-25A', 'DOC-26', 'DOC-27', 'DOC-28', 'DOC-29', 'DOC-30', 'DOC-31', 'DOC-32', 'DOC-33', 'DOC-34'].includes(docId)) {
    let selectEl = null;
    if (docId === 'DOC-25') selectEl = document.getElementById('mtg-25');
    else if (docId === 'DOC-25A') selectEl = document.getElementById('mtg-25a');
    else if (docId === 'DOC-32') selectEl = document.getElementById('mtg-32');
    else selectEl = document.getElementById(`mtg-${docId.replace('DOC-','').toLowerCase()}`);
    
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
  } else if (['DOC-41', 'DOC-43', 'DOC-45', 'DOC-46'].includes(docId)) {
    window.location.hash = '#/repairs';
  }
};

function bindDocumentsEvents() {
  // Event listeners handled via window.downloadDocFromCentre & window.openDocEditor
}


