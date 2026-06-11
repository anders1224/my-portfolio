// lib/supabase.js — include this on every page
// Replace with your actual Supabase project URL and anon key

const SUPABASE_URL  = 'https://ohlyburyplamumonbqsn.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obHlidXJ5cGxhbXVtb25icXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjQxNjEsImV4cCI6MjA5NjQ0MDE2MX0.IYDqaymyREpRgXmNM38sPHe6jH0DuIYVk84Yrk1kSAg';

// Load Supabase from local bundle
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── AUTH HELPERS ──────────────────────────
async function getSession() {
  const { data: { session } } = await db.auth.getSession();
  return session;
}

async function getUser() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !data) {
    // Fallback to session user when the profiles row is not available.
    return session.user;
  }

  return data;
}

// Resolve the login page relative to the current location
function _loginPage() {
  // dashboard pages live one level deep, so go up one folder
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const prefix = depth > 1 ? '../' : '';
  return prefix + 'thrivemine_index_16.html';
}

async function requireAuth(redirectTo) {
  const session = await getSession();
  if (!session) { window.location.href = redirectTo || _loginPage(); return null; }
  return session;
}

async function requireAdmin(redirectTo) {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    window.location.href = redirectTo || _loginPage();
    return null;
  }
  return user;
}

async function requireUser(redirectTo) {
  const user = await getUser();
  if (!user) { window.location.href = redirectTo || _loginPage(); return null; }
  if (user.role === 'admin') { window.location.href = '../admin/dashboard.html'; return null; }
  if (user.account_status === 'pending') {
    document.body.innerHTML = `
      <div style="min-height:100vh;background:#060d0a;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;padding:20px;">
        <div style="background:#0d1f15;border:1px solid rgba(57,255,20,.15);border-radius:16px;padding:48px 40px;max-width:480px;width:100%;text-align:center;">
          <div style="font-size:3rem;margin-bottom:16px;">⏳</div>
          <h2 style="color:#39ff14;font-size:1.6rem;font-weight:700;margin-bottom:10px;">Account Pending Approval</h2>
          <p style="color:#8a9a8e;font-size:.95rem;line-height:1.7;margin-bottom:28px;">
            Your account has been created and is awaiting admin approval.<br>
            You will be notified once your account is activated.
          </p>
          <button onclick="(async()=>{await db.auth.signOut();window.location.href='../${_loginPage()}'})()"
            style="background:rgba(57,255,20,.1);border:1px solid rgba(57,255,20,.3);color:#39ff14;padding:10px 28px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:.9rem;font-weight:600;">
            Sign Out
          </button>
        </div>
      </div>`;
    return null;
  }
  if (user.account_status === 'rejected') {
    document.body.innerHTML = `
      <div style="min-height:100vh;background:#060d0a;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;padding:20px;">
        <div style="background:#1a0d0d;border:1px solid rgba(239,68,68,.2);border-radius:16px;padding:48px 40px;max-width:480px;width:100%;text-align:center;">
          <div style="font-size:3rem;margin-bottom:16px;">🚫</div>
          <h2 style="color:#ef4444;font-size:1.6rem;font-weight:700;margin-bottom:10px;">Account Not Approved</h2>
          <p style="color:#8a9a8e;font-size:.95rem;line-height:1.7;margin-bottom:28px;">
            Your account application was not approved.<br>
            Please contact support if you believe this is a mistake.
          </p>
          <button onclick="(async()=>{await db.auth.signOut();window.location.href='../${_loginPage()}'})()"
            style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:10px 28px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:.9rem;font-weight:600;">
            Sign Out
          </button>
        </div>
      </div>`;
    return null;
  }
  return user;
}

async function signOut(redirectTo = '/index.html') {
  await db.auth.signOut();
  window.location.href = redirectTo;
}

// ── UTIL HELPERS ─────────────────────────
function fmt(n, decimals = 2) {
  if (n == null) return '$0.00';
  return '$' + parseFloat(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year:'numeric', month:'short', day:'numeric'
  });
}

function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year:'numeric', month:'short', day:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
}

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function statusBadge(s) {
  const map = {
    pending:   'badge-warning',
    approved:  'badge-success',
    completed: 'badge-success',
    active:    'badge-success',
    rejected:  'badge-danger',
    cancelled: 'badge-danger',
    suspended: 'badge-danger',
    open:      'badge-info',
    replied:   'badge-success',
    closed:    'badge-muted',
  };
  return `<span class="badge ${map[s]||'badge-muted'}">${s}</span>`;
}

function showAlert(el, msg, type = 'error') {
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'flex';
}

function hideAlert(el) {
  if (el) el.style.display = 'none';
}

function setLoading(btn, loading, text = 'Loading…') {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> ${text}`
    : btn.dataset.text || btn.textContent;
}

// Store original button text
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn').forEach(b => {
    b.dataset.text = b.textContent.trim();
  });
});
