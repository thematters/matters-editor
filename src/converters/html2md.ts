import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { toHtml } from 'hast-util-to-html'
import remarkGfm from 'remark-gfm'

const formatter = unified()
  .use(rehypeParse)
  .use(rehypeRemark, {
    handlers: {
      figure(h, node) {
        return h(node, 'html', toHtml(node))
      },
    },
  })
  .use(remarkGfm, {})
  .use(remarkStringify, {
    bullet: '*',
    listItemIndent: 'one',
    rule: '-',
  })

export const html2md = async (html: string): Promise<string> => {
  const result = await formatter.process(html)
  return String(result)
}
