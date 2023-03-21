import Blockquote from '@tiptap/extension-blockquote'
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
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
import { EditorOptions, useEditor } from '@tiptap/react'

import { Link, Mention, MentionSuggestion } from './extensions'

type UseCommentEditorProps = {
  content: string
  placeholder?: string
  mentionSuggestion?: MentionSuggestion
} & Partial<EditorOptions>

export const makeCommentEditorExtensions = ({
  placeholder,
  mentionSuggestion,
}: Pick<UseCommentEditorProps, 'placeholder' | 'mentionSuggestion'>) => {
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
    Underline,
    Italic,
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

export const useCommentEditor = ({
  content,
  placeholder,
  mentionSuggestion,
  ...editorProps
}: UseCommentEditorProps) => {
  const editor = useEditor({
    extensions: makeCommentEditorExtensions({ placeholder, mentionSuggestion }),
    content,
    ...editorProps,
  })

  return editor
}
