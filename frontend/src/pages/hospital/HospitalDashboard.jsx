import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import SectionCard from '../../components/SectionCard';
import { FaAmbulance, FaClipboardList } from 'react-icons/fa';

function HospitalDashboard() {
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [targetType, setTargetType] = useState('BLOOD_BANK');
  const [targetId, setTargetId] = useState('');
  const [requests, setRequests] = useState([]);
  const [feedback, setFeedback] = useState('');

  async function loadData() {
    const { data } = await api.get('/hospitals/requests');
    setRequests(data.requests || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const emergency = requests.filter((item) => item.isEmergency).length;
    const pending = requests.filter((item) => item.status === 'PENDING').length;
    const accepted = requests.filter((item) => item.status === 'ACCEPTED').length;
    return { emergency, pending, accepted };
  }, [requests]);

  async function createEmergency() {
    const payload = {
      bloodGroup,
      units: 2,
      targetType,
      note: 'Hospital emergency request',
      isEmergency: true,
    };

    if (targetType === 'DONOR') payload.donorId = Number(targetId);
    if (targetType === 'BLOOD_BANK') payload.bloodBankId = Number(targetId);

    await api.post('/hospitals/emergency-requests', payload);
    setFeedback('Emergency request created successfully.');
    setTargetId('');
    loadData();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Hospital Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Initiate urgent plasma requests and monitor emergency response status.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Emergency Requests: <strong>{stats.emergency}</strong></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Pending: <strong>{stats.pending}</strong></div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Accepted: <strong>{stats.accepted}</strong></div>
      </div>

      <SectionCard title="Create Emergency Request" icon={FaAmbulance}>
        {feedback && <p className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{feedback}</p>}
        <div className="grid gap-2 md:grid-cols-4">
          <select className="rounded-md border border-slate-300 px-3 py-2" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            <option value="BLOOD_BANK">BLOOD_BANK</option>
            <option value="DONOR">DONOR</option>
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-2" value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder={targetType === 'DONOR' ? 'Donor ID' : 'Blood Bank ID'} />
          <button className="rounded-md bg-red-600 px-3 py-2 text-white" onClick={createEmergency}>Create</button>
        </div>
      </SectionCard>

      <SectionCard title="Emergency Request Tracking" icon={FaClipboardList}>
        {requests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No hospital requests found.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {requests.map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                #{request.id} | Emergency: {String(request.isEmergency)} | {request.bloodGroup} | <strong>{request.status}</strong>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default HospitalDashboard;
