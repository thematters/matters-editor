import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import generatePackageJson from 'rollup-plugin-generate-package-json'

const packageJson = require('./package.json')
const sourcemap = true
const external = [...Object.keys(packageJson.peerDependencies), /@tiptap\/*/]
const plugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: './tsconfig.json' }),
  terser(),
]

export default [
  // main
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap,
        name: packageJson.name,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap,
      },
    ],
    plugins,
    external,
  },
  // editors
  {
    input: 'src/editors/index.ts',
    output: [
      {
        file: 'dist/editors/index.cjs',
        format: 'cjs',
        sourcemap,
      },
      {
        file: 'dist/editors/index.esm.js',
        format: 'esm',
        sourcemap,
      },
    ],
    plugins: [
      ...plugins,
      generatePackageJson({
        baseContents: {
          name: `${packageJson.name}/editors`,
          private: true,
          main: '../index.cjs',
          module: './index.esm.js',
          types: './types/src/editors/index.d.ts',
        },
      }),
    ],
    external,
  },
  // transformers
  {
    input: 'src/transformers/index.ts',
    output: [
      {
        file: 'dist/transformers/index.cjs',
        format: 'cjs',
        sourcemap,
      },
      {
        file: 'dist/transformers/index.esm.js',
        format: 'esm',
        sourcemap,
      },
    ],
    plugins: [
      ...plugins,
      generatePackageJson({
        baseContents: {
          name: `${packageJson.name}/transformers`,
          private: true,
          main: '../index.cjs',
          module: './index.esm.js',
          types: './types/src/transformers/index.d.ts',
        },
      }),
    ],
    external,
  },
  // types
  {
    input: 'dist/types/src/index.d.ts',
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [dts.default()],
  },
]
