import rehypeExternalLinks from 'rehype-external-links'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeRewrite from 'rehype-rewrite'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkBreaks from 'remark-breaks'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import {
  rehypeRewriteOptions,
  rehypeSanitizeOptions,
  rehypeStringifyOptions,
  remarkRehypeOptions,
} from './options'
import { remarkStrikethrough } from './plugins'

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
  .use(rehypeExternalLinks, { rel: ['noopener', 'nofollow', 'noreferrer'] })
  .use(rehypeFormat)
  .use(rehypeStringify, rehypeStringifyOptions)

export const md2html = (md: string): string => {
  const result = formatter.processSync(md)
  return String(result)
}
