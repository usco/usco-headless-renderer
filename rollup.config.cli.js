import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-post-replace'

export default {
  entry: 'src/index.js',
  dest: 'dist/cli.js',
  format: 'cjs',
  moduleName: 'usco-headless-renderer',
  sourceMap: true,
  //preferBuiltins: false,
  external: [
  ],
  plugins: [
    buble(),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
    }),
    replace({
      //'../../package.json': '../package.json',// fix path issues
      "'use strict';": "#!/usr/bin/env node\n'use strict';"// add shebang at start of file
    })
  ]
}
