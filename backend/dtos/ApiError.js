class ApiError extends Error {

  constructor(statusCode, message, isOperational = true, stack = '',context) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
