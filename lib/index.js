/* eslint promise/param-names: 0 */

import fs from 'fs-extra'
import path from 'path'
import mime from 'mime'
import glob from 'glob-all'

import * as log from './log'

import CONSTANTS from './constants'

const SRC_PATH_PATTERN = `**/?(${CONSTANTS.formats.sort().map((format) => `*.${format}`).join('|')})`

/*
 *  A Promise interface for reading a file from the file system to
 *  a Buffer instance (for binary data)
 */
const readFile = (filePath) => (
  new Promise((success, failure) => {
    fs.readFile(filePath, (e, buffer) => {
      if (e) return failure(e)
      success(buffer)
    })
  })
)

/*
 *  A Promise interface for writing a file to the file system
 */
const writeFile = (filePath, fileData) => (
  new Promise((success, failure) => {
    fs.writeFile(filePath, fileData, (e) => {
      if (e) return failure(e)
      success()
    })
  })
)

/*
 *  A Promise interface for ensuring a file path exists on the file system
 */
const ensureFile = (filePath) => (
  new Promise((success, failure) => {
    fs.ensureFile(filePath, (e) => {
      if (e) return failure(e)
      success()
    })
  })
)

function stat (P) {
  return new Promise((success, failure) => {
    fs.stat(P, (e, stat) => {
      if (!e) return success(stat)
      failure(e)
    })
  })
}

/*
 *  Read each file in a file path list to an object
 */
const mapFilePathListFromFS = (filePathList) => (
  Promise.all(
    filePathList.map(
      (filePath) => readFile(filePath)
        .then((fileData) => ({ filePath, fileData }))
      )
  )
)

/*
 *  Write each object in the file path list to a file
 */
const mapFilePathListToFS = (filePathList) => (
  Promise.all(
    filePathList.map(
      ({ filePath, fileData }) => ensureFile(filePath)
        .then(() => writeFile(filePath, fileData)
      )
    )
  )
)

const getStatError = (e, p) => (
  (e.code === 'ENOENT')
    ? `Path '${p}' does not exist.`
    : (p)
      ? `An error occurred on path ${p}: ${e.message}`
      : 'Path is not defined.'
)

const srcStat = (p) => {
  const { SRC_PATH } = p
  return stat(SRC_PATH)
    .then(() => p)
    .catch((e) => {
      throw Error(getStatError(e, SRC_PATH))
    })
}

const cssStat = (p) => {
  const { CSS_PATH } = p
  return stat(CSS_PATH)
    .then(() => p)
    .catch((e) => {
      throw Error(getStatError(e, CSS_PATH))
    })
}

function getFilePathList (filePath) {
  return new Promise((success, failure) => {
    glob(filePath, (e, filePathList) => {
      if (e) return failure(e)
      success(filePathList)
    })
  })
}

const mapSrcFilePathToCSSFilePath = (filePath, srcPath, cssPath) => filePath.replace(srcPath, cssPath)

const getFileNameFromFilePath = (filePath) => path.basename(filePath, path.extname(filePath))

const getFontMimeType = (filePath) => mime.lookup(filePath)

function getFontFormat (filePath) {
  const extension = path.extname(filePath).slice(1).toLowerCase()
  switch (extension) {
    case 'ttf':
      return 'truetype'
    case 'otf':
      return 'opentype'
    case 'eot':
      return 'embedded-opentype'
    default:
      return extension
  }
}

const url = (filePath, fileData) => `url(data:${getFontMimeType(filePath)};base64,${fileData.toString('base64')}) format('${getFontFormat(filePath)}')`
const createCSSFilePath = (filePath) => `${path.join(path.dirname(filePath), getFileNameFromFilePath(filePath))}.css`
const createCSSFileData = (fileName, list) => (`
@font-face {
  font-family: '${fileName}';
  src: ${list.map(({ filePath, fileData }) => url(filePath, fileData)).join(', ')};
}
`)

function createCSSFilePathListFromSrcFilePathList (srcFilePathList, srcPath, cssPath) {
  const cssFilePathList = []

  while (srcFilePathList.length) {
    /*
     *  Extract the first item from the 'srcFilePathList' collection
     */
    const srcFile = srcFilePathList.shift()

    /*
     *  Destructure its properties
     */
    const {
      filePath: srcFilePath /* ,
      fileData: srcFileData */
    } = srcFile

    /*
     *  The 'fileName' is the same, only the extension changes
     *  '/path/to/arial.ttf' matches '/path/to/arial.otf' as
     *  '/path/to/arial'
     */
    const fileName = getFileNameFromFilePath(srcFilePath)
    const filePath = path.join(path.dirname(srcFilePath), fileName)

    /*
     *  We're going to filter the 'srcFilePathList' collection to extract the other
     *  src files with the same 'fileName' and store them in an array
     */
    const list = srcFilePathList
      .filter(({ filePath: f }) => filePath === path.join(path.dirname(f), getFileNameFromFilePath(f))) /* 'filePath' is the property on the object in the array -- we're destructuring */

    /*
     *  We're going to remove those src files from the 'srcFilePathList' collection
     *  so that we don't process them again. This will also reduce the length of
     *  our array, and the number of loops we need to do
     */
    list.forEach(({ filePath }) => srcFilePathList.splice(srcFilePathList.findIndex(({ filePath: f }) => filePath === f), 1))

    /*
     *  Finally, we're going to put the first item we extracted from the
     *  'srcFilePathList' collection into the list we've just created
     *
     *  We could just as easily put it at the start of the current list with:
     *
     *    list.unshift(srcFile)
     *
     *  Or else we could put it at the end of the current list with:
     *
     *    list.push(srcFile)
     *
     *  For some reason I decided to create another array and use '[].concat(list)'
     */
    const last = [
      srcFile
    ].concat(list)

    const cssFilePath = createCSSFilePath(mapSrcFilePathToCSSFilePath(srcFilePath, srcPath, cssPath))
    const cssFileData = createCSSFileData(fileName, last)

    const cssFile = {
      filePath: cssFilePath,
      fileData: cssFileData
    }

    cssFilePathList.push(cssFile)
  }

  return cssFilePathList
}

export const run = (SRC_PATH, CSS_PATH) => (
  Promise.resolve({ SRC_PATH, CSS_PATH })
    .then(srcStat)
    .then(cssStat)
    .then(() => path.join(SRC_PATH, SRC_PATH_PATTERN))
    .then(getFilePathList)
    .then(mapFilePathListFromFS)
    .then((filePathList) => createCSSFilePathListFromSrcFilePathList(filePathList, SRC_PATH, CSS_PATH))
    .then(mapFilePathListToFS)
    .catch((e) => {
      log.decorateError(e)
      process.exit(1)
    })
)

export const runCmd = (SILENT, SRC_PATH, CSS_PATH) => (
  (SILENT)
    ? run(SRC_PATH, CSS_PATH)
    : Promise.resolve({ SRC_PATH, CSS_PATH })
      .then(srcStat)
      .then(cssStat)
      .then(() => {
        log.decorateSrcPath(SRC_PATH)
        log.decorateCSSPath(CSS_PATH)
      })
      .then(() => path.join(SRC_PATH, SRC_PATH_PATTERN))
      .then(getFilePathList)
      .then((filePathList) => {
        log.decorateSrcFilePathList(filePathList)
        return filePathList
      })
      .then(mapFilePathListFromFS)
      .then((filePathList) => createCSSFilePathListFromSrcFilePathList(filePathList, SRC_PATH, CSS_PATH))
      .then((filePathList) => {
        log.decorateCSSFilePathList(filePathList)
        return filePathList
      })
      .then(mapFilePathListToFS)
      .catch((e) => {
        log.decorateError(e)
        process.exit(1)
      })
)
