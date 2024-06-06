import { stripIndent } from 'common-tags'
import rehypeFormat from 'rehype-format'
import rehypeParse from 'rehype-parse'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'

import { normalizeArticleHTML, normalizeCommentHTML } from './normalize'
import { rehypeParseOptions, rehypeStringifyOptions } from './options'
import { sanitizeHTML, type SanitizeHTMLOptions } from './sanitize'

const formatter = unified()
  .use(rehypeParse, rehypeParseOptions)
  .use(rehypeRaw)
  .use(rehypeFormat)
  .use(rehypeStringify, rehypeStringifyOptions)

const formatHTML = (html: string): string => {
  const result = formatter.processSync(html)
  return String(result)
}

const expectProcessArticleHTML = (
  input: string,
  output: string,
  options?: SanitizeHTMLOptions,
) => {
  const result = normalizeArticleHTML(sanitizeHTML(input, options))
  expect(formatHTML(result).trim()).toBe(output)
}

const expectProcessCommentHTML = (
  input: string,
  output: string,
  options?: SanitizeHTMLOptions,
) => {
  const result = normalizeCommentHTML(sanitizeHTML(input, options))
  expect(formatHTML(result).trim()).toBe(output)
}

describe('Sanitize and normalize article', () => {
  test('squeeze empty paragraphs', () => {
    expectProcessArticleHTML(
      stripIndent`
        <p>1</p>
        <p></p>
        <p>2</p>
        <p></p>
        <p></p>
        <p>3</p>
      `,
      stripIndent`
        <p>1</p>
        <p>2</p>
        <p>3</p>
      `,
      { maxHardBreaks: 0 },
    )

    expectProcessArticleHTML(
      stripIndent`
        <p>1</p>
        <p>2</p>
        <p></p>
        <p>3</p>
      `,
      stripIndent`
        <p>1</p>
        <p>2</p>
        <p><br class="smart"></p>
        <p>3</p>
      `,
      { maxHardBreaks: 1 },
    )

    expectProcessArticleHTML(
      stripIndent`
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p></p>
          <p>3</p>
        </blockquote>
      `,
      stripIndent`
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p><br class="smart"></p>
          <p>3</p>
        </blockquote>
      `,
      { maxHardBreaks: 1 },
    )

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
      { maxHardBreaks: 2 },
    )
  })

  test('squeeze and retain all empty paragraphs', () => {
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
        <p><br class="smart"></p>
        <p>abc</p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
      `,
      { maxHardBreaks: -1 },
    )
  })
})

describe('Sanitize and normalize comment', () => {
  test('skip squeezing empty paragraphs', () => {
    expectProcessCommentHTML(
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
        <p><br/><br/><br/></p>
        <p></p>
      `,
      stripIndent`
        <p>abc</p>
        <p></p>
        <p></p>
        <p>abc</p>
        <p></p>
        <p>abc</p>
        <p></p>
        <p></p>
        <p></p>
        <p>abc</p>
        <p></p>
        <p><br class="smart"></p>
        <p><br class="smart"></p>
        <p><br class="smart"><br class="smart"><br class="smart"></p>
        <p></p>
      `,
    )
  })

  test('squeeze <br>', () => {
    expectProcessCommentHTML(
      stripIndent`
        <p>1</p>
        <p>2</p>
        <p>1<br>2</p>
        <p>1<br><br>2</p>
        <p>1<br><br></p>
      `,
      stripIndent`
        <p>1</p>
        <p>2</p>
        <p>12</p>
        <p>12</p>
        <p>1</p>
      `,
      { maxHardBreaks: 0, maxSoftBreaks: 0 },
    )

    // max 1 soft break
    expectProcessCommentHTML(
      stripIndent`
        <p>1</p>
        <p>2</p>
        <p>1<br>2</p>
        <p>1<br><br>2</p>
        <p>1<br><br></p>
      `,
      stripIndent`
        <p>1</p>
        <p>2</p>
        <p>1<br class="smart">2</p>
        <p>1<br class="smart">2</p>
        <p>1<br class="smart"></p>
      `,
      { maxHardBreaks: 0, maxSoftBreaks: 1 },
    )

    // blockquote
    expectProcessCommentHTML(
      stripIndent`
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p>1<br>2</p>
          <p>1<br><br>2</p>
          <p>1<br><br></p>
        </blockquote>
      `,
      stripIndent`
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p>12</p>
          <p>12</p>
          <p>1</p>
        </blockquote>
      `,
      { maxHardBreaks: 0, maxSoftBreaks: 0 },
    )
  })
})
