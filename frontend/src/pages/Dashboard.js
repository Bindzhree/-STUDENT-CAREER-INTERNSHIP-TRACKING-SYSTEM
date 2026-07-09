import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  Applied: '#185fa5', Assessment: '#b7791f', Interview: '#5b4fb7', Selected: '#1a6b4a', Rejected: '#c0392b'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { student } = useAuth();

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen">Loading dashboard...</div>;
  if (!data) return <div className="empty-state">Could not load dashboard.</div>;

  const statusMap = {};
  data.statusCounts.forEach(s => statusMap[s.status] = s.count);

  const doughnutData = {
    labels: Object.keys(statusMap),
    datasets: [{ data: Object.values(statusMap), backgroundColor: Object.keys(statusMap).map(s => STATUS_COLORS[s] || '#888'), borderWidth: 0 }]
  };

  const barData = {
    labels: data.monthly.map(m => m.month),
    datasets: [{ label: 'Applications', data: data.monthly.map(m => m.count), backgroundColor: '#1a6b4a', borderRadius: 6 }]
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Good morning, {student?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Here's your career progress at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <div className="stat-card"><div className="num">{data.totals.total || 0}</div><div className="lbl">Total Applications</div></div>
        <div className="stat-card"><div className="num" style={{ color: 'var(--accent)' }}>{data.totals.selected || 0}</div><div className="lbl">Selected</div></div>
        <div className="stat-card"><div className="num">{data.totals.success_rate || 0}%</div><div className="lbl">Success Rate</div></div>
        <div className="stat-card"><div className="num">{data.certifications || 0}</div><div className="lbl">Certifications</div></div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>Monthly Activity</div>
          {data.monthly.length ? (
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} height={160} />
          ) : <div className="empty-state" style={{ padding: '1.5rem' }}>No activity yet</div>}
        </div>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>Applications by Status</div>
          {Object.keys(statusMap).length ? (
            <div style={{ maxWidth: 220, margin: '0 auto' }}>
              <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 12 } } }, cutout: '65%' }} />
            </div>
          ) : <div className="empty-state" style={{ padding: '1.5rem' }}>No applications yet</div>}
        </div>
      </div>

      {/* Recent applications + Skills */}
      <div className="grid-2">
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>Recent Applications</div>
          {data.recentApps.length ? (
            <div>
              {data.recentApps.map(a => (
                <div key={a.application_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.role}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.company_name}</div>
                  </div>
                  <span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state" style={{ padding: '1rem' }}>No applications yet</div>}
        </div>

        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>Your Skills</div>
          {data.skills.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.skills.slice(0, 16).map((s, i) => (
                <span key={i} className={`chip ${s.proficiency === 'Advanced' ? 'chip-accent' : ''}`}>
                  {s.skill_name}
                </span>
              ))}
            </div>
          ) : <div className="empty-state" style={{ padding: '1rem' }}>Add skills to see them here</div>}
        </div>
      </div>
    </div>
  );
}
