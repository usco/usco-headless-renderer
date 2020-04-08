import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-post-replace'

export default {
  entry: 'src/index.js',
  dest: 'dist/cli.js',
  format: 'cjs',
  moduleName: 'usco-headless-renderer',
  sourceMap: 'inline',
  external: [],
  plugins: [
    buble(),
    nodeResolve({
      jsnext: true,
      main: true,
      preferBuiltins: true,
      skip: ['htmlparser2', 'entities', 'cheerio']
    }),
    commonjs({
      namedExports: {
        'node_modules/gl-vec3/index.js': ['vec3', 'squaredDistance'] // not sure why these do not get picked up
      }
    })
    /* replace({
      "'use strict';": "#!/usr/bin/env node\n'use strict';" // add shebang at start of file
    }) */
  ]
}
