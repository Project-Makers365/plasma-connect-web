import { Link } from 'react-router-dom';
import { FaHeartbeat, FaUserPlus, FaSignInAlt, FaTint, FaHospital, FaUserMd, FaBuilding } from 'react-icons/fa';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-800/10"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
              <FaTint className="h-10 w-10 text-white" />
            </div>
            
            {/* Main Title */}
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                PLASMA DONOR WEBSITE
              </span>
            </h1>
            
            {/* Tagline */}
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 sm:text-xl">
              Connect. Donate. Save Lives. Join our community of heroes making a difference one plasma donation at a time.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:-translate-y-0.5"
              >
                <FaUserPlus className="h-5 w-5" />
                Register
              </Link>
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-red-600 bg-white px-8 py-4 text-lg font-semibold text-red-600 shadow-md transition-all hover:bg-red-50 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FaSignInAlt className="h-5 w-5" />
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">Simple steps to save lives</p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <FaUserPlus className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Register</h3>
            <p className="text-gray-600">Create your account as a donor, recipient, hospital, or blood bank.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <FaHeartbeat className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Donate Plasma</h3>
            <p className="text-gray-600">Make a life-saving plasma donation at your convenience.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <FaHospital className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Request Plasma</h3>
            <p className="text-gray-600">Hospitals and patients can request plasma when needed.</p>
          </div>
          
          {/* Feature 4 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <FaUserMd className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Save Lives</h3>
            <p className="text-gray-600">Your donation helps patients recover from critical conditions.</p>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Who Can Join?</h2>
            <p className="mt-4 text-lg text-gray-600">Multiple roles to serve the community</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* User */}
            <div className="rounded-xl border border-red-100 bg-gradient-to-b from-white to-red-50/30 p-6 text-center transition hover:shadow-md hover:border-red-200">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FaUserPlus className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">User</h3>
              <p className="mt-2 text-sm text-gray-600">Request plasma and track donations</p>
            </div>
            
            {/* Donor */}
            <div className="rounded-xl border border-red-100 bg-gradient-to-b from-white to-red-50/30 p-6 text-center transition hover:shadow-md hover:border-red-200">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FaTint className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Donor</h3>
              <p className="mt-2 text-sm text-gray-600">Donate plasma and save lives</p>
            </div>
            
            {/* Hospital */}
            <div className="rounded-xl border border-red-100 bg-gradient-to-b from-white to-red-50/30 p-6 text-center transition hover:shadow-md hover:border-red-200">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FaHospital className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Hospital</h3>
              <p className="mt-2 text-sm text-gray-600">Raise emergency requests</p>
            </div>
            
            {/* Blood Bank */}
            <div className="rounded-xl border border-red-100 bg-gradient-to-b from-white to-red-50/30 p-6 text-center transition hover:shadow-md hover:border-red-200">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FaBuilding className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Blood Bank</h3>
              <p className="mt-2 text-sm text-gray-600">Manage plasma inventory</p>
            </div>
            
            {/* Admin */}
            <div className="rounded-xl border border-red-100 bg-gradient-to-b from-white to-red-50/30 p-6 text-center transition hover:shadow-md hover:border-red-200">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FaUserMd className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Admin</h3>
              <p className="mt-2 text-sm text-gray-600">Oversee all operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} Plasma Connect. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Saving lives through plasma donation
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
