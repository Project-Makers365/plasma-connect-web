import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import SectionCard from '../../components/SectionCard';
import { FaBoxes, FaCheckCircle, FaClipboardCheck, FaTimesCircle } from 'react-icons/fa';

function BloodBankDashboard() {
  const [stocks, setStocks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stockForm, setStockForm] = useState({ bloodGroup: 'A+', unitsAvailable: 0 });
  const [feedback, setFeedback] = useState('');

  async function loadData() {
    const [stocksRes, reqRes] = await Promise.all([api.get('/blood-banks/stocks'), api.get('/blood-banks/requests')]);
    setStocks(stocksRes.data.stocks || []);
    setRequests(reqRes.data.requests || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalUnits = useMemo(() => stocks.reduce((sum, stock) => sum + Number(stock.unitsAvailable || 0), 0), [stocks]);

  async function saveStock() {
    await api.put('/blood-banks/stocks', {
      bloodGroup: stockForm.bloodGroup,
      unitsAvailable: Number(stockForm.unitsAvailable),
    });
    setStockForm({ bloodGroup: 'A+', unitsAvailable: 0 });
    setFeedback('Stock updated successfully.');
    loadData();
  }

  async function respond(id, status) {
    await api.patch(`/blood-banks/requests/${id}/respond`, { status });
    setFeedback(`Request #${id} updated to ${status}.`);
    loadData();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Blood Bank Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Maintain plasma stock levels and process incoming requests from users and hospitals.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Total Stock Units: <strong>{totalUnits}</strong></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Incoming Requests: <strong>{requests.length}</strong></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Groups Managed: <strong>{stocks.length}</strong></div>
      </div>

      <SectionCard title="Manage Plasma Stock" icon={FaBoxes}>
        {feedback && <p className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{feedback}</p>}
        <div className="grid gap-2 md:grid-cols-3">
          <select className="rounded-md border border-slate-300 px-3 py-2" value={stockForm.bloodGroup} onChange={(e) => setStockForm({ ...stockForm, bloodGroup: e.target.value })}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min="0" value={stockForm.unitsAvailable} onChange={(e) => setStockForm({ ...stockForm, unitsAvailable: e.target.value })} />
          <button className="rounded-md bg-brand-600 px-3 py-2 text-white" onClick={saveStock}>Save Stock</button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {stocks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">No stock records available.</p>
          ) : (
            stocks.map((stock) => (
              <div key={stock.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">{stock.bloodGroup}: <strong>{stock.unitsAvailable}</strong> units</div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title="Incoming Requests" icon={FaClipboardCheck}>
        {requests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No incoming requests.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {requests.map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p>#{request.id} | {request.bloodGroup} | Units: {request.units} | <strong>{request.status}</strong></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1 text-white" onClick={() => respond(request.id, 'ACCEPTED')}><FaCheckCircle />Accept</button>
                  <button className="rounded-md bg-blue-600 px-3 py-1 text-white" onClick={() => respond(request.id, 'FULFILLED')}>Fulfill</button>
                  <button className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-white" onClick={() => respond(request.id, 'REJECTED')}><FaTimesCircle />Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default BloodBankDashboard;
