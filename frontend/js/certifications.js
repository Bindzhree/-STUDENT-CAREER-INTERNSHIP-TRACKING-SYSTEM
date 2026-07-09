Pages.certifications = {
  data: [],

  async load() {
    try {
      this.data = await API.get('/certifications');
      this.render();
    } catch { toast('Failed to load certifications', 'error'); }
  },

  render() {
    const el = document.getElementById('certs-grid');
    if (!this.data.length) {
      el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No certifications yet. Add your first one!</div>';
      return;
    }
    el.innerHTML = this.data.map(c => {
      const expired = c.expiry_date && new Date(c.expiry_date) < new Date();
      return `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div style="font-weight:500;font-size:15px;flex:1;padding-right:0.5rem">${c.cert_name}</div>
            <button class="btn btn-danger btn-sm" onclick="Pages.certifications.delete(${c.cert_id})">Delete</button>
          </div>
          ${c.platform ? `<div style="font-size:13px;color:var(--muted);margin-bottom:6px">📚 ${c.platform}</div>` : ''}
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;font-size:12px;color:var(--muted)">
            ${c.completion_date ? `<span>✅ ${fmtDate(c.completion_date)}</span>` : ''}
            ${c.expiry_date ? `<span style="color:${expired ? 'var(--danger)' : 'inherit'}">${expired ? '⚠️ Expired' : '🗓'} ${fmtDate(c.expiry_date)}</span>` : ''}
          </div>
          ${c.proof_url ? `<a href="${c.proof_url}" target="_blank" style="font-size:12px;color:var(--accent);margin-top:6px;display:block">View Certificate →</a>` : ''}
        </div>`;
    }).join('');
  },

  async add(e) {
    e.preventDefault();
    const body = {
      cert_name:       document.getElementById('cert-name').value,
      platform:        document.getElementById('cert-platform').value,
      completion_date: document.getElementById('cert-completion').value,
      expiry_date:     document.getElementById('cert-expiry').value,
      proof_url:       document.getElementById('cert-proof').value,
    };
    const btn = document.getElementById('cert-add-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.post('/certifications', body);
      closeModal('cert-modal');
      toast('Certification added');
      await this.load();
    } catch (err) {
      document.getElementById('cert-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },

  async delete(id) {
    if (!confirm('Delete this certification?')) return;
    try {
      await API.del(`/certifications/${id}`);
      toast('Deleted');
      this.data = this.data.filter(c => c.cert_id !== id);
      this.render();
    } catch { toast('Failed', 'error'); }
  }
};
