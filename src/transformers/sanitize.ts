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

const formatter = unified()
  .use(rehypeParse, rehypeParseOptions)
  .use(rehypeRaw)
  .use(rehypeSanitize, rehypeSanitizeOptions)
  .use(rehypeFormat)
  .use(rehypeStringify, rehypeStringifyOptions)

export const sanitizeHTML = (md: string): string => {
  const result = formatter.processSync(md)
  return String(result)
}
