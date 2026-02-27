class AppError extends Error {
  constructor(message, statusCode) {
    // as error class takes message
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // this is for operational error
    this.isOperational = true;
    // this is for not showing error to client
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
