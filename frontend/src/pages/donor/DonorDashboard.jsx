import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import SectionCard from '../../components/SectionCard';
import { FaCheckCircle, FaClock, FaHistory, FaTimesCircle, FaToggleOn, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

function DonorDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [donorStatus, setDonorStatus] = useState(null);

  async function loadData() {
    const [reqRes, histRes, statusRes] = await Promise.all([
      api.get('/donors/requests'), 
      api.get('/donors/history'),
      api.get('/users/can-become-donor').catch(() => ({ data: { canBecomeDonor: true } }))
    ]);
    setRequests(reqRes.data.requests || []);
    setHistory(histRes.data.requests || []);
    setDonorStatus(statusRes.data);
    
    // Set availability based on donor status
    if (statusRes.data && !statusRes.data.canBecomeDonor) {
      setIsAvailable(false);
    }
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
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Donor Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Manage your availability, respond to requests quickly, and review your donation activity.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Pending Requests: <strong>{requestCounts.pending}</strong></div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Accepted Requests: <strong>{requestCounts.accepted}</strong></div>
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700">Rejected Requests: <strong>{requestCounts.rejected}</strong></div>
      </div>

      {/* 6-Month Rule Notice */}
      {donorStatus && !donorStatus.canBecomeDonor && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <FaCalendarAlt className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">6-Month Donation Rule</p>
              <p className="text-sm text-red-800">
                You donated on {new Date(donorStatus.lastDonationDate).toLocaleDateString()}. 
                You must wait {donorStatus.daysRemaining} more days before you can donate again.
              </p>
              <p className="mt-1 text-xs text-red-700">
                After donating, you will be converted back to a User for 6 months.
              </p>
            </div>
          </div>
        </div>
      )}

      <SectionCard title="Availability" icon={FaToggleOn}>
        {feedback && <p className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{feedback}</p>}
        
        {/* Info Banner */}
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            <p className="text-xs text-red-800">
              <strong>Important:</strong> When you accept a donation request, you will be marked as unavailable 
              and converted to a User role for 6 months. You can become a donor again after this period.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            className={`rounded-md px-4 py-2 text-white transition ${isAvailable ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-400'}`} 
            onClick={() => changeAvailability(true)}
            disabled={donorStatus && !donorStatus.canBecomeDonor}
          >
            Available
          </button>
          <button 
            className={`rounded-md px-4 py-2 text-white transition ${!isAvailable ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-400'}`} 
            onClick={() => changeAvailability(false)}
          >
            Not Available
          </button>
        </div>
        {donorStatus && !donorStatus.canBecomeDonor && (
          <p className="mt-2 text-xs text-red-600">
            Availability is disabled due to 6-month donation rule
          </p>
        )}
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
                    <button className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700" onClick={() => respond(request.id, 'ACCEPTED')}><FaCheckCircle />Accept</button>
                    <button className="inline-flex items-center gap-1 rounded-md bg-slate-600 px-3 py-1 text-white hover:bg-slate-700" onClick={() => respond(request.id, 'REJECTED')}><FaTimesCircle />Reject</button>
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
