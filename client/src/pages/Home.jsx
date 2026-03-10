import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../components/common/Button';

export default function Home() {
  const navigate = useNavigate();
  
  // Grab the login status from Redux global state
  const isLoggedIn = useSelector((state) => state.auth.status);

  // Data for the "How It Works" Section
  const steps = [
    { id: 1, title: 'Browse Tools', desc: 'Find the perfect tool for your project' },
    { id: 2, title: 'Request Rental', desc: 'Send a rental request to the owner' },
    { id: 3, title: 'Get Approved', desc: 'Owner reviews and approves your request' },
    { id: 4, title: 'Pick Up & Return', desc: 'Use OTP for secure pickup and return' },
  ];

  // Data for the "Why Choose" Section
  const features = [
    { icon: '🔧', title: 'Rent Tools Locally', desc: 'Access quality tools when you need them without the cost of ownership' },
    { icon: '💰', title: 'Earn from Your Tools', desc: 'Make money from tools sitting idle in your garage' },
    { icon: '🎓', title: 'Learn New Skills', desc: 'Get expert guidance with optional skill-sharing sessions' },
    { icon: '🔐', title: 'Safe & Secure', desc: 'OTP verification, digital contracts, and trust scores ensure safe rentals' },
  ];

  // Data for "Popular Categories"
  const categories = [
    { icon: '🔧', name: 'Power Tools' },
    { icon: '🌱', name: 'Garden Tools' },
    { icon: '📷', name: 'Photography' },
    { icon: '🎸', name: 'Music' },
    { icon: '⚽', name: 'Sports' },
    { icon: '⛺', name: 'Camping' },
  ];

  // Dynamic handler for the "List Your Tool" button
  const handleListToolClick = () => {
    if (isLoggedIn) {
      navigate('/list-tool'); // Redirects to listing page if logged in
    } else {
      navigate('/login'); // Redirects to login if not logged in
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* --- HERO SECTION --- */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Rent Tools. Share Skills. <br />
            <span className="text-blue-600">Build Community.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Join Pakistan's first peer-to-peer tool rental and skill-sharing marketplace. 
            Save money, earn income, and connect with your local community.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md mx-auto">
            <Button className="px-8 py-3 text-lg w-full sm:w-auto" onClick={() => navigate('/browse-tools')}>
              Explore Tools
            </Button>
            
            {/* Dynamic Button */}
            <Button variant="secondary" className="px-8 py-3 text-lg w-full sm:w-auto" onClick={handleListToolClick}>
              List Your Tool
            </Button>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-md">
                {step.id}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHY CHOOSE US (FEATURES) SECTION --- */}
      <section id="features" className="py-20 bg-white px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose SkillLabz?</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-xl mb-3">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- POPULAR CATEGORIES SECTION --- */}
      <section className="py-16 bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">Popular Categories</h2>
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl w-32 h-32 hover:border-blue-500 cursor-pointer transition-colors shadow-sm">
              <span className="text-2xl mb-2">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700 text-center">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- TRUST & SAFETY SECTION --- */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-blue-50 rounded-3xl p-12 text-center border border-blue-100">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Trust & Safety First</h2>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto">
            Every rental is protected with OTP verification, digital contracts, user reviews, and trust scores. Your security is our priority.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center">
              <span className="text-2xl mb-2">🔐</span>
              <span className="font-bold text-sm text-gray-800">OTP Verification</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center">
              <span className="text-2xl mb-2">📄</span>
              <span className="font-bold text-sm text-gray-800">Digital Contracts</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center">
              <span className="text-2xl mb-2">⭐</span>
              <span className="font-bold text-sm text-gray-800">Trust Scores</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA BANNER --- */}
      {/* Hide this section if the user is already logged in */}
      {!isLoggedIn && (
        <section className="bg-blue-600 py-16 px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of users already renting and sharing tools in your community</p>
          <Button 
            variant="secondary" 
            className="bg-white text-blue-600 hover:bg-gray-100 border-none px-10 py-4 text-lg font-bold"
            onClick={() => navigate('/register')}
          >
            Create Free Account
          </Button>
        </section>
      )}
    </div>
  );
}