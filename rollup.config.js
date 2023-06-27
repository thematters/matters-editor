import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'

const packageJson = require('../package.json')
const sourcemap = false

const plugins = [
  commonjs(),
  resolve({ browser: true }),
  typescript({ tsconfig: './tsconfig.json' }),
  // terser(),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
]

export default [
  // main
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'demo/dist/index.umd.js',
        format: 'umd',
        name: packageJson.name,
        sourcemap,
      },
    ],
    plugins,
  },
]
