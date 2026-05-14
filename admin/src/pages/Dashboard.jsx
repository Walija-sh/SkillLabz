import { useState, useEffect } from 'react';
import verificationService from '../services/verification.service';

const Dashboard = () => {
  const [stats, setStats] = useState({ pending: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
          setError(null);
        const res = await verificationService.getPendingRequests();
        setStats({ pending: res.data?.length || 0 });
      } catch (err) {
          console.error("Stats fetch failed:", err);
          setError("Failed to load dashboard stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>
      
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Pending Verifications</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{stats.pending}</p>
        </div>
        {/* Placeholder for future growth */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-slate-300">
          <p className="text-sm font-medium text-gray-500 uppercase">System Status</p>
          <p className="text-4xl font-bold text-green-500 mt-2">Active</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;