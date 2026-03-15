import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import SectionCard from '../../components/SectionCard';
import DonorMap from '../../components/DonorMap';
import { useAuth } from '../../contexts/AuthContext';
import { FaBell, FaMapMarkedAlt, FaSearch, FaTint } from 'react-icons/fa';

const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function UserDashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    bloodGroup: user?.bloodGroup || 'A+',
    radiusKm: 30,
  });
  const [matches, setMatches] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState('');

  function getDirectionsUrl(donor) {
    const destination = `${donor.latitude},${donor.longitude}`;
    if (user?.latitude !== null && user?.latitude !== undefined && user?.longitude !== null && user?.longitude !== undefined) {
      const origin = `${user.latitude},${user.longitude}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  }

  async function search() {
    const { data } = await api.get('/users/donors/search', {
      params: {
        bloodGroup: filters.bloodGroup,
        latitude: user.latitude,
        longitude: user.longitude,
        radiusKm: Number(filters.radiusKm),
      },
    });
    setMatches(data.matches || []);
  }

  async function loadRequests() {
    const [reqRes, notiRes] = await Promise.all([
      api.get('/users/requests'),
      api.get('/notifications'),
    ]);
    setMyRequests(reqRes.data.requests || []);
    setNotifications(notiRes.data.notifications || []);
  }

  useEffect(() => {
    search();
    loadRequests();
  }, []);

  const requestCounts = useMemo(() => {
    const pending = myRequests.filter((item) => item.status === 'PENDING').length;
    const accepted = myRequests.filter((item) => item.status === 'ACCEPTED').length;
    const fulfilled = myRequests.filter((item) => item.status === 'FULFILLED').length;
    return { pending, accepted, fulfilled };
  }, [myRequests]);

  const activeDonorRequestIds = useMemo(
    () =>
      new Set(
        myRequests
          .filter(
            (item) =>
              item.targetType === 'DONOR' &&
              ['PENDING', 'ACCEPTED'].includes(item.status) &&
              item.donorId,
          )
          .map((item) => item.donorId),
      ),
    [myRequests],
  );

  async function createDonorRequest(donor) {
    try {
      await api.post('/users/requests', {
        bloodGroup: filters.bloodGroup,
        units: 1,
        targetType: 'DONOR',
        donorId: donor.id,
        note: 'Need plasma support',
      });
      setFeedback('Request sent successfully.');
      toast.success(`Request sent to ${donor.name || 'donor'} successfully`);
      loadRequests();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send request';
      setFeedback(message);
      toast.error(message);
    }
  }

  async function markNotificationRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
      );
      toast.success('Notification marked as read');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update notification';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Recipient Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Find nearby eligible donors by blood group and location, then track every request in real-time.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Pending: <strong>{requestCounts.pending}</strong></div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Accepted: <strong>{requestCounts.accepted}</strong></div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Fulfilled: <strong>{requestCounts.fulfilled}</strong></div>
      </div>

      <SectionCard title="Search Donors" icon={FaSearch}>
        {feedback && <p className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{feedback}</p>}
        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <select className="rounded-md border border-slate-300 px-3 py-2" value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}>
            {groups.map((group) => <option key={group}>{group}</option>)}
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min="1" value={filters.radiusKm} onChange={(e) => setFilters({ ...filters, radiusKm: e.target.value })} />
          <button className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700" onClick={search}>Find Matches</button>
        </div>

        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-800">
          <span className="inline-flex items-center gap-2 font-medium">
            <FaMapMarkedAlt className="text-red-600" /> Search radius: {filters.radiusKm} km
          </span>
        </div>
        <DonorMap center={{ latitude: user.latitude, longitude: user.longitude }} donors={matches} />

        <div className="mt-3 space-y-2">
          {matches.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No donor matches found in current filters.</p>
          ) : (
            matches.map((donor) => (
              <div key={donor.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{donor.name} ({donor.bloodGroup})</p>
                  <p className="text-slate-500">{donor.distanceKm} km away | {donor.phone}</p>
                </div>
                <button
                  className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  onClick={() => createDonorRequest(donor)}
                  disabled={activeDonorRequestIds.has(donor.id)}
                >
                  {activeDonorRequestIds.has(donor.id) ? 'Request Already Sent' : 'Send Request'}
                </button>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title="Request Tracking" icon={FaTint}>
        {myRequests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No requests yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {myRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p>
                  #{request.id} | {request.bloodGroup} | {request.targetType} | <strong>{request.status}</strong>
                </p>
                {request.status === 'ACCEPTED' && request.targetType === 'DONOR' && request.donor ? (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="font-semibold text-red-900">Accepted Donor Details</p>
                    <p className="text-red-800">Full Name: <strong>{request.donor.name || '-'}</strong></p>
                    <p className="text-red-800">Contact: <strong>{request.donor.phone || '-'}</strong></p>
                    <p className="text-red-800">Mail ID: <strong>{request.donor.email || '-'}</strong></p>
                    <p className="text-red-800">Address: <strong>{request.donor.address || '-'}</strong></p>
                    {request.donor.latitude !== null && request.donor.latitude !== undefined && request.donor.longitude !== null && request.donor.longitude !== undefined ? (
                      <a
                        href={getDirectionsUrl(request.donor)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Navigate to Donor
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Notifications" icon={FaBell}>
        {notifications.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No notifications.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {notifications.map((notification) => (
              <div key={notification.id} className={`rounded-xl border p-3 ${notification.isRead ? 'border-slate-200 bg-slate-50' : 'border-red-200 bg-red-50'}`}>
                <p className="font-semibold">{notification.title}</p>
                <p>{notification.message}</p>
                {!notification.isRead && (
                  <button className="mt-2 rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700" onClick={() => markNotificationRead(notification.id)}>
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default UserDashboard;
