import { useEffect, useState } from 'react';
import api from '../api';

export default function Certifications() {
  const [certs, setCerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ cert_name: '', platform: '', completion_date: '', expiry_date: '', proof_url: '' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/certifications').then(r => setCerts(r.data));
  useEffect(() => { load(); }, []);

  const set = f => e => setForm({...form, [f]: e.target.value});

  const handleAdd = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/certifications', form);
      setShowModal(false);
      setForm({ cert_name: '', platform: '', completion_date: '', expiry_date: '', proof_url: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.');
    } finally { setLoading(false); }
  };

  const deleteCert = async id => {
    if (!window.confirm('Delete this certification?')) return;
    await api.delete(`/certifications/${id}`);
    setCerts(certs.filter(c => c.cert_id !== id));
  };

  const isExpired = date => date && new Date(date) < new Date();

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Certifications</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Certification</button>
      </div>

      <div className="grid-2">
        {certs.length ? certs.map(c => (
          <div key={c.cert_id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 500, fontSize: 15, flex: 1 }}>{c.cert_name}</div>
              <button className="btn btn-danger btn-sm" onClick={() => deleteCert(c.cert_id)}>Delete</button>
            </div>
            {c.platform && <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>📚 {c.platform}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)' }}>
              {c.completion_date && <span>✅ {new Date(c.completion_date).toLocaleDateString('en-IN')}</span>}
              {c.expiry_date && (
                <span style={{ color: isExpired(c.expiry_date) ? 'var(--danger)' : 'inherit' }}>
                  {isExpired(c.expiry_date) ? '⚠️ Expired' : '🗓'} {new Date(c.expiry_date).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
            {c.proof_url && <a href={c.proof_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, display: 'block' }}>View Certificate →</a>}
          </div>
        )) : (
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state">No certifications yet. Add your first one!</div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Certification</div>
            <form onSubmit={handleAdd}>
              <div className="form-group"><label>Certificate Name *</label><input placeholder="AWS Cloud Practitioner" value={form.cert_name} onChange={set('cert_name')} required /></div>
              <div className="form-group"><label>Platform</label><input placeholder="Coursera / NPTEL / AWS..." value={form.platform} onChange={set('platform')} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Completion Date</label><input type="date" value={form.completion_date} onChange={set('completion_date')} /></div>
                <div className="form-group"><label>Expiry Date</label><input type="date" value={form.expiry_date} onChange={set('expiry_date')} /></div>
              </div>
              <div className="form-group"><label>Proof URL</label><input placeholder="https://..." value={form.proof_url} onChange={set('proof_url')} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
