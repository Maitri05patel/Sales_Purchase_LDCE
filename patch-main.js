const fs = require('fs');

let content = fs.readFileSync('client/src/main.js', 'utf8');

// 1. Add route to NAV_ITEMS
if (!content.includes("{ section: 'Templates Library'")) {
  const navSection = `
  { section: 'Templates Library', items: [
    { route: 'templates', label: 'Document Templates', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  ]},`;
  content = content.replace('];\n\nfunction renderSidebarNav', navSection + '\n];\n\nfunction renderSidebarNav');
}

// 2. Add 'templates' to ROLE_PERMISSIONS
content = content.replace(/repairs:\s*'(.*?)',/g, "repairs:   '$1',\n    templates: 'view',");

// 3. Add to getRouteTitle
content = content.replace("repairs: 'Equipment Repair Requests'", "repairs: 'Equipment Repair Requests',\n    templates: 'Document Templates Library'");

// 4. Add router logic
const routerLogic = `} else if (route === 'templates') {
      appEl.innerHTML = renderAppShell(renderTemplatesView(), 'templates');
    }`;
content = content.replace("} else if (route === 'repairs') {", routerLogic + " else if (route === 'repairs') {");

// 5. Add renderTemplatesView function
const viewFunc = `
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

  return \`
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
            \${templates.map(t => \`
              <tr>
                <td><strong>\${t.name}</strong><br><small>\${t.path}</small></td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="window.downloadTemplate('\${t.path}')">
                    Fill & Download
                  </button>
                </td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  \`;
}
`;
if (!content.includes("function renderTemplatesView")) {
  content += viewFunc;
}

// 6. Expose downloadTemplate to window
if (!content.includes("window.downloadTemplate")) {
  content = content.replace("window.handleDownloadDoc = async", "window.downloadTemplate = api.downloadTemplate;\nwindow.handleDownloadDoc = async");
}

fs.writeFileSync('client/src/main.js', content, 'utf8');
console.log('Successfully patched client/src/main.js');
