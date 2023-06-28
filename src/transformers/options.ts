import { RehypeRewriteOptions } from 'rehype-rewrite'
import { defaultSchema } from 'rehype-sanitize'
import { toHtml } from 'hast-util-to-html'
import { Options as RemarkStringifyOptions } from 'remark-stringify'
import { defaultHandlers, H } from 'hast-util-to-mdast'

export const remarkStringifyOptions: RemarkStringifyOptions = {
  bullet: '*',
  listItemIndent: 'one',
  rule: '-',
  emphasis: '_',
}

export const remarkRehypeOptions = { allowDangerousHtml: true }

export const rehypeParseOptions = { fragment: true }

/**
 * keep raw HTML if chilren are all <br>
 *
 * e.g.
 * <p><br></p> -> <p><br></p>
 * <p>abcabc</p> -> abcabc
 */
const makeBrHandler =
  (defaultHandler: typeof defaultHandlers.p) => (h: H, node: any) => {
    const isBrOnly =
      node.children.length > 0 &&
      node.children.every((child: any) => child.tagName === 'br')
    if (isBrOnly) {
      return h(node, 'html', toHtml(node))
    }

    return defaultHandler(h, node)
  }

export const rehypeRemarkOptions: import('hast-util-to-mdast/lib/types').Options =
  {
    newlines: true,
    handlers: {
      p: makeBrHandler(defaultHandlers.p),
      h1: makeBrHandler(defaultHandlers.h1),
      h2: makeBrHandler(defaultHandlers.h2),
      h3: makeBrHandler(defaultHandlers.h3),
      h4: makeBrHandler(defaultHandlers.h4),
      h5: makeBrHandler(defaultHandlers.h5),
      h6: makeBrHandler(defaultHandlers.h6),
      figure(h, node) {
        return h(
          node,
          'html',
          toHtml(node, {
            closeSelfClosing: false,
            closeEmptyElements: true,
          })
        )
      },
    },
  }

export const rehypeStringifyOptions = {
  closeSelfClosing: false,
  closeEmptyElements: true,
}

export const rehypeRewriteOptions: RehypeRewriteOptions = {
  rewrite: (node, index, parent) => {
    if (node.type == 'element' && node.tagName == 'a' && node.properties) {
      node.properties.target = '_blank'
      node.properties.rel = 'noopener noreferrer nofollow'
    }
    if (node.type == 'element' && node.tagName == 'del') {
      node.tagName = 's'
    }
    if (node.type == 'element' && node.tagName == 'u') {
      node.tagName = 'strong'
    }
  },
}

export const rehypeSanitizeOptions:
  | void
  | import('hast-util-sanitize/lib').Schema = {
  tagNames: [
    ...defaultSchema.tagNames!,
    'iframe',
    'footer',
    'header',
    'audio',
    'source',
  ],
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto', 'tel'],
  },
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'ref', 'target', 'className', 'data*'],
    br: ['className'],
    img: ['src', 'srcSet', 'data*'],
    audio: ['controls', 'data*', ['preload', 'metadata']],
    source: ['src', 'type', 'data*'],
    figure: [
      ['className', 'image', 'audio', 'embed', 'embed-code', 'embed-video'],
    ],
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
}
