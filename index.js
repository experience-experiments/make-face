require('babel-register')({})

const fs = require('fs')
/*
http://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
*/
const commander = require('commander')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const lib = require('./lib')

commander
  .version(pkg.version)
  .option('-s, --src_path <src_path>', 'The location from which to read font files')
  .option('-c, --css_path <css_path>', 'The location at which to write CSS files')
  .option('--silent', 'Silent running')
  .parse(process.argv)

lib.runCmd(commander.silent, commander.src_path, commander.css_path)
  .then(() => process.exit())

module.exports = lib.run
