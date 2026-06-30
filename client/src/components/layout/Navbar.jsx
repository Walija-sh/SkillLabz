import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import Button from '../common/Button';
import notificationService from '../../services/notification.service';

// ─── Constants ────────────────────────────────────────────────────────────────
const PUBLIC_NAV = [
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'Features', href: '/#features' },
  { name: 'Categories', href: '/#categories' },
  { name: 'Trust & Safety', href: '/#trust-and-safety' },
];

const PRIVATE_NAV = [
  { name: 'Home', href: '/' },
  { name: 'Browse Tools', href: '/browse-tools' },
  { name: 'List Your Tool', href: '/list-tool' },
  { name: 'My Rentals', href: '/my-rentals' },
  { name: 'Owner Dashboard', href: '/dashboard' },
];

// ─── Tiny shared components ───────────────────────────────────────────────────
const Icon = ({ d, className = 'h-6 w-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const Avatar = ({
  url,
  initial,
  className = 'h-10 w-10 text-lg',
  bg = 'bg-blue-600',
  ring = 'border border-gray-100',
}) => (
  <div
    className={`${className} ${bg} ${ring} rounded-full flex items-center justify-center text-white font-bold overflow-hidden shrink-0`}
  >
    {url ? (
      <img src={url} alt="Profile" className="w-full h-full object-cover" />
    ) : (
      initial
    )}
  </div>
);

const notifPanelVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const notifItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, delay: index * 0.04, ease: 'easeOut' },
  }),
};

const mobileMenuVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'tween', ease: 'easeOut', duration: 0.28 },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { type: 'tween', ease: 'easeIn', duration: 0.22 },
  },
};

// ─── CHANGED: removed the backdrop-blur-sm from variants; the blur now lives
//     purely in the className so there's no framer-filter conflict that can
//     produce the "mirror/glossy" artefact on some browsers.
const mobileMenuBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

const mobileMenuItemVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.08 + index * 0.04, duration: 0.22, ease: 'easeOut' },
  }),
  exit: { opacity: 0, x: 10, transition: { duration: 0.12, ease: 'easeIn' } },
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);


  // const notifRef = useRef(null);
  const notifDesktopRef = useRef(null);
const notifMobileRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  

  const isLoggedIn = useSelector((s) => s.auth.status);
  const userData = useSelector((s) => s.auth.userData);
  const name =
    userData?.fullName ||
    userData?.name ||
    userData?.firstName ||
    userData?.email?.split('@')[0] ||
    'User';
  const initial = name.charAt(0).toUpperCase();
  const profileImageUrl = userData?.profileImage?.url;

  // Scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click-outside notifications and profile dropdown
  useEffect(() => {
    const handler = (e) => {
  if (notifDesktopRef.current && !notifDesktopRef.current.contains(e.target))
    setIsNotifOpen(false);
  if (notifMobileRef.current && !notifMobileRef.current.contains(e.target))
    setIsNotifOpen(false);
  if (profileRef.current && !profileRef.current.contains(e.target))
    setIsProfileOpen(false);
};
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
    } catch (e) {
      console.error(e);
    } finally {
      setNotifLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [isLoggedIn, fetchNotifications]);

  // Handlers
  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const id = href.replace('/#', '');
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `/#${id}`);
      return;
    }
    navigate('/');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `/#${id}`);
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/');
    setIsOpen(false);
    setIsProfileOpen(false);
  };

const handleNotifClick = (notif) => {
  setIsNotifOpen(false);
  if (!notif.isRead) {
    notificationService.markAsRead(notif._id).catch((e) => console.error(e));
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notif._id ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }
};

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const s = isScrolled;
  const navItems = isLoggedIn ? PRIVATE_NAV : PUBLIC_NAV;

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        s
          ? 'bg-blue-600 border-b border-blue-600 shadow-lg shadow-blue-600/20 text-white'
          : 'bg-transparent border-b border-transparent shadow-none text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Three-column flex layout to perfectly center the navigation links */}
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Left Column: Logo */}
          <div className="flex-1 flex justify-start">
            <Link
              to="/"
              className="shrink-0 flex items-center gap-1.5 md:gap-1.5"
            >
              <img
                src={s ? '/logo-2.png' : '/logo.png'}
                alt="SkillLabz logo"
                className="h-9 w-9 object-contain shrink-0 md:h-10 md:w-10"
              />
              <span
                className={`text-2xl font-bold tracking-tight md:text-2xl ${
                  s ? 'text-white' : 'text-gray-900'
                }`}
              >
                SkillLabz
              </span>
            </Link>
          </div>

          {/* Center Column: Desktop Navigation Links */}
          <div className="hidden md:flex flex-none justify-center items-center gap-x-8">
            {navItems.map(({ name: n, href }) =>
              href.startsWith('/#') ? (
                <a
                  key={n}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm md:text-[15px] font-semibold transition-colors cursor-pointer bg-transparent px-2 py-1 rounded-md ${
                    s
                      ? 'text-white/90 hover:text-white'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {n}
                </a>
              ) : (
                <Link
                  key={n}
                  to={href}
                  className={`text-sm md:text-[15px] font-semibold transition-colors ${
                    s
                      ? 'text-white/90 hover:text-white'
                      : 'text-gray-800 hover:text-blue-600'
                  }`}
                >
                  {n}
                </Link>
              )
            )}
          </div>

          {/* Right Column: Auth / User Profile */}
          <div className="flex-1 flex justify-end items-center">
            {/* Desktop Auth/Profile */}
            <div className="hidden md:flex items-center pl-4">
              {!isLoggedIn ? (
                <div className="flex items-center space-x-5 pl-8">
                  <Link
                    to="/login"
                    className={`text-base font-bold transition-colors ${
                      s
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Login
                  </Link>
                  <Link to="/register">
                    <Button
                      className={`px-6 rounded-lg font-bold border text-base transition-colors ${
                        s
                          ? 'bg-white hover:bg-gray-200 border-white/20 focus:ring-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent focus:ring-blue-500'
                      }`}
                      style={s ? { color: '#191970' } : undefined}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="relative flex items-center gap-4 ml-2">
                  {/* Desktop Bell Notification */}
                  <div ref={notifDesktopRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen((v) => !v)}
                      className={`relative p-2 rounded-lg transition-colors ${
                        s ? 'hover:bg-white/10' : 'hover:bg-gray-300'
                      }`}
                      aria-label="Notifications"
                    >
                      <Icon
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                        className={`h-6 w-6 ${s ? 'text-white' : 'text-gray-700'}`}
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Desktop Notification panel */}
                    <AnimatePresence>
                      {isNotifOpen && (
                        <motion.div
                          variants={notifPanelVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          className="absolute top-full right-0 mt-3 w-104 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-[0_22px_60px_rgba(25,25,112,0.18)] backdrop-blur-md z-50"
                        >
                          <div className="relative overflow-hidden border-b border-blue-50 bg-linear-to-r from-blue-50 via-white to-blue-50 px-4 py-4">
                            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-600/10 blur-2xl" />
                            <div className="absolute -left-8 -bottom-10 h-20 w-20 rounded-full bg-blue-600/10 blur-2xl" />
                            <div className="relative flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                                  Activity
                                </p>
                                <span className="mt-1 block text-lg font-extrabold text-slate-900">
                                  Notifications
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={markAllRead}
                                className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 relative z-60 cursor-pointer"
                              >
                                Mark all read
                              </button>
                            </div>
                          </div>

                          <div className="max-h-96 overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] relative z-100">
                            {notifLoading ? (
                              <div className="px-5 py-8 text-center">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                                <p className="mt-3 text-sm font-medium text-slate-500">
                                  Loading notifications...
                                </p>
                              </div>
                            ) : notifications.length === 0 ? (
                              <div className="px-5 py-8 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                  <Icon
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                                    className="h-5 w-5"
                                  />
                                </div>
                                <p className="text-sm font-medium text-slate-500">
                                  No notifications yet.
                                </p>
                              </div>
                            ) : (
notifications.map((n, index) => {
  const destination = n.actionLink?.trim() || '/my-rentals';
  return (
    <motion.div
      key={n._id}
      custom={index}
      variants={notifItemVariants}
      initial="hidden"
      animate="show"
      whileHover={{
        scale: 1.01,
        backgroundColor: n.isRead ? '#f8fafc' : '#eff6ff',
      }}
      whileTap={{ scale: 0.995 }}
      className={`group border-b border-slate-100 overflow-hidden ${
        n.isRead ? 'bg-white' : 'bg-blue-50/60'
      }`}
    >
      <Link
        to={destination}
        onClick={() => handleNotifClick(n)}
        className="block w-full px-5 py-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-1 h-2.5 w-2.5 rounded-full ${
              n.isRead
                ? 'bg-slate-300'
                : 'bg-blue-600 shadow-[0_0_0_6px_rgba(25,25,112,0.08)]'
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p
                className={`min-w-0 wrap-break-word text-sm font-bold leading-snug ${
                  n.isRead ? 'text-slate-900' : 'text-blue-950'
                }`}
              >
                {n.title}
              </p>
              <span className="shrink-0 rounded-full bg-blue-600/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Open
              </span>
            </div>
            <p className="mt-1 wrap-break-word text-xs leading-relaxed text-slate-600">
              {n.message}
            </p>
            <p className="mt-2 wrap-break-word text-[11px] font-medium text-slate-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
})
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen((v) => !v)}
                      className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                    >
                      <Avatar
                        url={profileImageUrl}
                        initial={initial}
                        className="h-14 w-14 text-xl"
                      />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.18 }}
                          className="absolute top-full right-0 mt-3 w-72 max-w-[92vw] overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-[0_22px_60px_rgba(25,25,112,0.16)] backdrop-blur-md z-50"
                        >
                          <div className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-blue-50 px-4 py-4 border-b border-blue-50">
                            <div className="absolute -right-8 -top-10 h-20 w-20 rounded-full bg-blue-600/10 blur-2xl" />
                            <div className="absolute -left-10 -bottom-8 h-24 w-24 rounded-full bg-blue-600/10 blur-2xl" />
                            <div className="relative flex items-center gap-3">
                              <div className="ring-4 ring-white shadow-lg rounded-full">
                                <Avatar
                                  url={profileImageUrl}
                                  initial={initial}
                                  className="h-14 w-14 text-xl"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-base font-bold text-slate-900">
                                  {name}
                                </div>
                                <div className="truncate text-xs font-medium text-slate-500">
                                  {userData?.email}
                                </div>
                                <div className="mt-2 inline-flex items-center rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                                  Account
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link
                              to="/profile"
                              onClick={() => setIsProfileOpen(false)}
                              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </span>
                              <span>Profile Settings</span>
                            </Link>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                handleLogout();
                              }}
                              className="group mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M16 17l5-5-5-5" />
                                  <path d="M21 12H9" />
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                </svg>
                              </span>
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Actions: Notification Bell + Burger Menu */}
            <div className="flex items-center gap-2 md:hidden ml-4">
              {/* Mobile Notification Bell */}
              {isLoggedIn && (
                <div ref={notifMobileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen((v) => !v)}
                    className={`relative p-2 rounded-lg transition-colors ${
                      s ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                    aria-label="Notifications"
                  >
                    <Icon
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                      className={`h-6 w-6 ${s ? 'text-white' : 'text-gray-700'}`}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Mobile Notification Panel */}
                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        variants={notifPanelVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="absolute top-full -right-12 mt-3 w-[94vw] max-w-[360px] overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-[0_22px_60px_rgba(25,25,112,0.18)] backdrop-blur-md z-50"
                      >
                        <div className="relative overflow-hidden border-b border-blue-50 bg-linear-to-r from-blue-50 via-white to-blue-50 px-4 py-4">
                          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-600/10 blur-2xl" />
                          <div className="absolute -left-8 -bottom-10 h-20 w-20 rounded-full bg-blue-600/10 blur-2xl" />
                          <div className="relative flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                                Activity
                              </p>
                              <span className="mt-1 block text-lg font-extrabold text-slate-900">
                                Notifications
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={markAllRead}
                              className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 relative z-60 cursor-pointer"
                            >
                              Mark all read
                            </button>
                          </div>
                        </div>

                        <div className="max-h-80 relative z-100 overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))]">
                          {notifLoading ? (
                            <div className="px-5 py-8 text-center">
                              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                              <p className="mt-3 text-sm font-medium text-slate-500">
                                Loading...
                              </p>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Icon
                                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                                  className="h-5 w-5"
                                />
                              </div>
                              <p className="text-sm font-medium text-slate-500">
                                No notifications yet.
                              </p>
                            </div>
                          ) : (
notifications.map((n, index) => {
  const destination = n.actionLink?.trim() || '/my-rentals';
  return (
    <motion.div
      key={n._id}
      custom={index}
      variants={notifItemVariants}
      initial="hidden"
      animate="show"
      whileHover={{
        scale: 1.01,
        backgroundColor: n.isRead ? '#ffffff' : '#eff6ff',
      }}
      whileTap={{ scale: 0.995 }}
      className={`border-b border-slate-100 overflow-hidden ${
        n.isRead ? 'bg-white' : 'bg-blue-50/60'
      }`}
    >
      <Link
        to={destination}
        onClick={() => handleNotifClick(n)}
        className="block w-full px-5 py-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-1 h-2.5 w-2.5 rounded-full ${
              n.isRead
                ? 'bg-slate-300'
                : 'bg-blue-600 shadow-[0_0_0_6px_rgba(25,25,112,0.08)]'
            }`}
          />
          <div className="min-w-0 flex-1">
            <p
              className={`min-w-0 wrap-break-word text-sm font-bold leading-snug ${
                n.isRead ? 'text-slate-900' : 'text-blue-950'
              }`}
            >
              {n.title}
            </p>
            <p className="mt-1 wrap-break-word text-xs leading-relaxed text-slate-600">
              {n.message}
            </p>
            <p className="mt-2 wrap-break-word text-[11px] font-medium text-slate-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
})
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Burger Button */}
              <button
                onClick={() => setIsOpen(true)}
                className={`p-2 transition-colors ${
                  s ? 'text-white' : 'text-gray-800'
                }`}
              >
                <Icon d="M4 6h16M4 12h16M4 18h16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile fullscreen menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/*
             * BACKDROP
             * --------
             * KEY FIX: The glossy / mirror artefact was caused by Framer Motion
             * animating `opacity` on an element that also had `backdrop-filter`
             * applied via Tailwind's `backdrop-blur-sm`.  When a composited
             * backdrop-filter layer is opacity-animated from 0 → 1 inside a
             * stacking context, some browsers (especially WebKit / Safari) promote
             * it to its own GPU layer before the blur is fully resolved, which
             * produces the mirror/sheen flash.
             *
             * Solution: keep the dark scrim on this element but do NOT apply
             * backdrop-blur here.  Instead the blur lives only on the sidebar
             * panel's *header*, which is never opacity-animated.  The result is
             * a clean, dark semi-transparent overlay with zero glossy artefact.
             *
             * Classes used:
             *   fixed inset-0   – covers the full viewport
             *   z-40            – sits behind the sidebar (z-50) but above page
             *   bg-slate-900/40 – 40 % opaque dark scrim (enough to dim content)
             *   transition-all  – smooth property transitions
             *
             * backdrop-blur-sm has been intentionally removed from this element.
             */}
            <motion.button
              key="mobile-menu-backdrop"
              type="button"
              aria-label="Close menu"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuBackdropVariants}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 transition-all"
            />

            {/*
             * SIDEBAR PANEL
             * -------------
             * Solid white background (bg-white) guarantees the panel is fully
             * opaque — no semi-transparency here that could interact with the
             * backdrop and create a mirror/glass illusion.
             * z-50 keeps it above the backdrop at all times.
             */}
            <motion.div
              key="mobile-menu"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
              className="fixed right-0 top-0 z-50 flex h-full w-[82vw] max-w-sm flex-col overflow-hidden bg-white shadow-[0_8px_32px_rgba(25,25,112,0.18)]"
            >
              {/* Header strip — solid blue, no transparency */}
              <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img
                    src="/logo-2.png"
                    alt="SkillLabz logo"
                    className="h-9 w-9 object-contain shrink-0 md:h-10 md:w-10"
                  />
                  <span className="text-xl font-bold tracking-tight text-white">
                    SkillLabz
                  </span>
                </Link>

                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center text-white transition hover:text-white/80"
                >
                  <Icon d="M6 18L18 6M6 6l12 12" />
                </button>
              </div>

              {/* Nav links */}
              <div className="relative flex-1 px-5 pt-8">
                <div className="relative flex flex-col gap-5">
                  {navItems.map(({ name: n, href }, index) =>
                    href.startsWith('/#') ? (
                      <motion.a
                        key={n}
                        href={href}
                        custom={index}
                        variants={mobileMenuItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setIsOpen(false)}
                        className="block text-left text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        {n}
                      </motion.a>
                    ) : (
                      <motion.div
                        key={n}
                        custom={index}
                        variants={mobileMenuItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <Link
                          to={href}
                          onClick={() => setIsOpen(false)}
                          className="block text-left text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700"
                        >
                          {n}
                        </Link>
                      </motion.div>
                    )
                  )}

                  {isLoggedIn && (
                    <motion.div
                      custom={navItems.length}
                      variants={mobileMenuItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="block text-left text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Profile Settings
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer: logout / auth links */}
              <div className="bg-white px-5 py-6 border-t border-slate-100">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full border border-red-500 bg-red-600 px-4 py-3 text-lg font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 17l5-5-5-5" />
                      <path d="M15 12H3" />
                      <path d="M21 4v16" />
                    </svg>
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-left text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block text-left text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}