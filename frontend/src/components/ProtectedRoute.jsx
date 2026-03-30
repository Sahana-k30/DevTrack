// pages/ProtectedRoute.jsx  (or components/ProtectedRoute.jsx)
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  return children;
}