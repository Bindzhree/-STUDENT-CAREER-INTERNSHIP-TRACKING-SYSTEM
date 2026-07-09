import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Applications from './pages/Applications';
import Interviews  from './pages/Interviews';
import Skills      from './pages/Skills';
import Certifications from './pages/Certifications';
import Onboarding  from './pages/Onboarding';
import Layout      from './components/Layout';
import './index.css';

function PrivateRoute({ children }) {
  const { student, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return student ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="applications"   element={<Applications />} />
            <Route path="interviews"     element={<Interviews />} />
            <Route path="skills"         element={<Skills />} />
            <Route path="certifications" element={<Certifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
