require('./config/config')('./../.env')

const mongoose = require('mongoose')


async function main() {

  await mongoose.connect(config.mongodb.url, config.mongodb.options)

  require('./models/User')

  const app = require('./challenge')

  const Logger = require('./config/logger')

  Logger.info('Connected to MongoDB')
  const server = app.listen(config.port, () => {
    Logger.info(`Listening to port ${config.port}`)
  })


  const exitHandler = () => {
    if (server) {
      server.close(() => {
        Logger.info('Server closed')
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  }

  const unexpectedErrorHandler = (error) => {
    Logger.error(error)
    exitHandler()
  }

  process.on('uncaughtException', unexpectedErrorHandler)
  process.on('unhandledRejection', unexpectedErrorHandler)

  process.on('SIGTERM', () => {
    Logger.info('SIGTERM received')
    if (server) {
      server.close()
    }
  })

}

main()




