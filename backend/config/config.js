const Joi = require('joi')
const path = require('path')
const dotenv = require('dotenv')
const ApiError = require('../dtos/ApiError')
const httpStatus = require('http-status')

module.exports = (envPath) => {
  dotenv.config({path: path.join(__dirname, envPath ?? './../.env')})

  const envVarsSchema = Joi.object()
    .keys({
      NODE_ENV: Joi.string().valid('PRODUCTION', 'DEVELOPMENT', 'TEST').required(),
      APP_PORT: Joi.number().default(3000),
      SOCKET_PORT: Joi.number().default(3000),
      MONGODB_CONN_STRING: Joi.string().required().description('MongoDB Connection Url')

    })
    .unknown()

  const {value: envVars, error} = envVarsSchema.prefs({errors: {label: 'key'}}).validate(process.env)

  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Config validation error: ${error.message}`)
  }


  global.config = {
    env: envVars.NODE_ENV,
    port: envVars.APP_PORT,
    socket_port: envVars.SOCKET_PORT,
    mongodb: {
      url: envVars.MONGODB_CONN_STRING,
      options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }
  }
}
