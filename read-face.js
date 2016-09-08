#!/usr/bin/env node

require('babel-register')({ ignore: /!(make-face\/lib)/ })

const fs = require('fs')
/*
http://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
*/
const commander = require('commander')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const lib = require('./lib')

commander
  .version(pkg.version)
  .option('-p, --path <path>', 'The location from which to read CSS files')
  .option('-f, --file <file>', 'The file to which to write the object')
  .option('--silent', 'Silent running')
  .parse(process.argv)

/*
 *	TODO:
 *	maxBuffer!
 */
lib.readFaceFromCMD(commander.silent, commander.path, commander.file)
  .then(() => process.exit())
