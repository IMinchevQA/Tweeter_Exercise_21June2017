module.exports = {
  custIf: (a, op, b, options) => {
    if (op === '==' && a == b) { return options.fn(this) }
    if (op === '===' && a.toString() === b.toString()) { return options.fn(this) }
    if (op === '>' && a > b) { return options.fn(this) }
    if (op === '<' && a < b) { return options.fn(this) }
    return options.inverse(this)
  },
  hasLiked: (user, tweetId, options) => {
    if (user.likes.indexOf(tweetId) === -1) {
      return options.inverse(this)
    }
    return options.fn(this)
    // console.log(options.inverse(this))
    // let a = options.inverse(this)
    // console.log('debug')
  }
}
