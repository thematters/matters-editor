import { suite, add, cycle, complete, save } from 'benny'
import fs from 'fs'
import path from 'path'

import { html2md } from '../src'

const originalDir = path.resolve('./examples/original')
const htmls = {
  500: fs.readFileSync(path.resolve(originalDir, '500.html'), 'utf-8'),
  1500: fs.readFileSync(path.resolve(originalDir, '1500.html'), 'utf-8'),
  2600: fs.readFileSync(path.resolve(originalDir, '2600.html'), 'utf-8'),
  10000: fs.readFileSync(path.resolve(originalDir, '10000.html'), 'utf-8'),
  16000: fs.readFileSync(path.resolve(originalDir, '16000.html'), 'utf-8'),
  38000: fs.readFileSync(path.resolve(originalDir, '38000.html'), 'utf-8'),
}

suite(
  'HTML to Markdown',

  add('~500 characters', async () => {
    await html2md(htmls[500])
  }),

  add('~1500 characters', async () => {
    await html2md(htmls[1500])
  }),

  add('~2600 characters', async () => {
    await html2md(htmls[2600])
  }),

  add('~10000 characters', async () => {
    await html2md(htmls[10000])
  }),

  add('~16000 characters', async () => {
    await html2md(htmls[16000])
  }),

  add('~38000 characters', async () => {
    await html2md(htmls[38000])
  }),

  cycle(),
  complete(),
  save({ file: 'html2md' }),
  save({ file: 'html2md', format: 'chart.html' })
)
