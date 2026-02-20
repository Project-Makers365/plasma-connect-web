import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';
import { disconnectSocket } from '../realtime/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authRoutes = new Set(['/login', '/register', '/forgot-password']);

    async function bootstrap() {
      const token = localStorage.getItem('pc_token');
      if (!token) {
        setLoading(false);
        return;
      }

      if (authRoutes.has(location.pathname)) {
        setLoading(false);
        return;
      }

      if (user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('pc_token');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [location.pathname, user]);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('pc_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('pc_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('pc_token');
    disconnectSocket();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
