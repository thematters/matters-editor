import { suite, add, cycle, complete, save } from 'benny'
import fs from 'fs'
import path from 'path'
import naturalCompare from 'natural-compare-lite'

import { md2html } from '../src'

const markdownDir = path.resolve('./examples/markdown')

const mds: { [key: string]: any } = {}
const adds: any[] = []

const filenames = fs
  .readdirSync(markdownDir, { encoding: 'utf-8' })
  .sort(naturalCompare)

for (let filename of filenames) {
  const md = fs.readFileSync(path.resolve(markdownDir, filename), 'utf-8')
  mds[filename] = md
  adds.push(
    add(`~${filename.split('.')[0]} characters`, async () => {
      md2html(mds[filename])
    })
  )
}

suite(
  'Markdown to HTML',
  ...adds,
  cycle(),
  complete(() => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024
    console.log(
      `\nThe script uses approximately ${Math.round(used * 100) / 100} MB`
    )
  }),
  save({ file: 'md2html' }),
  save({ file: 'md2html', format: 'chart.html' })
)
