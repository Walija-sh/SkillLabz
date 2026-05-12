import { Outlet, Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-800">SkillLabz Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800">Dashboard</Link>
          <Link to="/verifications" className="block px-4 py-2 rounded hover:bg-slate-800">Verifications</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2">Admin: {user.username}</p>
          <button onClick={handleLogout} className="w-full py-2 bg-red-600 rounded text-sm font-bold">Logout</button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">Management Console</h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;