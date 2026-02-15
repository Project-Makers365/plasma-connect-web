import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import SectionCard from '../../components/SectionCard';
import {
  FaChartPie,
  FaClipboardList,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaTrash,
  FaUsersCog,
} from 'react-icons/fa';

const roleOptions = ['ADMIN', 'DONOR', 'USER', 'HOSPITAL', 'BLOOD_BANK'];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  const [feedback, setFeedback] = useState('');
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [showPasswords, setShowPasswords] = useState({});

  const [pendingResetUser, setPendingResetUser] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const [viewUserDetails, setViewUserDetails] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadData() {
    const [statsRes, usersRes, requestsRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/requests'),
    ]);

    setStats(statsRes.data);
    setUsers(usersRes.data.users || []);
    setAllRequests(requestsRes.data.requests || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const requestStats = useMemo(() => {
    const pending = allRequests.filter((item) => item.status === 'PENDING').length;
    const accepted = allRequests.filter((item) => item.status === 'ACCEPTED').length;
    const rejected = allRequests.filter((item) => item.status === 'REJECTED').length;
    const fulfilled = allRequests.filter((item) => item.status === 'FULFILLED').length;
    return { total: allRequests.length, pending, accepted, rejected, fulfilled };
  }, [allRequests]);

  async function updateBlock(userId, blocked) {
    await api.patch(`/admin/users/${userId}/${blocked ? 'block' : 'unblock'}`);
    setFeedback(`User #${userId} ${blocked ? 'blocked' : 'unblocked'} successfully.`);
    loadData();
  }

  function requestPasswordReset(user) {
    const newPassword = (passwordDrafts[user.id] || '').trim();
    if (!newPassword) {
      setFeedback('Enter a new password first.');
      return;
    }
    setPendingResetUser(user);
  }

  async function confirmResetPassword() {
    if (!pendingResetUser) return;
    const userId = pendingResetUser.id;
    const newPassword = (passwordDrafts[userId] || '').trim();

    if (!newPassword) {
      setFeedback('Enter a new password first.');
      setPendingResetUser(null);
      return;
    }

    try {
      setIsResetting(true);
      await api.patch(`/admin/users/${userId}/reset-password`, { newPassword });
      setPasswordDrafts((prev) => ({ ...prev, [userId]: '' }));
      setFeedback(`Password reset successful for user #${userId}.`);
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
      setPendingResetUser(null);
    }
  }

  async function openUserDetails(userId) {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      setViewUserDetails(data);
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to load user details');
    }
  }

  function openEdit(user) {
    setEditUser({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'USER',
      bloodGroup: user.bloodGroup || '',
      address: user.address || '',
      latitude: user.latitude ?? '',
      longitude: user.longitude ?? '',
      isBlocked: Boolean(user.isBlocked),
    });
  }

  async function saveUserEdit() {
    if (!editUser) return;

    try {
      setSavingEdit(true);
      await api.put(`/admin/users/${editUser.id}`, {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        role: editUser.role,
        bloodGroup: editUser.bloodGroup || null,
        address: editUser.address || null,
        latitude: editUser.latitude === '' ? null : Number(editUser.latitude),
        longitude: editUser.longitude === '' ? null : Number(editUser.longitude),
        isBlocked: editUser.isBlocked,
      });

      setFeedback(`User #${editUser.id} updated successfully.`);
      setEditUser(null);
      loadData();
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteUser(user) {
    const ok = window.confirm(`Delete user ${user.name} (${user.email})? This cannot be undone.`);
    if (!ok) return;

    try {
      await api.delete(`/admin/users/${user.id}`);
      setFeedback(`User #${user.id} deleted successfully.`);
      loadData();
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to delete user');
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Admin Control Center</h2>
        <p className="mt-1 text-sm text-slate-600">Full control over users, requests, role management, and operational analytics.</p>
      </div>

      {stats && (
        <SectionCard title="System Statistics" icon={FaChartPie}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{key}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Requests Oversight" icon={FaClipboardList}>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">Total: <strong>{requestStats.total}</strong></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">Pending: <strong>{requestStats.pending}</strong></div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">Accepted: <strong>{requestStats.accepted}</strong></div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">Fulfilled: <strong>{requestStats.fulfilled}</strong></div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">Rejected: <strong>{requestStats.rejected}</strong></div>
        </div>
      </SectionCard>

      <SectionCard title="User Management" icon={FaUsersCog}>
        {feedback && <p className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{feedback}</p>}

        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-slate-500">{user.email} | {user.role}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md border border-slate-300 px-3 py-1" onClick={() => openUserDetails(user.id)}><FaEye className="mr-1 inline" />View</button>
                    <button className="rounded-md border border-slate-300 px-3 py-1" onClick={() => openEdit(user)}><FaEdit className="mr-1 inline" />Edit</button>
                    <button className="rounded-md border border-red-300 px-3 py-1 text-red-700" onClick={() => deleteUser(user)}><FaTrash className="mr-1 inline" />Delete</button>
                    {user.role !== 'ADMIN' && (
                      <button
                        type="button"
                        className={`rounded-md px-3 py-1 text-white ${user.isBlocked ? 'bg-brand-600' : 'bg-red-600'}`}
                        onClick={() => updateBlock(user.id, !user.isBlocked)}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type={showPasswords[user.id] ? 'text' : 'password'}
                    placeholder="New password"
                    className="rounded-md border border-slate-300 px-3 py-1"
                    value={passwordDrafts[user.id] || ''}
                    onChange={(event) => setPasswordDrafts((prev) => ({ ...prev, [user.id]: event.target.value }))}
                  />
                  <button type="button" className="rounded-md border border-slate-300 px-3 py-1 text-slate-700" onClick={() => setShowPasswords((prev) => ({ ...prev, [user.id]: !prev[user.id] }))}>
                    {showPasswords[user.id] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button type="button" className="rounded-md bg-slate-900 px-3 py-1 text-white" onClick={() => requestPasswordReset(user)}>
                    <FaKey className="mr-1 inline" />Reset Password
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      {pendingResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">Confirm Password Reset</h3>
            <p className="mt-2 text-sm text-slate-600">Reset password for <strong>{pendingResetUser.name}</strong> ({pendingResetUser.email})?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-md border border-slate-300 px-3 py-1 text-slate-700" onClick={() => setPendingResetUser(null)} disabled={isResetting}>Cancel</button>
              <button type="button" className="rounded-md bg-red-600 px-3 py-1 text-white disabled:opacity-60" onClick={confirmResetPassword} disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">User Full Details</h3>
            <p className="mt-1 text-sm text-slate-600">{viewUserDetails.user.name} ({viewUserDetails.user.email})</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <div className="rounded-md bg-slate-100 p-2">Role: <strong>{viewUserDetails.user.role}</strong></div>
              <div className="rounded-md bg-slate-100 p-2">Phone: <strong>{viewUserDetails.user.phone}</strong></div>
              <div className="rounded-md bg-slate-100 p-2">Address: <strong>{viewUserDetails.user.address || '-'}</strong></div>
              <div className="rounded-md bg-slate-100 p-2">Blocked: <strong>{String(viewUserDetails.user.isBlocked)}</strong></div>
              <div className="rounded-md bg-slate-100 p-2">Created Requests: <strong>{viewUserDetails.related.createdRequests.length}</strong></div>
              <div className="rounded-md bg-slate-100 p-2">Notifications: <strong>{viewUserDetails.related.notifications.length}</strong></div>
            </div>
            <div className="mt-4 text-right">
              <button className="rounded-md border border-slate-300 px-3 py-1" onClick={() => setViewUserDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Name" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Phone" value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
              <select className="rounded-md border border-slate-300 px-3 py-2" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                {roleOptions.map((role) => <option key={role}>{role}</option>)}
              </select>
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Blood Group" value={editUser.bloodGroup || ''} onChange={(e) => setEditUser({ ...editUser, bloodGroup: e.target.value })} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Address" value={editUser.address || ''} onChange={(e) => setEditUser({ ...editUser, address: e.target.value })} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Latitude" value={editUser.latitude} onChange={(e) => setEditUser({ ...editUser, latitude: e.target.value })} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Longitude" value={editUser.longitude} onChange={(e) => setEditUser({ ...editUser, longitude: e.target.value })} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-md border border-slate-300 px-3 py-1" onClick={() => setEditUser(null)} disabled={savingEdit}>Cancel</button>
              <button className="rounded-md bg-brand-600 px-3 py-1 text-white disabled:opacity-60" onClick={saveUserEdit} disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
