import rehypeFormat from 'rehype-format'
import rehypeParse from 'rehype-parse'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

import { rehypeSqueezeParagraphs } from './lib'
import {
  rehypeParseOptions,
  rehypeSanitizeOptions,
  rehypeStringifyOptions,
} from './options'

export interface SanitizeHTMLOptions {
  maxEmptyParagraphs?: number
}

export const sanitizeHTML = (
  html: string,
  { maxEmptyParagraphs }: SanitizeHTMLOptions = {},
): string => {
  const formatter = unified()
    .use(rehypeParse, rehypeParseOptions)
    .use(rehypeRaw)
    .use(rehypeSanitize, rehypeSanitizeOptions)

  if (maxEmptyParagraphs) {
    formatter.use(rehypeSqueezeParagraphs, {
      maxCount: maxEmptyParagraphs,
    })
  }

  formatter.use(rehypeFormat).use(rehypeStringify, rehypeStringifyOptions)

  const result = formatter.processSync(html)
  return String(result)
}
