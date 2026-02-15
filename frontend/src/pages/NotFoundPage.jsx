import { Link } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-8">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <FaExclamationTriangle />
        </p>
        <h1 className="text-3xl font-bold text-slate-900">404 - Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist or may have been moved.</p>
        <Link className="mx-auto mt-5 inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white" to="/dashboard">
          <FaArrowLeft />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
