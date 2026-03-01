import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
const protect = catchAsync(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
      return next(new AppError('Missing or invalid authorization header',401))
    }

    const token = authorization.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired token',401));
    }

    const user = await User.findById(decoded.id).select('-password');;
    if (!user) {
      return next(new AppError('User no longer exists',401));
    }

    req.user = user;
    next();
  
});


export default protect;


