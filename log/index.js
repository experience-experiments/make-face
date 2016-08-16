
import path from 'path'
import chalk from 'chalk'

import CONSTANTS from '../constants'

const pad = (i = 0) => {
  const n = (i < 10) ? 3 : (i < 100) ? 2 : (i < 1000) ? 1 : 0
  return String.fromCharCode(32).repeat(n)
}

export function decorateError (message) {
  const s =
    chalk.red('ERROR\t') +
    chalk.white(message)
  console.error(s)
}

export function decorateSrcPath (srcPath) {
  const s =
    chalk.gray('FROM\t') +
    chalk.white(srcPath)
  console.log(s)
}

export function decorateCSSPath (cssPath) {
  const s =
    chalk.gray('TO\t') +
    chalk.white(cssPath)
  console.log(s)
}

export function decorateSrcFilePathList (filePathList) {
  CONSTANTS.formats.sort()
  .forEach((ext) => {
    const list = filePathList
      .filter((filePath) => path.extname(filePath).slice(1).toLowerCase() === ext)
    const i = list.length
    if (i) {
      const s = pad() +
        chalk.magenta('READING') +
        chalk.gray(' [') +
        pad(i) +
        chalk.white(i) +
        chalk.gray('] ') +
        chalk.gray(ext)
      console.log(s)
    }
  })
}

export function decorateCSSFilePathList (filePathList) {
  const i = filePathList.length
  if (i) {
    const s = pad() +
      chalk.green('WRITING') +
      chalk.gray(' [') +
      pad(i) +
      chalk.white(i) +
      chalk.gray('] css')
    console.log(s)
  }
}
