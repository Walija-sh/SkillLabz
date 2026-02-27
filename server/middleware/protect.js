// JWT verify
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

const protect = async (req, res, next) => {
    // 1. Extract token from cookie
    const token = req.cookies.jwt;

    if (!token) {
        return next(new AppError('Not authorized, no token', 401));
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Get user
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }
        

        // 4. Attach user to req
        req.user = user;
        next();

    } catch (err) {
        return next(new AppError('Invalid/expired token', 401));
    }
};

export default protect;
