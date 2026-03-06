import express from 'express';
import { registerUser,loginUser,getMe,completeProfile,uploadProfileImage,verifyEmail ,sendVerificationEmail} from '../controllers/auth.controller.js';
import protect from '../middleware/protect.middleware.js';
import upload from '../middleware/upload.middleware.js';

const AuthRouter=express.Router();

AuthRouter.post('/register',registerUser);
AuthRouter.get('/verify-email/:token', verifyEmail);
AuthRouter.post('/send-verification-email',protect, sendVerificationEmail);
AuthRouter.post('/login',loginUser);

AuthRouter.get('/me',protect,getMe);
AuthRouter.patch('/complete-profile', protect, completeProfile);
AuthRouter.patch(
  '/upload-profile-image',
  protect,
  upload.single('profileImage'),
  uploadProfileImage
);

export default AuthRouter;
