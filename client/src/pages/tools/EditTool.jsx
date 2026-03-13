import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toolService from '../../services/tool.service';
import Button from '../../components/common/Button'; // ✅ Imported your reusable Button

export default function EditTool() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    description: '',
    pricePerDay: '',
    depositAmount: '',
    city: ''
  });

  // --- IMAGE MANAGEMENT STATE ---
  const [existingImages, setExistingImages] = useState([]); 
  const [newImageFiles, setNewImageFiles] = useState([]);   
  const [newImagePreviews, setNewImagePreviews] = useState([]); 

  // ✅ Synced with the upload.array("images", 5) limit from your backend routes
  const MAX_IMAGES = 5; 
  const totalCurrentImages = existingImages.length + newImageFiles.length;

  // Fetch the tool data when the page loads
  useEffect(() => {
    const fetchTool = async () => {
      try {
        const response = await toolService.getToolById(id);
        const item = response.item;
        
        // Pre-fill the form with existing data
        setFormData({
          title: item.title || '',
          category: item.category || '',
          condition: item.condition || '',
          description: item.description || '',
          pricePerDay: item.pricePerDay || '',
          depositAmount: item.depositAmount || '',
          city: item.location?.city || ''
        });
        
        setExistingImages(item.images || []);
      } catch (err) {
        setError(err.message || "Failed to load tool details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- IMAGE HANDLERS ---
  const handleImageSelect = (e) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setError(null);

    // Validate max images
    if (totalCurrentImages + files.length > MAX_IMAGES) {
      setError(`You can only have a maximum of ${MAX_IMAGES} images. Space left: ${MAX_IMAGES - totalCurrentImages}.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Add actual files to state for submission
    setNewImageFiles(prev => [...prev, ...files]);

    // Generate preview URLs for the UI
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeNewImage = (indexToRemove) => {
    setNewImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (totalCurrentImages === 0) {
      setError("Please include at least one product image.");
      return;
    }

    setSaving(true);

    try {
      const updateData = new FormData();
      
      updateData.append('title', formData.title);
      updateData.append('category', formData.category);
      updateData.append('condition', formData.condition);
      updateData.append('description', formData.description);
      updateData.append('pricePerDay', formData.pricePerDay);
      updateData.append('depositAmount', formData.depositAmount);

      const keptImageIds = existingImages.map(img => img.public_id);
      updateData.append('keptImages', JSON.stringify(keptImageIds));

      if (newImageFiles.length > 0) {
        newImageFiles.forEach((file) => {
          updateData.append('images', file);
        });
      }

      await toolService.updateTool(id, updateData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Failed to update the tool. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header & Back Button */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Listing</h1>
        <p className="text-gray-500 mt-1">Update the details for your tool.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-medium border border-red-100 flex items-center gap-3 shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          {error}
        </div>
      )}

      {/* The Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 transition-all" />
        </div>

        {/* ✅ SYNced Category & Condition Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 transition-all">
              <option value="" disabled>Select Category</option>
              <option value="camera">Photography & Camera</option>
              <option value="laptop">Laptops & Computers</option>
              <option value="tools">Hardware & Tools</option>
              <option value="musical_instrument">Musical Instruments</option>
              <option value="sports">Sports Equipment</option>
              <option value="other">Other / Miscellaneous</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 transition-all">
              <option value="" disabled>Select Condition</option>
              <option value="new">Brand New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Per Day (Rs)</label>
            <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} required min="0" className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Security Deposit (Rs)</label>
            <input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} required min="0" className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 transition-all" />
          </div>
        </div>

        {/* City (Locked) */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">City <span className="text-xs font-normal ml-1">(Cannot be changed)</span></label>
          <input type="text" name="city" value={formData.city} disabled className="w-full rounded-xl border border-gray-200 p-3 bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 transition-all resize-none"></textarea>
        </div>

        {/* --- IMAGE MANAGER UI --- */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Product Images</label>
              <p className="text-xs text-gray-500">Max {MAX_IMAGES} images. ({totalCurrentImages} currently added)</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-6">
            
            {/* 1. Display Existing Images */}
            {existingImages.map((img, index) => (
              <div key={img.public_id || index} className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shrink-0 group shadow-sm bg-gray-50">
                <img src={img.url} alt={`Tool ${index}`} className="w-full h-full object-cover" />
                {/* Hover Delete Overlay */}
                <div 
                  onClick={() => removeExistingImage(index)}
                  className="absolute inset-0 bg-gray-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            ))}

            {/* 2. Display New Image Previews */}
            {newImagePreviews.map((preview, index) => (
              <div key={`new-${index}`} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-blue-400 border-dashed shrink-0 group shadow-sm bg-blue-50/30">
                <img src={preview} alt={`New upload ${index}`} className="w-full h-full object-cover opacity-90" />
                {/* Hover Delete Overlay */}
                <div 
                  onClick={() => removeNewImage(index)}
                  className="absolute inset-0 bg-gray-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Upload New File Input */}
          <label className="block text-sm font-bold text-gray-700 mb-2">Upload New Images (Optional)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageSelect}
            disabled={totalCurrentImages >= MAX_IMAGES}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* ✅ REUSABLE BUTTON: Submit */}
        <div className="pt-6 border-t border-gray-100">
          <Button 
            type="submit" 
            variant="primary"
            isLoading={saving}
            className="!w-full !py-3.5 !rounded-xl text-base font-black shadow-md shadow-blue-200 gap-2"
          >
            Save Updates
          </Button>
        </div>

      </form>
    </div>
  );
}