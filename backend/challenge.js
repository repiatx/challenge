const cors = require('cors')
const xss = require('xss-clean')
const helmet = require('helmet')
const express = require('express')
const morgan = require('./config/morgan')
const httpStatus = require('http-status')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const addRequestId = require('express-request-id')()

const {errorConverter, errorHandler} = require('./middlewares/error')

const userRoute = require('./routes/v1/user.route')

const ApiError = require('./dtos/ApiError')

const i18n = require('i18n')
const path = require('path')


i18n.configure({
  locales: ['en', 'tr'],
  defaultLocale: 'en',
  directory: path.join(process.cwd(), 'locales'),
  updateFiles: false,
  objectNotation: true,
  header: 'x-lang-code',
  api: {
    __: 't', // now req.__ becomes req.t
    __n: 'tn' // and req.__n can be called as req.tn
  }
})

global.__ = (key, langCode, data = {}) => {

  return i18n.__({locale: langCode, phrase: key}, data)

}

const app = express()

app.use(i18n.init)

if (config.env !== 'TEST') {
  app.use(morgan.successHandler)
  app.use(morgan.errorHandler)
}


// set security HTTP headers
app.use(helmet())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

// sanitize request data
app.use(xss())
app.use(mongoSanitize())

// gzip compression
app.use(compression())

// enable cors
app.use(cors())
app.use(addRequestId)
app.options('*', cors())

// v1 api routes
app.use('/v1', userRoute)

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Route Not found'))
})


// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)

module.exports = app

