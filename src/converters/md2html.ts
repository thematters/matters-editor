import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
// import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'

const formatter = unified()
  .use(remarkParse)
  // .use(remarkRehype, {allowDangerousHtml: true})
  // .use(rehypeRaw) // *Parse* the raw HTML strings embedded in the tree
  // .use(rehypeStringify)
  // .process(`
  //   *emphasis* and <strong>strong</strong>
  // `)
  .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
  .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings

export const md2html = async (md: string): Promise<string> => {
  const result = await formatter.process(md)
  return String(result)
}
