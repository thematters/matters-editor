import { type Root, type RootContent } from 'hast'
import rehypeFormat from 'rehype-format'
import rehypeParse from 'rehype-parse'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

import {
  rehypeParseOptions,
  rehypeSanitizeOptions,
  rehypeStringifyOptions,
} from './options'

/**
 * Squeeze empty paragraphs to a maximum of N
 *
 * e.g.
 * <p></p><p></p><p></p><p></p><p></p><p></p>
 * =>
 * <p></p><p></p>
 *
 * @param {number} maxCount
 */
const rehypeSqueezeParagraphs =
  ({ maxCount }: { maxCount: number }) =>
  (tree: Root) => {
    if (tree.type !== 'root') {
      return
    }

    const children: RootContent[] = []
    let count = 0
    let touched = false

    tree.children.forEach((node) => {
      // skip empty text nodes
      if (node.type === 'text' && node.value.replace(/\s/g, '') === '') {
        children.push(node)
        return
      }

      // skip non-paragraph nodes
      if (node.type !== 'element' || node.tagName !== 'p') {
        count = 0
        children.push(node)
        return
      }

      // skip non-empty paragraphs:
      // - <p></p>
      // - <p><br/></p>
      const isEmptyParagraph =
        node.children.length === 0 ||
        node.children.every((n) => n.type === 'element' && n.tagName === 'br')
      if (!isEmptyParagraph) {
        count = 0
        children.push(node)
        return
      }

      // cap empty paragraphs
      count++
      if (count <= maxCount) {
        children.push({
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [],
        })
      } else {
        touched = true
      }
    })

    if (touched) {
      tree.children = children
    }
  }

const formatter = unified()
  .use(rehypeParse, rehypeParseOptions)
  .use(rehypeRaw)
  .use(rehypeSanitize, rehypeSanitizeOptions)
  .use(rehypeSqueezeParagraphs, { maxCount: 2 })
  .use(rehypeFormat)
  .use(rehypeStringify, rehypeStringifyOptions)

export const sanitizeHTML = (html: string): string => {
  const result = formatter.processSync(html)
  return String(result)
}
