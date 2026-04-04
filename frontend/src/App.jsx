import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout      from './components/layout/Layout';
import Home        from './pages/Home';
import Login       from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard   from './pages/Dashboard';
import GitHub      from './pages/GitHub';
import LeetCode    from './pages/LeetCode';
import Codeforces  from './pages/Codeforces';
import Analytics   from './pages/Analytics';
import Timeline    from './pages/Timeline';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fafaf8' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #f0f0f0', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Home />} />

          {/* Auth routes */}
          <Route path="/login"         element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected app routes inside layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
          </Route>

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="github"     element={<GitHub />} />
            <Route path="leetcode"   element={<LeetCode />} />
            <Route path="codeforces" element={<Codeforces />} />
            <Route path="analytics"  element={<Analytics />} />
            <Route path="timeline"   element={<Timeline />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}