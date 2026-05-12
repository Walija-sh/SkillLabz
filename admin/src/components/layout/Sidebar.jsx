import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Verifications', path: '/verifications' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col md:flex">
      <div className="p-6 text-xl font-black tracking-tight border-b border-slate-800 text-indigo-400">
        SKILLLABZ <span className="text-white text-xs block font-normal">ADMIN PORTAL</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg text-sm font-bold transition-colors ${location.pathname === item.path ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;