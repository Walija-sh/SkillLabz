import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          
          {/* Brand & Tagline */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold tracking-tight text-gray-900">SkillLabz</span>
            <p className="mt-4 text-sm text-gray-500">
              Empowering communities through trusted peer-to-peer tool rentals and skill sharing.
            </p>
          </div>

          {/* Links Group 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/tools" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Browse Tools</Link></li>
              <li><Link to="/skills" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Learn Skills</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">How it Works</Link></li>
            </ul>
          </div>

          {/* Links Group 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase ">Trust & Safety</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/verification" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Identity Verification</Link></li>
              <li><Link to="/insurance" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Damage Protection</Link></li>
              <li><Link to="/guidelines" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>

          {/* Links Group 3 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/help" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SkillLabz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}