const RandomHash = require('random-hash')

const utils = {

  generateHash: (length = 24) => {

    return RandomHash.generateHash({length: length})

  }
}
module.exports = utils
