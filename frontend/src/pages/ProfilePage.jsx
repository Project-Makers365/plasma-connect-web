import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaIdCard, FaSyncAlt, FaUserCircle } from 'react-icons/fa';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import SectionCard from '../components/SectionCard';

function roleLabel(role) {
  if (!role) return '-';
  return role.replace('_', ' ');
}

function valueOrDash(value) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function formatDate(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString();
}

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [switchingRole, setSwitchingRole] = useState(false);

  const refreshProfile = useCallback(async (showSuccessToast = false) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      if (showSuccessToast) {
        toast.success(`${data.user?.name || 'User'} profile refreshed`);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load profile details';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  async function handleSwitchToUser() {
    if (!window.confirm('Are you sure you want to switch to User role? You will lose donor privileges.')) return;
    
    setSwitchingRole(true);
    try {
      await api.post('/users/switch-to-user');
      await refreshProfile(true);
      toast.success('Successfully switched to User role');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to switch role';
      toast.error(message);
    } finally {
      setSwitchingRole(false);
    }
  }

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <div className="space-y-4">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        <FaArrowLeft />
        Back to Home
      </Link>

      <SectionCard
        title="My Profile"
        icon={FaUserCircle}
        action={(
          <div className="flex gap-2">
            {user?.role === 'DONOR' && (
              <button
                type="button"
                onClick={handleSwitchToUser}
                disabled={switchingRole}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Switch to User
              </button>
            )}
            <button
              type="button"
              onClick={() => refreshProfile(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        )}
      >
        {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">User ID</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.id)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Full Name</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.name)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Email</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.email)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Phone</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.phone)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Role</p>
            <p className="font-semibold text-slate-800">{roleLabel(user?.role)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Blood Group</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.bloodGroup)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-red-600">Address</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.address)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Latitude</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.latitude)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Longitude</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.longitude)}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Account Status</p>
            <p className="font-semibold text-slate-800">{user?.isBlocked ? 'Blocked' : 'Active'}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-600">Created At</p>
            <p className="font-semibold text-slate-800">{formatDate(user?.createdAt)}</p>
          </div>
          {/*<div className="rounded-xl border border-slate-200 bg-white p-3">*/}
          {/*  <p className="text-xs uppercase tracking-wide text-slate-500">Last Updated</p>*/}
          {/*  <p className="font-semibold text-slate-800">{formatDate(user?.updatedAt)}</p>*/}
          {/*</div>*/}
        </div>
      </SectionCard>

      <SectionCard title="Access Scope" icon={FaIdCard}>
        <p className="text-sm text-slate-700">
          This page shows details only for the currently logged-in account.
          Each user role (Admin, Donor, User, Hospital, Blood Bank) sees its own profile data.
        </p>
      </SectionCard>
    </div>
  );
}

export default ProfilePage;
