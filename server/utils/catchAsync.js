const catchAsync= (fn) => {
  // Closure function
  return (req, res, next) => {
    // if error comes it automatically transfer to global error Handler
    fn(req, res, next).catch((err) => next(err));
  };
};
export default catchAsync;
