const axios = require('axios')

const BackendService = {

  requester: axios.create({
    baseURL: process.env.BACKEND_URL
  }),

  login(email, password) {

    const config = {
      url: '/v1/users/login',
      method: 'POST',
      data: {
        email: email,
        password: password
      }
    }

    return this.requester.request(config)

  },

  logout(token) {
    const config = {
      url: '/v1/users/logout',
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`
      }
    }
    return this.requester.request(config)
  }

}

module.exports = BackendService
