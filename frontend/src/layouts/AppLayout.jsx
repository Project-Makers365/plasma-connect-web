import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { FaHeartbeat, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import NotificationBell from '../components/NotificationBell';

function roleLabel(role) {
  if (!role) return 'Unknown';
  return role.replace('_', ' ');
}

function AppLayout() {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  function handleConfirmLogout() {
    const currentUserName = user?.name || 'User';
    logout();
    toast.success(`${currentUserName} logged out successfully`);
    setShowLogoutDialog(false);
  }

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
            <button type="button" onClick={() => setShowLogoutDialog(true)} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-white">
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <Outlet />
      </main>

      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirm Logout</h3>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to logout from your account?</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutDialog(false)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
