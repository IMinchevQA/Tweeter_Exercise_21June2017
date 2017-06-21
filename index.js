let env = process.env.NODE_ENV || 'development'
const settings = require('./server/config/settings')[env]
const database = require('./server/config/database')
const expressCurrentApp = require('./server/config/express')
const routes = require('./server/config/routes')
const express = require('express')
const passport = require('./server/config/passport')
let app = express()

// Completed 6 of 8 tasks.
// !!! delPost - point 6 is not completed, it is under construction

database(settings)
expressCurrentApp(app, settings)
routes(app)
passport()

app.listen(settings.port)
console.log(`Server is listening on port ${settings.port}`)
