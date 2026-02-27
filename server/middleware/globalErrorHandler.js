import AppError from "../utils/appError.js";

///  Invalid Error Ids in database
const handleInvalidIdError = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate Field ${value} entered.Please enter unique name`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  // console.log(errors);
  const message = `Invalid input.${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () =>
  new AppError("Invalid Token.Please login Again", 401);

const sendErrorDev = (err, req, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, req, res) => {
  // FOR API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      // only show on console to developer
      console.error("ERROR 💥", err);
      // Operational, trusted error: send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Something went  Wrong",
      });
    }
  }
};

// ERROR MIDDLEWARE GLOBAL
const globalErroHandler = (err, req, res, next) => {
  // stack trace tells about error in which line
  // console.log(err.stack);
  console.log(process.env.NODE_ENV);
  // if not given by default 500
  if (process.env.NODE_ENV === "development") {
    // in development we want to give all information to developer
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // Now we want to customize mongoose error
    let error = { ...err };

    error.message = err.message;
    // console.log('ERROR', error);
    // console.log('ERR', err);
    // CONDITION WILL BE ERR.NAME BEACAUSE ERROR IS SHALLOW COPY AND NOT POINTING TO SAME SO NOT EQUAL
    if (err.name === "CastError") error = handleInvalidIdError(error);
    if (err.code === 11000) error = handleDuplicateError(error);
    if (err.name === "ValidationError") error = handleValidationError(error);
    if (err.name === "JsonWebTokenError") error = handleJsonWebTokenError();
    sendErrorProd(error, req, res);
  }
};

export default globalErroHandler;
