
import jwt from 'jsonwebtoken';
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js';
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js';
import formatUserResponse from '../utils/formatUserResponse.js';
import cloudinary from '../config/cloudinary.js';
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { verificationEmailTemplate } from "../utils/emailTemplates.js";

const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('Please provide all fields', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 409));
  }

  const user = await User.create({
    username,
    email,
    password
  });

   const token= generateToken(user._id);




  res.status(201).json({
    status: 'success',
    message: 'Registered successfully.',
    data:formatUserResponse(user,token)
  });
});
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

   

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });
  

  if (!user) {
    return next(new AppError('Invalid or expired token', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully.'
  });
});
const sendVerificationEmail = catchAsync(async (req, res, next) => {
 const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email already verified', 400));
  }

  // Create a new token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpire = Date.now() + 15 * 60 * 1000;

  await user.save();

  const verificationURL = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email - SkillLabz",
    html: verificationEmailTemplate(user.username, verificationURL)
  });

  res.status(200).json({
    status: 'success',
    message: 'Verification email sent successfully.'
  });
});
const loginUser=catchAsync(async(req,res,next)=>{
        const {email,password}=req.body;

        if( !email || !password ){
            
             return next(new AppError('Please provide all fields',400));
        }
         

        const user=await User.findOne({email}).select('+password');
        if(!user){
             return next(new AppError('User doesnot exists',409));
            
        }
        
        const validPassword=await user.comparePassword(password.trim());
        if(!validPassword){
            return next(new AppError('Invalid Credentials',401));
        }
      
        const token= generateToken(user._id);


          
          res.status(200).json({
        status:'success',
        message:'Login User successfully',
         data:formatUserResponse(user, token)
    })

   

})
const getMe=catchAsync(
  async(req,res,next)=>{

     if (!req.user) {
        return next(new AppError('Not authenticated',401));
    }

    const user=req.user;
    
 res.status(200).json({
        status:'success',
        message:'Current User fetched successfully',
        data: formatUserResponse(user)
    })
}
)

const completeProfile = catchAsync(async (req, res, next) => {
  const { bio, phone, city, addressText, coordinates } = req.body;

  if (!bio || !phone || !city || !addressText || !coordinates) {
    return next(new AppError('Please provide all required profile fields', 400));
  }

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return next(new AppError('Coordinates must be [longitude, latitude]', 400));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Optional: prevent re-edit if already completed
  // if (user.profileCompleted) {
  //   return next(new AppError('Profile already completed', 400));
  // }

  // Update fields
  user.bio = bio;
  user.phone = phone;
  user.location = {
    type: "Point",
    coordinates,
    addressText,
    city
  };

  user.profileCompleted = true;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile completed successfully',
    data: formatUserResponse(user)
  });
});



const uploadProfileImage = catchAsync(async (req, res, next) => {

  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

   const user = req.user; // use attached user


  // 🔥 Delete old image if exists
  if (user.profileImage && user.profileImage.public_id) {
    await cloudinary.uploader.destroy(user.profileImage.public_id);
  }

  // multer-storage-cloudinary already uploaded file
  user.profileImage = {
    public_id: req.file.filename,   // IMPORTANT
    url: req.file.path              // secure_url
  };

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile image updated successfully',
    data: {
      profileImage: user.profileImage
    }
  });

});
export {registerUser,loginUser,getMe,completeProfile,uploadProfileImage,verifyEmail,sendVerificationEmail }