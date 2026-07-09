Pages.resumes = {
  data: [],
  apps: [],

  async load() {
    try {
      [this.data, this.apps] = await Promise.all([
        API.get('/resumes/stats'),
        API.get('/applications')
      ]);
      this.render();
    } catch { toast('Failed to load resumes', 'error'); }
  },

  render() {
    const el = document.getElementById('resumes-grid');
    if (!this.data.length) {
      el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No resumes added yet. Add your first version!</div>';
      return;
    }
    el.innerHTML = this.data.map(r => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div style="flex:1;padding-right:0.5rem">
            <div style="font-weight:600;font-size:15px">${r.version_name}</div>
            ${r.uploaded_date ? `<div style="font-size:12px;color:var(--muted)">${fmtDate(r.uploaded_date)}</div>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:1rem;margin-bottom:8px">
          <div style="text-align:center;background:var(--bg);border-radius:8px;padding:8px 16px;flex:1">
            <div style="font-size:20px;font-weight:600">${r.total_used || 0}</div>
            <div style="font-size:11px;color:var(--muted)">Applications</div>
          </div>
          <div style="text-align:center;background:var(--accent-lt);border-radius:8px;padding:8px 16px;flex:1">
            <div style="font-size:20px;font-weight:600;color:var(--accent)">${r.selected || 0}</div>
            <div style="font-size:11px;color:var(--muted)">Selected</div>
          </div>
        </div>
        ${r.notes ? `<div style="font-size:13px;color:var(--muted);margin-bottom:8px">${r.notes}</div>` : ''}
        ${r.file_url ? `<a href="${r.file_url}" target="_blank" style="font-size:12px;color:var(--accent);display:block;margin-bottom:8px">📄 View Resume →</a>` : ''}
        <div style="margin-bottom:8px">
          <div style="font-size:12px;font-weight:500;color:var(--muted);margin-bottom:6px;cursor:pointer" onclick="Pages.resumes.toggleApps(${r.resume_id}, this)">
            📋 View Applications ▾
          </div>
          <div id="resume-apps-${r.resume_id}" style="display:none">
            ${this.apps.filter(a => a.resume_id === r.resume_id).length ?
              this.apps.filter(a => a.resume_id === r.resume_id).map(a => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">
                  <span><strong>${a.company_name}</strong> — ${a.role}</span>
                  <span class="badge badge-${a.status.toLowerCase()}">${a.status}</span>
                </div>
              `).join('') :
              '<div style="font-size:12px;color:var(--muted)">No applications linked to this resume yet.</div>'
            }
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn btn-outline btn-sm" onclick="Pages.resumes.openEdit(${r.resume_id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="Pages.resumes.delete(${r.resume_id})">Delete</button>
        </div>
      </div>
    `).join('');
  },

  async add(e) {
    e.preventDefault();
    const body = {
      version_name:  document.getElementById('res-version').value,
      file_url:      document.getElementById('res-url').value,
      uploaded_date: document.getElementById('res-date').value,
      notes:         document.getElementById('res-notes').value,
    };
    const btn = document.getElementById('res-add-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.post('/resumes', body);
      closeModal('res-modal');
      toast('Resume version added');
      await this.load();
    } catch (err) {
      document.getElementById('res-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },
  toggleApps(id, el) {
    const div = document.getElementById(`resume-apps-${id}`);
    if (div.style.display === 'none') {
      div.style.display = 'block';
      el.textContent = '📋 Hide Applications ▴';
    } else {
      div.style.display = 'none';
      el.textContent = '📋 View Applications ▾';
    }
  },

  openEdit(id) {
    const r = this.data.find(x => x.resume_id === id);
    if (!r) return;
    document.getElementById('edit-res-id').value      = r.resume_id;
    document.getElementById('edit-res-version').value = r.version_name;
    document.getElementById('edit-res-url').value     = r.file_url || '';
    document.getElementById('edit-res-date').value    = r.uploaded_date ? r.uploaded_date.split('T')[0] : '';
    document.getElementById('edit-res-notes').value   = r.notes || '';
    openModal('edit-res-modal');
  },

  async saveEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-res-id').value;
    const body = {
      version_name:  document.getElementById('edit-res-version').value,
      file_url:      document.getElementById('edit-res-url').value,
      uploaded_date: document.getElementById('edit-res-date').value,
      notes:         document.getElementById('edit-res-notes').value,
    };
    const btn = document.getElementById('edit-res-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.put(`/resumes/${id}`, body);
      closeModal('edit-res-modal');
      toast('Resume updated');
      await this.load();
    } catch (err) {
      document.getElementById('edit-res-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },

  async delete(id) {
    if (!confirm('Delete this resume version?')) return;
    try {
      await API.del(`/resumes/${id}`);
      toast('Deleted');
      this.data = this.data.filter(x => x.resume_id !== id);
      this.render();
    } catch { toast('Delete failed', 'error'); }
  }
};