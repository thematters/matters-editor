import { unified } from 'unified'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeFormat from 'rehype-format'

import rehypeParse from 'rehype-parse'
import {
  rehypeParseOptions,
  rehypeSanitizeOptions,
  rehypeStringifyOptions,
} from './options'

export const sanitizeHTML = async (md: string): Promise<string> => {
  const formatter = unified()
    .use(rehypeParse, rehypeParseOptions)
    .use(rehypeRaw)
    .use(rehypeSanitize, rehypeSanitizeOptions)
    .use(rehypeFormat)
    .use(rehypeStringify, rehypeStringifyOptions)

  const result = await formatter.process(md)
  return String(result)
}
