import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { toHtml } from 'hast-util-to-html'

const formatter = unified()
  .use(rehypeParse)
  .use(rehypeRemark, {
    handlers: {
      svg(h, node) {
        return h(node, 'html', toHtml(node))
      },
      figure(h, node) {
        return h(node, 'html', toHtml(node))
      },
    },
  })
  .use(remarkStringify)

export const html2md = async (html: string): Promise<string> => {
  const result = await formatter.process(html)
  return String(result)
}
