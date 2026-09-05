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
    masters:   'view',
    cte:       'approve',
    indents:   'approve',
    notes:     'approve',
    financial: 'view',
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
    financial: 'view',
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

// Router & Controller
async function router() {
  const hash = window.location.hash || '#/dashboard';
  const route = hash.replace('#/', '') || 'dashboard';
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
      const orders = await api.getOrders();
      const vouchers = await api.getVouchers();
      appEl.innerHTML = renderAppShell(renderDeliveryView(orders.data, vouchers.data), 'delivery');
      bindDeliveryEvents();
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
// 9. DELIVERY & VOUCHERS (FORM-10 & 11)
// ----------------------------------------------------
function renderDeliveryView(orders, vouchers) {
  const formHtml = canCreate('delivery') ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pass for Payment Voucher (FORM-11)</h3>
      </div>
      <form id="voucherForm" class="form-grid">
        <div class="form-group">
          <label class="form-label">Sanction Ref / Order No</label>
          <input type="text" id="voucherRef" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Gross Invoice Amount (₹)</label>
          <input type="number" id="voucherGross" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Central Stock Folio</label>
          <input type="text" id="voucherFolio" class="form-control" placeholder="e.g. Vol 3, Page 142" required />
        </div>
        <div class="form-group">
          <label class="form-label">Deductions (Penalty/SD) (₹)</label>
          <input type="number" id="voucherDeductions" class="form-control" value="0.00" />
        </div>
        <div class="form-group full-width">
          <label class="form-label">Account Head</label>
          <input type="text" id="voucherHead" class="form-control" required />
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
            Process Payment Voucher
          </button>
        </div>
      </form>
    </div>
  ` : '';

  return `
    ${renderAccessBanner('delivery')}
    ${formHtml}
  `;
}

function bindDeliveryEvents() {
  document.getElementById('voucherForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Voucher processed successfully (Demo)');
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

// ----------------------------------------------------
// 11. DOCUMENT CENTRE
// ----------------------------------------------------

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
    const isDualFormat = ['DOC-01', 'DOC-02', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-06', 'DOC-07'].includes(docId);
    const actionBtns = isDualFormat ? `
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
    ` : `
      <button
        class="btn btn-primary btn-sm doc-download-btn"
        style="width:100%;justify-content:center;margin-top:0.5rem;"
        data-doc="${docId}"
        onclick="window.downloadDocFromCentre('${docId}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Document (.docx)
      </button>
    `;

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
          <div style="font-size:0.85rem;color:var(--neutral-400,#888);">All 47 official procurement documents — generated live from your database data. Click any Download button to get the filled .docx file.</div>
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
      { docId:'DOC-25', name:'DLPC Agenda & Proposal', note:'Select the committee meeting', selector: sel('mtg-25', meetingOpts, 'Select Meeting') },
      { docId:'DOC-26', name:'DLPC Rate Reasonability Certificate', note:'Select the committee meeting', selector: sel('mtg-26', meetingOpts, 'Select Meeting') },
      { docId:'DOC-27', name:'DLPC Minutes of Meeting (MOM)', note:'Select the committee meeting', selector: sel('mtg-27', meetingOpts, 'Select Meeting') },
      { docId:'DOC-28', name:'Checklist B – Final Approval Package', note:'Select the committee meeting', selector: sel('mtg-28', meetingOpts, 'Select Meeting') },
      { docId:'DOC-29', name:'Note – Direct Purchase Against Bid (DLPC)', note:'Select the committee meeting', selector: sel('mtg-29', meetingOpts, 'Select Meeting') },
      { docId:'DOC-30', name:'DPC Proposal Document Index', note:'Select the DPC meeting', selector: sel('mtg-30', meetingOpts, 'Select Meeting') },
      { docId:'DOC-31', name:'DPC Forwarding Letter to Principal', note:'Select the DPC meeting', selector: sel('mtg-31', meetingOpts, 'Select Meeting') },
      { docId:'DOC-32', name:'GeM Agenda Format – DPC', note:'Select the DPC meeting', selector: sel('mtg-32', meetingOpts, 'Select Meeting') },
      { docId:'DOC-33', name:'Institute BID Certificate', note:'Select the DPC meeting', selector: sel('mtg-33', meetingOpts, 'Select Meeting') },
      { docId:'DOC-34', name:'L1 INFO Sheet for DPC', note:'Select the DPC meeting', selector: sel('mtg-34', meetingOpts, 'Select Meeting') },
      { docId:'DOC-35', name:'DPC Minutes of Meeting (MOM)', note:'Select the DPC meeting', selector: sel('mtg-35', meetingOpts, 'Select Meeting') },
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
  'DOC-26': () => ({ entityId: document.getElementById('mtg-26')?.value }),
  'DOC-27': () => ({ entityId: document.getElementById('mtg-27')?.value }),
  'DOC-28': () => ({ entityId: document.getElementById('mtg-28')?.value }),
  'DOC-29': () => ({ entityId: document.getElementById('mtg-29')?.value }),
  'DOC-30': () => ({ entityId: document.getElementById('mtg-30')?.value }),
  'DOC-31': () => ({ entityId: document.getElementById('mtg-31')?.value }),
  'DOC-32': () => ({ entityId: document.getElementById('mtg-32')?.value }),
  'DOC-33': () => ({ entityId: document.getElementById('mtg-33')?.value }),
  'DOC-34': () => ({ entityId: document.getElementById('mtg-34')?.value }),
  'DOC-35': () => ({ entityId: document.getElementById('mtg-35')?.value }),
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

function bindDocumentsEvents() {
  // Event listeners handled via window.downloadDocFromCentre
}

