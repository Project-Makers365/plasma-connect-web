import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import MapPicker from '../../components/MapPicker';
import { FaCheckCircle, FaCrosshairs, FaEye, FaEyeSlash, FaMapMarkedAlt, FaUserPlus } from 'react-icons/fa';

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
  const [locationMode, setLocationMode] = useState('current');
  const [geoLoading, setGeoLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
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

  function updateLocation({ lat, lng }) {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }

  async function reverseGeocodeAndFillAddress(lat, lng) {
    setAddressLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,
        { headers: { Accept: 'application/json' } },
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const resolvedAddress = data.display_name || '';
      if (resolvedAddress) {
        setForm((prev) => ({ ...prev, address: resolvedAddress }));
      }
    } catch {
      setGeoError('Location detected, but address lookup failed. You can enter address manually.');
      toast.error('Address lookup failed for selected location');
    } finally {
      setAddressLoading(false);
    }
  }

  function fetchCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }

    setGeoError('');
    setGeoLoading(true);
    setLocationMode('current');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateLocation({ lat, lng });
        reverseGeocodeAndFillAddress(lat, lng).finally(() => {
          toast.success('Current location updated');
          setGeoLoading(false);
        });
      },
      (positionError) => {
        setGeoLoading(false);
        const message = positionError.message || 'Unable to fetch your location.';
        setGeoError(message);
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  async function handleManualMapSelect(lat, lng) {
    setLocationMode('manual');
    setGeoError('');
    updateLocation({ lat, lng });
    await reverseGeocodeAndFillAddress(lat, lng);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const registeredUser = await register({
        ...form,
        bloodGroup: needsBlood ? form.bloodGroup : null,
      });
      toast.success(`Registration successful for ${registeredUser?.name || form.name || 'User'}`);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        const message = 'Server timeout. Please check backend and try again.';
        setError(message);
        toast.error(message);
      } else {
        const message = err.response?.data?.message || 'Registration failed';
        setError(message);
        toast.error(message);
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
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
            <div className="relative">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-24"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
              {(geoLoading || addressLoading) && (
                <span className="absolute inset-y-0 right-3 inline-flex items-center text-xs text-slate-500">Updating...</span>
              )}
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
            <p className="text-sm font-semibold text-slate-800">Location</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={fetchCurrentLocation}
                disabled={geoLoading || addressLoading}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  locationMode === 'current'
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FaCrosshairs />
                {(geoLoading || addressLoading) ? 'Detecting Location...' : 'Use Current Location'}
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('manual')}
                disabled={geoLoading || addressLoading}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  locationMode === 'manual'
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FaMapMarkedAlt />
                Manual Location
              </button>
              <p className="text-xs text-slate-600">
                Use current location or switch to manual and pick on map.
              </p>
            </div>

            {geoError && <p className="text-xs text-red-600">{geoError}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"><FaMapMarkedAlt className="text-brand-700" /> Pick your location</p>
          <MapPicker
            latitude={form.latitude}
            longitude={form.longitude}
            isInteractive={locationMode === 'manual'}
            onSelect={({ lat, lng }) => handleManualMapSelect(lat, lng)}
          />
          <p className="mt-1 text-xs text-slate-500">
            {locationMode === 'manual'
              ? 'Manual mode enabled: click or drag on map to update address.'
              : 'Current location mode: click "Use Current Location" to sync map and address.'}
          </p>
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
