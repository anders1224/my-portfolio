// js/dashboard-layout.js — injected on every dashboard page

function renderSidebar(activePage, user) {
  const navItems = [
    { id:'overview',      icon:'🏠', label:'Overview',          href:'index.html' },
    { id:'investments',   icon:'📈', label:'My Investments',    href:'investments.html' },
    { id:'deposit',       icon:'💰', label:'Deposit',           href:'deposit.html' },
    { id:'withdraw',      icon:'💸', label:'Withdraw',          href:'withdraw.html' },
    { id:'transactions',  icon:'📋', label:'Transactions',      href:'transactions.html' },
    { id:'referrals',     icon:'🎁', label:'Referrals',         href:'referrals.html' },
    { id:'profile',       icon:'👤', label:'My Profile',        href:'profile.html' },
    { id:'support',       icon:'💬', label:'Support',           href:'support.html' },
  ];

  const nav = navItems.map(item => `
    <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
      <span class="nav-icon">${item.icon}</span> ${item.label}
    </a>
  `).join('');

  return `
    <div class="sidebar-logo">
      <a href="../index.html" class="logo">
        <div class="logo-icon">⚡</div> THRIVE<span>MINE</span>
      </a>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Main Menu</div>
      ${nav}
    </nav>
    <div class="sidebar-footer">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(57,255,20,.1);
          border:1px solid var(--border);display:flex;align-items:center;justify-content:center;
          font-family:'Rajdhani',sans-serif;font-weight:700;color:var(--green);font-size:.9rem;flex-shrink:0;">
          ${(user?.full_name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style="overflow:hidden;">
          <div style="font-size:.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${user?.full_name || 'User'}
          </div>
          <div style="font-size:.7rem;color:var(--muted);">${user?.email || ''}</div>
        </div>
      </div>
      <button onclick="signOut('../thrivemine_index_16.html')" class="btn btn-danger btn-sm btn-full">
        🚪 Sign Out
      </button>
    </div>
  `;
}

function renderTopbar(title, unreadCount = 0) {
  return `
    <button class="menu-btn" onclick="toggleSidebar()">☰</button>
    <div>
      <h2 style="font-family:'Rajdhani',sans-serif;font-size:1.1rem;font-weight:700;">${title}</h2>
    </div>
    <div class="topbar-right">
      <a href="profile.html" style="width:34px;height:34px;border-radius:50%;
        background:rgba(57,255,20,.1);border:1px solid var(--border);
        display:flex;align-items:center;justify-content:center;
        font-family:'Rajdhani',sans-serif;font-weight:700;color:var(--green);font-size:.85rem;">
        U
      </a>
    </div>
  `;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}

function initLayout(activePage, pageTitle) {
  (async () => {
    const user = await requireUser();
    if (!user) return;

    document.getElementById('sidebar').innerHTML  = renderSidebar(activePage, user);
    document.getElementById('topbar').innerHTML   = renderTopbar(pageTitle);

    // Update avatar initial
    document.querySelectorAll('.user-initial').forEach(el => {
      el.textContent = (user.full_name || 'U').charAt(0).toUpperCase();
    });

    return user;
  })();
}
