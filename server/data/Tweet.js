const mongoose = require('mongoose')
const SCHEMA = mongoose.Schema
const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required!'

let tweetSchema = new SCHEMA({
  title: { type: SCHEMA.Types.String, required: REQUIRED_VALIDATION_MESSAGE },
  message: { type: SCHEMA.Types.String, required: REQUIRED_VALIDATION_MESSAGE, maxlength: 140 },
  date: { type: Date, default: Date.now },
  creator: { type: SCHEMA.ObjectId, ref: 'User' },
  views: { type: SCHEMA.Types.Number, default: 0 },
  likes: { type: SCHEMA.Types.Number, default: 0 },
  dislikes: { type: SCHEMA.Types.Number, default: 0 },
  hashTags: [{ type: SCHEMA.Types.String }]
})

let Tweet = mongoose.model('Tweet', tweetSchema)

module.exports = Tweet


// const mongoose = require('mongoose')
// const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required!'
// const ObjectId = mongoose.Schema.Types.ObjectId
//
// let tweetSchema = new mongoose.Schema({
//   title: { type: String, required: REQUIRED_VALIDATION_MESSAGE },
//   message: { type: String, required: REQUIRED_VALIDATION_MESSAGE, maxlength: 140 },
//   date: { type: Date, default: Date.now },
//   creator: {type: ObjectId, ref: 'User'},
//   views: {type: Number, default: 0},
//   likes: {type: Number, default: 0},
//   dislikes: {type: Number, default: 0},
//   createdOn: {type: Date, default: Date.now},
//   hashTags: [String],
// })
//
// let Tweet = mongoose.model('Tweet', tweetSchema)
// module.exports = Tweet


