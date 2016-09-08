require('babel-register')({ ignore: /!(make-face\/lib)/ })

const lib = require('./lib')

module.exports = {
  makeFace: lib.makeFace,
  readFace: lib.readFace
}

