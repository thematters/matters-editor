import fs from 'fs'
import path from 'path'

import { md2html, html2md } from '../src'

const originalDir = path.resolve('./examples/original')
const markdownDir = path.resolve('./examples/markdown')
const htmlDir = path.resolve('./examples/html')

;(async () => {
  // Original HTML to Markdown
  const originals = fs.readdirSync(originalDir, { encoding: 'utf-8' })
  for (let filename of originals) {
    const html = fs.readFileSync(path.resolve(originalDir, filename), 'utf-8')
    fs.writeFileSync(
      path.resolve(markdownDir, filename.replace('.html', '.md')),
      html2md(html),
      'utf-8'
    )
  }

  // Markdown to HTML
  const mds = fs.readdirSync(markdownDir, { encoding: 'utf-8' })
  for (let filename of mds) {
    const md = fs.readFileSync(path.resolve(markdownDir, filename), 'utf-8')
    fs.writeFileSync(
      path.resolve(htmlDir, filename.replace('.md', '.html')),
      md2html(md),
      'utf-8'
    )
  }
})()
