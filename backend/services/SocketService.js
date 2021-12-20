const io = require('socket.io-client')

const socket = io(process.env.SOCKET_APP_URL)


socket.on('connect', () => {

  console.log('connected to socket')

})


socket.on('event', event => {
})

const SocketService = {

  sendUserRegistered(fullName) {

    const data = {
      type: 'SEND_EVENT',
      data: {
        event_type: 'USER_REGISTERED',
        room: 'users',
        data: {
          full_name: fullName
        }
      }
    }

    socket.emit('event', data)
  }

}

module.exports = SocketService
