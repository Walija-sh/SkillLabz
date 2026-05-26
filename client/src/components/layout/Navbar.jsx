import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import Button from '../common/Button';
import notificationService from '../../services/notification.service';

// ─── Constants ────────────────────────────────────────────────────────────────
const PUBLIC_NAV  = [];
const PRIVATE_NAV = [{ name: 'Browse Tools', href: '/browse-tools' }, { name: 'List Your Tool', href: '/list-tool' }, { name: 'My Rentals', href: '/my-rentals' }, { name: 'Owner Dashboard', href: '/dashboard' }];

// ─── Tiny shared components ───────────────────────────────────────────────────
const Icon = ({ d, className = 'h-6 w-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const Avatar = ({ url, initial, className = 'h-10 w-10 text-lg', bg = 'bg-blue-600', ring = 'border border-gray-100' }) => (
  <div className={`${className} ${bg} ${ring} rounded-full flex items-center justify-center text-white font-bold overflow-hidden shrink-0`}>
    {url ? <img src={url} alt="Profile" className="w-full h-full object-cover" /> : initial}
  </div>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [isOpen,        setIsOpen]        = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen,   setIsNotifOpen]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifLoading,  setNotifLoading]  = useState(false);
  const [isScrolled,    setIsScrolled]    = useState(false);

  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn      = useSelector((s) => s.auth.status);
  const userData        = useSelector((s) => s.auth.userData);
  const name            = userData?.fullName || userData?.name || userData?.firstName || userData?.email?.split('@')[0] || 'User';
  const initial         = name.charAt(0).toUpperCase();
  const profileImageUrl = userData?.profileImage?.url;

  // Scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click-outside notifications
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Notifications fetch + polling
  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    setNotifLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) { console.error(e); }
    finally { setNotifLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) { setNotifications([]); setUnreadCount(0); return; }
    fetchNotifications();
    const id = setInterval(fetchNotifications, 15000);
    return () => clearInterval(id);
  }, [isLoggedIn, fetchNotifications]);

  // Handlers
  const handleAnchorClick = (e, href) => {
    e.preventDefault(); setIsOpen(false);
    if (location.pathname === '/') document.getElementById(href.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' });
    else navigate(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/login');
    setIsOpen(false); setIsProfileOpen(false);
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) { console.error(e); }
    }
    setIsNotifOpen(false);
    navigate(notif.actionLink || '/my-rentals');
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const s = isScrolled;
  const navItems = isLoggedIn ? PRIVATE_NAV : PUBLIC_NAV;

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-300 ${s ? 'bg-[#191970] border-b border-[#191970] shadow-lg shadow-[#191970]/20 text-white' : 'bg-transparent border-b border-transparent shadow-none text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">

          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-1.5">
            <img src={s ? '/logo-2.png' : '/logo.png'} alt="SkillLabz logo" className="h-24 w-24 object-contain shrink-0" />
            <span className={`text-2xl font-bold tracking-tight ${s ? 'text-white' : 'text-gray-900'}`}>SkillLabz</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navItems.map(({ name: n, href }) =>
                href.startsWith('/#')
                  ? <a key={n} href={href} onClick={(e) => handleAnchorClick(e, href)} className={`text-base font-semibold transition-colors cursor-pointer ${s ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-[#191970]'}`}>{n}</a>
                  : <Link key={n} to={href} className={`text-lg font-semibold transition-colors ${s ? 'text-white/90 hover:text-white' : 'text-gray-800 hover:text-[#191970]'}`}>{n}</Link>
              )}
            </div>

            <div className="flex items-center pl-4">
              {!isLoggedIn ? (
                <div className="flex items-center space-x-5 pl-8">
                  <Link to="/login" className={`text-base font-bold transition-colors ${s ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`}>Login</Link>
                  <Link to="/register">
                    <Button className={`px-6 rounded-lg font-bold border text-base transition-colors ${s ? 'bg-white hover:bg-blue-50 border-white/20 focus:ring-white' : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent focus:ring-blue-500'}`} style={s ? { color: '#191970' } : undefined}>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="relative flex items-center gap-3 ml-2" ref={notifRef}>

                  {/* Bell */}
                  <button type="button" onClick={() => setIsNotifOpen((v) => !v)}
                    className={`relative p-2 rounded-lg transition-colors ${s ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`} aria-label="Notifications">
                    <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9" className={`h-6 w-6 ${s ? 'text-white' : 'text-gray-700'}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification panel */}
                  {isNotifOpen && (
                    <div className="absolute top-full right-24 mt-3 w-96 max-w-[90vw] bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-900">Notifications</span>
                        <button type="button" onClick={markAllRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Mark all read</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifLoading
                          ? <p className="px-4 py-6 text-sm text-gray-500">Loading...</p>
                          : notifications.length === 0
                            ? <p className="px-4 py-6 text-sm text-gray-500">No notifications yet.</p>
                            : notifications.map((n) => (
                              <button type="button" key={n._id} onClick={() => handleNotifClick(n)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${n.isRead ? 'bg-white' : 'bg-blue-50/60'}`}>
                                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                                <p className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                              </button>
                            ))}
                      </div>
                    </div>
                  )}

                  {/* Profile */}
                  <div className="relative flex items-center gap-3 cursor-pointer" onClick={() => setIsProfileOpen((v) => !v)}>
                    <Avatar url={profileImageUrl} initial={initial} />
                    <span className={`text-base font-bold ${s ? 'text-white' : 'text-gray-900'}`}>{name}</span>

                    {isProfileOpen && (
                      <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                          <Avatar url={profileImageUrl} initial={initial} />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-gray-900 truncate">{name}</span>
                            <span className="text-xs text-gray-500 truncate">{userData?.email}</span>
                          </div>
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold hover:bg-gray-50">Logout</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile burger */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(true)} className={`p-2 transition-colors ${s ? 'text-white' : 'text-gray-400'}`}>
              <Icon d="M4 6h16M4 12h16M4 18h16" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile fullscreen menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-60 flex flex-col">
          <div className="flex justify-between items-center h-16 px-4 border-b border-gray-50">
            <div className="flex items-center gap-1.5">
              <img src="/logo.png" alt="SkillLabz logo" className="h-16 w-16 object-contain shrink-0" />
              <span className="text-xl font-bold text-gray-900">SkillLabz</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400">
              <Icon d="M6 18L18 6M6 6l12 12" />
            </button>
          </div>

          {isLoggedIn && (
            <Link to="/profile" onClick={() => setIsOpen(false)} className="px-5 py-6 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <Avatar url={profileImageUrl} initial={initial} className="h-12 w-12 text-xl" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">{name}</span>
                <span className="text-sm text-gray-400 font-medium">{userData?.email}</span>
              </div>
            </Link>
          )}

          <div className="flex-1 px-5 pt-2 flex flex-col space-y-6">
            {navItems.map(({ name: n, href }) =>
              href.startsWith('/#')
                ? <a key={n} href={href} onClick={(e) => handleAnchorClick(e, href)} className="text-lg font-semibold text-gray-800">{n}</a>
                : <Link key={n} to={href} onClick={() => setIsOpen(false)} className="text-[17px] font-semibold text-gray-800">{n}</Link>
            )}
          </div>

          <div className="p-5 pb-10">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="w-full py-4 text-red-600 font-bold bg-[#fef2f2] rounded-xl active:bg-red-100 transition-colors">Logout</button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-gray-700 font-bold border border-gray-200 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 border border-transparent focus:ring-blue-500">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}