Pages.interviews = {
  data: [],
  apps: [],

  async load() {
    try {
      [this.data, this.apps] = await Promise.all([API.get('/interviews'), API.get('/applications')]);
      this.renderTable();
      this.populateAppSelect();
    } catch { toast('Failed to load interviews', 'error'); }
  },

  renderTable() {
    const el = document.getElementById('int-table-body');
    if (!this.data.length) {
      document.getElementById('int-table-wrap').classList.add('hidden');
      document.getElementById('int-empty').classList.remove('hidden');
      return;
    }
    document.getElementById('int-table-wrap').classList.remove('hidden');
    document.getElementById('int-empty').classList.add('hidden');
    el.innerHTML = this.data.map(i => `
      <tr>
        <td style="font-weight:500">${i.company_name}</td>
        <td style="white-space:nowrap">${i.role}</td>
        <td style="text-align:center">#${i.round_number}</td>
        <td style="white-space:nowrap">${badge(i.round_type || '—', 'applied')}</td>
        <td style="font-size:13px;white-space:nowrap">${fmtDate(i.interview_date)}</td>
        <td onclick="Pages.interviews.cycleOutcome(${i.round_id}, this)" style="cursor:pointer" title="Click to change">${badge(i.outcome)}</td>
        <td style="font-size:12px;color:var(--muted);min-width:100px;white-space:nowrap">${i.prep_status}</td>
        <td style="font-size:12px;color:var(--muted);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" title="${i.notes || ''}" onclick="this.style.whiteSpace=this.style.whiteSpace==='normal'?'nowrap':'normal';this.style.maxWidth=this.style.maxWidth==='none'?'130px':'none'">${i.notes || '—'}</td>        <td style="display:flex;gap:6px">
  <button class="btn btn-outline btn-sm" onclick="Pages.interviews.openEdit(${i.round_id})">Edit</button>
  <button class="btn btn-danger btn-sm" onclick="Pages.interviews.delete(${i.round_id})">Delete</button>
</td>
      </tr>
    `).join('');

    document.querySelectorAll('.outcome-select').forEach(sel => {
      sel.addEventListener('change', async e => {
        const id = e.target.dataset.id;
        try {
          await API.patch(`/interviews/${id}/outcome`, { outcome: e.target.value });
          toast('Outcome updated');
        } catch { toast('Update failed', 'error'); }
      });
    });
  },

  populateAppSelect() {
    const sel = document.getElementById('int-app-select');
    sel.innerHTML = '<option value="">Select company — role</option>' +
      this.apps.map(a => `<option value="${a.application_id}">${a.company_name} — ${a.role}</option>`).join('');
  },

  async add(e) {
    e.preventDefault();
    const body = {
      application_id: document.getElementById('int-app-select').value,
      round_number:   document.getElementById('int-round-num').value,
      round_type:     document.getElementById('int-round-type').value,
      interview_date: document.getElementById('int-date').value,
      outcome:        document.getElementById('int-outcome').value,
      prep_status:    document.getElementById('int-prep').value,
      notes:          document.getElementById('int-notes').value,
    };
    const btn = document.getElementById('int-add-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.post('/interviews', body);
      closeModal('int-modal');
      toast('Round added');
      await this.load();
    } catch (err) {
      document.getElementById('int-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },

  openEdit(id) {
    const i = this.data.find(x => x.round_id === id);
    if (!i) return;
    document.getElementById('edit-int-id').value          = i.round_id;
    document.getElementById('edit-int-round-num').value   = i.round_number;
    document.getElementById('edit-int-round-type').value  = i.round_type;
    document.getElementById('edit-int-date').value        = i.interview_date ? i.interview_date.split('T')[0] : '';
    document.getElementById('edit-int-outcome').value     = i.outcome;
    document.getElementById('edit-int-prep').value        = i.prep_status;
    document.getElementById('edit-int-notes').value       = i.notes || '';
    openModal('edit-int-modal');
  },

  async saveEdit(e) {
    e.preventDefault();
    const id   = document.getElementById('edit-int-id').value;
    const body = {
      round_number:   document.getElementById('edit-int-round-num').value,
      round_type:     document.getElementById('edit-int-round-type').value,
      interview_date: document.getElementById('edit-int-date').value,
      outcome:        document.getElementById('edit-int-outcome').value,
      prep_status:    document.getElementById('edit-int-prep').value,
      notes:          document.getElementById('edit-int-notes').value,
    };
    const btn = document.getElementById('edit-int-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      await API.put(`/interviews/${id}`, body);
      closeModal('edit-int-modal');
      toast('Round updated');
      await this.load();
    } catch (err) {
      document.getElementById('edit-int-error').textContent = err.message;
    } finally { btn.textContent = 'Save'; btn.disabled = false; }
  },

  async delete(id) {
    if (!confirm('Delete this round?')) return;
    try {
      await API.del(`/interviews/${id}`);
      toast('Deleted');
      this.data = this.data.filter(i => i.round_id !== id);
      this.renderTable();
    } catch { toast('Delete failed', 'error'); }
  }
};
