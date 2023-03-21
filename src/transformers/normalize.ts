import { Extensions, getSchema } from '@tiptap/core'
import { DOMParser, DOMSerializer, Node } from '@tiptap/pm/model'
import { createHTMLDocument, parseHTML, VHTMLDocument } from 'zeed-dom'
import {
  makeArticleEditorExtensions,
  makeCommentEditorExtensions,
} from '../editors'

export const makeNormalizer = (extensions: Extensions) => {
  const schema = getSchema(extensions)

  return (html: string): string => {
    const dom = parseHTML(html) as unknown as Node
    // @ts-ignore
    const doc = DOMParser.fromSchema(schema).parse(dom).toJSON()
    const contentNode = Node.fromJSON(schema, doc)

    const document = DOMSerializer.fromSchema(schema).serializeFragment(
      contentNode.content,
      {
        document: createHTMLDocument() as unknown as Document,
      }
    ) as unknown as VHTMLDocument

    return document.render()
  }
}

export const normalizeArticleHTML = (html: string): string => {
  const extensions = makeArticleEditorExtensions({})
  const normalizer = makeNormalizer(extensions)
  return normalizer(html)
}

export const normalizeCommentHTML = (html: string): string => {
  const extensions = makeCommentEditorExtensions({})
  const normalizer = makeNormalizer(extensions)
  return normalizer(html)
}