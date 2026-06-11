import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from '../../components/common/LocationPicker';
import userService from '../../services/user.service';
import Webcam from 'react-webcam';
import verificationService from '../../services/verification.service';

// ─── Animation Variants ──────────────────────────────────────────────────────
const pageStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const fieldStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fieldFade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Card Section Header ─────────────────────────────────────────────────────
const CardSectionHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="text-base sm:text-lg font-black tracking-widest uppercase text-[#1A1A2E]">{title}</h2>
    <p className="text-sm font-medium text-gray-400 mt-1">{subtitle}</p>
  </div>
);

// ─── Field Label ─────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label className="block text-[10px] font-black tracking-widest uppercase text-[#191970] mb-2">
    {children}
  </label>
);

// ─── Input class ─────────────────────────────────────────────────────────────
const inputClass =
  'w-full rounded-xl bg-white border border-gray-200 px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal';

// ─── Alert Banner ────────────────────────────────────────────────────────────
const AlertBanner = ({ type, children }) => {
  const styles = {
    error: 'bg-red-50 border-red-100 text-red-700',
    success: 'bg-green-50 border-green-100 text-green-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      className={`rounded-xl border px-4 py-3 text-xs font-bold ${styles[type]}`}
    >
      {children}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompleteProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData: user } = useSelector((state) => state.auth);
  const [isEditing] = useState(user?.profileCompleted || false);

  // --- PROFILE STATE ---
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    phone: user?.phone || '',
    city: user?.location?.city || '',
    addressText: user?.location?.addressText || '',
    coordinates: user?.location?.coordinates?.length === 2 ? user.location.coordinates : [0, 0],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage?.url || null);
  const [uiState, setUiState] = useState({ isLoading: false, error: null, success: null });

  // --- VERIFICATION STATE ---
  const webcamRef = useRef(null);
  const [verifUiState, setVerifUiState] = useState({ isLoading: false, error: null, success: null });
  const [verifData, setVerifData] = useState({
    fullName: '',
    cnicNumber: '',
    dateOfBirth: '',
    cnicFront: null,
    cnicBack: null,
    selfieUrl: null,
    selfieFile: null,
  });

  // --- PROFILE HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationUpdate = (locationData) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: locationData.coordinates,
      city: locationData.city || '',
      addressText: locationData.area || '',
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUiState({ ...uiState, error: 'File size must be less than 5MB.', success: null });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUiState({ ...uiState, error: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.coordinates[0] === 0 && formData.coordinates[1] === 0) {
      setUiState((prev) => ({ ...prev, error: "Location required. Use 'Detect My Location' to continue." }));
      return;
    }
    setUiState({ isLoading: true, error: null, success: null });
    try {
      const profileResponse = await userService.completeProfile(formData);
      const updatedUserData = profileResponse.data?.data || profileResponse.data || profileResponse.user;
      if (updatedUserData) dispatch(updateUser(updatedUserData));

      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', selectedFile);
        const imageResponse = await userService.uploadProfileImage(imageFormData);
        const newProfileImage = imageResponse.data?.profileImage || imageResponse.data?.data?.profileImage;
        if (newProfileImage) dispatch(updateUser({ profileImage: newProfileImage }));
      }

      setUiState({
        isLoading: false,
        error: null,
        success: isEditing ? 'Changes saved! Redirecting…' : 'Profile created! Redirecting…',
      });
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setUiState({
        isLoading: false,
        error: err.response?.data?.message || 'Something went wrong saving your profile.',
        success: null,
      });
    }
  };

  // --- VERIFICATION HANDLERS ---
  const handleVerifChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cnicNumber') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 13) return;
      setVerifData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    setVerifData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifFile = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) setVerifData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const captureSelfie = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setVerifData((prev) => ({
        ...prev,
        selfieUrl: imageSrc,
        selfieFile: dataURLtoFile(imageSrc, 'selfie.jpg'),
      }));
    }
  }, [webcamRef]);

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verifData.cnicFront || !verifData.cnicBack || !verifData.selfieFile) {
      setVerifUiState({
        error: 'Please provide all 3 images: CNIC Front, Back, and Live Selfie.',
        isLoading: false,
        success: null,
      });
      return;
    }
    setVerifUiState({ isLoading: true, error: null, success: null });
    try {
      const vForm = new FormData();
      vForm.append('fullName', verifData.fullName);
      vForm.append('cnicNumber', verifData.cnicNumber);
      vForm.append('dateOfBirth', verifData.dateOfBirth);
      vForm.append('cnicFront', verifData.cnicFront);
      vForm.append('cnicBack', verifData.cnicBack);
      vForm.append('selfie', verifData.selfieFile);
      await verificationService.submitVerification(vForm);
      dispatch(updateUser({ identityVerificationStatus: 'pending' }));
      setVerifUiState({ isLoading: false, error: null, success: 'Verification submitted successfully!' });
    } catch (err) {
      setVerifUiState({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to submit verification.',
        success: null,
      });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="min-h-screen bg-[#ECEFF1] px-4 sm:px-6 py-10 pb-24"
      variants={pageStagger}
      initial="hidden"
      animate="show"
    >
      <div className="w-full max-w-2xl mx-auto space-y-5">

        {/* ── PAGE HEADER ── */}
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1A1A2E] uppercase">
            {isEditing ? (
              <>Edit Your <span className="text-[#191970]">Profile</span></>
            ) : (
              <>Complete Your <span className="text-[#191970]">Profile</span></>
            )}
          </h1>
          <p className="mt-3 text-base font-medium text-gray-500">
            {isEditing
              ? 'Update your details or change your photo below.'
              : 'Add a photo and contact details to build trust in the community.'}
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            CARD 1 — PROFILE INFORMATION
        ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          <CardSectionHeader
            title="Profile Information"
            subtitle="Your public details visible to the community"
          />

          <AnimatePresence>
            {uiState.error && (
              <div className="mb-5">
                <AlertBanner type="error">{uiState.error}</AlertBanner>
              </div>
            )}
            {uiState.success && (
              <div className="mb-5">
                <AlertBanner type="success">{uiState.success}</AlertBanner>
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <motion.div variants={fieldStagger} initial="hidden" animate="show" className="space-y-5">

              {/* ── Photo Upload ── */}
              <motion.div variants={fieldFade} className="flex flex-col items-center gap-3 pb-6 border-b border-gray-100">
                <label
                  htmlFor="photo-upload"
                  className="relative cursor-pointer group"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#191970] transition-colors bg-[#ECEFF1] shadow-sm">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      </div>
                    )}
                    {previewUrl && (
                      <div className="absolute inset-0 rounded-full bg-[#1A1A2E]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">Change</span>
                      </div>
                    )}
                  </div>
                </label>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {previewUrl ? 'Click to change photo' : 'Upload profile photo'}
                </p>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </motion.div>

              {/* Bio */}
              <motion.div variants={fieldFade}>
                <FieldLabel>Bio *</FieldLabel>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Share your expertise or why you're joining SkillLabz…"
                  className={`${inputClass} resize-none`}
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={uiState.isLoading}
                  required
                />
              </motion.div>

              {/* Phone */}
              <motion.div variants={fieldFade}>
                <FieldLabel>Phone Number *</FieldLabel>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g., 03149117269"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={uiState.isLoading}
                  required
                />
              </motion.div>

              {/* City + Area */}
              <motion.div variants={fieldFade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>City *</FieldLabel>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g., Taxila"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={uiState.isLoading}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Area / Markaz *</FieldLabel>
                  <input
                    type="text"
                    name="addressText"
                    placeholder="e.g., G-11 Markaz"
                    value={formData.addressText}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={uiState.isLoading}
                    required
                  />
                </div>
              </motion.div>

              {/* Location Picker */}
              <motion.div variants={fieldFade}>
                <FieldLabel>Location Mapping </FieldLabel>
                <div className="border border-gray-200 rounded-xl overflow-hidden [&>div>label:first-child]:hidden [&>label:first-child]:hidden [&_label.text-gray-900]:hidden [&>div>h3:first-child]:hidden">
                  <LocationPicker
                    currentCoordinates={formData.coordinates}
                    onLocationSelect={handleLocationUpdate}
                  />
                </div>
              </motion.div>

            </motion.div>

            {/* ── Action Buttons ── */}
            <div className="flex gap-3 mt-7 pt-6 border-t border-gray-100">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  disabled={uiState.isLoading}
                  className="flex-1 py-4 rounded-xl bg-white border border-gray-200 text-[#1A1A2E] text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={uiState.isLoading}
                className="flex-[2] py-4 rounded-xl bg-[#191970] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f0f50] transition-colors disabled:opacity-50 shadow-lg shadow-[#191970]/20"
              >
                {uiState.isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    Processing…
                  </span>
                ) : isEditing ? (
                  'Save Profile Changes'
                ) : (
                  'Complete Profile'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            CARD 2 — IDENTITY VERIFICATION
        ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          <CardSectionHeader
            title="Identity Verification"
            subtitle="Verify with your CNIC to earn a trusted badge"
          />

          {/* STATUS: PENDING */}
          {user?.identityVerificationStatus === 'pending' && (
            <motion.div
              variants={fadeUp}
              className="rounded-xl bg-amber-50 border border-amber-200 p-5 flex flex-col items-start gap-2"
            >
              <h3 className="text-base sm:text-lg font-black uppercase tracking-widest text-amber-800">
                Verification Pending Review
              </h3>
              <p className="text-sm font-medium text-amber-700 leading-relaxed">
                Your documents have been received and are under review. We'll notify you once a decision is made.
              </p>
            </motion.div>
          )}

          {/* STATUS: APPROVED */}
          {user?.identityVerificationStatus === 'approved' && (
            <motion.div
              variants={fadeUp}
              className="rounded-xl bg-green-50 border border-green-100 p-5 flex flex-col items-start gap-2"
            >
              <h3 className="text-base sm:text-lg font-black uppercase tracking-widest text-green-800">
                Identity Verified
              </h3>
              <p className="text-sm font-medium text-green-700 leading-relaxed">
                Your profile now displays a verified trusted badge.
              </p>
            </motion.div>
          )}

          {/* ACTIVE FORM */}
          {(user?.identityVerificationStatus === 'rejected' ||
            !user?.identityVerificationStatus ||
            user?.identityVerificationStatus === 'not_submitted') && (
            <div className="space-y-5">

              <AnimatePresence>
                {user?.identityVerificationStatus === 'rejected' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 font-medium"
                  >
                    Your previous request was rejected. Ensure photos are clear and details match your CNIC exactly.
                  </motion.div>
                )}
                {verifUiState.error && (
                  <AlertBanner type="error">{verifUiState.error}</AlertBanner>
                )}
                {verifUiState.success && (
                  <AlertBanner type="success">{verifUiState.success}</AlertBanner>
                )}
              </AnimatePresence>

              <form onSubmit={handleVerificationSubmit}>
                <motion.div variants={fieldStagger} initial="hidden" animate="show" className="space-y-5">

                  {/* Full Name + CNIC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={fieldFade}>
                      <FieldLabel>Full Name (as on CNIC) *</FieldLabel>
                      <input
                        type="text"
                        name="fullName"
                        value={verifData.fullName}
                        onChange={handleVerifChange}
                        required
                        disabled={verifUiState.isLoading}
                        placeholder="Muhammad Ali"
                        className={inputClass}
                      />
                    </motion.div>
                    <motion.div variants={fieldFade}>
                      <FieldLabel>CNIC Number (no dashes) *</FieldLabel>
                      <input
                        type="text"
                        name="cnicNumber"
                        value={verifData.cnicNumber}
                        onChange={handleVerifChange}
                        required
                        disabled={verifUiState.isLoading}
                        maxLength="13"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="3740512345678"
                        className={inputClass}
                      />
                    </motion.div>
                  </div>

                  {/* Date of Birth */}
                  <motion.div variants={fieldFade} className="sm:max-w-xs">
                    <FieldLabel>Date of Birth *</FieldLabel>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={verifData.dateOfBirth}
                      onChange={handleVerifChange}
                      required
                      disabled={verifUiState.isLoading}
                      className={inputClass}
                    />
                  </motion.div>

                  {/* CNIC Images */}
                  <motion.div variants={fieldFade}>
                    <FieldLabel>CNIC Images *</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                      {[
                        { key: 'cnicFront', label: 'CNIC Front' },
                        { key: 'cnicBack', label: 'CNIC Back' },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#191970]/40 rounded-xl py-7 px-4 cursor-pointer transition-colors bg-[#FAFAFA] group"
                        >
                          {verifData[key] ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#191970]">
                              {verifData[key].name.length > 16
                                ? verifData[key].name.slice(0, 14) + '…'
                                : verifData[key].name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#191970]/60 transition-colors">
                              {label}
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVerifFile(e, key)}
                            disabled={verifUiState.isLoading}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  </motion.div>

                  {/* ── Webcam ── */}
                  <motion.div variants={fieldFade}>
                    <FieldLabel>Live Selfie Verification *</FieldLabel>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-[#FAFAFA]">
                      <div className="flex flex-col md:flex-row gap-0">

                        {/* Camera feed */}
                        <div className="w-full md:w-1/2 aspect-video bg-[#1A1A2E] relative overflow-hidden">
                          {verifData.selfieUrl ? (
                            <img src={verifData.selfieUrl} alt="Selfie preview" className="w-full h-full object-cover" />
                          ) : (
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              mirrored={true}
                              screenshotFormat="image/jpeg"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Selfie controls */}
                        <div className="w-full md:w-1/2 p-5 flex flex-col justify-center gap-4">
                          <p className="text-xs font-medium text-gray-400 leading-relaxed">
                            Face should be clearly visible and well-lit. Remove sunglasses or hats before capturing.
                          </p>
                          {verifData.selfieUrl ? (
                            <button
                              type="button"
                              onClick={() => setVerifData((prev) => ({ ...prev, selfieUrl: null, selfieFile: null }))}
                              className="w-full py-3 rounded-xl bg-white border border-gray-200 text-[#1A1A2E] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                              Retake Photo
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={captureSelfie}
                              className="w-full py-3 rounded-xl bg-[#191970] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0f0f50] transition-colors shadow-md shadow-[#191970]/20"
                            >
                              Capture Face
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </motion.div>

                {/* Submit */}
                <div className="mt-7 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={verifUiState.isLoading}
                    className="w-full py-4 rounded-xl bg-[#191970] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f0f50] transition-colors disabled:opacity-50 shadow-lg shadow-[#191970]/20"
                  >
                    {verifUiState.isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        Submitting…
                      </span>
                    ) : (
                      'Submit for Verification'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}