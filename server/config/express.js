const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const handlebars = require('express-handlebars')
const path = require('path')
const helpers = require('./helpers')

module.exports = (app, settings) => {
  app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers: helpers
  }))
  app.set('view engine', 'handlebars')
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(session({
    secret: '$3$$I0N-PA$$W0RD',
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use((req, res, next) => {
    if (req.user) {
      res.locals.currentUser = req.user // Now currentUser might be accessed from each page in the application
      res.locals.isAdmin = req.user.roles.indexOf('Admin') >= 0
    }
    next()
  })

  app.use((req, res, next) => {
      // Configure public folder
    if (req.url.startsWith('/public')) {
      req.url = req.url.replace('/public', '')
    }
    next()
  },
    express.static(path.normalize(path.join(settings.rootPath, 'public'))))
}
