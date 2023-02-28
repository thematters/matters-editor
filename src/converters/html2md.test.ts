import { test, expect, describe } from 'vitest'
import { html2md } from './html2md'

describe('HTML to Markdown', async () => {
  test('emphasis', async () => {
    const md = (await html2md('<p><em>emphasis</em></p>')).trim()
    expect(md).toBe('*emphasis*')
  })
})
