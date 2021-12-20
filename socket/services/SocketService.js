const enums = require('../libs/enums')

const SocketService = {

  sendLoginResponse: (client, data) => {

    client.emit('event', {
      type: enums.outgoing_event_types.LOGIN_RESPONSE,
      data: data
    })

  },
  sendLoginErrorResponse: (client,error) => {

    client.emit('event', {
      type: enums.outgoing_event_types.LOGIN_RESPONSE,
      error: error
    })

  },

  joinUsersRoom: (client) => {
    client.join('users')
  },

  notifyOtherUsersThatIHaveLoggedIn: (client) => {

    client.to('users').emit('event', {
      type: enums.outgoing_event_types.LOGGED_IN
    })

  },

  notifyOnlineUsersChanged: (io) => {

    io.to('users').emit('event', {
      type: enums.outgoing_event_types.USERS_CHANGED
    })


  },




}

module.exports = SocketService
