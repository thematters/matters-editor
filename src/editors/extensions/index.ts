import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import History from '@tiptap/extension-history'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'

import { FigureAudio } from './figureAudio'
import { FigureEmbed } from './figureEmbed'
import { FigureImage } from './figureImage'
import { Link } from './link'
import { Mention, MentionSuggestion } from './mention'
import { Bold } from './bold'
import { HorizontalRule } from './horizontalRule'
import { ReadOnlyFigureImage } from './readOnlyFigureImage'
import { ReadOnlyFigureAudio } from './readOnlyFigureAudio'
import { ReadOnlyFigureEmbed } from './readOnlyFigureEmbed'

export * from './figureAudio'
export * from './figureEmbed'
export * from './figureImage'
export * from './readOnlyFigureAudio'
export * from './readOnlyFigureEmbed'
export * from './readOnlyFigureImage'
export * from './link'
export * from './horizontalRule'
export * from './mention'
export * from './bold'

const baseExtensions = (placeholder?: string) => [
  Document,
  History,
  Placeholder.configure({
    placeholder,
  }),
  // Basic Formats
  Text,
  Paragraph,
  Bold,
  Strike,
  Code,
  CodeBlock,
  Blockquote,
  HardBreak.configure({
    HTMLAttributes: {
      class: 'smart',
    },
  }),
  HorizontalRule,
  OrderedList,
  ListItem,
  BulletList,
  // Custom Formats
  Link,
]

const baseArticleExtensions = (placeholder?: string) => [
  ...baseExtensions(placeholder),
  Gapcursor,
  Heading.configure({
    levels: [2, 3],
  }),
]

/**
 * Article
 */
export type MakeArticleEditorExtensionsProps = {
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
  maxCaptionLength?: number
}

export const makeArticleEditorExtensions = ({
  placeholder,
  mentionSuggestion,
  maxCaptionLength,
}: MakeArticleEditorExtensionsProps) => {
  const extensions = [
    ...baseArticleExtensions(placeholder),
    FigureImage.configure({ maxCaptionLength }),
    FigureAudio.configure({ maxCaptionLength }),
    FigureEmbed.configure({ maxCaptionLength }),
  ]

  if (mentionSuggestion) {
    extensions.push(Mention.configure({ suggestion: mentionSuggestion }))
  }

  return extensions
}

export const makeEditArticleEditorExtensions = ({
  placeholder,
  mentionSuggestion,
  maxCaptionLength,
}: MakeArticleEditorExtensionsProps) => {
  const extensions = [
    ...baseArticleExtensions(placeholder),
    ReadOnlyFigureImage.configure({ maxCaptionLength }),
    ReadOnlyFigureAudio.configure({ maxCaptionLength }),
    ReadOnlyFigureEmbed.configure({ maxCaptionLength }),
  ]

  if (mentionSuggestion) {
    extensions.push(Mention.configure({ suggestion: mentionSuggestion }))
  }

  return extensions
}

/**
 * Comment
 */
export type MakeCommentEditorExtensionsProps = {
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
}

export const makeCommentEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: MakeCommentEditorExtensionsProps) => {
  const extensions = [...baseExtensions(placeholder)]

  if (mentionSuggestion) {
    extensions.push(Mention.configure({ suggestion: mentionSuggestion }))
  }

  return extensions
}
