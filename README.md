# Make Face

Convert font files to CSS `@font-face {}` declarations with data embedded in `Base64`.

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
var makeFace = require('make-face');

var srcPath = './src/file/path';
var cssPath = './css/file/path';

makeFace(srcPath, cssPath)
	.then(() => console.log('Done'));
```

## Import using ES6
```
import makeFace from 'make-face'

const srcPath = './src/file/path'
const cssPath = './css/file/path'

makeFace(srcPath, cssPath)
	.then(() => console.log('Done'))
```