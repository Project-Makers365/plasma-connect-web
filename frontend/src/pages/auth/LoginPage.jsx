import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaCheckCircle, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt, 
  FaUserShield,
  FaUser,
  FaTint,
  FaHospital,
  FaBuilding,
  FaUserMd,
  FaArrowLeft
} from 'react-icons/fa';

const ROLES = {
  USER: { label: 'User', icon: FaUser, description: 'Request plasma & track donations' },
  DONOR: { label: 'Donor', icon: FaTint, description: 'Donate plasma & save lives' },
  HOSPITAL: { label: 'Hospital', icon: FaHospital, description: 'Raise emergency requests' },
  BLOOD_BANK: { label: 'Blood Bank', icon: FaBuilding, description: 'Manage plasma stock' },
  ADMIN: { label: 'Admin', icon: FaUserMd, description: 'Full system control' },
};

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Handle pre-selected role from registration
  useEffect(() => {
    if (location.state?.role) {
      setSelectedRole(location.state.role);
    }
    if (location.state?.email) {
      setForm(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const loggedInUser = await login(form.email.trim(), form.password);
      
      // Check if user role matches selected role
      if (selectedRole && loggedInUser.role !== selectedRole) {
        toast.error(`This account is not registered as ${ROLES[selectedRole].label}. Please select the correct role.`);
        return;
      }
      
      toast.success(`Welcome, ${loggedInUser?.name || 'User'}!`);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    }
  }

  // Role Selection View
  if (!selectedRole) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
              <FaTint className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-gray-600">Select your role to continue</p>
          </div>

          {/* Role Selection Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(ROLES).map(([roleKey, role]) => {
              const Icon = role.icon;
              
              return (
                <button
                  key={roleKey}
                  onClick={() => setSelectedRole(roleKey)}
                  className="flex flex-col items-center rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-red-700 transition-all hover:bg-red-100 hover:shadow-lg hover:-translate-y-1 hover:border-red-300"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{role.label}</h3>
                  <p className="mt-1 text-center text-sm opacity-80">{role.description}</p>
                </button>
              );
            })}
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <FaArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Login Form View
  const SelectedIcon = ROLES[selectedRole].icon;

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-6 px-4 py-8 lg:grid-cols-12">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-7">
        {/* Role Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="ml-auto flex items-center gap-2">
            <SelectedIcon className="h-5 w-5 text-red-600" />
            <span className="font-medium text-gray-700">{ROLES[selectedRole].label} Login</span>
          </div>
        </div>

        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FaSignInAlt className="text-red-600" /> 
          Sign in as {ROLES[selectedRole].label}
        </h1>
        <p className="text-sm text-slate-600">Enter your credentials to access your {ROLES[selectedRole].label.toLowerCase()} dashboard.</p>
        
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <div className="relative">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Password"
            type={showLoginPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="button" className="absolute inset-y-0 right-0 px-3 text-slate-500" onClick={() => setShowLoginPassword((prev) => !prev)} aria-label="Toggle login password visibility">
            {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button 
          className="w-full rounded-md bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-700" 
          type="submit"
        >
          Login as {ROLES[selectedRole].label}
        </button>
        <Link to="/forgot-password" className="block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm text-slate-700 transition hover:bg-slate-50">
          Forgot Password?
        </Link>
        <p className="text-center text-sm text-slate-600">
          New here? <Link className="font-medium text-red-600 hover:text-red-700" to="/register">Create account</Link>
        </p>
      </form>

      <aside className="h-fit space-y-3 rounded-2xl border border-red-100 bg-white p-6 shadow-soft lg:col-span-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><FaUserShield className="text-red-600" /> {ROLES[selectedRole].label} Access</h2>
        <p className="text-sm text-slate-600">Your role permissions:</p>
        <ul className="space-y-2 text-sm text-slate-700">
          {selectedRole === 'USER' && (
            <>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Search for plasma donors</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Create plasma requests</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Track request status</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> View request history</li>
            </>
          )}
          {selectedRole === 'DONOR' && (
            <>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Toggle availability status</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Accept or reject requests</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Track donation history</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> View matched recipients</li>
            </>
          )}
          {selectedRole === 'HOSPITAL' && (
            <>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Raise emergency requests</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Track emergency pipeline</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Manage hospital request log</li>
            </>
          )}
          {selectedRole === 'BLOOD_BANK' && (
            <>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Manage plasma stock</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Accept or decline requests</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> View stock request logs</li>
            </>
          )}
          {selectedRole === 'ADMIN' && (
            <>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Full system control</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Manage all users</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> View all records</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-red-600" /> System analytics</li>
            </>
          )}
        </ul>
      </aside>
    </div>
  );
}

export default LoginPage;
