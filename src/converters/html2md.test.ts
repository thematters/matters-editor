import { test, expect, describe } from 'vitest'
import { html2md } from './html2md'

describe('HTML to Markdown', async () => {
  test('heading #1', async () => {
    const md = (await html2md('<h1>Heading level 1</h1>')).trim()
    expect(md).toBe('# Heading level 1')
  })

  test('heading #2', async () => {
    const md = (await html2md('<h2>Heading level 2</h2>')).trim()
    expect(md).toBe('## Heading level 2')
  })

  test('heading #3', async () => {
    const md = (await html2md('<h3>Heading level 3</h3>')).trim()
    expect(md).toBe('### Heading level 3')
  })

  test('heading #4', async () => {
    const md = (await html2md('<h4>Heading level 4</h4>')).trim()
    expect(md).toBe('#### Heading level 4')
  })

  test('heading #5', async () => {
    const md = (await html2md('<h5>Heading level 5</h5>')).trim()
    expect(md).toBe('##### Heading level 5')
  })

  test('heading #6', async () => {
    const md = (await html2md('<h6>Heading level 6</h6>')).trim()
    expect(md).toBe('###### Heading level 6')
  })

  test('italic', async () => {
    const md = (await html2md('<em>italic</em>')).trim()
    expect(md).toBe('*italic*')
  })

  test('bold', async () => {
    const md = (await html2md('<strong>bold</strong>')).trim()
    expect(md).toBe('**bold**')
  })

  test('bold & italic', async () => {
    // <em><strong>
    const md1 = (
      await html2md('This text is <em><strong>really important</strong></em>.')
    ).trim()
    expect(md1).toBe('This text is ***really important***.')

    // <strong><em>
    const md2 = (
      await html2md('This text is <strong><em>really important</em></strong>.')
    ).trim()
    expect(md2).toBe('This text is ***really important***.')
  })

  test('code', async () => {
    const md1 = (
      await html2md('At the command prompt, type <code>nano</code>.')
    ).trim()
    expect(md1).toBe('At the command prompt, type `nano`.')

    const md2 = (
      await html2md('<code>Use `code` in your Markdown file.</code>')
    ).trim()
    expect(md2).toBe('``Use `code` in your Markdown file.``')
  })

  test('code blocks', async () => {
    const md1 = (
      await html2md(`
      <pre>
        <code>
          &lt;html&gt;
          &lt;head&gt;
          &lt;/head&gt;
          &lt;/html&gt;
        </code>
      </pre>
      `)
    ).replace(/\s/g, '')
    expect(md1).toBe('```<html><head></head></html>```')

    const md2 = (
      await html2md(`
      <pre>
        &lt;html&gt;
        &lt;head&gt;
        &lt;/head&gt;
        &lt;/html&gt;
      </pre>
      `)
    ).replace(/\s/g, '')
    expect(md2).toBe('```<html><head></head></html>```')
  })

  test('line breaks', async () => {
    const md = (await html2md('line<br/>breaks')).trim().replace('\\\n', ',')
    expect(md).toBe('line,breaks')
  })

  test('horizontal rules', async () => {
    const md = (await html2md('<hr/>')).trim()
    expect(md).toBe('***')
  })

  test('blockquote', async () => {
    const md = (
      await html2md(`
      <blockquote>
        <p>Dorothy followed her through many of the beautiful rooms in her castle.</p>
      </blockquote>
      `)
    ).trim()
    expect(md).toBe(
      '> Dorothy followed her through many of the beautiful rooms in her castle.'
    )
  })

  test('ordered list', async () => {
    const md = (
      await html2md(`
      <ol>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
        <li>Fourth item</li>
      </ol>`)
    ).trim()
    expect(md).toBe(`1.  First item
2.  Second item
3.  Third item
4.  Fourth item`)
  })

  test('neseted ordered list', async () => {
    const md = (
      await html2md(`
      <ol>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item
          <ol>
            <li>Indented item</li>
            <li>Indented item</li>
          </ol>
        </li>
        <li>Fourth item</li>
      </ol>
      `)
    ).trim()
    expect(md).toBe(`1.  First item

2.  Second item

3.  Third item

    1.  Indented item
    2.  Indented item

4.  Fourth item`)
  })

  test('unordered list', async () => {
    const md = (
      await html2md(`
      <ul>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
        <li>Fourth item</li>
      </ul>`)
    ).trim()
    expect(md).toBe(`*   First item
*   Second item
*   Third item
*   Fourth item`)
  })

  test('nested unordered list', async () => {
    const md = (
      await html2md(`
      <ul>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item
          <ul>
            <li>Indented item</li>
            <li>Indented item</li>
          </ul>
        </li>
        <li>Fourth item</li>
      </ul>
      `)
    ).trim()
    expect(md).toBe(`*   First item

*   Second item

*   Third item

    *   Indented item
    *   Indented item

*   Fourth item`)
  })

  test('links', async () => {
    const md = (
      await html2md(`
      <p>My favorite search engine is <a href="https://duckduckgo.com" target="_blank" rel="noopener noreferrer nofollow">Duck Duck Go</a>.</p>
      `)
    ).trim()
    expect(md).toBe(
      'My favorite search engine is [Duck Duck Go](https://duckduckgo.com).'
    )
  })
})
