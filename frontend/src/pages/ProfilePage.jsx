import { useCallback, useEffect, useState } from 'react';
import { FaIdCard, FaSyncAlt, FaUserCircle } from 'react-icons/fa';
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

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="My Profile"
        icon={FaUserCircle}
        action={(
          <button
            type="button"
            onClick={refreshProfile}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      >
        {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">User ID</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.id)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.name)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.email)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.phone)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
            <p className="font-semibold text-slate-800">{roleLabel(user?.role)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Blood Group</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.bloodGroup)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.address)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Latitude</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.latitude)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Longitude</p>
            <p className="font-semibold text-slate-800">{valueOrDash(user?.longitude)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Account Status</p>
            <p className="font-semibold text-slate-800">{user?.isBlocked ? 'Blocked' : 'Active'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Created At</p>
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
