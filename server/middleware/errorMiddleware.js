export const createError = (statusCode, message, errors) => {
  const error = new Error(message)
  error.statusCode = statusCode
  if (errors) error.errors = errors
  return error
}

export const errorMiddleware = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'
  let errors = err.errors

  if (err.name === 'ValidationError') {
    statusCode = 422
    message = 'Validation failed'
    errors = Object.values(err.errors).map((fieldError) => fieldError.message)
  }

  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    if (field === 'qrToken') {
      message = 'Registration payment is pending. Please try again after refreshing the page.'
    } else if (field === 'user') {
      message = 'You already have a registration for this tournament.'
    } else {
      message = `${field} already exists`
    }
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token.'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Session expired. Please login again.'
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  }

  res.status(statusCode).json(response)
}
