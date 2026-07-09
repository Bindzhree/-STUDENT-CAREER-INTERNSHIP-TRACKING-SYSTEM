import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/',               label: 'Dashboard',       icon: '▦' },
  { to: '/applications',   label: 'Applications',    icon: '📋' },
  { to: '/interviews',     label: 'Interviews',      icon: '🎙' },
  { to: '/skills',         label: 'Skills',          icon: '⚡' },
  { to: '/certifications', label: 'Certifications',  icon: '🏆' },
];

export default function Layout() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🎯 CareerTrack</div>
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}>
            <span>{n.icon}</span> {n.label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{student?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{student?.branch} · Sem {student?.semester}</div>
            <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
