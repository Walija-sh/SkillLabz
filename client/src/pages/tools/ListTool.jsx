import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import toolService from '../../services/tool.service';

export default function ListTool() {
  const navigate = useNavigate();

  // State mapped exactly to your Postman/API payload
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    pricePerDay: '',
    depositAmount: '',
    condition: '',
    city: '',
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
      images: e.target.files, // Stores the FileList object
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState({ isLoading: true, error: null, success: null });

    try {
      // Because we are uploading files, we MUST use FormData instead of standard JSON
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('pricePerDay', Number(formData.pricePerDay));
      submitData.append('depositAmount', Number(formData.depositAmount));
      submitData.append('condition', formData.condition);
      submitData.append('city', formData.city);
      submitData.append('addressText', formData.addressText);
      
      // Hardcoded Lat/Lng for now as per your payload screenshot
      submitData.append('lat', '31.5204');
      submitData.append('lng', '74.3587');

      // Append all selected images to the formdata
      if (formData.images) {
        Array.from(formData.images).forEach((file) => {
          submitData.append('images', file);
        });
      }

      console.log("Submitting Tool Data to Backend...");

      // The actual API call to your Node.js backend
      await toolService.createTool(submitData);

      setUiState({
        isLoading: false,
        error: null,
        success: "Tool listed successfully! Redirecting to dashboard...",
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

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
        
        {/* Page Title (Outside the card to match Figma) */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">List Your Tool</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details to start earning
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-200">
          
          {/* Feedback Messages */}
          {uiState.error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100" role="alert">
              {uiState.error}
            </div>
          )}
          {uiState.success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100" role="alert">
              {uiState.success}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* Tool Information Section */}
            <div>
              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900">Tool Information</h3>
                <p className="text-sm text-gray-500">Provide accurate details to attract renters</p>
              </div>
              
              <div className="space-y-5">
                
                {/* Tool Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tool Name*</label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g., DeWalt Cordless Drill"
                    className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category*</label>
                  <select
                    name="category"
                    className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    <option value="power_tools">Power Tools</option>
                    <option value="garden_tools">Garden Tools</option>
                    <option value="camera">Photography & Camera</option>
                    <option value="music">Music Instruments</option>
                    <option value="sports">Sports Equipment</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description*</label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Describe your tool, its condition, and what's included..."
                    className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                  />
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Price per Day (Rs.)*</label>
                    <input
                      name="pricePerDay"
                      type="number"
                      placeholder="500"
                      className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      disabled={uiState.isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Security Deposit (Rs.)*</label>
                    <input
                      name="depositAmount"
                      type="number"
                      placeholder="3000"
                      className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={formData.depositAmount}
                      onChange={handleChange}
                      disabled={uiState.isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Condition*</label>
                  <select
                    name="condition"
                    className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
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

                {/* Location Grid (Split into two inputs to satisfy the backend cleanly) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Location Address*</label>
                    <input
                      name="addressText"
                      type="text"
                      placeholder="e.g., Gulberg"
                      className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={formData.addressText}
                      onChange={handleChange}
                      disabled={uiState.isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">City*</label>
                    <input
                      name="city"
                      type="text"
                      placeholder="e.g., Lahore"
                      className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={uiState.isLoading}
                      required
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Upload Photos Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Upload Photos*</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={uiState.isLoading}
                  required
                />
                <div className="flex flex-col items-center justify-center text-gray-500">
                  {/* Figma Upload Icon Match */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600 mb-1">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
                  
                  {formData.images && formData.images.length > 0 && (
                    <span className="mt-3 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                      {formData.images.length} file(s) selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Skill Session Toggle (Blue theme applied) */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Offer Skill Session</h4>
                <p className="text-xs text-gray-500 mt-0.5">Teach renters how to use this tool</p>
              </div>
              
              <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.offerSkillSession ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.offerSkillSession ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full sm:w-1/2 py-3 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                onClick={() => navigate(-1)}
                disabled={uiState.isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-1/2 py-3 shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700 text-white" 
                isLoading={uiState.isLoading}
              >
                List Tool
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}