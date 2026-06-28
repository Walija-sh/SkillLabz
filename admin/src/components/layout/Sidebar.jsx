import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import authService from '../../services/auth.service';

const menuItems = [
  { name: 'Dashboard',     path: '/dashboard',     icon: Squares2X2Icon },
  { name: 'Verifications', path: '/verifications', icon: ShieldCheckIcon },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full ml-3 px-3 py-1.5 bg-[#191970] text-white text-xs font-black uppercase tracking-widest rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-50"
          >
            {label}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#191970]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
function DesktopSidebar({ collapsed, setCollapsed, location, handleLogout }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="hidden md:flex relative flex-col bg-[#191970] text-white shadow-2xl shrink-0 z-20 overflow-visible"
      style={{ minHeight: '100vh' }}
    >
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 overflow-hidden shrink-0" style={{ minHeight: 72 }}>
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.img
              key="logo-collapsed"
              src="/logo.png"
              alt="SkillLabz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-8 h-8 object-contain shrink-0 mx-auto"
            />
          ) : (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <img src="/logo.png" alt="SkillLabz" className="w-8 h-8 object-contain shrink-0" />
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-lg font-black tracking-tight text-[#191970] uppercase leading-none">
                  SkillLabz
                </h1>
                <span className="text-[#191970] text-[10px] font-bold block mt-0.5 tracking-widest uppercase">
                  Admin Portal
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return collapsed ? (
            <Tooltip key={item.path} label={item.name}>
              <Link
                to={item.path}
                className={`flex items-center justify-center w-12 h-12 rounded-2xl mx-auto transition-colors relative ${
                  isActive ? 'text-[#191970]' : 'text-white hover:text-white/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTabDesktop"
                    className="absolute inset-0 bg-white rounded-2xl -z-10 shadow-md"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" strokeWidth={2} />
              </Link>
            </Tooltip>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors relative overflow-hidden ${
                isActive ? 'text-[#191970]' : 'text-white hover:text-white/80'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeAdminTabDesktop"
                  className="absolute inset-0 bg-white rounded-2xl -z-10 shadow-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {item.name}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        {collapsed ? (
          <Tooltip label="Logout">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto bg-white text-red-500 hover:bg-red-50 transition-colors shadow-md"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" strokeWidth={2} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-red-500 hover:bg-red-50 transition-colors shadow-md"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
            <motion.span
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap"
            >
              Logout
            </motion.span>
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#191970] shadow-lg hover:bg-gray-100 transition-colors border border-gray-200"
        style={{ right: -14 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronRightIcon className="w-3.5 h-3.5" strokeWidth={3} />
        </motion.div>
      </motion.button>
    </motion.aside>
  );
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────
function MobileSidebar({ open, setOpen, location, handleLogout }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-[#191970] flex items-center justify-center text-white shadow-lg"
      >
        <Bars3Icon className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="drawer"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="md:hidden fixed top-0 left-0 h-full w-64 bg-[#191970] text-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="bg-white px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="SkillLabz" className="w-8 h-8 object-contain shrink-0" />
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#191970] uppercase leading-none">
                    SkillLabz
                  </h1>
                  <span className="text-[#191970]/50 text-[9px] block mt-0.5 tracking-widest uppercase">
                    Admin Portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#191970]/10 flex items-center justify-center text-[#191970]/60 hover:text-[#191970] hover:bg-[#191970]/20 transition-colors shrink-0"
              >
                <XMarkIcon className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-6 space-y-1 px-3">
              {menuItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors relative overflow-hidden ${
                        isActive ? 'text-[#191970]' : 'text-white hover:text-white/80'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeAdminTabMobile"
                          className="absolute inset-0 bg-white rounded-2xl -z-10 shadow-md"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.06, duration: 0.3 }}
              >
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-red-500 hover:bg-red-50 transition-colors shadow-md"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
                  Logout
                </button>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Logout logic lives here — calls authService then redirects to /login
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <DesktopSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        location={location}
        handleLogout={handleLogout}
      />
      <MobileSidebar
        open={mobileOpen}
        setOpen={setMobileOpen}
        location={location}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Sidebar;