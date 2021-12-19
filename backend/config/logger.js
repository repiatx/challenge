require('winston-mongodb')
const winston = require('winston')
const mongoose = require('mongoose')

let Logger

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, {message: info.stack})
  }
  return info
})

try {
  Logger = winston.createLogger({
    level: config.env === 'DEVELOPMENT' ? 'debug' : 'info',
    format: winston.format.combine(
      enumerateErrorFormat(),
      config.env === 'DEVELOPMENT' ? winston.format.colorize() : winston.format.uncolorize(),
      winston.format.splat(),
      winston.format.printf(({level, message}) => `${level}: ${message}`)
    ),
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error']
      }),
      new winston.transports.MongoDB({
        db: mongoose.connection.db,
        level: 'warn',
        collection: 'logs'
      }),
    ]

  })

} catch (err) {
  console.log(err)
}


module.exports = Logger
