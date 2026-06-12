import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  // If the path is anything other than the home page, render nothing!
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
    <footer className="border-t border-blue-600 bg-blue-600">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 justify-items-center gap-12 text-center md:grid-cols-3 md:justify-items-start md:text-left lg:gap-8">
          
          {/* Column 1: Brand & Tagline */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center justify-center gap-3 md:justify-start">
              <img src="/logo-2.png" alt="SkillLabz logo" className="h-24 w-24 object-contain" />
              <span className="text-2xl font-bold tracking-tight text-white">SkillLabz</span>
            </Link>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-200 md:pr-4">
              Pakistan's first peer-to-peer tool rental and skill-sharing marketplace.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-white">Platform</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a 
                  href="/#how-it-works" 
                  onClick={(e) => handleScroll(e, '/#how-it-works')}
                  className="text-base text-gray-200 hover:text-white transition-colors cursor-pointer"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a 
                  href="/#features" 
                  onClick={(e) => handleScroll(e, '/#features')}
                  className="text-base text-gray-200 hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="/#categories" 
                  onClick={(e) => handleScroll(e, '/#categories')}
                  className="text-base text-gray-200 hover:text-white transition-colors cursor-pointer"
                >
                  Categories
                </a>
              </li>
              <li>
                <a 
                  href="/#trust-and-safety" 
                  onClick={(e) => handleScroll(e, '/#trust-and-safety')}
                  className="text-base text-gray-200 hover:text-white transition-colors cursor-pointer"
                >
                  Trust & Safety
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/terms" className="text-base text-gray-200 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-base text-gray-200 hover:text-white transition-colors">Privacy Policy</Link></li>            </ul>
          </div>
          
        </div>

        {/* Bottom Section: Centered Copyright */}
        <div className="mt-12 border-t border-white/20 pt-8 flex justify-center items-center">
          <p className="text-base text-gray-300">
            &copy; {new Date().getFullYear()} SkillLabz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}