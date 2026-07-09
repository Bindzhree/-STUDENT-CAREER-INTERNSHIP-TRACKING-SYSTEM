import { useEffect, useState } from 'react';
import api from '../api';

const PROFICIENCY = ['Beginner','Intermediate','Advanced'];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ skill_name: '', proficiency: 'Beginner' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/skills').then(r => setSkills(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/skills', form);
      setForm({ skill_name: '', proficiency: 'Beginner' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.');
    } finally { setLoading(false); }
  };

  const deleteSkill = async id => {
    await api.delete(`/skills/${id}`);
    setSkills(skills.filter(s => s.skill_id !== id));
  };

  const grouped = PROFICIENCY.reduce((acc, p) => {
    acc[p] = skills.filter(s => s.proficiency === p);
    return acc;
  }, {});

  const colorMap = { Beginner: 'badge-applied', Intermediate: 'badge-assessment', Advanced: 'badge-selected' };

  return (
    <div>
      <h1 className="page-title">Skills</h1>

      {/* Add skill inline */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
            <label>Skill Name</label>
            <input placeholder="e.g. React, SQL, Docker..." value={form.skill_name} onChange={e => setForm({...form, skill_name: e.target.value})} required />
          </div>
          <div className="form-group" style={{ width: 160, marginBottom: 0 }}>
            <label>Proficiency</label>
            <select value={form.proficiency} onChange={e => setForm({...form, proficiency: e.target.value})}>
              {PROFICIENCY.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : '+ Add Skill'}</button>
        </form>
      </div>

      {/* Skills grouped by proficiency */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {PROFICIENCY.map(p => (
          <div key={p} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className={`badge ${colorMap[p]}`}>{p}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{grouped[p].length} skill{grouped[p].length !== 1 ? 's' : ''}</span>
            </div>
            {grouped[p].length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {grouped[p].map(s => (
                  <div key={s.skill_id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 99, fontSize: 13 }}>
                    {s.skill_name}
                    {s.source === 'Resume' && <span style={{ fontSize: 10, color: 'var(--muted)' }}>PDF</span>}
                    <button onClick={() => deleteSkill(s.skill_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            ) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No {p.toLowerCase()} skills yet.</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
