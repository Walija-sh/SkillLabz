import { useState, useEffect } from 'react';
import verificationService from '../services/verification.service';
import { formatDate } from '../utils/dateFormatter';

const Verifications = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);





  const [error, setError] = useState(null);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      setError(null);
      const res = await verificationService.getPendingRequests();
      setRequests(res.data || []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to load verification requests";
      setError(message);
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setError(null);
      if (action === 'approve') {
        await verificationService.approveRequest(id);
      } else {
        if (!reason) {
          setError("Please provide a rejection reason");
          return;
        }
        await verificationService.rejectRequest(id, reason);
      }
      setRequests(requests.filter(r => r._id !== id));
      setSelected(null);
      setReason('');
    } catch (err) {
      const message = err.response?.data?.message || err.message || `Action failed`;
      setError(message);
      console.error(`Error during ${action}:`, err);
    }
  };

  if (loading) return <div className="p-10 text-center font-medium">Loading requests...</div>;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-semibold">Error</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={() => loadRequests()} className="mt-4 bg-red-600 text-white px-4 py-2 rounded text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">User</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Legal Name</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {requests.map(req => (
            <tr key={req._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{req.user?.username}</p>
                <p className="text-xs text-gray-500">{req.user?.email}</p>
              </td>
              <td className="px-6 py-4 text-slate-700">{req.fullName}</td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => setSelected(req)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-100">Review Documents</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-2xl font-bold mb-6">Review Identity: {selected.fullName}</h2>

            <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Full Name</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selected.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">CNIC Number</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selected.cnicNumber || selected.cnic || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date of Birth</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatDate(selected.dateOfBirth || selected.dob)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-2">Selfie</p><img src={selected.selfie.url} className="rounded-lg shadow-sm border" /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-2">CNIC Front</p><img src={selected.cnicFront.url} className="rounded-lg shadow-sm border" /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-2">CNIC Back</p><img src={selected.cnicBack.url} className="rounded-lg shadow-sm border" /></div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rejection Reason</label>
                <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why if rejecting..." className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <button onClick={() => handleAction(selected._id, 'reject')} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Reject</button>
              <button onClick={() => handleAction(selected._id, 'approve')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifications;