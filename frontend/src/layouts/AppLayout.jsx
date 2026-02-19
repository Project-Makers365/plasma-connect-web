import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHeartbeat, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import NotificationBell from '../components/NotificationBell';

function roleLabel(role) {
  if (!role) return 'Unknown';
  return role.replace('_', ' ');
}

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-brand-700">
              <FaHeartbeat className="text-red-500" />
              Plasma Connect
            </Link>
            <p className="text-xs text-slate-500">Real-time plasma donor and request coordination platform</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <NotificationBell />
            <Link to="/profile" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-brand-300 hover:bg-brand-50/50">
              <p className="inline-flex items-center gap-2 font-medium text-slate-800">
                <FaUserCircle className="text-brand-700" />
                {user?.name || 'User'}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{roleLabel(user?.role)} - Profile</p>
            </Link>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-white">
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
