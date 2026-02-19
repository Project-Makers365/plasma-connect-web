import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaEye, FaEyeSlash, FaSignInAlt, FaUserShield } from 'react-icons/fa';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const loggedInUser = await login(form.email, form.password);
      toast.success(`Welcome, ${loggedInUser?.name || 'User'}!`);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-6 px-4 py-8 lg:grid-cols-12">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-7">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><FaSignInAlt className="text-brand-700" /> Welcome to Plasma Connect</h1>
        <p className="text-sm text-slate-600">Sign in with your registered credentials to continue.</p>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <div className="relative">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10"
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
        <button className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white transition hover:bg-brand-700" type="submit">
          Login
        </button>
        <Link to="/forgot-password" className="block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm text-slate-700 transition hover:bg-slate-50">
          Forgot Password?
        </Link>
        <p className="text-center text-sm text-slate-600">
          New here? <Link className="font-medium text-brand-700" to="/register">Create account</Link>
        </p>
      </form>

      <aside className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><FaUserShield className="text-brand-700" /> Role Login Access</h2>
        <p className="text-sm text-slate-600">All roles use Email + Password to login.</p>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-center gap-2"><FaCheckCircle className="text-brand-600" /> Admin: full control and visibility of all records</li>
          <li className="flex items-center gap-2"><FaCheckCircle className="text-brand-600" /> Donor: manage availability and respond to requests</li>
          <li className="flex items-center gap-2"><FaCheckCircle className="text-brand-600" /> User: search donors and track own requests</li>
          <li className="flex items-center gap-2"><FaCheckCircle className="text-brand-600" /> Hospital: raise and track emergency requests</li>
          <li className="flex items-center gap-2"><FaCheckCircle className="text-brand-600" /> Blood Bank: manage stock and process requests</li>
        </ul>
      </aside>
    </div>
  );
}

export default LoginPage;
