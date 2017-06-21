const encryption = require('../utilities/encryption')
const User = require('../data/User')
const errorHandler = require('../utilities/error-handler.js')

module.exports = {
  registerGet: (req, res) => {
    res.render('users/register')
  },
  registerPost: (req, res) => {
    let reqUser = req.body

    if (!reqUser.password) {
      res.locals.globalError = 'password is required!'
      res.render('users/register')
      return
    }

    let salt = encryption.generateSalt()
    let hashedPassword = encryption.generateHashedPassword(salt, reqUser.password)

    User
      .create({
        username: reqUser.username,
        salt: salt,
        hashedPass: hashedPassword,
        firstName: reqUser.firstName,
        lastName: reqUser.lastName
      }).then(user => {
        req.logIn(user, (err, user) => {
          if (err) {
            let message = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
            res.locals.globalError = message
            res.render('users/register')
          }
          res.redirect('/')
        })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('users/register')
      })
  },
  loginGet: (req, res) => {
    res.render('users/login')
  },
  loginPost: (req, res) => {
    let reqUser = req.body
    User
      .findOne({ username: reqUser.username })
      .then((user) => {
        if (!user) {
          res.locals.globalError = 'Invalid user data!'
          res.render('users/login')
          return
        }

        if (!user.authenticate(reqUser.password)) {
          res.locals.globalError = 'Invalid user data!'
          res.render('users/login')
          return
        }

        req.login(user, (err, user) => {
          if (err) {
            res.locals.globalError = err
            res.render('users/login')
          }

          res.redirect('/')
        })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('users/register')
    })
  },
  logout: (req, res) => {
    req.logout()
    res.redirect('/')
  },
  profile: (req, res) => {
    let usernameReq = req.params.username
    User
      .findOne({ username: usernameReq })
      .populate('startedTweets')
      .then(user => {
        let userData = user.startedTweets
        userData.likes = user.likes.length > 0 ? user.likes.length : 0
        userData.dislikes = user.dislikes.length > 0 ? user.dislikes.length : 0
        res.render('users/profile', { tweets: userData })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('users/register')
      })
  }
}



