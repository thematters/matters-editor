import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
// import rehypeSanitize from 'rehype-sanitize'
import rehypeFormat from 'rehype-format'
// import remarkGfm from 'remark-gfm'
import rehypeRewrite from 'rehype-rewrite'

const formatter = unified()
  .use(remarkParse)
  // .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRewrite, {
    rewrite: (node, index, parent) => {
      if (node.type == 'element' && node.tagName == 'a' && node.properties) {
        node.properties.target = '_blank'
        node.properties.rel = 'noopener noreferrer nofollow'
      }
    },
  })
  .use(rehypeRaw)
  // .use(rehypeSanitize)
  .use(rehypeFormat)
  .use(rehypeStringify)

export const md2html = async (md: string): Promise<string> => {
  const result = await formatter.process(md)
  return String(result)
}
