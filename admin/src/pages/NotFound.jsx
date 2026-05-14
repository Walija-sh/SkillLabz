import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="h-screen flex flex-col items-center justify-center">
    <h1 className="text-6xl font-bold text-slate-200">404</h1>
    <p className="text-gray-500 mt-2 mb-6">Oops! This page doesn't exist.</p>
    <Link to="/dashboard" className="text-indigo-600 font-bold hover:underline">Back to Safety</Link>
  </div>
);

export default NotFound;