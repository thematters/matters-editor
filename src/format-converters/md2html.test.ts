import { test, expect, describe } from 'vitest'
import { md2html } from './md2html'

describe('Markdown to HTML', async () => {
  test('emphasis', async () => {
    const html = (await md2html('*emphasis*')).trim()
    expect(html).toBe('<p><em>emphasis</em></p>')
  })
})
