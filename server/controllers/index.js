const homeController = require('./home-controller')
const usersController = require('./users-controller')
const tweetsController = require('./tweets-controller')

module.exports = {
  home: homeController,
  users: usersController,
  tweets: tweetsController
}
