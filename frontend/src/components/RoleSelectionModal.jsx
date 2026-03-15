import { useState } from 'react';
import { FaUser, FaTint, FaTimes, FaInfoCircle } from 'react-icons/fa';
import api from '../api/client';
import toast from 'react-hot-toast';

function RoleSelectionModal({ isOpen, onClose, onRoleSelected, user }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleRoleSelect(role) {
    setLoading(true);
    try {
      // If user wants to become a donor
      if (role === 'DONOR') {
        // Check if user has donated in last 6 months
        const { data } = await api.get('/users/can-become-donor');
        
        if (!data.canBecomeDonor) {
          toast.error(data.message || 'You cannot become a donor at this time. Please wait 6 months after your last donation.');
          setLoading(false);
          return;
        }

        // Convert user to donor
        await api.post('/users/convert-to-donor');
        toast.success('You are now registered as a Donor!');
      } else {
        toast.success('Continuing as User');
      }

      onRoleSelected(role);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update role';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700">
            <FaTint className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'User'}!</h2>
          <p className="mt-2 text-gray-600">How would you like to proceed?</p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-xl bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Did you know?</p>
              <p className="mt-1">
                You can use the platform as a User to request plasma, or become a Donor to help save lives. 
                If you've donated before, you must wait 6 months before donating again.
              </p>
            </div>
          </div>
        </div>

        {/* Role Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* User Option */}
          <button
            onClick={() => handleRoleSelect('USER')}
            disabled={loading}
            className="group flex flex-col items-center rounded-xl border-2 border-red-200 bg-red-50 p-6 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-lg disabled:opacity-50"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md transition group-hover:scale-110">
              <FaUser className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900">Continue as User</h3>
            <p className="mt-2 text-center text-sm text-red-700">
              Request plasma and track your requests
            </p>
          </button>

          {/* Donor Option */}
          <button
            onClick={() => handleRoleSelect('DONOR')}
            disabled={loading}
            className="group flex flex-col items-center rounded-xl border-2 border-red-200 bg-red-50 p-6 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-lg disabled:opacity-50"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md transition group-hover:scale-110">
              <FaTint className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900">Become a Donor</h3>
            <p className="mt-2 text-center text-sm text-red-700">
              Donate plasma and save lives
            </p>
          </button>
        </div>

        {/* Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          You can change your mind later in your profile settings
        </p>
      </div>
    </div>
  );
}

export default RoleSelectionModal;
