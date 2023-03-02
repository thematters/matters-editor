import { suite, add, cycle, complete, save } from 'benny'
import fs from 'fs'
import path from 'path'
import naturalCompare from 'natural-compare-lite'

import { html2md } from '../src'

const originalDir = path.resolve('./examples/original')

const htmls: { [key: string]: any } = {}
const adds: any[] = []

const filenames = fs
  .readdirSync(originalDir, { encoding: 'utf-8' })
  .sort(naturalCompare)

for (let filename of filenames) {
  const html = fs.readFileSync(path.resolve(originalDir, filename), 'utf-8')
  htmls[filename] = html
  adds.push(
    add(`~${filename.split('.')[0]} characters`, async () => {
      await html2md(htmls[filename])
    })
  )
}

suite(
  'HTML to Markdown',
  ...adds,
  cycle(),
  complete(),
  save({ file: 'html2md' }),
  save({ file: 'html2md', format: 'chart.html' })
)
