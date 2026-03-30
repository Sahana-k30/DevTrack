import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout    from './components/layout/Layout';
import Login     from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import GitHub    from './pages/GitHub';
import LeetCode  from './pages/LeetCode';
import Codeforces from './pages/Codeforces';
import Analytics from './pages/Analytics';
import Timeline  from './pages/Timeline';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
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
          <Route path="/login"         element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<Dashboard />} />
            <Route path="github"     element={<GitHub />} />
            <Route path="leetcode"   element={<LeetCode />} />
            <Route path="codeforces" element={<Codeforces />} />
            <Route path="analytics"  element={<Analytics />} />
            <Route path="timeline"   element={<Timeline />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}