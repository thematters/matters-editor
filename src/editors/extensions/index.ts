export * from './blockquote'
export * from './bold'
export * from './figcaptionKit'
export * from './figureAudio'
export * from './figureEmbed'
export * from './figureImage'
export * from './horizontalRule'
export * from './link'
export * from './mention'
export * from './pasteDropFile'
export * from '@tiptap/extension-dropcursor'
export * from '@tiptap/extension-placeholder'

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
import { FigcaptionKit } from './figcaptionKit'
import { FigureAudio } from './figureAudio'
import { FigureEmbed } from './figureEmbed'
import { FigureImage } from './figureImage'
import { HorizontalRule } from './horizontalRule'
import { Link } from './link'

const baseEditorExtensions = [
  Document,
  History,
  Placeholder,
  Text,
  Paragraph,
  HardBreak.configure({
    HTMLAttributes: {
      class: 'smart',
    },
  }),
  Link,
]

export const articleEditorExtensions = [
  ...baseEditorExtensions,
  Blockquote,
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
  FigureImage,
  FigureAudio,
  FigureEmbed,
  FigcaptionKit,
]

export const commentEditorExtensions = [...baseEditorExtensions, Blockquote]

export const momentEditorExtensions = [...baseEditorExtensions]

export const campaignEditorExtensions = [
  Document,
  History,
  Placeholder,
  // Basic Formats
  Text,
  Paragraph,
  HardBreak.configure({
    HTMLAttributes: {
      class: 'smart',
    },
  }),
]
