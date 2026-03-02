import AppError from "../utils/appError.js";

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission", 403)
      );
    }
    next();
  };
};

export default restrictTo;