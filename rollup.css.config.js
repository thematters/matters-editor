import postcss from 'rollup-plugin-postcss'

const inputDir = 'src/themes'

const outputDir = 'build/themes'

export default [
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
