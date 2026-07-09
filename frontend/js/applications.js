Pages.applications = {
  data: [],

  async load() {
    try {
      const [apps, resumes] = await Promise.all([
        API.get('/applications'),
        API.get('/resumes')
      ]);
      this.data = apps;
      this.render();
      this.populateResumeSelect(resumes);
    } catch { toast('Failed to load applications', 'error'); }
  },

  populateResumeSelect(resumes) {
    const sel = document.getElementById('app-resume-id');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select resume version (optional)</option>' +
      resumes.map(r => `<option value="${r.resume_id}">${r.version_name}</option>`).join('');
  },

  render() {
    const el = document.getElementById('apps-table-body');
    if (!this.data.length) {
      document.getElementById('apps-table-wrap').classList.add('hidden');
      document.getElementById('apps-empty').classList.remove('hidden');
      return;
    }
    document.getElementById('apps-table-wrap').classList.remove('hidden');
    document.getElementById('apps-empty').classList.add('hidden');

    const STATUSES = ['Applied','Assessment','Interview','Rejected','Selected'];
    el.innerHTML = this.data.map(a => `
      <tr>
        <td style="font-weight:500">${a.company_name}</td>
        <td>${a.role}</td>
        <td style="color:var(--muted);font-size:13px">${a.platform || '—'}</td>
        <td style="font-size:13px">${fmtDate(a.applied_date)}</td>
        <td style="font-size:13px">${fmtDate(a.deadline)}</td>
        <td>
          <select class="status-select" data-id="${a.application_id}" style="font-size:12px;padding:3px 6px;width:auto">
            ${STATUSES.map(s => `<option ${s===a.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td style="display:flex;gap:6px">
  <button class="btn btn-outline btn-sm" onclick="Pages.applications.openEdit(${a.application_id})">Edit</button>
  <button class="btn btn-danger btn-sm" onclick="Pages.applications.delete(${a.application_id})">Delete</button>
</td>
      </tr>
    `).join('');

    // attach status change listeners
    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async e => {
        const id = e.target.dataset.id;
        const status = e.target.value;
        try {
          await API.patch(`/applications/${id}/status`, { status });
          const app = this.data.find(a => a.application_id == id);
          if (app) app.status = status;
          toast('Status updated');
          if (status === 'Selected') {
            if (app && confirm(`🎉 Congratulations on getting selected at ${app.company_name}!\n\nDo you want to add this to your Experience tracker?`)) {
              document.getElementById('exp-company-select').value = '';
              document.getElementById('exp-company').value = app.company_name;
              document.getElementById('exp-role').value = app.role;
              document.getElementById('exp-status').value = 'Ongoing';
              Router.go('experience');
              setTimeout(() => openModal('exp-modal'), 300);
            }
          }
        } catch { toast('Update failed', 'error'); }
      });
    });
  },

  filter() {
    const search = document.getElementById('apps-search').value.toLowerCase();
    const status = document.getElementById('apps-status-filter').value;
    const filtered = this.data.filter(a => {
      const matchSearch = !search ||
        a.company_name.toLowerCase().includes(search) ||
        a.role.toLowerCase().includes(search);
      const matchStatus = !status || a.status === status;
      return matchSearch && matchStatus;
    });
    this.renderFiltered(filtered);
  },

  renderFiltered(data) {
    const el = document.getElementById('apps-table-body');
    if (!data.length) {
      document.getElementById('apps-table-wrap').classList.add('hidden');
      document.getElementById('apps-empty').classList.remove('hidden');
      document.getElementById('apps-empty').textContent = 'No applications match your search.';
      return;
    }
    document.getElementById('apps-table-wrap').classList.remove('hidden');
    document.getElementById('apps-empty').classList.add('hidden');
    const STATUSES = ['Applied','Assessment','Interview','Rejected','Selected'];
    el.innerHTML = data.map(a => `
      <tr>
        <td style="font-weight:500">${a.company_name}</td>
        <td>${a.role}</td>
        <td style="color:var(--muted);font-size:13px">${a.platform || '—'}</td>
        <td style="font-size:13px">${fmtDate(a.applied_date)}</td>
        <td style="font-size:13px">${fmtDate(a.deadline)}</td>
        <td>
          <select class="status-select" data-id="${a.application_id}" style="font-size:12px;padding:3px 6px;width:auto">
            ${STATUSES.map(s => `<option ${s===a.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="Pages.applications.openEdit(${a.application_id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="Pages.applications.delete(${a.application_id})">Delete</button>
        </td>
      </tr>
    `).join('');
    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async e => {
        const id = e.target.dataset.id;
        const status = e.target.value;
        try {
          await API.patch(`/applications/${id}/status`, { status });
          const app = this.data.find(a => a.application_id == id);
          if (app) app.status = status;
          toast('Status updated');
          // if selected — ask to add to experience
          if (status === 'Selected') {
            const app = this.data.find(a => a.application_id == id);
            if (app && confirm(`🎉 Congratulations on getting selected at ${app.company_name}!\n\nDo you want to add this to your Experience tracker?`)) {
              // pre-fill experience modal
              document.getElementById('exp-company-select').value = '';
              document.getElementById('exp-company').value = app.company_name;
              document.getElementById('exp-role').value = app.role;
              document.getElementById('exp-status').value = 'Ongoing';
              // switch to experience page and open modal
              Router.go('experience');
              setTimeout(() => openModal('exp-modal'), 300);
            }
          }
        } catch { toast('Update failed', 'error'); }
      });
    });
  },

  async add(e) {
    e.preventDefault();
    const body = {
      company_name: document.getElementById('app-company').value,
      role:         document.getElementById('app-role').value,
      platform:     document.getElementById('app-platform').value,
      industry:     document.getElementById('app-industry').value,
      applied_date: document.getElementById('app-date').value,
      deadline:     document.getElementById('app-deadline').value,
      resume_id:    document.getElementById('app-resume-id').value || null,
    };
    const btn = document.getElementById('app-add-btn');
    btn.textContent = 'Adding...'; btn.disabled = true;
    try {
      await API.post('/applications', body);
      closeModal('app-modal');
      toast('Application added');
      await this.load();
    } catch (err) {
      document.getElementById('app-error').textContent = err.message;
    } finally { btn.textContent = 'Add'; btn.disabled = false; }
  },

  openEdit(id) {
    const a = this.data.find(x => x.application_id === id);
    if (!a) return;
    document.getElementById('edit-app-id').value       = a.application_id;
    document.getElementById('edit-app-company').value  = a.company_name;
    document.getElementById('edit-app-role').value     = a.role;
    document.getElementById('edit-app-platform').value = a.platform || '';
    document.getElementById('edit-app-date').value     = a.applied_date ? a.applied_date.split('T')[0] : '';
    document.getElementById('edit-app-deadline').value = a.deadline ? a.deadline.split('T')[0] : '';
    openModal('edit-app-modal');
  },

  async saveEdit(e) {
    e.preventDefault();
    const id   = document.getElementById('edit-app-id').value;
    const body = {
      role:         document.getElementById('edit-app-role').value,
      platform:     document.getElementById('edit-app-platform').value,
      applied_date: document.getElementById('edit-app-date').value,
      deadline:     document.getElementById('edit-app-deadline').value,
    };
    const btn = document.getElementById('edit-app-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.put(`/applications/${id}`, body);
      closeModal('edit-app-modal');
      toast('Application updated');
      await this.load();
    } catch (err) {
      document.getElementById('edit-app-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },

  async delete(id) {
    if (!confirm('Delete this application and its interview rounds?')) return;
    try {
      await API.del(`/applications/${id}`);
      toast('Deleted');
      this.data = this.data.filter(a => a.application_id !== id);
      this.render();
    } catch { toast('Delete failed', 'error'); }
  }
};
