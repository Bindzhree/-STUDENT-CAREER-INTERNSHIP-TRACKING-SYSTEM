let barChart = null, doughnutChart = null;

const Pages = {};

Pages.dashboard = {
  async load() {
    try {
      const d = await API.get('/dashboard');
      this.renderStats(d);
      this.renderCharts(d);
      this.renderRecent(d.recentApps);
      this.renderSkills(d.skills);
    } catch { toast('Failed to load dashboard', 'error'); }
  },

  renderStats(d) {
    document.getElementById('stat-total').textContent   = d.totals.total || 0;
    document.getElementById('stat-selected').textContent = d.totals.selected || 0;
    document.getElementById('stat-rate').textContent    = (d.totals.success_rate || 0) + '%';
    document.getElementById('stat-certs').textContent   = d.certifications || 0;
  },

  renderCharts(d) {
    // Bar — monthly activity
    const barCtx = document.getElementById('bar-chart').getContext('2d');
    if (barChart) barChart.destroy();
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: d.monthly.map(m => m.month),
        datasets: [{ label: 'Applications', data: d.monthly.map(m => m.count), backgroundColor: '#1a6b4a', borderRadius: 6 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    // Doughnut — status
    const statusMap = {};
    d.statusCounts.forEach(s => statusMap[s.status] = s.count);
    const colors = { Applied: '#185fa5', Assessment: '#b7791f', Interview: '#5b4fb7', Selected: '#1a6b4a', Rejected: '#c0392b' };
    const dCtx = document.getElementById('doughnut-chart').getContext('2d');
    if (doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(dCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusMap),
        datasets: [{ data: Object.values(statusMap), backgroundColor: Object.keys(statusMap).map(s => colors[s] || '#888'), borderWidth: 0 }]
      },
      options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 10 } } } }
    });
  },

  renderRecent(apps) {
    const el = document.getElementById('recent-apps');
    if (!apps.length) { el.innerHTML = '<div class="empty-state">No applications yet</div>'; return; }
    el.innerHTML = apps.map(a => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:14px;font-weight:500">${a.role}</div>
          <div style="font-size:12px;color:var(--muted)">${a.company_name}</div>
        </div>
        ${badge(a.status)}
      </div>
    `).join('');
  },

  renderSkills(skills) {
    const el = document.getElementById('dash-skills');
    if (!skills.length) { el.innerHTML = '<div class="empty-state">No skills added yet</div>'; return; }
    el.innerHTML = `<div class="chips-wrap">${skills.slice(0,18).map(s => `<span class="chip">${s.skill_name}</span>`).join('')}</div>`;
  }
};
