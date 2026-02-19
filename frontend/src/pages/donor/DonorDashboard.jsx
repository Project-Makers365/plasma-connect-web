import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import SectionCard from '../../components/SectionCard';
import { FaCheckCircle, FaClock, FaHistory, FaTimesCircle, FaToggleOn } from 'react-icons/fa';

function DonorDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState('');

  async function loadData() {
    const [reqRes, histRes] = await Promise.all([api.get('/donors/requests'), api.get('/donors/history')]);
    setRequests(reqRes.data.requests || []);
    setHistory(histRes.data.requests || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const requestCounts = useMemo(() => {
    const pending = requests.filter((item) => item.status === 'PENDING').length;
    const accepted = requests.filter((item) => item.status === 'ACCEPTED').length;
    const rejected = requests.filter((item) => item.status === 'REJECTED').length;
    return { pending, accepted, rejected };
  }, [requests]);

  async function changeAvailability(value) {
    try {
      setIsAvailable(value);
      await api.patch('/donors/availability', { isAvailable: value });
      setFeedback(`Availability updated to ${value ? 'Available' : 'Not Available'}.`);
      toast.success(`Availability set to ${value ? 'Available' : 'Not Available'}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update availability';
      setFeedback(message);
      toast.error(message);
    }
  }

  async function respond(requestId, status) {
    try {
      await api.patch(`/donors/requests/${requestId}/respond`, { status });
      setFeedback(`Request #${requestId} marked as ${status}.`);
      toast.success(`Request #${requestId} marked as ${status}`);
      loadData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update request status';
      setFeedback(message);
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Donor Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Manage your availability, respond to requests quickly, and review your donation activity.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Pending Requests: <strong>{requestCounts.pending}</strong></div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Accepted Requests: <strong>{requestCounts.accepted}</strong></div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">Rejected Requests: <strong>{requestCounts.rejected}</strong></div>
      </div>

      <SectionCard title="Availability" icon={FaToggleOn}>
        {feedback && <p className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{feedback}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button className={`rounded-md px-4 py-2 text-white ${isAvailable ? 'bg-brand-600' : 'bg-slate-600'}`} onClick={() => changeAvailability(true)}>
            Available
          </button>
          <button className={`rounded-md px-4 py-2 text-white ${!isAvailable ? 'bg-amber-600' : 'bg-slate-600'}`} onClick={() => changeAvailability(false)}>
            Not Available
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Incoming Requests" icon={FaClock}>
        {requests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No incoming requests.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-800">Request #{request.id}</p>
                <p className="text-slate-600">Blood Group: {request.bloodGroup} | Units: {request.units}</p>
                <p className="text-slate-600">Status: <strong>{request.status}</strong></p>
                {request.status === 'PENDING' && (
                  <div className="mt-2 flex gap-2">
                    <button className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1 text-white" onClick={() => respond(request.id, 'ACCEPTED')}><FaCheckCircle />Accept</button>
                    <button className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-white" onClick={() => respond(request.id, 'REJECTED')}><FaTimesCircle />Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Donation History" icon={FaHistory}>
        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No donation history found yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {history.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">#{item.id} | {item.bloodGroup} | <strong>{item.status}</strong></div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default DonorDashboard;
