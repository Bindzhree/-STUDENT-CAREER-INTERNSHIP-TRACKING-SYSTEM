import { useEffect, useState } from 'react';
import api from '../api';

const STATUSES = ['Applied','Assessment','Interview','Rejected','Selected'];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ company_name: '', role: '', applied_date: '', platform: '', deadline: '', industry: '' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/applications').then(r => setApps(r.data));
  useEffect(() => { load(); }, []);

  const set = f => e => setForm({...form, [f]: e.target.value});

  const handleAdd = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/applications', form);
      setShowModal(false);
      setForm({ company_name: '', role: '', applied_date: '', platform: '', deadline: '', industry: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add.');
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/applications/${id}/status`, { status });
    setApps(apps.map(a => a.application_id === id ? {...a, status} : a));
  };

  const deleteApp = async id => {
    if (!window.confirm('Delete this application?')) return;
    await api.delete(`/applications/${id}`);
    setApps(apps.filter(a => a.application_id !== id));
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Applications</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Application</button>
      </div>

      <div className="card">
        {apps.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Company</th><th>Role</th><th>Platform</th><th>Applied</th><th>Deadline</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a.application_id}>
                    <td style={{ fontWeight: 500 }}>{a.company_name}</td>
                    <td>{a.role}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.platform || '—'}</td>
                    <td style={{ fontSize: 13 }}>{a.applied_date ? new Date(a.applied_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ fontSize: 13 }}>{a.deadline ? new Date(a.deadline).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <select value={a.status} onChange={e => updateStatus(a.application_id, e.target.value)}
                        style={{ fontSize: 12, padding: '3px 8px', width: 'auto' }}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteApp(a.application_id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No applications yet. Add your first one!</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Application</div>
            <form onSubmit={handleAdd}>
              <div className="grid-2">
                <div className="form-group"><label>Company Name *</label><input placeholder="Google" value={form.company_name} onChange={set('company_name')} required /></div>
                <div className="form-group"><label>Role *</label><input placeholder="SDE Intern" value={form.role} onChange={set('role')} required /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Platform</label><input placeholder="LinkedIn / Internshala" value={form.platform} onChange={set('platform')} /></div>
                <div className="form-group"><label>Industry</label><input placeholder="Tech" value={form.industry} onChange={set('industry')} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Applied Date</label><input type="date" value={form.applied_date} onChange={set('applied_date')} /></div>
                <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={set('deadline')} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
