import BulletList from '@tiptap/extension-bullet-list'
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

import { Blockquote } from './blockquote'
import { Bold } from './bold'
import { FigureAudio } from './figureAudio'
import { FigureEmbed } from './figureEmbed'
import { FigureImage } from './figureImage'
import { HorizontalRule } from './horizontalRule'
import { Link } from './link'
import { Mention, type MentionSuggestion } from './mention'

export * from './bold'
export * from './figureAudio'
export * from './figureEmbed'
export * from './figureImage'
export * from './horizontalRule'
export * from './link'
export * from './mention'

const baseExtensions = (placeholder?: string) => [
  Document,
  History,
  Placeholder.configure({
    placeholder,
  }),
  // Basic Formats
  Text,
  Paragraph,
  HardBreak.configure({
    HTMLAttributes: {
      class: 'smart',
    },
  }),
  // Custom Formats
  Link,
  Blockquote,
]

const baseArticleExtensions = (placeholder?: string) => [
  ...baseExtensions(placeholder),
  Gapcursor,
  Bold,
  Strike,
  CodeBlock,
  HorizontalRule,
  OrderedList,
  ListItem,
  BulletList,
  Heading.configure({
    levels: [2, 3],
  }),
]

/**
 * Article
 */
export interface MakeArticleEditorExtensionsProps {
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
}

export const makeArticleEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: MakeArticleEditorExtensionsProps) => {
  const extensions = [
    ...baseArticleExtensions(placeholder),
    FigureImage,
    FigureAudio,
    FigureEmbed,
  ]

  if (mentionSuggestion) {
    extensions.push(Mention.configure({ suggestion: mentionSuggestion }))
  }

  return extensions
}

/**
 * Comment
 */
export interface MakeCommentEditorExtensionsProps {
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

/**
 * Moment
 */
export interface MakeMomentEditorExtensionsProps {
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
}

export const makeMomentEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: MakeMomentEditorExtensionsProps) => {
  const extensions = [...baseExtensions(placeholder)]

  if (mentionSuggestion) {
    extensions.push(Mention.configure({ suggestion: mentionSuggestion }))
  }

  return extensions
}

/**
 * Campaign
 */
export interface MakeCampaignEditorExtensionsProps {
  placeholder?: string
}

export const makeCampaignEditorExtensions = ({
  placeholder,
}: MakeCampaignEditorExtensionsProps) => {
  return [
    Document,
    History,
    Placeholder.configure({
      placeholder,
    }),
    // Basic Formats
    Text,
    Paragraph,
    HardBreak.configure({
      HTMLAttributes: {
        class: 'smart',
      },
    }),
    // Custom Formats
    Link,
  ]
}
