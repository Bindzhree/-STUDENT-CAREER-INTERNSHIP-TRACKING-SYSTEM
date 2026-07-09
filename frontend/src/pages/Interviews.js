import { useEffect, useState } from 'react';
import api from '../api';

const ROUND_TYPES = ['Online Test','Technical','HR','Group Discussion','Final'];
const OUTCOMES    = ['Pending','Passed','Failed'];
const PREP        = ['Not Started','In Progress','Ready'];

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ application_id: '', round_number: 1, round_type: 'Technical', interview_date: '', outcome: 'Pending', prep_status: 'Not Started', notes: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/interviews').then(r => setInterviews(r.data));
    api.get('/applications').then(r => setApplications(r.data));
  };
  useEffect(() => { load(); }, []);

  const set = f => e => setForm({...form, [f]: e.target.value});

  const handleAdd = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/interviews', form);
      setShowModal(false);
      setForm({ application_id: '', round_number: 1, round_type: 'Technical', interview_date: '', outcome: 'Pending', prep_status: 'Not Started', notes: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.');
    } finally { setLoading(false); }
  };

  const deleteRound = async id => {
    if (!window.confirm('Delete this round?')) return;
    await api.delete(`/interviews/${id}`);
    setInterviews(interviews.filter(i => i.round_id !== id));
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Interview Tracker</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Round</button>
      </div>

      <div className="card">
        {interviews.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Company</th><th>Role</th><th>Round</th><th>Type</th><th>Date</th><th>Outcome</th><th>Prep</th><th>Notes</th><th></th></tr>
              </thead>
              <tbody>
                {interviews.map(i => (
                  <tr key={i.round_id}>
                    <td style={{ fontWeight: 500 }}>{i.company_name}</td>
                    <td>{i.role}</td>
                    <td style={{ textAlign: 'center' }}>#{i.round_number}</td>
                    <td><span className="badge badge-applied" style={{ fontSize: 11 }}>{i.round_type}</span></td>
                    <td style={{ fontSize: 13 }}>{i.interview_date ? new Date(i.interview_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td><span className={`badge badge-${i.outcome?.toLowerCase()}`}>{i.outcome}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{i.prep_status}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.notes || '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteRound(i.round_id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No interview rounds yet.</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Interview Round</div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Application *</label>
                <select value={form.application_id} onChange={set('application_id')} required>
                  <option value="">Select company + role</option>
                  {applications.map(a => <option key={a.application_id} value={a.application_id}>{a.company_name} — {a.role}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Round #</label><input type="number" min="1" value={form.round_number} onChange={set('round_number')} /></div>
                <div className="form-group">
                  <label>Round Type</label>
                  <select value={form.round_type} onChange={set('round_type')}>
                    {ROUND_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Date</label><input type="date" value={form.interview_date} onChange={set('interview_date')} /></div>
                <div className="form-group">
                  <label>Outcome</label>
                  <select value={form.outcome} onChange={set('outcome')}>{OUTCOMES.map(o => <option key={o}>{o}</option>)}</select>
                </div>
              </div>
              <div className="form-group">
                <label>Prep Status</label>
                <select value={form.prep_status} onChange={set('prep_status')}>{PREP.map(p => <option key={p}>{p}</option>)}</select>
              </div>
              <div className="form-group"><label>Notes</label><textarea placeholder="Topics covered, feedback..." value={form.notes} onChange={set('notes')} /></div>
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
