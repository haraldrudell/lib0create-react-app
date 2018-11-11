/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.

builds bin/preplib from src/preplib.js
*/
import { eslint } from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'

import path from 'path'

import { readPackageJson, getExternal, formats, mergeRollups } from './rollup/letsroll'
import chmod from './rollup/rollupChmodPlugin'
import shebang from './rollup/rollupShebangPlugin'

// get path constants
const {/* TODO main, module, */dependencies} = readPackageJson({strings: {main: 'ext', module: 'ext', dependencies: 1}})
const external = getExternal({dependencies})
const dirs = {
  project: path.resolve(),
}
Object.assign(dirs, {
  src: path.join(dirs.project, 'src'),
  bin: path.join(dirs.project, 'bin'),
})
Object.assign(dirs, {
  srcIndex: path.join(dirs.src, 'index.js'),
  srcPreplib: path.join(dirs.src, 'preplib.js'),
  binPreplib: path.join(dirs.bin, 'preplib'),
})

const rollupConfigJs = getRollupConfig()

export default [{
  input: dirs.srcPreplib,
  output: {file: dirs.binPreplib, format: formats.cjs.format},
  plugins: [shebang(), chmod()],
},/* TODO {
  input: dirs.srcIndex,
  output: {file: main, format: formats.cjs.format},
},{
  input: dirs.srcIndex,
  output: {file: module, format: formats.esm.format},
}*/].map(o => mergeRollups(rollupConfigJs, o))

function getRollupConfig() {
  const includeExclude = {
    include: ['**/*.js', '**/*.mjs'],
    exclude: 'node_modules/**',
  }

  return {
    external,
    plugins: [
      eslint(includeExclude),
      resolve({extensions: ['.mjs', '.js', '.json']}),
      json(),
      babel({
        ...includeExclude,
        plugins: ['@babel/plugin-proposal-class-properties'/*classProperties(),*/],
      }),
      commonjs(),
    ],
  }
}
