import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { toHtml } from 'hast-util-to-html'
import { remarkStrikethrough } from './plugins'
import rehypeRewrite from 'rehype-rewrite'

const formatter = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRewrite, {
    rewrite: (node, index, parent) => {
      if (node.type == 'element' && node.tagName == 'u') {
        node.tagName = 'strong'
      }
    },
  })
  .use(rehypeRemark, {
    handlers: {
      figure(h, node) {
        return h(
          node,
          'html',
          toHtml(node, {
            closeSelfClosing: true,
            closeEmptyElements: true,
            tightSelfClosing: false,
          })
        )
      },
    },
  })
  .use(remarkStrikethrough)
  .use(remarkStringify, {
    bullet: '*',
    listItemIndent: 'one',
    rule: '-',
    emphasis: '_',
  })

export const html2md = async (html: string): Promise<string> => {
  const result = await formatter.process(html)
  return String(result)
}
