import React from 'react'
import Blockquote from '@tiptap/extension-blockquote'
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import History from '@tiptap/extension-history'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import { EditorContent, EditorOptions, useEditor } from '@tiptap/react'

import {
  FigureAudio,
  FigureEmbed,
  FigureImage,
  Link,
  Mention,
  MentionSuggestion,
} from './extensions'

type ArticleEditorProps = {
  content: string
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
} & Partial<EditorOptions>

export const makeArticleEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: Pick<ArticleEditorProps, 'placeholder' | 'mentionSuggestion'>) => {
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
    Underline,
    Italic,
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

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  content,
  placeholder,
  mentionSuggestion,
  ...editorProps
}) => {
  const editor = useEditor({
    extensions: makeArticleEditorExtensions({ placeholder, mentionSuggestion }),
    content,
    ...editorProps,
  })

  return <EditorContent editor={editor} />
}
