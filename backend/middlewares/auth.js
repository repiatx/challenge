const httpStatus = require('http-status')
const jsonwebtoken = require('jsonwebtoken')

const User = require('./../models/User')

const ApiError = require('../dtos/ApiError')

const catchAsync = require('../libs/catchAsync')

const Auth =  catchAsync(async (req, res, next) => {

  const jwt = req.headers['authorization']

  if ( ! jwt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Authorization header is not given')
  }

  let token
  let decoded
  token = jwt.split(' ')[1]

  try {
    jsonwebtoken.verify(token, process.env.APP_SECRET_KEY)
  } catch (ex) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'invalid signature')
  }


  try {
    decoded = jsonwebtoken.decode(token, {complete: true})
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'invalid token')
  }


  const foundUser = await User.findById(decoded.payload.user_id)

  if ( ! foundUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid token')
  }

  req.user = foundUser
  return next()


})


module.exports = Auth
