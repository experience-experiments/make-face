require('babel-register')({})

const commander = require('commander')
/*
http://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
*/
const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'))
const run = require('./lib').run

commander
  .version(pkg.version)
  .option('-s, --src_path <src_path>', 'The location from which to read font files')
  .option('-c, --css_path <css_path>', 'The location at which to write CSS files')
  .parse(process.argv)

run(commander.src_path, commander.css_path)
  .then(() => process.exit())

module.exports = run
