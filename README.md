# Make Face

Convert `otf`, `ttf`, `eot`, `svg` or `woff` font files to CSS `@font-face {}` declarations with data embedded in `Base64`.

Always:
```
npm install
```

## Run from the command line

```
node make-face -s ./src/file/path -c ./css/file/path
```
* To run without logging, use the `--silent` option

## Import using RequireJS

```
var makeFace = require('make-face').makeFace;

var srcPath = './src/file/path';
var cssPath = './css/file/path';

makeFace(srcPath, cssPath)
  .then(() => console.log('Done'));
```

## Import using ES6
```
import { makeFace } from 'make-face'

const srcPath = './src/file/path'
const cssPath = './css/file/path'

makeFace(srcPath, cssPath)
  .then(() => console.log('Done'))
```

## Read Face

Read `css` files from the file system. Each key is the CSS file path, and each value is the file data, as a string.

### Using RequireJS

```
var readFace = require('make-face').readFace;

var path = './css/file/path';

readFace(path)
  .then((data) => console.log(data));
```

### Using ES6
```
import { readFace } from 'make-face'

const path = './css/file/path'

readFace(path)
  .then((data) => console.log(data))
```