import { stripIndent } from 'common-tags'
import rehypeFormat from 'rehype-format'
import rehypeParse from 'rehype-parse'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'

import { normalizeArticleHTML } from './normalize'
import { rehypeParseOptions, rehypeStringifyOptions } from './options'
import { sanitizeHTML } from './sanitize'

const formatter = unified()
  .use(rehypeParse, rehypeParseOptions)
  .use(rehypeRaw)
  .use(rehypeFormat)
  .use(rehypeStringify, rehypeStringifyOptions)

const formatHTML = (html: string): string => {
  const result = formatter.processSync(html)
  return String(result)
}

const expectProcessArticleHTML = (input: string, output: string) => {
  const result = normalizeArticleHTML(sanitizeHTML(input))
  expect(formatHTML(result).trim()).toBe(output)
}

// const expectProcessCommentHTML = (input: string, output: string) => {
//   const result = normalizeCommentHTML(sanitizeHTML(input))
//   expect(formatHTML(result).trim()).toBe(output)
// }

describe('Sanitize and normalize article', () => {
  test('squeeze empty paragraphys', () => {
    expectProcessArticleHTML(
      stripIndent`
        <p>abc</p>
        <p></p>
        <p></p>
        abc
        <p></p>
        <p>abc</p>
        <p></p>
        <p></p>
        <p></p>
        <p>abc</p>
        <p></p>
        <p><br></p>
        <p><br/></p>
        <p><br></br></p>
        <p><br/><br/><br/></p>
        <p></p>
      `,
      stripIndent`
        <p>abc</p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
        <p>abc</p>
        <p><br class="smart"></p>
        <p>abc</p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
        <p>abc</p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
      `,
    )
  })
})

// describe('Sanitize and normalize comment', () => {})
