import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import DonorDashboard from './donor/DonorDashboard';
import UserDashboard from './user/UserDashboard';
import HospitalDashboard from './hospital/HospitalDashboard';
import BloodBankDashboard from './bloodbank/BloodBankDashboard';
import { FaExclamationTriangle } from 'react-icons/fa';

function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const views = {
    ADMIN: <AdminDashboard />,
    DONOR: <DonorDashboard />,
    USER: <UserDashboard />,
    HOSPITAL: <HospitalDashboard />,
    BLOOD_BANK: <BloodBankDashboard />,
  };

  return (
    views[user.role] || (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <p className="inline-flex items-center gap-2 font-semibold"><FaExclamationTriangle /> Role not supported</p>
      </div>
    )
  );
}

export default DashboardPage;
