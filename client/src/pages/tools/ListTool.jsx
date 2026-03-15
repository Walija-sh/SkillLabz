import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../../components/common/Button';
import toolService from '../../services/tool.service';

export default function ListTool() {
  const navigate = useNavigate();
  const { userData: user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    pricePerDay: '',
    depositAmount: '',
    condition: '',
    offerSkillSession: false, 
    skillSessionPrice: '',       // ✅ NEW
    skillSessionDescription: '', // ✅ NEW
    images: null,
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
    success: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, offerSkillSession: !prev.offerSkillSession }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    
    if (selectedFiles && selectedFiles.length > 3) {
      setUiState((prev) => ({
        ...prev,
        error: "You can only upload a maximum of 3 images.",
      }));
      e.target.value = null; 
      setFormData((prev) => ({ ...prev, images: null })); 
      setImagePreviews([]); 
      return;
    }

    setUiState((prev) => ({ ...prev, error: null }));
    setFormData((prev) => ({ ...prev, images: selectedFiles }));

    if (selectedFiles) {
      const previews = Array.from(selectedFiles).map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setImagePreviews([]);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState({ isLoading: true, error: null, success: null });

    // Profile check
    if (!user?.profileCompleted || !user?.location?.coordinates) {
      setUiState({
        isLoading: false,
        error: "Profile incomplete! Please update your address and location in your profile before listing.",
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
      
      // ✅ ADDED: Skill Session Data
      submitData.append('offerSkillSession', String(formData.offerSkillSession));
      if (formData.offerSkillSession) {
        submitData.append('skillSessionPrice', Number(formData.skillSessionPrice) || 0);
        submitData.append('skillSessionDescription', formData.skillSessionDescription);
      }
      
      if (formData.images) {
        Array.from(formData.images).forEach((file) => {
          submitData.append('images', file);
        });
      }

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
                    <option value="laptop">Laptops & Computers</option>
                    <option value="tools">Hardware & Tools</option>
                    <option value="musical_instrument">Musical Instruments</option>
                    <option value="sports">Sports Equipment</option>
                    <option value="other">Other / Miscellaneous</option>
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
                    <option value="new">Brand New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase">Photos* (Max 3)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer relative min-h-[160px] flex items-center justify-center overflow-hidden">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  onChange={handleFileChange}
                  disabled={uiState.isLoading}
                  required
                />
                
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full z-10 pointer-events-none">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="aspect-video w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
                        <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center z-10 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-sm font-bold text-gray-700 mb-1">Upload images</span>
                    <span className="text-xs text-gray-400 font-medium">PNG, JPG up to 10MB.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skill Session Container */}
            <div className="space-y-4">
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

              {/* ✅ NEW: Conditional Inputs for Skill Session */}
              {formData.offerSkillSession && (
                <div className="bg-gray-50 border border-blue-100 rounded-2xl p-6 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <label className="block text-xs font-black text-blue-600 mb-1.5 uppercase tracking-wide">Skill Session Price (Rs)*</label>
                    <input
                      name="skillSessionPrice"
                      type="number"
                      placeholder="e.g., 2500"
                      className="w-full rounded-xl bg-white border border-blue-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                      value={formData.skillSessionPrice}
                      onChange={handleChange}
                      required={formData.offerSkillSession}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-blue-600 mb-1.5 uppercase tracking-wide">Session Description*</label>
                    <textarea
                      name="skillSessionDescription"
                      rows={3}
                      placeholder="e.g., I will teach you the basics of threading and safe operation..."
                      className="w-full rounded-xl bg-white border border-blue-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                      value={formData.skillSessionDescription}
                      onChange={handleChange}
                      required={formData.offerSkillSession}
                    />
                    <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">Maximum 500 characters</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                type="button" 
                variant="secondary" 
                size="lg"
                className="w-full sm:w-1/2 uppercase tracking-wide font-bold"
                onClick={() => navigate(-1)}
                disabled={uiState.isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                className="w-full sm:w-1/2 uppercase tracking-wide font-bold shadow-lg shadow-blue-200" 
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