import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Onboarding() {
  const [step, setStep] = useState(1); // 1=upload, 2=review, 3=done
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const res = await api.post('/resume/parse', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setParsed(res.data);
      setStep(2);
    } catch (err) {
      setError('Could not parse PDF. Try again or skip.');
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = i => setParsed(p => ({ ...p, skills: p.skills.filter((_,idx) => idx !== i) }));
  const removeCert  = i => setParsed(p => ({ ...p, certifications: p.certifications.filter((_,idx) => idx !== i) }));
  const removeProj  = i => setParsed(p => ({ ...p, projects: p.projects.filter((_,idx) => idx !== i) }));

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const calls = [];
      if (parsed.skills.length)         calls.push(api.post('/skills/bulk', { skills: parsed.skills }));
      if (parsed.certifications.length)  calls.push(api.post('/certifications/bulk', { certifications: parsed.certifications }));
      // projects one-by-one (no bulk endpoint needed, array is small)
      for (const p of parsed.projects)  calls.push(api.post('/projects', p).catch(() => {}));
      await Promise.all(calls);
      setStep(3);
    } catch (err) {
      setError('Import failed. You can add data manually from the dashboard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {step === 1 && (
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Welcome! Let's set up your profile</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>Upload your resume PDF and we'll auto-fill your skills, certifications and projects. You can review everything before saving.</p>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '2rem', textAlign: 'center', marginBottom: '1rem', cursor: 'pointer' }}
                 onClick={() => document.getElementById('resumeFile').click()}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{file ? file.name : 'Click to upload resume PDF'}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Max 5MB</div>
            </div>
            <input id="resumeFile" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            {error && <div className="error-msg" style={{ marginBottom: 8 }}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleUpload} disabled={!file || loading}>{loading ? 'Parsing...' : 'Parse Resume'}</button>
              <button className="btn btn-outline" onClick={() => navigate('/')}>Skip, I'll add manually</button>
            </div>
          </div>
        )}

        {step === 2 && parsed && (
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Review extracted data</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.25rem' }}>Remove anything that looks wrong, then confirm.</p>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Skills ({parsed.skills.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {parsed.skills.map((s, i) => (
                  <span key={i} className="chip">
                    {s.skill_name}
                    <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                {!parsed.skills.length && <span style={{ fontSize: 13, color: 'var(--muted)' }}>None detected</span>}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Certifications ({parsed.certifications.length})</div>
              {parsed.certifications.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span>{c.cert_name}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeCert(i)}>Remove</button>
                </div>
              ))}
              {!parsed.certifications.length && <span style={{ fontSize: 13, color: 'var(--muted)' }}>None detected</span>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Projects ({parsed.projects.length})</div>
              {parsed.projects.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span>{p.title}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeProj(i)}>Remove</button>
                </div>
              ))}
              {!parsed.projects.length && <span style={{ fontSize: 13, color: 'var(--muted)' }}>None detected</span>}
            </div>

            {error && <div className="error-msg" style={{ marginBottom: 8 }}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>{loading ? 'Saving...' : 'Confirm & Save'}</button>
              <button className="btn btn-outline" onClick={() => navigate('/')}>Skip</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profile set up!</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>Your skills, certifications and projects have been imported. Start tracking your applications now.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Dashboard</button>
          </div>
        )}

      </div>
    </div>
  );
}
