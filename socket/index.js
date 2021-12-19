require('dotenv').config()
const axios = require('axios')

const server = require('http').createServer()
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
})


const enums = require('./libs/enums')

const requester = axios.create({
  baseURL: process.env.BACKEND_URL
})

io.on('connection', client => {
  console.log('guest connected')


  client.on('event', event => {

    // const jsonData = JSON.parse(event)

    switch (event.type) {
      case enums.event_types.LOGIN:
        const config = {
          url: '/v1/users/login',
          method: 'POST',
          data: event.data
        }
        return requester.request(config)
            .then(response => {
              client.emit('event', {
                type: enums.event_types.LOGIN_RESPONSE,
                data: response.data
              })
              client.join('users')
              console.log('client joined users')
              client.token = response.data.token
              client.to('users').emit('event', {
                type: enums.event_types.LOGGED_IN
              })

            })
            .catch(response => {

              client.emit('event', {
                type: enums.event_types.LOGIN_RESPONSE,
                error: response.response.data
              })

            })
    }

    console.log(event)


  })
  client.on('disconnect', () => {

    console.log('client disconnected')

    client.leave('users')

    if (client.token) {

      const config = {
        url: '/v1/users/logout',
        method: 'GET',
        headers: {
          authorization: `Bearer ${client.token}`
        }
      }
      return requester.request(config)
          .then(response => {
            console.log(response.data)
          })
          .catch(err => {
            console.log(err.response.data)
          })
    }


  })
})

server.listen(3001)
