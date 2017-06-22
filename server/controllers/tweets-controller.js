const Tweet = require('../data/Tweet')
const User = require('../data/User')
const errorHandler = require('../utilities/error-handler')
let parseTagsAndHandlers = (tweetContent) => {
  return new Promise((resolve, reject) => {
    let splitSeparators = /[\s.,!?]/
    let patternMatchTag = /(^|)#[\w]+/
    let arrTagsFound = new Set([])

    // Splitting tweet content into separate words in order to search for tags
    let tweetTokens = tweetContent.split(splitSeparators).filter(e => e !== '')
    tweetTokens.forEach(t => {
      if (t.match(patternMatchTag)) {
        let tag = t.toLowerCase().substr(1)
        arrTagsFound.add(tag)
      }
    })

    // let uniqueTag = arrTagsFound.filter((item, i, ar) => arrTagsFound.indexOf(item) === -1)
    return resolve(arrTagsFound)
  })
}

module.exports = {
  addGet: (req, res) => {
    res.render('tweets/add')
  },
  addPost: (req, res) => {
    let tweetReq = req.body
    let userReq = req.user._id

    parseTagsAndHandlers(tweetReq.message)
    .then(tagsFound => {
      User.findById(userReq)
       .then(user => {
         Tweet
           .create({
             title: tweetReq.title, // for test purposes only -  i + ' Some whatever title!'
             message: tweetReq.message, // for test purposes only (i * 10) + ' Never mind this is just an exercise',
             creator: user
           })
           .then(tweet => {
             tagsFound.forEach(tag => tweet.hashTags.push(tag))
             tweet.save()
             user.startedTweets.push(tweet._id)
             user.save()
             res.redirect('/')
           })
           .catch(err => {
             res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
             res.render('tweets/add')
           })
       })
       .catch(err => {
         res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
         res.render('tweets/add')
       })
    })
  },
  all: (req, res) => {
    Tweet
     .find({})
     .populate('creator')
     .sort('-date')
     .limit(100)
     .then(tweets => {
       res.render('tweets/all', { tweets: tweets })
     })
     .catch(err => {
       res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
       res.render('/')
     })
  },
  findByTag: (req, res) => {
    let tagName = req.params.tagname
    Tweet
      .find({hashTags: tagName})
      .populate('creator')
      .sort('-date')
      .then(tweets => {
        res.render('tweets/all', { tweets: tweets })
      })
  },
  vote: (req, res) => {
    let vote = req.params.votes
    let currentTweetId = req.params.id
    let currentUserId = req.user._id
    User
      .findById(currentUserId)
      .then(user => {
        Tweet
          .findById(currentTweetId)
          .then(tweet => {
            let likeIndex = user.likes.indexOf(currentTweetId)
            let dislikeIndex = user.dislikes.indexOf(currentTweetId)

            if (vote === 'like') {
              if (likeIndex > -1) {
                // If code here is executed so someone tries to inject likes and dislikes from outside with e.g. Postman
                res.locals.globalError = 'Dude, vote more than once!'
                res.render('/')
                return
              }

              if (dislikeIndex > -1) {
                user.dislikes.splice(dislikeIndex, 1)
                --tweet.dislikes
              }
              user.likes.push(currentTweetId)
              user.save()
              ++tweet.likes
            } else if (vote === 'dislike') {
              if (likeIndex === -1 || // Tweet cannot be disliked before to be liked first.
                dislikeIndex > -1) {
                // If code here is executed so someone tries to inject likes and dislikes from outside with e.g. Postman
                res.locals.globalError = 'Dude, vote more than once!'
                res.render('/')
                return
              }
              if (likeIndex > -1) {
                user.likes.splice(likeIndex, 1)
                --tweet.likes
              }
              user.dislikes.push(currentTweetId)
              user.save()
              ++tweet.dislikes
            }
            tweet
              .save()
              .then(() => {
                res.redirect('/tweets/all')
              }).catch(err => {
                res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
                res.render('tweets/all')
              })
          })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('users/register')
      })
  },
  editGet: (req, res) => {
    let currentTweetId = req.params.id
    Tweet
      .findById(currentTweetId)
      .populate('creator')
      .then(tweet => {
        res.render('tweets/edit', { tweet: tweet })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('tweets/all')
      })
  },
  editPost: (req, res) => {
    let currentTweetId = req.params.id
    let tweetBodyReq = req.body
    Tweet
      .findById(currentTweetId)
      .then(tweet => {
          // The following code ensures that when tweet's hashTags will be updated when #tags in the message text is changed also!
        parseTagsAndHandlers(tweetBodyReq.message)
          .then(arrTagsFound => {
            tweet.title = tweetBodyReq.title
            tweet.message = tweetBodyReq.message
            tweet.hashTags = []
            if (arrTagsFound.size > 0) {
              arrTagsFound.forEach(function (tag) {
                tweet.hashTags.push(tag)
                tweet.save()
              })
            }
            tweet
              .save()
              .then(() => {
                res.redirect('/tweets/all')
              }).catch(err => {
                res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
                res.render('tweets/all')
              })
          }).catch(err => {
            res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
            res.render('tweets/all')
          })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('tweets/all')
      })
  },
  deleteGet: (req, res) => {
    let currentTweetId = req.params.id
    Tweet
      .findById(currentTweetId)
      .populate('creator')
      .then(tweet => {
        res.render('tweets/delete', { tweet: tweet })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('tweets/all')
      })
  },
  // delPost purposes: To delete tweetId from User's: likes, dislikes, createdTweets.
  // Finally the tweet should be deleted itself.
  // The role of variables 'cntUsersLikedFound', 'let cntUsersDislikedFound = 0' is just informative and depicts the count of Users found who respectively liked and disliked certain tweet!!!
  deletePost: (req, res) => {
    let currentTweetId = req.params.id
    let removeUsersLikes = new Promise((resolve, reject) => {
      let cntUsersLikedFound = 0
      User
        .find({ likes: currentTweetId })
        .then(usersLikedFound => {
          if (usersLikedFound.length > 0) {
            cntUsersLikedFound = usersLikedFound.length
            usersLikedFound.forEach(userLiked => {
              let delIndex = userLiked.likes.indexOf(currentTweetId)
              userLiked.likes.splice(delIndex, 1)
              userLiked.save()
            })
          }
          return resolve(cntUsersLikedFound)
        }).catch(err => {
          res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
          res.render('tweets/all')
        })
    })
    let removeUsersDislikes = new Promise((resolve, reject) => {
      let cntUsersDislikedFound = 0
      User
      .find({ dislikes: currentTweetId })
      .then(usersDislikedFound => {
        if (usersDislikedFound.length > 0) {
          cntUsersDislikedFound = usersDislikedFound.length
          usersDislikedFound.forEach(userDisliked => {
            let delIndex = userDisliked.dislikes.indexOf(currentTweetId)
            userDisliked.dislikes.splice(delIndex, 1)
            userDisliked.save()
          })
        }
        return resolve(cntUsersDislikedFound)
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('tweets/all')
      })
    })
    // I suppose here the error occurs!!!
    let removeUserStartedTweet = new Promise((resolve, reject) => {
      User
        .findOne({ startedTweets: currentTweetId })
        .then(user => {
          let delIndex = user.startedTweets.indexOf(currentTweetId)
          user.startedTweets.splice(delIndex, 1)
          user
          .save()
          .then(() => {
            return resolve('success')
          }).catch(err => {
            res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
            res.render('tweets/all')
          })
        }).catch(err => {
          res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
          res.render('tweets/all')
        })
    })

    removeUsersLikes
      .then(cntUsersLikedFound => {
        removeUsersDislikes
          .then(cntUsersDislikedFound => {
            removeUserStartedTweet
            .then(successMsg => {
              Tweet
               .findById(currentTweetId)
               .then(tweet => {
                 tweet.remove()
                   .then(() => {
                     res.redirect('/tweets/all')
                   }).catch(err => {
                     res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
                     res.render('tweets/all')
                   })
               }).catch(err => {
                 res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
                 res.render('tweets/all')
               })
            }).catch(err => {
              res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
              res.render('tweets/all')
            })
          }).catch(err => {
            res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
            res.render('tweets/all')
          })
      }).catch(err => {
        res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
        res.render('tweets/all')
      })
  }
}

    // WRONG query - fails when trying to execute removeUserStartedTweet
    // The wrong code below is intentionally leaved(unused of course) as part of the actual file.
    // Tweet
    //     .findById(currentTweetId)
    //     .then(tweet => {
    //       removeUsersLikes
    //       .then(cntUsersLikedFound => {
    //         removeUsersDislikes
    //         .then(cntUsersDislikedFound => {
    //           removeUserStartedTweet
    //           .then(success => {
    //             tweet.remove()
    //             .then(() => {
    //               res.redirect('/tweets/all')
    //             }).catch(err => {
    //               res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
    //               res.render('tweets/all')
    //             })
    //           }).catch(err => {
    //             res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
    //             res.render('tweets/all')
    //           })
    //         }).catch(err => {
    //           res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
    //           res.render('tweets/all')
    //         })
    //       }).catch(err => {
    //         res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
    //         res.render('tweets/all')
    //       })
    //     }).catch(err => {
    //       res.locals.globalError = err.errmsg ? err.message : errorHandler.handleMongooseError(err)
    //       res.render('tweets/all')
    //     })
