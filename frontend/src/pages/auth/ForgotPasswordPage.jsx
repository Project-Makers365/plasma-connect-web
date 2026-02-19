import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { FaArrowLeft, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';

function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [resetInfo, setResetInfo] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function requestResetOtp() {
    setError('');
    setResetInfo('');
    if (!forgotEmail.trim()) {
      const message = 'Enter your email to receive OTP.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      if (data.otp) {
        setOtp(String(data.otp));
        const expires = data.expiresAt ? new Date(data.expiresAt).toLocaleString() : '';
        setResetInfo(`Dev OTP generated: ${data.otp}${expires ? ` (expires: ${expires})` : ''}`);
        toast.success('OTP generated successfully');
        return;
      }
      setResetInfo(data.message || 'If account exists, OTP has been sent to email.');
      toast.success(data.message || 'OTP request submitted');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to request password reset';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPasswordReset() {
    setError('');
    setResetInfo('');
    if (!forgotEmail.trim()) {
      const message = 'Enter your account email.';
      setError(message);
      toast.error(message);
      return;
    }
    if (!otp.trim()) {
      const message = 'Enter OTP from your email.';
      setError(message);
      toast.error(message);
      return;
    }
    if (!newPassword || !confirmPassword) {
      const message = 'Enter and confirm new password.';
      setError(message);
      toast.error(message);
      return;
    }
    if (newPassword !== confirmPassword) {
      const message = 'New password and confirm password do not match.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setResetInfo(data.message || 'Password reset successful.');
      toast.success(data.message || 'Password reset successful');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
            <FaArrowLeft />
            Back to Login
          </Link>
        </div>

        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><FaKey className="text-brand-700" /> Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-600">Get OTP on your email and reset your password securely.</p>

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {resetInfo && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{resetInfo}</p>}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
            placeholder="Account email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
          <button
            type="button"
            className="rounded-md bg-slate-900 px-3 py-2 text-white disabled:opacity-60 md:col-span-2"
            onClick={requestResetOtp}
            disabled={loading}
          >
            {loading ? 'Requesting...' : 'Send OTP'}
          </button>

          <input
            className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <div className="relative">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10"
              placeholder="New password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="button" className="absolute inset-y-0 right-0 px-3 text-slate-500" onClick={() => setShowNewPassword((prev) => !prev)} aria-label="Toggle new password visibility">
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10"
              placeholder="Confirm new password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="button" className="absolute inset-y-0 right-0 px-3 text-slate-500" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label="Toggle confirm password visibility">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="button"
            className="rounded-md bg-brand-600 px-3 py-2 text-white transition hover:bg-brand-700 disabled:opacity-60 md:col-span-2"
            onClick={submitPasswordReset}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
