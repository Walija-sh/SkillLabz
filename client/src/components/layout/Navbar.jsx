import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice'; 
import Button from '../common/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  const registeredName = userData?.fullName || userData?.name || userData?.firstName || userData?.email?.split('@')[0] || "User";
  const userInitial = registeredName.charAt(0).toUpperCase();
  
  // Safely grab the profile image URL if it exists
  const profileImageUrl = userData?.profileImage?.url;

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
                <div className="relative flex items-center gap-3 ml-2 cursor-pointer" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                  
                  {/* Dynamic Avatar */}
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
                      {/* FIXED: Now links to /profile */}
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