import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ Hook to get user data from Redux
import Button from '../../components/common/Button';
import toolService from '../../services/tool.service';

export default function ListTool() {
  const navigate = useNavigate();
  
  // ✅ 1. Get the logged-in user's profile data (coordinates/city) from Redux
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    pricePerDay: '',
    depositAmount: '',
    condition: '',
    city: user?.location?.city || '', // ✅ Pre-fill from profile
    addressText: '',
    offerSkillSession: false, 
    images: null,
  });

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
    success: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      offerSkillSession: !prev.offerSkillSession,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: e.target.files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState({ isLoading: true, error: null, success: null });

    // ✅ 2. Validation: Ensure user has a location in their profile
    if (!user?.location?.coordinates) {
      setUiState({
        isLoading: false,
        error: "Profile incomplete! Please set your location in your profile before listing.",
        success: null,
      });
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('pricePerDay', Number(formData.pricePerDay));
      submitData.append('depositAmount', Number(formData.depositAmount));
      submitData.append('condition', formData.condition);
      submitData.append('city', formData.city);
      submitData.append('addressText', formData.addressText);
      
      // ✅ 3. DYNAMIC LOCATION: Use the coordinates from the owner's profile
      // MongoDB stores coordinates as [Longitude, Latitude]
      const [lng, lat] = user.location.coordinates;
      submitData.append('lat', lat); 
      submitData.append('lng', lng);

      if (formData.images) {
        Array.from(formData.images).forEach((file) => {
          submitData.append('images', file);
        });
      }

      // API Call
      await toolService.createTool(submitData);

      setUiState({
        isLoading: false,
        error: null,
        success: "Tool listed successfully! Redirecting to dashboard...",
      });

      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      setUiState({
        isLoading: false,
        error: err?.message || "Failed to list tool. Please try again.",
        success: null,
      });
    }
  };

  return (
    <div className="flex min-h-screen justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-3xl">
        
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">List Your Tool</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Fill in the details to start earning from your equipment
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-200">
          
          {uiState.error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 font-bold" role="alert">
              {uiState.error}
            </div>
          )}
          {uiState.success && (
            <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-100 font-bold" role="alert">
              {uiState.success}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            
            <div>
              <div className="mb-5">
                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">Tool Information</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">Tool Name*</label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g., Sony A7 III"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">Category*</label>
                  <select
                    name="category"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    <option value="camera">Photography & Camera</option>
                    <option value="power-tools">Power Tools</option>
                    <option value="electronics">Electronics</option>
                    <option value="camping">Camping Gear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">Description*</label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Describe your tool and its features..."
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">Price/Day (Rs)*</label>
                    <input
                      name="pricePerDay"
                      type="number"
                      placeholder="2500"
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      disabled={uiState.isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">Security Deposit (Rs)*</label>
                    <input
                      name="depositAmount"
                      type="number"
                      placeholder="10000"
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      value={formData.depositAmount}
                      onChange={handleChange}
                      disabled={uiState.isLoading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">Condition*</label>
                  <select
                    name="condition"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    value={formData.condition}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                  >
                    <option value="" disabled>Select condition</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">Address*</label>
                    <input
                      name="addressText"
                      type="text"
                      placeholder="e.g., Gulberg III"
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      value={formData.addressText}
                      onChange={handleChange}
                      disabled={uiState.isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase">City*</label>
                    <input
                      name="city"
                      type="text"
                      className="w-full rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed"
                      value={formData.city}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase">Photos*</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={uiState.isLoading}
                  required
                />
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-bold text-gray-700 mb-1">Upload images</span>
                  <span className="text-xs text-gray-400 font-medium">PNG, JPG up to 10MB</span>
                  {formData.images && <span className="mt-3 text-xs font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">{formData.images.length} Files selected</span>}
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-blue-200">
              <div>
                <h4 className="font-black text-white text-sm uppercase">Offer Skill Session</h4>
                <p className="text-xs text-blue-100 mt-0.5">Teach the renter how to use this tool</p>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all ${
                  formData.offerSkillSession ? 'bg-white' : 'bg-blue-700'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full shadow transition duration-200 ${
                    formData.offerSkillSession ? 'translate-x-5 bg-blue-600' : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                type="button" 
                className="w-full sm:w-1/2 py-4 bg-white text-gray-700 border border-gray-200 font-black uppercase tracking-tight"
                onClick={() => navigate(-1)}
                disabled={uiState.isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-1/2 py-4 bg-blue-600 text-white font-black uppercase tracking-tight shadow-xl shadow-blue-200" 
                isLoading={uiState.isLoading}
              >
                List My Tool
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}