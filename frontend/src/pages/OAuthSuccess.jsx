import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      login(token); // saves as 'devtracker_token' consistently
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500 mx-auto" />
        <p className="text-gray-400 mt-4">Logging you in...</p>
      </div>
    </div>
  );
}