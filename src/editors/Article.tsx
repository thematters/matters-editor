import { useEditor } from '@tiptap/react'
import type { EditorOptions } from '@tiptap/react'
import {
  makeArticleEditorExtensions,
  MakeArticleEditorExtensionsProps,
} from './extensions'

type UseArticleEditorProps = {
  content: string
} & MakeArticleEditorExtensionsProps &
  Partial<EditorOptions>

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
