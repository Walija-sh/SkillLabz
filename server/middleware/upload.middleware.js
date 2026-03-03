import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    let folder = 'skilllabz/misc';

    // ✅ profile image
    if (file.fieldname === 'profileImage') {
      folder = 'skilllabz/profile-images';
    }

    // ✅ item images
    if (file.fieldname === 'images') {
      folder = 'skilllabz/item-images';
    }

    // ✅ verification docs
    if (file.fieldname === 'cnicFront') {
      folder = 'skilllabz/verification/cnic-front';
    }

    if (file.fieldname === 'cnicBack') {
      folder = 'skilllabz/verification/cnic-back';
    }

    if (file.fieldname === 'selfie') {
      folder = 'skilllabz/verification/selfies';
    }

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
      cb(new Error('Please upload an image'), false);
    }
    cb(null, true);
  }
});

export default upload;