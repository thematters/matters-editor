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
import { useEditor } from '@tiptap/react'
import type { EditorOptions } from '@tiptap/react'

import {
  FigureAudio,
  FigureEmbed,
  FigureImage,
  Link,
  Bold,
  Mention,
  MentionSuggestion,
} from './extensions'

type UseArticleEditorProps = {
  content: string
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
} & Partial<EditorOptions>

export const makeArticleEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: Pick<UseArticleEditorProps, 'placeholder' | 'mentionSuggestion'>) => {
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

export const useArticleEdtor = ({
  content,
  placeholder,
  mentionSuggestion,
  ...editorProps
}: UseArticleEditorProps) => {
  const editor = useEditor({
    extensions: makeArticleEditorExtensions({ placeholder, mentionSuggestion }),
    content,
    ...editorProps,
  })

  return editor
}
