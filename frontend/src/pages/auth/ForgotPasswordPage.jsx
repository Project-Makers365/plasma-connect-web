import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { FaArrowLeft, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';

function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [resetInfo, setResetInfo] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function requestResetToken() {
    setError('');
    setResetInfo('');
    if (!forgotEmail.trim()) {
      setError('Enter your email to request reset token.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setResetInfo(`Reset token generated for dev. Expires at ${new Date(data.expiresAt).toLocaleString()}.`);
      } else {
        setResetInfo(data.message || 'If account exists, reset instructions were generated.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  }

  async function submitPasswordReset() {
    setError('');
    setResetInfo('');
    if (!resetToken.trim()) {
      setError('Enter reset token.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Enter and confirm new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/reset-password', { token: resetToken.trim(), newPassword });
      setResetInfo(data.message || 'Password reset successful.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
        <p className="mt-1 text-sm text-slate-600">Request a token and reset your password securely.</p>

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
            onClick={requestResetToken}
            disabled={loading}
          >
            {loading ? 'Requesting...' : 'Request Reset Token'}
          </button>

          <input
            className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
            placeholder="Reset token"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
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
