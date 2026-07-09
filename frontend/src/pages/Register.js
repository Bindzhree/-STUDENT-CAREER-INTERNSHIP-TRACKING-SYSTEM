import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', usn: '', branch: '', semester: '', email: '', password: '', cgpa: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = field => e => setForm({...form, [field]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, { name: res.data.name, student_id: res.data.student_id, ...form });
      navigate('/onboarding'); // go to onboarding after register
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Create account</h1>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group"><label>Full Name</label><input placeholder="Priya Sharma" value={form.name} onChange={set('name')} required /></div>
              <div className="form-group"><label>USN</label><input placeholder="1XX21CS000" value={form.usn} onChange={set('usn')} required /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label>Branch</label><input placeholder="CSE" value={form.branch} onChange={set('branch')} /></div>
              <div className="form-group"><label>Semester</label><input type="number" min="1" max="8" placeholder="6" value={form.semester} onChange={set('semester')} /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label>Email</label><input type="email" placeholder="you@college.edu" value={form.email} onChange={set('email')} required /></div>
              <div className="form-group"><label>CGPA</label><input type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={set('cgpa')} /></div>
            </div>
            <div className="form-group"><label>Password</label><input type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required /></div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }} disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 14, color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
