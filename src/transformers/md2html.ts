import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeFormat from 'rehype-format'
import rehypeRewrite from 'rehype-rewrite'
import remarkBreaks from 'remark-breaks'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'

import { remarkStrikethrough } from './plugins'
import {
  rehypeRewriteOptions,
  rehypeSanitizeOptions,
  rehypeStringifyOptions,
  remarkRehypeOptions,
} from './options'

const formatter = unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkDirectiveRehype)
  .use(remarkBreaks)
  .use(remarkStrikethrough)
  .use(remarkRehype, remarkRehypeOptions)
  .use(rehypeRewrite, rehypeRewriteOptions)
  .use(rehypeRaw)
  .use(rehypeSanitize, rehypeSanitizeOptions)
  .use(rehypeFormat)
  .use(rehypeStringify, rehypeStringifyOptions)

export const md2html = async (md: string): Promise<string> => {
  const result = await formatter.process(md)
  return String(result)
}
