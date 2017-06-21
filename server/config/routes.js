const controllers = require('../controllers')
const auth = require('../config/auth')

module.exports = (app) => {
  app.get('/', controllers.home.index)

  // Users
  app.get('/users/register', controllers.users.registerGet)
  app.post('/users/register', controllers.users.registerPost)
  app.get('/users/login', controllers.users.loginGet)
  app.post('/users/login', controllers.users.loginPost)
  app.get('/users/profile/:username', auth.isAuthenticated, controllers.users.profile)
  app.post('/users/logout', auth.isAuthenticated, controllers.users.logout)

  // Tweets
  app.get('/tweets/add', auth.isAuthenticated, controllers.tweets.addGet)
  app.post('/tweets/add', auth.isAuthenticated, controllers.tweets.addPost)
  app.get('/tweets/all', auth.isAuthenticated, controllers.tweets.all)
  app.get('/tweets/:votes/:id', auth.isAuthenticated, controllers.tweets.vote)
  app.get('/tweets/edit/:id/:title', auth.isAuthenticated, controllers.tweets.editGet)
  app.post('/tweets/edit/:id/:title', auth.isAuthenticated, controllers.tweets.editPost)
  app.get('/tweets/delete/:id/:title', auth.isAuthenticated, controllers.tweets.deleteGet)
  app.post('/tweets/delete/:id/:title', auth.isAuthenticated, controllers.tweets.deletePost)

  // Tag
  app.get('/tag/:tagname', controllers.tweets.findByTag)

  app.all('*', (req, res) => {
    res.status(404)
    res.send('404 Not Found')
    res.end()
  })
}
