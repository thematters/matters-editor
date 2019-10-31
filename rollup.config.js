import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

const inputDir = 'src/themes'

const outputDir = 'build/themes'

export default [
  {
    input: "src/index.ts",
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
  },
  {
    input: `${inputDir}/editor.css`,
    output: [
      {
        file: `${outputDir}/editor.min.css`,
        format: 'es'
      },
    ],
    plugins: [
      postcss({ extract: true })
    ]
  },
  {
    input: `${inputDir}/quill.bubble.css`,
    output: [
      {
        file: `${outputDir}/quill.bubble.min.css`,
        format: 'es'
      },
    ],
    plugins: [
      postcss({ extract: true })
    ]
  },
  {
    input: `${inputDir}/tippy.css`,
    output: [
      {
        file: `${outputDir}/tippy.min.css`,
        format: 'es'
      },
    ],
    plugins: [
      postcss({ extract: true })
    ]
  }
]
