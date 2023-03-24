import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import generatePackageJson from 'rollup-plugin-generate-package-json'

const packageJson = require('./package.json')
const sourcemap = false
const cjsExternal = [...Object.keys(packageJson.peerDependencies)]
const esmExternal = [
  ...Object.keys(packageJson.peerDependencies),
  /@tiptap\/.*/,
]
const plugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: './tsconfig.json' }),
  terser(),
]

const makeGeneratePackageJson = (name) => {
  return generatePackageJson({
    baseContents: {
      name: `${packageJson.name}/${name}`,
      private: true,
      main: './index.cjs',
      module: './index.esm.js',
      types: `./types/src/${name}/index.d.ts`,
    },
  })
}

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
    ],
    plugins,
    external: cjsExternal,
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap,
      },
    ],
    plugins,
    external: esmExternal,
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
    ],
    plugins: [...plugins, makeGeneratePackageJson('editors')],
    external: cjsExternal,
  },
  {
    input: 'src/editors/index.ts',
    output: [
      {
        file: 'dist/editors/index.esm.js',
        format: 'esm',
        sourcemap,
      },
    ],
    plugins: [...plugins, makeGeneratePackageJson('editors')],
    external: esmExternal,
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
    ],
    plugins: [...plugins, makeGeneratePackageJson('transformers')],
    external: cjsExternal,
  },
  {
    input: 'src/transformers/index.ts',
    output: [
      {
        file: 'dist/transformers/index.esm.js',
        format: 'esm',
        sourcemap,
      },
    ],
    plugins: [...plugins, makeGeneratePackageJson('transformers')],
    external: esmExternal,
  },
  // types
  {
    input: 'dist/types/src/index.d.ts',
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [dts.default()],
  },
]
