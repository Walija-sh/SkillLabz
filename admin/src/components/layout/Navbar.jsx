import authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Management System</h2>
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
          Admin: {user.username}
        </span>
        <button onClick={handleLogout} className="text-xs font-black text-red-500 hover:text-red-700 uppercase">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;