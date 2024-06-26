import rehypeFormat from 'rehype-format'
import rehypeParse from 'rehype-parse'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

import { rehypeSqueezeBreaks, type RehypeSqueezeBreaksOptions } from './lib'
import {
  rehypeParseOptions,
  rehypeSanitizeOptions,
  rehypeStringifyOptions,
} from './options'

export type SanitizeHTMLOptions = RehypeSqueezeBreaksOptions

export const sanitizeHTML = (
  html: string,
  { maxHardBreaks, maxSoftBreaks }: SanitizeHTMLOptions = {},
): string => {
  const formatter = unified()
    .use(rehypeParse, rehypeParseOptions)
    .use(rehypeRaw)
    .use(rehypeSanitize, rehypeSanitizeOptions)
    .use(rehypeSqueezeBreaks, { maxHardBreaks, maxSoftBreaks })
    .use(rehypeFormat)
    .use(rehypeStringify, rehypeStringifyOptions)

  const result = formatter.processSync(html)
  return String(result)
}
