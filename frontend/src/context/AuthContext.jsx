import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const TOKEN_KEY = 'devdragon_token';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    try {
      const res = await axios.get(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = useCallback((token) => {
    localStorage.setItem(TOKEN_KEY, token);
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    // Tell the backend to destroy the session + clear the cookie
    try {
      await axios.post(`${apiBase}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Even if the backend call fails, still clear locally
    }

    // Wipe the token and user state
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);

    // Redirect to login page — this also triggers Login.jsx's useEffect
    // which wipes any remaining token before the user clicks login again
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { TOKEN_KEY };