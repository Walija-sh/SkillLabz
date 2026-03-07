import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { updateUser } from '../../store/authSlice'; 
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LocationPicker from '../../components/common/LocationPicker';
import userService from '../../services/user.service'; 

export default function CompleteProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData: user } = useSelector((state) => state.auth);
  
  const [isEditing] = useState(user?.profileCompleted || false);

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    phone: user?.phone || '',
    city: user?.location?.city || '',
    addressText: user?.location?.addressText || '',
    coordinates: user?.location?.coordinates?.length === 2 ? user.location.coordinates : [0, 0], 
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage?.url || null);

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
    success: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationUpdate = (coords) => {
    setFormData((prev) => ({ ...prev, coordinates: coords }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUiState({ ...uiState, error: "File size must be less than 5MB.", success: null });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setUiState({ ...uiState, error: null }); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.coordinates[0] === 0 && formData.coordinates[1] === 0) {
      setUiState((prev) => ({
        ...prev,
        error: "Location access is required. Please use 'Detect My Location' to continue.",
      }));
      return;
    }

    setUiState({ isLoading: true, error: null, success: null });

    try {
      const profileResponse = await userService.completeProfile(formData);
      
      const updatedUserData = profileResponse.data?.data || profileResponse.data || profileResponse.user;
      
      if (updatedUserData) {
        dispatch(updateUser(updatedUserData));
      }

      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', selectedFile); 
        
        const imageResponse = await userService.uploadProfileImage(imageFormData);
        const newProfileImage = imageResponse.data?.profileImage || imageResponse.data?.data?.profileImage;
        
        if (newProfileImage) {
           dispatch(updateUser({ profileImage: newProfileImage })); 
        }
      }

      setUiState({
        isLoading: false,
        error: null,
        success: isEditing ? "Changes saved! Redirecting..." : "Profile created! Redirecting...",
      });

      setTimeout(() => navigate('/profile'), 2000);
      
    } catch (err) {
      setUiState({
        isLoading: false,
        error: err.response?.data?.message || "Something went wrong saving your profile.",
        success: null,
      });
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-2xl">
        
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            {isEditing ? "Edit Your Profile" : "Complete Your Profile"}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {isEditing 
              ? "Update your details or change your photo below." 
              : "Add a photo and your contact details to build trust in the community."}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
          
          {uiState.error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 border border-red-100 animate-in fade-in slide-in-from-top-2">
              {uiState.error}
            </div>
          )}
          {uiState.success && (
            <div className="mb-6 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700 border border-blue-100 animate-in fade-in slide-in-from-top-2">
              {uiState.success}
            </div>
          )}

          <form className="space-y-7" onSubmit={handleSubmit}>
            
            <div className="flex flex-col items-center justify-center pb-4 border-b border-gray-100">
              <label 
                htmlFor="photo-upload" 
                className="relative cursor-pointer group flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-dashed border-gray-200 hover:border-blue-600 bg-gray-50 transition-all overflow-hidden"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Photo</span>
                  </div>
                )}
                
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                  </div>
                )}
              </label>
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 tracking-tight">Bio*</label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Share a bit about your expertise or why you're joining SkillLabz..."
                className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-gray-400"
                value={formData.bio}
                onChange={handleChange}
                disabled={uiState.isLoading}
                required
              />
            </div>

            <div className="pt-2">
              <Input 
                label="Phone Number*" 
                name="phone" 
                type="tel" 
                placeholder="e.g., 03149117269" 
                value={formData.phone} 
                onChange={handleChange} 
                disabled={uiState.isLoading}
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <Input 
                label="City*" 
                name="city" 
                placeholder="e.g., Taxila" 
                value={formData.city} 
                onChange={handleChange} 
                disabled={uiState.isLoading}
                required 
              />
              <Input 
                label="Area / Markaz*" 
                name="addressText" 
                placeholder="e.g., G-11 Markaz" 
                value={formData.addressText} 
                onChange={handleChange} 
                disabled={uiState.isLoading}
                required 
              />
            </div>

            <div className="pt-2">
              <LocationPicker 
                currentCoordinates={formData.coordinates} 
                onLocationSelect={handleLocationUpdate} 
              />
            </div>

            <div className="pt-8 border-t border-gray-100 flex gap-4">
              {isEditing && (
                <Button 
                  type="button" 
                  onClick={() => navigate('/profile')} 
                  className="w-full sm:w-1/3 py-4 bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                  disabled={uiState.isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                className={`w-full py-4 bg-blue-600 text-lg font-black shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-[0.98] ${isEditing ? 'sm:w-2/3' : ''}`} 
                isLoading={uiState.isLoading}
              >
                {isEditing ? "Save Changes" : "Complete Profile"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}