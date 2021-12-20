require('dotenv').config()
const server = require('http').createServer()
const io = require('socket.io')(server, {cors: {origin: '*'}})

const enums = require('./libs/enums')

const SocketService = require('./services/SocketService')
const BackendService = require('./services/BackendService')


io.on('connection', client => {

  //guest connected
  client.on('event', onClientData)
  client.on('disconnect', onClientDisconnected)

  function onClientData(event) {


    switch (event.type) {
      case enums.incoming_event_types.LOGIN:

        const email = event.data.email
        const password = event.data.password
        return BackendService.login(email, password)
            .then(response => {

              SocketService.sendLoginResponse(client, response.data)
              //user Joined to room
              SocketService.joinUsersRoom(client)

              SocketService.notifyOtherUsersThatIHaveLoggedIn(client)

              SocketService.notifyOnlineUsersChanged(io)

              client.token = response.data.token


            })
            .catch(response => {

              SocketService.sendLoginErrorResponse(client, response.response?.data)

            })
      case enums.incoming_event_types.SEND_EVENT:
        // There might be a special authentication for Backend
        const data = {
          type: event.data.event_type,
          data: event.data.data
        }

        const room = event.data.room
        io.to(room).emit('event', data)
    }


  }

  function onClientDisconnected() {
    //client disconnedted
    client.leave('users')

    if (client.token) {

      BackendService.logout(client.token)
          .then(() => {
            SocketService.notifyOnlineUsersChanged(io)
          })
          .catch(err => {
            console.log(err.response.data)
          })
    }

  }

})


server.listen(3001, function () {
  console.log('socket started')
})
