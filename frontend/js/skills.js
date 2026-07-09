Pages.skills = {
  data: [],

  async load() {
    try {
      this.data = await API.get('/skills');
      this.render();
    } catch { toast('Failed to load skills', 'error'); }
  },

  render() {
    const levels = ['Advanced', 'Intermediate', 'Beginner'];
    levels.forEach(level => {
      const group = this.data.filter(s => s.proficiency === level);
      const el = document.getElementById(`skills-${level.toLowerCase()}`);
      el.innerHTML = group.length
        ? group.map(s => `
            <span class="chip">
              ${s.skill_name}
              ${s.source === 'Resume' ? '<span style="font-size:10px;color:var(--muted)">PDF</span>' : ''}
              <button class="chip-remove" onclick="Pages.skills.delete(${s.skill_id})">×</button>
            </span>`).join('')
        : `<span style="font-size:13px;color:var(--muted)">No ${level.toLowerCase()} skills yet</span>`;
    });
  },

  async add(e) {
    e.preventDefault();
    const body = {
      skill_name:  document.getElementById('skill-name').value,
      proficiency: document.getElementById('skill-prof').value,
    };
    const btn = document.getElementById('skill-add-btn');
    btn.textContent = 'Adding...'; btn.disabled = true;
    try {
      await API.post('/skills', body);
      document.getElementById('skill-name').value = '';
      toast('Skill added');
      await this.load();
    } catch (err) {
      toast(err.message, 'error');
    } finally { btn.textContent = '+ Add'; btn.disabled = false; }
  },

  async delete(id) {
    try {
      await API.del(`/skills/${id}`);
      toast('Removed');
      this.data = this.data.filter(s => s.skill_id !== id);
      this.render();
    } catch { toast('Failed', 'error'); }
  }
};
