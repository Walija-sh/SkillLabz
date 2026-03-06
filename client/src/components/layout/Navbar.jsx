import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation links targeting section IDs
  const navigation = [
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
  ];

  // Function to handle smooth scrolling or routing
  const handleScroll = (e, href) => {
    e.preventDefault();
    setIsOpen(false); // Close mobile menu if open

    const targetId = href.replace('/#', '');

    if (location.pathname === '/') {
      // If already on the home page, smoothly scroll to the section
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on another page (like /tools), navigate to home page with the hash
      navigate(href);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Side: Logo Section */}
          <Link to="/" className="shrink-0 flex items-center gap-3">
            <div className="bg-blue-600 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transform -rotate-45">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.53 9.53a.75.75 0 011.06 0l1.22 1.22a.75.75 0 001.06 0l1.22-1.22a.75.75 0 011.06 1.06l-1.22 1.22a.75.75 0 000 1.06l1.22 1.22a.75.75 0 01-1.06 1.06l-1.22-1.22a.75.75 0 00-1.06 0l-1.22 1.22a.75.75 0 01-1.06-1.06l1.22-1.22a.75.75 0 000-1.06l-1.22-1.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                <path d="M14.394 6.942a4.982 4.982 0 00-4.085 1.488L5.75 13.006a2.25 2.25 0 103.182 3.182l4.576-4.56a4.982 4.982 0 001.488-4.084.75.75 0 00-1.218-.544 2.985 2.985 0 01-1.385.498.75.75 0 01-.63-.263 2.984 2.984 0 01.026-1.748.75.75 0 00-.395-.892z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">SkillLabz</span>
          </Link>

          {/* Right Side: Links + Auth Buttons Grouped */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* Desktop Menu Links */}
            <div className="flex space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleScroll(e, item.href)}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="flex items-center space-x-5 pl-4">
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link to="/register">
                <Button className="px-6 rounded-lg font-bold">Sign Up</Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="block pl-4 pr-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="pt-4 pb-6 border-t border-gray-100 px-4 flex flex-col space-y-3">
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)} 
              className="w-full text-center py-2.5 text-gray-700 font-bold border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Login
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full py-2.5 rounded-lg">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}