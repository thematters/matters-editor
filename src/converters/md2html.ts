import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeFormat from 'rehype-format'
import rehypeRewrite from 'rehype-rewrite'
import remarkBreaks from 'remark-breaks'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'

import { remarkStrikethrough } from './plugins'

const formatter = unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkDirectiveRehype)
  .use(remarkBreaks)
  .use(remarkStrikethrough)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRewrite, {
    rewrite: (node, index, parent) => {
      if (node.type == 'element' && node.tagName == 'a' && node.properties) {
        node.properties.target = '_blank'
        node.properties.rel = 'noopener noreferrer nofollow'
      }
      if (node.type == 'element' && node.tagName == 'del') {
        node.tagName = 's'
      }
    },
  })
  .use(rehypeRaw)
  .use(rehypeSanitize, {
    tagNames: [
      ...defaultSchema.tagNames!,
      'iframe',
      'footer',
      'header',
      'audio',
      'source',
    ],
    attributes: {
      ...defaultSchema.attributes,
      a: ['href', 'ref', 'target'],
      img: ['src', 'srcSet', 'data*'],
      audio: ['controls', 'data*', ['preload', 'metadata']],
      source: ['src', 'type', 'data*'],
      figure: [['className', 'image', 'audio', 'embed-code', 'embed-video']],
      div: [
        [
          'className',
          'player',
          'progress-bar',
          'meta',
          'time',
          'iframe-container',
        ],
        'data*',
      ],
      h4: [['className', 'title']],
      span: [['className', 'play', 'current', 'duration'], 'data*'],
      iframe: [
        'src',
        'allowFullScreen',
        ['loading', 'lazy'],
        ['frameBorder', '0'],
        ['sandbox', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
      ],
    },
  })
  .use(rehypeFormat)
  .use(rehypeStringify, {
    closeSelfClosing: true,
    closeEmptyElements: true,
    tightSelfClosing: false,
  })

export const md2html = async (md: string): Promise<string> => {
  const result = await formatter.process(md)
  return String(result)
}
