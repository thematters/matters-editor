import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import History from '@tiptap/extension-history'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
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

export * from './figureAudio'
export * from './figureEmbed'
export * from './figureImage'
export * from './link'
export * from './mention'
export * from './bold'

export type MakeArticleEditorExtensionsProps = {
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
}

export const makeArticleEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: MakeArticleEditorExtensionsProps) => {
  return [
    Document,
    History,
    Gapcursor,
    Placeholder.configure({
      placeholder,
    }),
    // Basic Formats
    Text,
    Paragraph,
    Heading.configure({
      levels: [2, 3],
    }),
    Bold,
    Strike,
    Code,
    CodeBlock,
    Blockquote,
    HardBreak,
    HorizontalRule,
    OrderedList,
    ListItem,
    BulletList,
    // Custom Formats
    Link,
    FigureImage,
    FigureAudio,
    FigureEmbed,
    Mention.configure({
      suggestion: mentionSuggestion,
    }),
  ]
}

export type MakeCommentEditorExtensionsProps = {
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
}

export const makeCommentEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: MakeCommentEditorExtensionsProps) => {
  return [
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
    HardBreak,
    HorizontalRule,
    ListItem,
    OrderedList,
    BulletList,
    // Custom Formats
    Link,
    Mention.configure({
      suggestion: mentionSuggestion,
    }),
  ]
}
