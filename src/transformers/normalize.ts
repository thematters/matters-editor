import type { Extensions } from '@tiptap/core'
import { getSchema } from '@tiptap/core'
import { DOMParser, DOMSerializer, Node } from '@tiptap/pm/model'
import isURL from 'validator/lib/isURL'
import { createHTMLDocument, parseHTML, type VHTMLDocument } from 'zeed-dom'

import {
  makeArticleEditorExtensions,
  makeCommentEditorExtensions,
  makeJournalEditorExtensions,
  Mention,
} from '../editors/extensions'

export type NormalizeOptions = {
  truncate?: {
    maxLength: number
    keepProtocol: boolean
  }
}

export const makeNormalizer = (extensions: Extensions) => {
  const schema = getSchema(extensions)

  return (html: string): string => {
    const dom = parseHTML(html) as unknown as Node
    // @ts-expect-error
    const doc = DOMParser.fromSchema(schema).parse(dom).toJSON()
    const contentNode = Node.fromJSON(schema, doc)

    const document = DOMSerializer.fromSchema(schema).serializeFragment(
      contentNode.content,
      {
        document: createHTMLDocument() as unknown as Document,
      },
    ) as unknown as VHTMLDocument

    return document.render()
  }
}

// match HTML anchor tags and truncate the text
export const truncateLinkText = (
  html: string,
  { maxLength, keepProtocol }: { maxLength: number; keepProtocol: boolean },
): string => {
  const regex = /<a\s+([^>]*?)>(.*?)<\/a>/gi

  return html.replace(regex, (match, attributes: string, text: string) => {
    if (!isURL(text)) {
      return match
    }

    let truncatedText = text

    if (!keepProtocol) {
      truncatedText = text.replace(/(^\w+:|^)\/\//, '')
    }

    if (maxLength <= 0) {
      throw new Error('maxLength must be greater than 0')
    }

    if (maxLength && truncatedText.length > maxLength) {
      truncatedText = truncatedText.slice(0, maxLength) + '...'
    }

    return `<a ${attributes}>${truncatedText}</a>`
  })
}

export const normalizeArticleHTML = (
  html: string,
  options?: NormalizeOptions,
): string => {
  const extensions = makeArticleEditorExtensions({})
  const normalizer = makeNormalizer([...extensions, Mention])

  let normalizedHtml = normalizer(html)

  if (options?.truncate) {
    normalizedHtml = truncateLinkText(html, options.truncate)
  }

  return normalizedHtml
}

export const normalizeCommentHTML = (
  html: string,
  options?: NormalizeOptions,
): string => {
  const extensions = makeCommentEditorExtensions({})
  const normalizer = makeNormalizer([...extensions, Mention])

  let normalizedHtml = normalizer(html)

  if (options?.truncate) {
    normalizedHtml = truncateLinkText(html, options.truncate)
  }

  return normalizedHtml
}

export const normalizeJournalHTML = (
  html: string,
  options?: NormalizeOptions,
): string => {
  const extensions = makeJournalEditorExtensions({})
  const normalizer = makeNormalizer([...extensions, Mention])

  let normalizedHtml = normalizer(html)

  if (options?.truncate) {
    normalizedHtml = truncateLinkText(html, options.truncate)
  }

  return normalizedHtml
}
