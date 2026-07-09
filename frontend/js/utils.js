// ---- ROUTER ----
const Router = {
  current: null,

  go(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar a[data-page]').forEach(a => a.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    const link = document.querySelector(`.sidebar a[data-page="${page}"]`);
    if (link) link.classList.add('active');
    this.current = page;
    Pages[page]?.load?.();
  }
};

// ---- MODAL ----
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  // reset form inside
  const form = document.querySelector(`#${id} form`);
  if (form) form.reset();
  const err = document.querySelector(`#${id} .error-msg`);
  if (err) err.textContent = '';
}

// close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ---- TOAST ----
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;padding:0.7rem 1.2rem;border-radius:8px;font-size:14px;font-weight:500;z-index:999;background:${type === 'success' ? 'var(--accent)' : 'var(--danger)'};color:white;box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ---- DATE FORMAT ----
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---- BADGE ----
function badge(text, cls) {
  return `<span class="badge badge-${cls || text.toLowerCase()}">${text}</span>`;
}

// ---- AUTH GUARD ----
function requireAuth() {
  if (!localStorage.getItem('token')) {
    showAuth('login');
    return false;
  }
  return true;
}

function showAuth(page) {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('login-box').classList.toggle('hidden', page !== 'login');
  document.getElementById('register-box').classList.toggle('hidden', page !== 'register');
  document.getElementById('forgot-box').classList.toggle('hidden', page !== 'forgot');
  document.getElementById('onboarding-box').classList.add('hidden');
}

function showApp(student) {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('sidebar-name').textContent = student.name;
  document.getElementById('sidebar-branch').textContent = `${student.branch || 'Student'} · Sem ${student.semester || '—'}`;
  updateAvatar(student);
  Router.go('dashboard');
}

function updateAvatar(student) {
  const el = document.getElementById('sidebar-avatar');
  if (!el) return;
  if (student.avatar_url) {
    el.innerHTML = `<img src="${student.avatar_url}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" onerror="this.parentElement.innerHTML='${getInitials(student.name)}'" />`;
    el.style.background = 'transparent';
  } else {
    el.textContent = getInitials(student.name);
    el.style.background = getAvatarColor(student.name);
  }
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase() : parts[0][0].toUpperCase();
}

function getAvatarColor(name) {
  const colors = ['#1a6b4a','#185fa5','#5b4fb7','#b7791f','#c0392b','#0f6e56','#2c7be5'];
  let hash = 0;
  for (let i = 0; i < name?.length || 0; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}
