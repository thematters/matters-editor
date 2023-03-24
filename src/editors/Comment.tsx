import { EditorOptions, useEditor } from '@tiptap/react'
import {
  makeCommentEditorExtensions,
  MakeCommentEditorExtensionsProps,
} from './extensions'

type UseCommentEditorProps = {
  content: string
} & MakeCommentEditorExtensionsProps &
  Partial<EditorOptions>

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
