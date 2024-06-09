import { type Schema } from 'hast-util-sanitize'
import { toHtml } from 'hast-util-to-html'
import { defaultHandlers, type Handle, type Options } from 'hast-util-to-mdast'
import { type Html } from 'mdast'
import { type RehypeRewriteOptions } from 'rehype-rewrite'
import { defaultSchema } from 'rehype-sanitize'
import { type Options as RemarkStringifyOptions } from 'remark-stringify'

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
  (defaultHandler: Handle): Handle =>
  (state, node, parent) => {
    const isBrOnly =
      node.children.length > 0 &&
      node.children.every(
        (child) => 'tagName' in child && child.tagName === 'br',
      )
    if (isBrOnly) {
      const result: Html = { type: 'html', value: toHtml(node) }
      state.patch(node, result)
      return result
    }

    return defaultHandler(state, node, parent)
  }

export const rehypeRemarkOptions: Options = {
  newlines: true,
  handlers: {
    p: makeBrHandler(defaultHandlers.p),
    h1: makeBrHandler(defaultHandlers.h1),
    h2: makeBrHandler(defaultHandlers.h2),
    h3: makeBrHandler(defaultHandlers.h3),
    h4: makeBrHandler(defaultHandlers.h4),
    h5: makeBrHandler(defaultHandlers.h5),
    h6: makeBrHandler(defaultHandlers.h6),
    figure(state, node) {
      const result: Html = {
        type: 'html',
        value: toHtml(node, {
          closeSelfClosing: false,
          closeEmptyElements: true,
        }),
      }
      state.patch(node, result)
      return result
    },
  },
}

export const rehypeStringifyOptions = {
  closeSelfClosing: false,
  closeEmptyElements: true,
}

export const rehypeRewriteOptions: RehypeRewriteOptions = {
  rewrite: (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      node.properties !== undefined
    ) {
      node.properties.target = '_blank'
      node.properties.rel = 'noopener noreferrer nofollow'
    }
    if (node.type === 'element' && node.tagName === 'del') {
      node.tagName = 's'
    }
    if (node.type === 'element' && node.tagName === 'u') {
      node.tagName = 'strong'
    }
  },
}

export const rehypeSanitizeOptions: Schema = {
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'iframe',
    'footer',
    'header',
    'audio',
    'source',
    'figure',
    'figcaption',
  ],
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto', 'tel'],
  },
  attributes: {
    ...defaultSchema.attributes,
    a: [
      // for mention extension
      ['className', 'mention'],
      'href',
      'ref',
      'target',
      'data*',
    ],
    br: [
      // classes
      ['className', 'smart'],
    ],
    img: ['src', 'srcSet', 'data*'],
    audio: ['controls', 'data*', ['preload', 'metadata']],
    source: ['src', 'type', 'data*'],
    figure: [
      // classes
      ['className', 'image', 'audio', 'embed', 'embed-code', 'embed-video'],
    ],
    div: [
      // classes
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
    h4: [
      // classes
      ['className', 'title'],
    ],
    span: [
      // classes
      ['className', 'play', 'current', 'duration'],
      'data*',
    ],
    iframe: [
      'src',
      'allowFullScreen',
      ['loading', 'lazy'],
      ['frameBorder', '0'],
      ['sandbox', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
    ],
  },
}
