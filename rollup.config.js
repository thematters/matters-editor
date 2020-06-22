import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import pkg from './package.json'

const mainDir = {
  input: 'src/index.ts',
}

const themeDir = {
  input: 'src/themes',
  output: 'dist/themes',
}

export default [
  {
    input: mainDir.input,
    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: pkg.name,
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    plugins: [
      commonjs({
        include: 'node_modules/**',
      }),
      external(),
      resolve(),
      typescript({
        clean: true,
      }),
    ],
  },
  {
    input: `${themeDir.input}/editor.css`,
    output: [
      {
        file: `${themeDir.output}/editor.min.css`,
        format: 'es',
      },
    ],
    plugins: [
      postcss({
        extract: true,
      }),
    ],
  },
  {
    input: `${themeDir.input}/quill.bubble.css`,
    output: [
      {
        file: `${themeDir.output}/quill.bubble.min.css`,
        format: 'es',
      },
    ],
    plugins: [
      postcss({
        extract: true,
      }),
    ],
  },
  {
    input: `${themeDir.input}/tippy.css`,
    output: [
      {
        file: `${themeDir.output}/tippy.min.css`,
        format: 'es',
      },
    ],
    plugins: [
      postcss({
        extract: true,
      }),
    ],
  },
]
