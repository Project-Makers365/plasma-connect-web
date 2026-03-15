import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';
import { disconnectSocket } from '../realtime/socket';
import RoleSelectionModal from '../components/RoleSelectionModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    const authRoutes = new Set(['/login', '/register', '/forgot-password', '/']);

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
        
        // Show role selection modal for USER role on first login
        const hasSeenRoleModal = sessionStorage.getItem('pc_role_modal_seen');
        if (data.user.role === 'USER' && !hasSeenRoleModal) {
          setShowRoleModal(true);
        }
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
    
    // Show role selection modal for USER role
    if (data.user.role === 'USER') {
      setShowRoleModal(true);
    }
    
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    // Don't auto-login, let user login manually
    return data.user;
  }

  function logout() {
    localStorage.removeItem('pc_token');
    sessionStorage.removeItem('pc_role_modal_seen');
    disconnectSocket();
    setUser(null);
  }

  function handleRoleSelected(newRole) {
    if (user) {
      setUser({ ...user, role: newRole });
    }
    sessionStorage.setItem('pc_role_modal_seen', 'true');
  }

  function handleModalClose() {
    sessionStorage.setItem('pc_role_modal_seen', 'true');
    setShowRoleModal(false);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <RoleSelectionModal 
        isOpen={showRoleModal} 
        onClose={handleModalClose}
        onRoleSelected={handleRoleSelected}
        user={user}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
