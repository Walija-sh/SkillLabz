const conf = {
    // Your live Vercel backend URL
    apiUrl: String(import.meta.env.VITE_API_BASE_URL || 'https://skill-labz-backend.vercel.app/api'),
    
    // Placeholder for other production keys (like Cloudinary or Stripe)
    imageCloudName: String(import.meta.env.VITE_CLOUDINARY_NAME || ""),
};

export default conf;