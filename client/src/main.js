import { api } from './api.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

window.handleDownloadDoc = async (docId, entityId) => {
  try {
    await api.downloadDocument(docId, entityId);
  } catch (err) {
    alert('Error downloading document: ' + err.message);
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
    dashboard: 'view',      // Full Institutional Overview
    masters:   'view',      // View departments & committees
    cte:       'approve',   // Approve annual CTE demands
    indents:   'approve',   // Approve purchase indents
    notes:     'approve',   // Final administrative sanction on note sheets
    financial: 'view',      // Oversight of EMD / e-PBG ledger
    scrutiny:  'view',      // Review technical scrutiny matrix
    committee: 'approve',   // Grant DLPC/DPC final sanctions
    delivery:  'view',      // Inspection & payment vouchers
    repairs:   'view',      // Equipment repairs approval
    templates: 'view',      // Official document templates
  },
  StoreOfficer: {
    dashboard: 'view',      // Full Store & Purchase Dashboard
    masters:   'manage',    // Full CRUD on depts & governance
    cte:       'view',      // Aggregate demands into CTE proposal
    indents:   'create',    // Review & process indents
    notes:     'create',    // Prepare & process Gujarati note sheets
    financial: 'manage',    // Full EMD & e-PBG management
    scrutiny:  'create',    // Compile bids & committee agenda
    committee: 'create',    // Secretary role (DLPC & DPC)
    delivery:  'manage',    // Stock entry & pass for payment vouchers
    repairs:   'manage',    // Work orders & repair bills
    templates: 'view',      // Full template library
  },
  HOD: {
    dashboard: 'hidden',    // Removed - irrelevant to HOD
    masters:   'hidden',    // Removed - managed by Store
    cte:       'create',    // Submit department annual item demands
    indents:   'create',    // Initiate & sign department indents
    notes:     'approve',   // Review & sign administrative note sheets
    financial: 'hidden',    // Removed - handled by Store & Accounts
    scrutiny:  'approve',   // Review & endorse technical scrutiny matrix
    committee: 'hidden',    // Removed - managed centrally
    delivery:  'approve',   // Sign department material receipt notes
    repairs:   'create',    // Submit equipment repair requests
    templates: 'hidden',    // Removed
  },
  DeptRep: {
    dashboard: 'hidden',    // Removed - irrelevant to DeptRep
    masters:   'hidden',    // Removed
    cte:       'create',    // Prepare departmental item demands
    indents:   'create',    // Draft purchase indents & checklist A/C
    notes:     'create',    // Draft Gujarati note sheets
    financial: 'hidden',    // Removed
    scrutiny:  'hidden',    // Removed - handled by Expert Committee
    committee: 'hidden',    // Removed
    delivery:  'create',    // Receive incoming goods & material notes
    repairs:   'hidden',    // Removed
    templates: 'hidden',    // Removed
  },
  ExpertMember: {
    dashboard: 'hidden',    // Removed - irrelevant to Expert Committee
    masters:   'hidden',    // Removed
    cte:       'hidden',    // Removed
    indents:   'create',    // Technical Specs (FORM-04) & ATC Terms (FORM-05)
    notes:     'hidden',    // Removed - handled by Store & HOD
    financial: 'hidden',    // Removed
    scrutiny:  'create',    // Technical Scrutiny Matrix (FORM-08) & Disqualifications
    committee: 'hidden',    // Removed
    delivery:  'create',    // Physical Technical Inspection & Reports (FORM-10)
    repairs:   'hidden',    // Removed
    templates: 'hidden',    // Removed
  },
  AccountsOfficer: {
    dashboard: 'hidden',    // Removed - irrelevant to Accounts
    masters:   'hidden',    // Removed
    cte:       'hidden',    // Removed
    indents:   'hidden',    // Removed
    notes:     'hidden',    // Removed
    financial: 'manage',    // Financial Ledger (EMD Demand Drafts & e-PBG Deposits)
    scrutiny:  'hidden',    // Removed
    committee: 'view',      // Financial review of DLPC/DPC rate reasonability
    delivery:  'manage',    // Verify Checklist D & E and release payment
    repairs:   'hidden',    // Removed
    templates: 'hidden',    // Removed
  },
  DLPCMember: {
    dashboard: 'hidden',    // Removed - irrelevant to DLPC Member
    masters:   'hidden',    // Removed
    cte:       'hidden',    // Removed
    indents:   'hidden',    // Removed
    notes:     'hidden',    // Removed
    financial: 'hidden',    // Removed
    scrutiny:  'view',      // Review technical scrutiny before sanctioning
    committee: 'approve',   // Review DLPC / DPC Agendas, Rate Reasonability & sign MOM
    delivery:  'hidden',    // Removed
    repairs:   'hidden',    // Removed
    templates: 'hidden',    // Removed
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

  { section: 'Templates Library', items: [
    { route: 'templates', label: 'Document Templates', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
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
    templates: 'Document Templates Library'
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
  let route = hash.replace('#/', '') || roleDefault;
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
      const items = await api.getFinancialInstruments();
      appEl.innerHTML = renderAppShell(renderFinancialView(items.data), 'financial');
      bindFinancialEvents();
    } else if (route === 'scrutiny') {
      const bids = await api.getBids();
      appEl.innerHTML = renderAppShell(renderScrutinyView(bids.data), 'scrutiny');
      bindScrutinyEvents();
    } else if (route === 'committee') {
      const meetings = await api.getMeetings();
      appEl.innerHTML = renderAppShell(renderCommitteeView(meetings.data), 'committee');
      bindCommitteeEvents();
    } else if (route === 'delivery') {
      const orders = await api.getOrders().catch(() => ({ data: [] }));
      const inspections = await api.getInspections().catch(() => ({ data: [] }));
      let vouchers = { data: [] };
      if (currentRole === 'StoreOfficer' || currentRole === 'AccountsOfficer' || currentRole === 'Principal') {
        vouchers = await api.getVouchers().catch(() => ({ data: [] }));
      }
      appEl.innerHTML = renderAppShell(renderDeliveryView(orders.data, vouchers.data, inspections.data), 'delivery');
      bindDeliveryEvents();
    } else if (route === 'templates') {
      appEl.innerHTML = renderAppShell(renderTemplatesView(), 'templates');
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
      <div class="card-header">
        <h3 class="card-title">Submit Annual CTE Demand (Statements 1 to 5)</h3>
      </div>
      <form id="cteForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Financial Year</label>
          <select id="cteFinYear" class="form-control">
            <option value="2026-27">2026-27</option>
            <option value="2027-28">2027-28</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category (Statement Type)</label>
          <select id="cteCategory" class="form-control">
            <option value="Non-IT Equipment">Statement 1: Non-IT Equipment</option>
            <option value="IT Equipment">Statement 2: IT Equipment</option>
            <option value="Furniture">Statement 3: Furniture</option>
            <option value="Books">Statement 4: Books & Periodicals</option>
            <option value="Maintenance">Statement 5: Maintenance & AMC</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Department</label>
          <select id="cteDept" class="form-control">
            ${depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Grant Head</label>
          <select id="cteGrantHead" class="form-control">
            <option value="State Grant (TED-5)">State Grant (TED-5)</option>
            <option value="State Grant (TED-11)">State Grant (TED-11)</option>
            <option value="Center Grant">Center Grant</option>
            <option value="Student Welfare">Student Welfare</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label class="form-label">Item Nomenclature / Description</label>
          <input type="text" id="cteItemName" class="form-control" placeholder="Full technical item title" required />
        </div>
        <div class="form-group">
          <label class="form-label">Quantity Required</label>
          <input type="number" id="cteQty" class="form-control" min="1" value="1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Approx Unit Rate (₹)</label>
          <input type="number" id="cteRate" class="form-control" step="0.01" placeholder="0.00" required />
        </div>
        <div class="form-group full-width">
          <label class="form-label">Detailed Academic / Laboratory Justification</label>
          <textarea id="cteJustification" class="form-control" required placeholder="Academic necessity, AICTE/GTU norms compliance justification..."></textarea>
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
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
              <th>Grant Head</th>
            </tr>
          </thead>
          <tbody>
            ${demands.map(d => `
              <tr>
                <td>${d.fin_year}</td>
                <td><span class="badge badge-info">${d.category}</span></td>
                <td>${d.dept_code}</td>
                <td><strong>${d.item_name}</strong></td>
                <td>${d.qty}</td>
                <td>₹${parseFloat(d.unit_rate).toLocaleString('en-IN')}</td>
                <td><strong>₹${parseFloat(d.total_cost).toLocaleString('en-IN')}</strong></td>
                <td>${d.grant_head}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindCteEvents() {
  document.getElementById('cteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      fin_year: document.getElementById('cteFinYear').value,
      category: document.getElementById('cteCategory').value,
      dept_id: document.getElementById('cteDept').value,
      grant_head: document.getElementById('cteGrantHead').value,
      item_name: document.getElementById('cteItemName').value,
      qty: document.getElementById('cteQty').value,
      unit_rate: document.getElementById('cteRate').value,
      justification: document.getElementById('cteJustification').value
    };
    try {
      await api.createCteDemand(payload);
      alert('CTE Demand recorded successfully!');
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
              <th>Actions</th>
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
                  <button class="btn btn-primary btn-sm" onclick="handleDownloadDoc('DOC-12', '${i.id || i.indent_no.split('/').pop()}')">Gen DOC-12</button>
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
function renderFinancialView(items) {
  const formHtml = canManage('financial') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Register Vendor Financial Instrument (EMD / e-PBG D.D. Ledger)</h3>
      </div>
      <form id="finForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Instrument Type</label>
          <select id="finType" class="form-control">
            <option value="EMD">EMD (Earnest Money Deposit)</option>
            <option value="e-PBG / Security Deposit">e-PBG / Security Deposit</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">GeM Bid / Order No</label>
          <input type="text" id="finBidNo" class="form-control" placeholder="e.g. GEM/2026/B/7586906" required />
        </div>
        <div class="form-group">
          <label class="form-label">Vendor / Party Legal Name</label>
          <input type="text" id="finVendor" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Demand Draft / Bank Guarantee No</label>
          <input type="text" id="finDdNo" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Instrument Date</label>
          <input type="date" id="finDdDate" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Amount (₹)</label>
          <input type="number" id="finAmount" class="form-control" step="0.01" required />
        </div>
        <div class="form-group">
          <label class="form-label">Issuing Bank & Branch</label>
          <input type="text" id="finBank" class="form-control" placeholder="State Bank of India, Ahmedabad" required />
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
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
      <div class="card-header">
        <h3 class="card-title">EMD & Security Deposit Ledger Records</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Bid / Order No</th>
              <th>Vendor Name</th>
              <th>D.D. No & Date</th>
              <th>Amount (₹)</th>
              <th>Bank Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td><span class="badge badge-info">${i.instrument_type}</span></td>
                <td><strong>${i.bid_order_no}</strong></td>
                <td>${i.vendor_name}</td>
                <td>${i.dd_number} (${new Date(i.dd_date).toLocaleDateString('en-GB')})</td>
                <td>₹${parseFloat(i.amount).toLocaleString('en-IN')}</td>
                <td>${i.bank_name}</td>
                <td><span class="badge badge-success">${i.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindFinancialEvents() {
  document.getElementById('finForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      instrument_type: document.getElementById('finType').value,
      bid_order_no: document.getElementById('finBidNo').value,
      vendor_name: document.getElementById('finVendor').value,
      dd_number: document.getElementById('finDdNo').value,
      dd_date: document.getElementById('finDdDate').value,
      amount: document.getElementById('finAmount').value,
      bank_name: document.getElementById('finBank').value
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
function renderScrutinyView(bids) {
  const formHtml = canCreate('scrutiny') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Technical Scrutiny Matrix (FORM-08)</h3>
      </div>
      <form id="scrutinyForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Select GeM Bid</label>
          <select id="scrutinyBid" class="form-control">
            ${bids.map(b => `<option value="${b.id}">${b.bid_no} (Status: ${b.status})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Vendor Name</label>
          <input type="text" id="scrutinyVendor" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Specifications (Qualified?)</label>
          <select id="scrutinySpecs" class="form-control">
            <option value="Qualified">Qualified</option>
            <option value="Disqualified">Disqualified</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Turnover Criteria</label>
          <select id="scrutinyTurnover" class="form-control">
            <option value="Qualified">Qualified</option>
            <option value="Disqualified">Disqualified</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label class="form-label">Reason for Disqualification (if any)</label>
          <textarea id="scrutinyReason" class="form-control" placeholder="Specify if any parameter is disqualified..."></textarea>
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Save Evaluation
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('scrutiny')}
    ${formHtml}
  `;
}

function bindScrutinyEvents() {
  document.getElementById('scrutinyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Scrutiny saved successfully (Demo)');
  });
}

// ----------------------------------------------------
// 8. COMMITTEE SANCTIONS (FORM-09)
// ----------------------------------------------------
function renderCommitteeView(meetings) {
  const formHtml = canCreate('committee') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">DLPC / DPC Sanctions (FORM-09)</h3>
      </div>
      <form id="committeeForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Committee Type</label>
          <select id="committeeType" class="form-control">
            <option value="DLPC">DLPC (≤ ₹ 5.00 Lakhs)</option>
            <option value="DPC">DPC (> ₹ 5.00 Lakhs)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Meeting Ref No</label>
          <input type="text" id="committeeRef" class="form-control" placeholder="e.g. LDCE/DLPC/2026-27/04" required />
        </div>
        <div class="form-group">
          <label class="form-label">L1 Vendor Name</label>
          <input type="text" id="committeeL1" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">L1 Final Amount (₹)</label>
          <input type="number" id="committeeAmount" class="form-control" required />
        </div>
        <div class="form-group full-width">
          <label class="form-label">Rate Reasonability Certification</label>
          <textarea id="committeeReasonability" class="form-control" required>The L1 rate quoted is verified against market survey and found reasonable.</textarea>
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 18V6"/><path d="M16 10a4 4 0 0 0-8 0"/></svg>
            Submit Resolution & Generate MOM
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('committee')}
    ${formHtml}
  `;
}

function bindCommitteeEvents() {
  document.getElementById('committeeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Committee resolution saved successfully (Demo)');
  });
}

// ----------------------------------------------------
// 9. DELIVERY & INSPECTION / VOUCHERS (FORM-10 & 11)
// ----------------------------------------------------
function renderDeliveryView(orders, vouchers, inspections = []) {
  const isExpert = currentRole === 'ExpertMember';
  const isDept = currentRole === 'DeptRep' || currentRole === 'HOD';
  const isAccounts = currentRole === 'AccountsOfficer';
  const isStore = currentRole === 'StoreOfficer' || currentRole === 'Principal';

  // Section 1: Physical Technical Inspection (FORM-10) Form
  // Visible to ExpertMember, DeptRep, HOD, StoreOfficer, Principal
  const canInspect = isExpert || isDept || isStore;
  const inspectionFormHtml = canInspect ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Physical Equipment Inspection Certificate (FORM-10)</h3>
      </div>
      <form id="inspectionForm" class="form-grid">
        <div class="form-group full-width">
          <label class="form-label">Select Purchase Order / Item</label>
          <select id="insOrderId" class="form-control" required>
            ${orders.map(o => `<option value="${o.id}">${o.order_no} &mdash; ${o.item_name || 'Supplied Item'} (${o.supplier_name})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Vendor Invoice No &amp; Date</label>
          <input type="text" id="insInvoice" class="form-control" placeholder="e.g. INV/2026/049 dt. 12/03/2026" required />
        </div>
        <div class="form-group">
          <label class="form-label">Material Receipt Date</label>
          <input type="date" id="insReceiptDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Technical Inspection Date</label>
          <input type="date" id="insDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Working / Acceptance Status</label>
          <select id="insStatus" class="form-control">
            <option value="Fully Functional &amp; Accepted">Fully Functional &amp; Accepted</option>
            <option value="Accepted with Minor Rectification">Accepted with Minor Rectification</option>
            <option value="Rejected / Specification Mismatch">Rejected / Specification Mismatch</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label class="form-label">Equipment Serial Numbers / Asset Identifiers</label>
          <input type="text" id="insSerial" class="form-control" placeholder="e.g. SN-84920489, SN-84920490 (Comma separated)" required />
        </div>
        <div class="form-group full-width" style="display:flex; gap:1.5rem; margin-top:0.5rem;">
          <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
            <input type="checkbox" id="insSpecsOk" checked /> Technical specs match GeM Bid contract
          </label>
          <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
            <input type="checkbox" id="insAccessoriesOk" checked /> Standard accessories, manuals &amp; warranty cards received
          </label>
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Sign &amp; Certify Technical Inspection
          </button>
        </div>
      </form>
    </div>
  ` : '';

  // Section 2: Pass for Payment Voucher (FORM-11)
  // Only visible to StoreOfficer and AccountsOfficer (and Principal)
  const canVoucher = isStore || isAccounts;
  const voucherFormHtml = canVoucher ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pass for Payment Voucher (FORM-11) &mdash; Bill Passing Section</h3>
      </div>
      <form id="voucherForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Sanction Ref / Order No</label>
          <input type="text" id="voucherRef" class="form-control" placeholder="e.g. PO/2026/01" required />
        </div>
        <div class="form-group">
          <label class="form-label">Gross Invoice Amount (₹)</label>
          <input type="number" id="voucherGross" class="form-control" step="0.01" placeholder="0.00" required />
        </div>
        <div class="form-group">
          <label class="form-label">Central Stock Folio</label>
          <input type="text" id="voucherFolio" class="form-control" placeholder="e.g. Vol 3, Page 142" required />
        </div>
        <div class="form-group">
          <label class="form-label">Deductions (Penalty/SD) (₹)</label>
          <input type="number" id="voucherDeductions" class="form-control" value="0.00" step="0.01" />
        </div>
        <div class="form-group full-width">
          <label class="form-label">Account Head</label>
          <input type="text" id="voucherHead" class="form-control" value="State Grant (TED-5)" required />
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
            Process &amp; Authorize Payment Voucher
          </button>
        </div>
      </form>
    </div>
  ` : '';

  // Section 3: Completed Inspections Registry Table
  const inspectionsTableHtml = canInspect ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Completed Technical Inspections &amp; Goods Inward Registry</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Item Nomenclature</th>
              <th>Vendor / Supplier</th>
              <th>Inspection Date</th>
              <th>Serial Numbers</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${inspections && inspections.length > 0 ? inspections.map(ins => `
              <tr>
                <td><strong>${ins.order_no || 'PO-2026'}</strong></td>
                <td>${ins.item_name || 'Lab Equipment'}</td>
                <td>${ins.supplier_name || 'Government GeM Vendor'}</td>
                <td>${new Date(ins.inspection_date).toLocaleDateString('en-GB')}</td>
                <td><code style="font-size:0.75rem;">${ins.serial_numbers}</code></td>
                <td><span class="badge badge-success">${ins.working_status}</span></td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="6" style="text-align:center; color:var(--neutral-400); padding:1.5rem;">
                  No equipment inspection records logged yet. Orders awaiting technical inspection will appear here.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  ` : '';

  // Section 4: Vouchers Table (only for Store & Accounts)
  const vouchersTableHtml = canVoucher ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Passed Payment Vouchers Ledger</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Sanction Ref</th>
              <th>Gross (₹)</th>
              <th>Deductions (₹)</th>
              <th>Net Payable (₹)</th>
              <th>Stock Folio</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${vouchers && vouchers.length > 0 ? vouchers.map(v => `
              <tr>
                <td><strong>${v.voucher_no}</strong></td>
                <td>${v.sanction_ref}</td>
                <td>₹${parseFloat(v.gross_amount).toLocaleString('en-IN')}</td>
                <td>₹${(parseFloat(v.sd_retained || 0) + parseFloat(v.other_deductions || 0)).toLocaleString('en-IN')}</td>
                <td><strong>₹${parseFloat(v.net_payable).toLocaleString('en-IN')}</strong></td>
                <td>${v.stock_folio_no}</td>
                <td><span class="badge badge-success">${v.status}</span></td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="7" style="text-align:center; color:var(--neutral-400); padding:1.5rem;">
                  No payment vouchers passed yet.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('delivery')}
    ${inspectionFormHtml}
    ${voucherFormHtml}
    ${inspectionsTableHtml}
    ${vouchersTableHtml}
  `;
}

function bindDeliveryEvents() {
  // Bind inspection form
  document.getElementById('inspectionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      order_id: document.getElementById('insOrderId').value,
      invoice_no_date: document.getElementById('insInvoice').value,
      receipt_date: document.getElementById('insReceiptDate').value,
      inspection_date: document.getElementById('insDate').value,
      working_status: document.getElementById('insStatus').value,
      serial_numbers: document.getElementById('insSerial').value,
      specs_verified: document.getElementById('insSpecsOk').checked,
      accessories_ok: document.getElementById('insAccessoriesOk').checked,
      inspector_ids: [currentUser?.id || 1]
    };
    try {
      await api.createInspection(payload);
      alert('Equipment Inspection Certificate signed & logged successfully!');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Bind voucher form
  document.getElementById('voucherForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      inspection_id: 1,
      sanction_ref: document.getElementById('voucherRef').value,
      gross_amount: document.getElementById('voucherGross').value,
      stock_folio_no: document.getElementById('voucherFolio').value,
      other_deductions: document.getElementById('voucherDeductions').value,
      account_head: document.getElementById('voucherHead').value,
      vendor_info: 'Verified GeM Supplier'
    };
    try {
      await api.createVoucher(payload);
      alert('Pass for Payment Voucher authorized successfully!');
      router();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

// ----------------------------------------------------
// 10. REPAIRS & NON-WORKING EQUIPMENT (FORM-12)
// ----------------------------------------------------
function renderRepairsView(depts, requests) {
  const formHtml = canCreate('repairs') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Non-Working Equipment Repair Request (FORM-12)</h3>
      </div>
      <form id="repairForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Equipment Name</label>
          <input type="text" id="repairName" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Original Cost (₹)</label>
          <input type="number" id="repairCost" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Date Since Non-Working</label>
          <input type="date" id="repairDate" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Estimated Repair Cost (₹)</label>
          <input type="number" id="repairEst" class="form-control" required />
        </div>
        <div class="form-group full-width">
          <label class="form-label">Detailed Fault Description</label>
          <textarea id="repairDesc" class="form-control" required></textarea>
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>
            Submit Repair Request
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('repairs')}
    ${formHtml}
  `;
}

function bindRepairsEvents() {
  document.getElementById('repairForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Repair request submitted successfully (Demo)');
  });
}

// App Initialization
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

function renderTemplatesView() {
  const templates = [
    { path: '2.Intitiating process/Check list- A while initiate process.docx', name: 'Check list A' },
    { path: '2.Intitiating process/Format-Specifications Sheet.docx', name: 'Specifications Sheet' },
    { path: '2.Intitiating process/Format-Terms and conditions.docx', name: 'Terms and Conditions' },
    { path: '2.Intitiating process/General guidelines & Common ATC for bid.docx', name: 'General Guidelines & ATC' },
    { path: '2.Intitiating process/Indent for Purchase format_Govt. Fund.docx', name: 'Purchase Indent (Govt. Fund)' },
    { path: '2.Intitiating process/Indent for Purchase format_Non Govt. fund.docx', name: 'Purchase Indent (Non Govt. Fund)' },
    { path: '2.Intitiating process/Note for Purchase-New Item-2026-27.docx', name: 'Note for Purchase (New Item)' },
    { path: '2.Intitiating process/Note for Purchase-Other items.docx', name: 'Note for Purchase (Other Items)' },
  ];

  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Available Document Templates (Phase 2)</h3>
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
