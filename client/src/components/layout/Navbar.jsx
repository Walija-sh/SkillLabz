import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice'; 
import Button from '../common/Button';
import notificationService from '../../services/notification.service';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const notificationMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  const registeredName = userData?.fullName || userData?.name || userData?.firstName || userData?.email?.split('@')[0] || "User";
  const userInitial = registeredName.charAt(0).toUpperCase();
  
  // Safely grab the profile image URL if it exists
  const profileImageUrl = userData?.profileImage?.url;

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setIsNotifLoading(true);
      const response = await notificationService.getMyNotifications();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsNotifLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
  }, [isLoggedIn, fetchNotifications]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const publicNavigation = [
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
  ];

  const privateNavigation = [
    { name: 'Browse Tools', href: '/browse-tools' },
    { name: 'List Your Tool', href: '/list-tool' },
    { name: 'My Rentals', href: '/my-rentals' },
    { name: 'Owner Dashboard', href: '/dashboard' },
  ];

  const handleScroll = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const targetId = href.replace('/#', '');

    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    dispatch(logout());
    navigate('/login');
    setIsOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;

    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }

    setIsNotificationOpen(false);
    navigate(notification.actionLink || "/my-rentals");
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" className="shrink-0 flex items-center gap-3">
            <div className="bg-blue-600 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transform -rotate-45">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.53 9.53a.75.75 0 011.06 0l1.22 1.22a.75.75 0 001.06 0l1.22-1.22a.75.75 0 011.06 1.06l-1.22 1.22a.75.75 0 000 1.06l1.22 1.22a.75.75 0 01-1.06 1.06l-1.22-1.22a.75.75 0 00-1.06 0l-1.22 1.22a.75.75 0 01-1.06-1.06l1.22-1.22a.75.75 0 000-1.06l-1.22-1.22a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">SkillLabz</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {!isLoggedIn ? (
                publicNavigation.map((item) => (
                  <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                    {item.name}
                  </a>
                ))
              ) : (
                privateNavigation.map((item) => (
                  <Link key={item.name} to={item.href} className="text-[15px] font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                    {item.name}
                  </Link>
                ))
              )}
            </div>

            <div className="flex items-center pl-4">
              {!isLoggedIn ? (
                <div className="flex items-center space-x-5 border-l border-gray-200 pl-8">
                  <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
                  <Link to="/register"><Button className="px-6 rounded-lg font-bold">Sign Up</Button></Link>
                </div>
              ) : (
                <div className="relative flex items-center gap-3 ml-2" ref={notificationMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute top-full right-24 mt-3 w-96 max-w-[90vw] bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-900">Notifications</span>
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {isNotifLoading ? (
                          <p className="px-4 py-6 text-sm text-gray-500">Loading...</p>
                        ) : notifications.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-gray-500">No notifications yet.</p>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              type="button"
                              key={notification._id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                notification.isRead ? "bg-white" : "bg-blue-50/60"
                              }`}
                            >
                              <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-[11px] text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative flex items-center gap-3 cursor-pointer" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border border-gray-100">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>

                    <span className="text-base font-bold text-gray-900">{registeredName}</span>

                    {isProfileMenuOpen && (
                      <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            {profileImageUrl ? (
                              <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              userInitial
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-gray-900 truncate">{registeredName}</span>
                            <span className="text-xs text-gray-500 truncate">{userData?.email}</span>
                          </div>
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold hover:bg-gray-50">
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(true)} className="p-2 text-gray-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-60 flex flex-col">
          <div className="flex justify-between items-center h-20 px-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
               <div className="bg-blue-600 h-10 w-10 rounded-xl flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transform -rotate-45">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.53 9.53a.75.75 0 011.06 0l1.22 1.22a.75.75 0 001.06 0l1.22-1.22a.75.75 0 011.06 1.06l-1.22 1.22a.75.75 0 000 1.06l1.22 1.22a.75.75 0 01-1.06 1.06l-1.22-1.22a.75.75 0 00-1.06 0l-1.22 1.22a.75.75 0 01-1.06-1.06l1.22-1.22a.75.75 0 000-1.06l-1.22-1.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">SkillLabz</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Profile Section */}
          {isLoggedIn && (
            <Link 
              to="/profile" // FIXED: Now links to /profile
              onClick={() => setIsOpen(false)}
              className="px-5 py-6 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="shrink-0 h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden border border-gray-100">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">{registeredName}</span>
                <span className="text-sm text-gray-400 font-medium">{userData?.email}</span>
              </div>
            </Link>
          )}

          {/* Links List */}
          <div className="flex-1 px-5 pt-2 flex flex-col space-y-6">
            {!isLoggedIn ? (
              publicNavigation.map((item) => (
                <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className="text-lg font-semibold text-gray-800">
                  {item.name}
                </a>
              ))
            ) : (
              privateNavigation.map((item) => (
                <Link key={item.name} to={item.href} onClick={() => setIsOpen(false)} className="text-[17px] font-semibold text-gray-800">
                  {item.name}
                </Link>
              ))
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-5 pb-10">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout} 
                className="w-full py-4 text-red-600 font-bold bg-[#fef2f2] rounded-xl active:bg-red-100 transition-colors"
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-gray-700 font-bold border border-gray-200 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)}><Button className="w-full py-3 rounded-lg">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}