import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MapPicker from '../../components/MapPicker';
import { FaCheckCircle, FaEye, FaEyeSlash, FaMapMarkedAlt, FaUserPlus } from 'react-icons/fa';

const roles = ['USER', 'DONOR', 'HOSPITAL', 'BLOOD_BANK'];
const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const roleDetails = {
  USER: {
    label: 'Recipient User',
    required: ['Name', 'Email', 'Password', 'Phone', 'Blood Group', 'Address', 'Location'],
    access: ['Search donors', 'Create plasma requests', 'Track request status', 'View request history'],
  },
  DONOR: {
    label: 'Donor',
    required: ['Name', 'Email', 'Password', 'Phone', 'Blood Group', 'Address', 'Location'],
    access: ['Toggle availability', 'Accept or reject requests', 'Track donation history', 'View matched recipients'],
  },
  HOSPITAL: {
    label: 'Hospital',
    required: ['Name', 'Email', 'Password', 'Phone', 'Blood Group', 'Address', 'Location'],
    access: ['Raise emergency requests', 'Track emergency pipeline', 'Manage hospital request log'],
  },
  BLOOD_BANK: {
    label: 'Blood Bank',
    required: ['Name', 'Email', 'Password', 'Phone', 'Address', 'Location'],
    access: ['Manage plasma stock', 'Accept or decline requests', 'View stock request logs'],
  },
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
    bloodGroup: 'A+',
    address: '',
    latitude: 17.385,
    longitude: 78.4867,
  });

  const needsBlood = useMemo(() => ['USER', 'DONOR', 'HOSPITAL'].includes(form.role), [form.role]);
  const activeRole = roleDetails[form.role];

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register({
        ...form,
        bloodGroup: needsBlood ? form.bloodGroup : null,
      });
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Server timeout. Please check backend and try again.');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-12">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><FaUserPlus className="text-brand-700" /> Create Plasma Connect account</h1>
        <p className="text-sm text-slate-600">Register once. Login with your email and password to access your role dashboard.</p>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid gap-3 md:grid-cols-2">
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="relative">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10" placeholder="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <button type="button" className="absolute inset-y-0 right-0 px-3 text-slate-500" onClick={() => setShowPassword((prev) => !prev)} aria-label="Toggle password visibility">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roles.map((role) => <option key={role}>{role}</option>)}
          </select>
          {needsBlood && (
            <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              {groups.map((group) => <option key={group}>{group}</option>)}
            </select>
          )}
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 md:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"><FaMapMarkedAlt className="text-brand-700" /> Pick your location</p>
          <MapPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onSelect={({ lat, lng }) => setForm({ ...form, latitude: lat, longitude: lng })}
          />
          <p className="mt-2 text-xs text-slate-500">Selected: {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}</p>
        </div>

        <button
          className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Registering...' : 'Register'}
        </button>
        <p className="text-center text-sm text-slate-600">
          Already registered? <Link className="text-brand-700" to="/login">Login</Link>
        </p>
      </form>

      <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-4">
        <h2 className="text-lg font-semibold text-slate-900">Role Requirements</h2>
        <p className="text-sm text-slate-600">Selected role: <span className="font-semibold text-brand-700">{activeRole.label}</span></p>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">Required During Register</p>
          <ul className="space-y-2 text-sm text-slate-700">
            {activeRole.required.map((item) => (
              <li key={item} className="flex items-center gap-2"><FaCheckCircle className="text-brand-600" /> {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">Access After Login</p>
          <ul className="space-y-2 text-sm text-slate-700">
            {activeRole.access.map((item) => (
              <li key={item} className="flex items-center gap-2"><FaCheckCircle className="text-brand-600" /> {item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default RegisterPage;
