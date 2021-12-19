const catchAsync = require('../libs/catchAsync')


const MainController = {

  main: catchAsync((req, res) => {

      return res.send('',404)

  })

}


module.exports = MainController
