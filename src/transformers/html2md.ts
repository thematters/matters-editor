import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { remarkStrikethrough } from './plugins'
import rehypeRewrite from 'rehype-rewrite'
import {
  rehypeParseOptions,
  rehypeRemarkOptions,
  rehypeRewriteOptions,
  remarkStringifyOptions,
} from './options'

const formatter = unified()
  .use(rehypeParse, rehypeParseOptions)
  .use(rehypeRewrite, rehypeRewriteOptions)
  .use(rehypeRemark, rehypeRemarkOptions)
  .use(remarkStrikethrough)
  .use(remarkStringify, remarkStringifyOptions)

export const html2md = (html: string): string => {
  const result = formatter.processSync(html)
  return String(result)
}
