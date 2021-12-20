const Joi = require('joi')
const bcrypt = require('bcrypt')
const {isEmpty} = require('lodash')
const httpStatus = require('http-status')
const jsonwebtoken = require('jsonwebtoken')

const enums = require('../libs/enums')

const User = require('./../models/User')

const ApiError = require('./../dtos/ApiError')

const catchAsync = require('./../libs/catchAsync')
const SocketService = require('../services/SocketService')


const UserController = {

  GetRegisterPageOptions: catchAsync(async (req, res) => {

    const languages = [
      {
        value: 'tr',
        title: 'Türkçe'
      },
      {
        value: 'en',
        title: 'English'
      }
    ]

    const countries = [
      {
        value: 'tr',
        title: 'Türkiye'
      },
      {
        value: 'en_us',
        title: 'America'
      }

    ]

    return res.json({
      languages: languages,
      countries: countries
    })

  }),
  RegisterUser: catchAsync(async (req, res) => {

    const full_name = req.body.full_name
    const email = req.body.email
    const country = req.body.country        // value değerleri gelmekte
    const language = req.body.language      // value değerleri gelmekte
    const password = req.body.password
    const passwordRepeat = req.body.password_repeat


    if (isEmpty(full_name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'full_name has not provided')
    }

    if (isEmpty(email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'email has not provided')
    }

    if (isEmpty(country)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'country has not provided')
    }

    if (isEmpty(language)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'language has not provided')
    }

    if (isEmpty(password)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'password has not provided')
    }

    if (isEmpty(passwordRepeat)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'password_repeat has not provided')
    }

    if (password !== passwordRepeat) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Given password does not match with the given password_repeat')
    }

    // Joi ile hepsini yapabilirdim.
    const passwordCheck = Joi.string().min(8).alphanum().label('password').validate(password)
    if (passwordCheck.error) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Validation error: ${error.details.map(x => x.message).join(', ')}`)
    }

    const languageCheck = Joi.string().valid('tr', 'en').label('language').validate(language)
    if (languageCheck.error) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Validation error: ${languageCheck.error.details.map(x => x.message).join(', ')}`)
    }

    const countryCheck = Joi.string().valid('tr', 'en_us').label('country').validate(country)
    if (countryCheck.error) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Validation error: ${countryCheck.error.details.map(x => x.message).join(', ')}`)
    }


    const foundUser = await User.findOne({email: email})
    if (foundUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, `User already exist. Please try another user`)
    }

    const userDoc = new User()
    userDoc.full_name = full_name
    userDoc.email = email
    userDoc.country = country
    userDoc.language = language
    userDoc.password = bcrypt.hashSync(password, 13)
    await userDoc.save()

    // @TODO: socket handle
    SocketService.sendUserRegistered(full_name)

    return res.json({
      success: true,
      message: 'User registered successfully'
    })

  }),
  Login: catchAsync(async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    if (isEmpty(email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'email has not provided')
    }

    if (isEmpty(password)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'password has not provided')
    }

    const foundUser = await User.findOne({email: email})

    if ( ! foundUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    }

    if ( ! bcrypt.compareSync(password, foundUser.password)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Wrong password')
    }
    const jwt = jsonwebtoken.sign({user_id: foundUser._id.toString()}, process.env.APP_SECRET_KEY)

    foundUser.status = enums.user_statuses.ONLINE
    await foundUser.save()

    return res.json({
      success: true,
      token: jwt
    })

  }),
  UserList: catchAsync(async (req, res) => {

    const onlineUsers = await User.find({status: enums.user_statuses.ONLINE})

    return res.json({
      online_users: onlineUsers
    })

  }),
  UserDetail: catchAsync(async (req, res) => {

    const userId = req.params.userId

    if (isEmpty(userId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User Id not given as a parameter')
    }

    const foundUser = await User.findById(userId)

    if ( ! foundUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    }

    return res.json({
      user: foundUser
    })

  }),
  LogOut: catchAsync(async (req, res) => {

    req.user.status = enums.user_statuses.OFFLINE
    await req.user.save()

    return res.json({
      success: true,
      message: 'User logout successfully'
    })

  })

}


module.exports = UserController
