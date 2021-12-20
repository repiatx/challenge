const express = require('express')

const Auth = require('../../middlewares/auth')

const UserController = require('../../controllers/UserController')

const router = express.Router()


router.get('/users/get-register-page-options', UserController.GetRegisterPageOptions)
router.post('/users/login', UserController.Login)

router.get('/users', Auth, UserController.UserList)
router.post('/users', UserController.RegisterUser)
router.get('/users/logout', Auth, UserController.LogOut)
router.get('/users/:userId', Auth, UserController.UserDetail)


module.exports = router
