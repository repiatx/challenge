const mongoose = require('mongoose')
const enums = require('../libs/enums')

const schema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: enums.user_statuses.OFFLINE
  },

}, {
  collection: 'users',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

class UserClass {

  get full_name() {
    return `${this.first_name} ${this.last_name}`
  }

  set full_name(value) {
    const firstSpace = value.indexOf(' ')
    this.first_name = value.split(' ')[0]
    this.last_name = firstSpace === -1 ? '' : value.substr(firstSpace + 1)
  }

}

schema.loadClass(UserClass)

module.exports = mongoose.model('User', schema)
