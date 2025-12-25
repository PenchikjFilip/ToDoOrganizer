// backend/utils/asyncHandler.js
// Promise.resolve() handles both sync and async functions. If the async function (fn) throws an error, .catch() will automatically call next(err), passing control to the global handler.
//Fix for too many try catch

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;