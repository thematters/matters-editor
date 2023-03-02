import fs from 'fs'
import path from 'path'

import { md2html, html2md } from '../src'

const originalDir = path.resolve('./examples/original')
const markdownDir = path.resolve('./examples/markdown')
const htmlDir = path.resolve('./examples/html')

;(async () => {
  // Original HTML to Markdown
  const htmls = {
    500: fs.readFileSync(path.resolve(originalDir, '500.html'), 'utf-8'),
    1500: fs.readFileSync(path.resolve(originalDir, '1500.html'), 'utf-8'),
    2600: fs.readFileSync(path.resolve(originalDir, '2600.html'), 'utf-8'),
    10000: fs.readFileSync(path.resolve(originalDir, '10000.html'), 'utf-8'),
    16000: fs.readFileSync(path.resolve(originalDir, '16000.html'), 'utf-8'),
    38000: fs.readFileSync(path.resolve(originalDir, '38000.html'), 'utf-8'),
  }
  fs.writeFileSync(
    path.resolve(markdownDir, '500.md'),
    await html2md(htmls[500]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(markdownDir, '1500.md'),
    await html2md(htmls[1500]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(markdownDir, '2600.md'),
    await html2md(htmls[2600]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(markdownDir, '10000.md'),
    await html2md(htmls[10000]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(markdownDir, '16000.md'),
    await html2md(htmls[16000]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(markdownDir, '38000.md'),
    await html2md(htmls[38000]),
    'utf-8'
  )

  // Markdown to HTML
  const mds = {
    500: fs.readFileSync(path.resolve(markdownDir, '500.md'), 'utf-8'),
    1500: fs.readFileSync(path.resolve(markdownDir, '1500.md'), 'utf-8'),
    2600: fs.readFileSync(path.resolve(markdownDir, '2600.md'), 'utf-8'),
    10000: fs.readFileSync(path.resolve(markdownDir, '10000.md'), 'utf-8'),
    16000: fs.readFileSync(path.resolve(markdownDir, '16000.md'), 'utf-8'),
    38000: fs.readFileSync(path.resolve(markdownDir, '38000.md'), 'utf-8'),
  }
  fs.writeFileSync(
    path.resolve(htmlDir, '500.html'),
    await md2html(mds[500]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(htmlDir, '1500.html'),
    await md2html(mds[1500]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(htmlDir, '2600.html'),
    await md2html(mds[2600]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(htmlDir, '10000.html'),
    await md2html(mds[10000]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(htmlDir, '16000.html'),
    await md2html(mds[16000]),
    'utf-8'
  )
  fs.writeFileSync(
    path.resolve(htmlDir, '38000.html'),
    await md2html(mds[38000]),
    'utf-8'
  )
})()
