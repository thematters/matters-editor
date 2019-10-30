import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'es'
    }
  ],
  plugins: [
    commonjs({ include: 'node_modules/**'}),
    external(),
    resolve(),
    typescript({ clean: true })
  ]
}
