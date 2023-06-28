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
  const { extensions, ...restProps } = editorProps
  const editor = useEditor({
    extensions: [
      ...makeCommentEditorExtensions({ placeholder, mentionSuggestion }),
      ...(extensions || []),
    ],
    content,
    ...restProps,
  })

  return editor
}
