const mongoose = require('mongoose')
const httpStatus = require('http-status')

const Logger = require('../config/logger')

const ApiError = require('../dtos/ApiError')

const errorConverter = (err, req, res, next) => {

  let error = err

  if ( ! (error instanceof ApiError)) {
    let statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR
    let message = error.message || httpStatus[statusCode]
    let context

    if (error.isAxiosError) {
      statusCode = error.response?.status || 421
      message = error.response?.data?.message ?? error.response?.data ?? 'Cannot reach the Host: ' + error.config?.url
      context = {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data
      }
    }


    error = new ApiError(statusCode, message, false, err.stack, context)
  }

  next(error)
}

const errorHandler = async (err, req, res, next) => {

  let {statusCode, message} = err

  if (config.env === 'PRODUCTION' && ! err.isOperational) {
    Logger.error(message)
    statusCode = httpStatus.INTERNAL_SERVER_ERROR
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
  }

  res.locals.errorMessage = err.message

  const response = {
    code: statusCode,
    request_id: req.id,
    message,
    ...(config.env === 'DEVELOPMENT' && {stack: err.stack})
  }

  if (config.env === 'DEVELOPMENT') {
    await Logger.error(err.toString() + ' trace_id:' + req.id.toString(), response)


  }

  res.status(statusCode).send(response)
}

module.exports = {
  errorConverter,
  errorHandler
}
