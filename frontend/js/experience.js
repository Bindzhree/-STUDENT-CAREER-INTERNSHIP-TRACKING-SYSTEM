Pages.experience = {

    companies: [],

  async load() {
    try {
      [this.data, this.companies] = await Promise.all([
        API.get('/experience'),
        API.get('/applications')
      ]);
      this.populateCompanySelect();
      this.render();
    } catch { toast('Failed to load experience', 'error'); }
  },

  populateCompanySelect() {
    const unique = [...new Set(this.companies.map(a => a.company_name))];
    const sel = document.getElementById('exp-company-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select existing company...</option>' +
      unique.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  handleCompanySelect() {
    const sel = document.getElementById('exp-company-select');
    const input = document.getElementById('exp-company');
    if (sel.value) input.value = sel.value;
  },
  data: [],

  async load() {
    try {
      [this.data, this.companies] = await Promise.all([
        API.get('/experience'),
        API.get('/applications')
      ]);
      this.populateCompanySelect();
      this.render();
    } catch { toast('Failed to load experience', 'error'); }
  },

  populateCompanySelect() {
    const unique = [...new Set(this.companies.map(a => a.company_name))];
    const sel = document.getElementById('exp-company-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select existing company...</option>' +
      unique.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  handleCompanySelect() {
    const sel = document.getElementById('exp-company-select');
    const input = document.getElementById('exp-company');
    if (sel.value) input.value = sel.value;
  },

  render() {
    const el = document.getElementById('exp-grid');
    if (!this.data.length) {
      el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No internship experience added yet. Add your first one!</div>';
      return;
    }
    el.innerHTML = this.data.map(e => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div style="flex:1;padding-right:0.5rem">
            <div style="font-weight:600;font-size:15px">${e.company_name}</div>
            <div style="font-size:13px;color:var(--muted)">${e.role}</div>
          </div>
          <span class="badge ${e.status==='Ongoing'?'badge-interview':'badge-selected'}">${e.status}</span>
        </div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-bottom:8px">
          ${e.start_date ? `<span>📅 ${fmtDate(e.start_date)} → ${e.end_date ? fmtDate(e.end_date) : 'Present'}</span>` : ''}
          ${e.type ? `<span>📍 ${e.type}</span>` : ''}
          ${e.stipend ? `<span>💰 ${e.stipend}</span>` : ''}
        </div>
        ${e.description ? `<div style="font-size:13px;color:var(--text);margin-bottom:8px;line-height:1.5">${e.description}</div>` : ''}
        ${e.skills_used ? `<div style="font-size:12px;color:var(--muted);margin-bottom:8px">🛠 <strong>Skills:</strong> ${e.skills_used}</div>` : ''}
        ${e.certificate_url ? `<a href="${e.certificate_url}" target="_blank" style="font-size:12px;color:var(--accent);display:block;margin-bottom:8px">📄 View Certificate →</a>` : ''}
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn btn-outline btn-sm" onclick="Pages.experience.openEdit(${e.experience_id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="Pages.experience.delete(${e.experience_id})">Delete</button>
        </div>
      </div>
    `).join('');
  },

  async add(e) {
    e.preventDefault();
    const body = {
      company_name:    document.getElementById('exp-company').value,
      role:            document.getElementById('exp-role').value,
      start_date:      document.getElementById('exp-start').value,
      end_date:        document.getElementById('exp-end').value,
      type:            document.getElementById('exp-type').value,
      stipend:         document.getElementById('exp-stipend').value,
      description:     document.getElementById('exp-desc').value,
      skills_used:     document.getElementById('exp-skills').value,
      certificate_url: document.getElementById('exp-cert').value,
      status:          document.getElementById('exp-status').value,
    };
    const btn = document.getElementById('exp-add-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.post('/experience', body);
      closeModal('exp-modal');
      toast('Experience added');
      await this.load();
    } catch (err) {
      document.getElementById('exp-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },

  openEdit(id) {
    const e = this.data.find(x => x.experience_id === id);
    if (!e) return;
    document.getElementById('edit-exp-id').value      = e.experience_id;
    document.getElementById('edit-exp-company').value = e.company_name;
    document.getElementById('edit-exp-role').value    = e.role;
    document.getElementById('edit-exp-start').value   = e.start_date ? e.start_date.split('T')[0] : '';
    document.getElementById('edit-exp-end').value     = e.end_date ? e.end_date.split('T')[0] : '';
    document.getElementById('edit-exp-type').value    = e.type;
    document.getElementById('edit-exp-stipend').value = e.stipend || '';
    document.getElementById('edit-exp-desc').value    = e.description || '';
    document.getElementById('edit-exp-skills').value  = e.skills_used || '';
    document.getElementById('edit-exp-cert').value    = e.certificate_url || '';
    document.getElementById('edit-exp-status').value  = e.status;
    openModal('edit-exp-modal');
  },

  async saveEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-exp-id').value;
    const body = {
      company_name:    document.getElementById('edit-exp-company').value,
      role:            document.getElementById('edit-exp-role').value,
      start_date:      document.getElementById('edit-exp-start').value,
      end_date:        document.getElementById('edit-exp-end').value,
      type:            document.getElementById('edit-exp-type').value,
      stipend:         document.getElementById('edit-exp-stipend').value,
      description:     document.getElementById('edit-exp-desc').value,
      skills_used:     document.getElementById('edit-exp-skills').value,
      certificate_url: document.getElementById('edit-exp-cert').value,
      status:          document.getElementById('edit-exp-status').value,
    };
    const btn = document.getElementById('edit-exp-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.put(`/experience/${id}`, body);
      closeModal('edit-exp-modal');
      toast('Experience updated');
      await this.load();
    } catch (err) {
      document.getElementById('edit-exp-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },

  async delete(id) {
    if (!confirm('Delete this experience?')) return;
    try {
      await API.del(`/experience/${id}`);
      toast('Deleted');
      this.data = this.data.filter(x => x.experience_id !== id);
      this.render();
    } catch { toast('Delete failed', 'error'); }
  }
};