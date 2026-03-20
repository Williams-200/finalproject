// ============================================================
// DASHBOARD.JS — Name entry, localStorage progress, UI updates
// ============================================================

const LS_NAME    = 'pylearn_name';
const LS_VISITED = 'pylearn_visited';   // JSON: { vars: true, cond: false, ... }
const LS_POINTS  = 'pylearn_points';    // JSON: { vars: 3, cond: 0, ... }

const MODULE_KEYS = ['vars', 'cond', 'loops', 'func'];
const MODULE_PAGES = {
  vars:  'index.html',
  cond:  'conditionals.html',
  loops: 'loops.html',
  func:  'functions.html',
};

// ===== INITIALISE =====
window.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem(LS_NAME);
  if (name) {
    showDashboard(name);
  } else {
    document.getElementById('name-screen').removeAttribute('hidden');
  }
});

// ===== NAME ENTRY =====
function saveName() {
  const input = document.getElementById('name-input');
  const name  = (input ? input.value : '').trim();
  if (!name) {
    input.focus();
    input.style.borderColor = '#f87171';
    setTimeout(() => { input.style.borderColor = ''; }, 1200);
    return;
  }
  localStorage.setItem(LS_NAME, name);
  const screen = document.getElementById('name-screen');
  screen.classList.add('fade-out');
  setTimeout(() => {
    screen.setAttribute('hidden', '');
    showDashboard(name);
  }, 400);
}

// ===== SHOW DASHBOARD =====
function showDashboard(name) {
  const dash = document.getElementById('dashboard');
  dash.removeAttribute('hidden');

  // Set names
  const initial = name.charAt(0).toUpperCase();
  document.getElementById('user-avatar').textContent        = initial;
  document.getElementById('user-name-display').textContent  = name;
  document.getElementById('wb-name').textContent            = name.split(' ')[0]; // first name only

  loadProgress();
}

// ===== PROGRESS (read localStorage from module pages) =====
function loadProgress() {
  const visited = getVisited();
  const points  = getPoints();

  let startedCount = 0;
  let totalPoints  = 0;

  MODULE_KEYS.forEach(key => {
    const hasVisited = visited[key];
    const pts        = points[key] || 0;

    if (hasVisited) startedCount++;
    totalPoints += pts;

    // Progress bar: use quiz points as rough %  (max 5 per module → 100%)
    const pct  = Math.min(100, (pts / 5) * 100);
    const bar  = document.getElementById('prog-' + key);
    const badge= document.getElementById('badge-' + key);
    const cta  = document.getElementById('cta-' + key);

    if (bar)   bar.style.width = pct + '%';

    if (hasVisited && pts >= 5) {
      if (badge) { badge.textContent = '✅ Done!'; badge.className = 'mc-badge done'; }
      if (cta)   cta.textContent = 'Review →';
    } else if (hasVisited) {
      if (badge) { badge.textContent = '⏳ In progress'; badge.className = 'mc-badge started'; }
      if (cta)   cta.textContent = 'Continue →';
    } else {
      if (badge) { badge.textContent = 'New'; badge.className = 'mc-badge'; }
      if (cta)   cta.textContent = 'Start →';
    }
  });

  // Update summary numbers
  const psDone  = document.getElementById('ps-done');
  const psQuiz  = document.getElementById('ps-quiz');
  if (psDone) psDone.textContent = startedCount;
  if (psQuiz) psQuiz.textContent = totalPoints;

  // Mark each card as visited when clicked
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.key;
      if (key) markVisited(key);
    });
  });
}

// ===== HELPERS =====
function getVisited() {
  try { return JSON.parse(localStorage.getItem(LS_VISITED)) || {}; }
  catch { return {}; }
}

function getPoints() {
  try { return JSON.parse(localStorage.getItem(LS_POINTS)) || {}; }
  catch { return {}; }
}

function markVisited(key) {
  const v = getVisited();
  v[key] = true;
  localStorage.setItem(LS_VISITED, JSON.stringify(v));
}

// ===== LOGOUT =====
function logout() {
  if (!confirm('Log out? Your progress will be saved for next time.')) return;
  localStorage.removeItem(LS_NAME);
  // keep progress intact so it loads on next login
  location.reload();
}
