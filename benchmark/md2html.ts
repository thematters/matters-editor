import { suite, add, cycle, complete, save } from 'benny'
import fs from 'fs'
import path from 'path'

import { md2html } from '../src'

const markdownDir = path.resolve('./examples/markdown')
const htmlDir = path.resolve('./examples/html')
const mds = {
  500: fs.readFileSync(path.resolve(markdownDir, '500.md'), 'utf-8'),
  1500: fs.readFileSync(path.resolve(markdownDir, '1500.md'), 'utf-8'),
  2600: fs.readFileSync(path.resolve(markdownDir, '2600.md'), 'utf-8'),
  10000: fs.readFileSync(path.resolve(markdownDir, '10000.md'), 'utf-8'),
  16000: fs.readFileSync(path.resolve(markdownDir, '16000.md'), 'utf-8'),
  38000: fs.readFileSync(path.resolve(markdownDir, '38000.md'), 'utf-8'),
}

suite(
  'Markdown to HTML',

  add('~500 characters', async () => {
    await md2html(mds[500])
  }),

  add('~1500 characters', async () => {
    await md2html(mds[1500])
  }),

  add('~2600 characters', async () => {
    await md2html(mds[2600])
  }),

  add('~10000 characters', async () => {
    await md2html(mds[10000])
  }),

  add('~16000 characters', async () => {
    await md2html(mds[16000])
  }),

  add('~38000 characters', async () => {
    await md2html(mds[38000])
  }),

  cycle(),
  complete(),
  save({ file: 'md2html' }),
  save({ file: 'md2html', format: 'chart.html' })
)
