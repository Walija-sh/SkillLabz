import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  // 👇 ADDED THIS: If the path is anything other than the home page, render nothing!
  if (location.pathname !== '/') {
    return null;
  }

  // Function to handle smooth scrolling to homepage sections
  const handleScroll = (e, href) => {
    e.preventDefault();
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

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          
          {/* Column 1: Brand & Tagline */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform -rotate-45">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.53 9.53a.75.75 0 011.06 0l1.22 1.22a.75.75 0 001.06 0l1.22-1.22a.75.75 0 011.06 1.06l-1.22 1.22a.75.75 0 000 1.06l1.22 1.22a.75.75 0 01-1.06 1.06l-1.22-1.22a.75.75 0 00-1.06 0l-1.22 1.22a.75.75 0 01-1.06-1.06l1.22-1.22a.75.75 0 000-1.06l-1.22-1.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                  <path d="M14.394 6.942a4.982 4.982 0 00-4.085 1.488L5.75 13.006a2.25 2.25 0 103.182 3.182l4.576-4.56a4.982 4.982 0 001.488-4.084.75.75 0 00-1.218-.544 2.985 2.985 0 01-1.385.498.75.75 0 01-.63-.263 2.984 2.984 0 01.026-1.748.75.75 0 00-.395-.892z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">SkillLabz</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed pr-4">
              Pakistan's first peer-to-peer tool rental and skill-sharing marketplace.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="text-base font-bold text-gray-900">Platform</h3>
            <ul className="mt-4 space-y-3">
              <li>
                {/* Updated to act as a smooth scroll link */}
                <a 
                  href="/#how-it-works" 
                  onClick={(e) => handleScroll(e, '/#how-it-works')}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  How it Works
                </a>
              </li>
              <li><Link to="/trust-safety" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Trust & Safety</Link></li>
              <li><Link to="/pricing" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-base font-bold text-gray-900">Support</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/help" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact Us</Link></li>
              <li><Link to="/report-issue" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Report Issue</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-base font-bold text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cancellation-policy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Section: Centered Copyright */}
        <div className="mt-12 border-t border-gray-100 pt-8 flex justify-center items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SkillLabz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}