import { type EditorOptions, useEditor } from '@tiptap/react'

import {
  makeMomentEditorExtensions,
  type MakeMomentEditorExtensionsProps,
} from './extensions'

type UseMomentEditorProps = {
  content: string
} & MakeMomentEditorExtensionsProps &
  Partial<EditorOptions>

export const useMomentEditor = ({
  content,
  placeholder,
  mentionSuggestion,
  ...editorProps
}: UseMomentEditorProps) => {
  const { extensions, ...restProps } = editorProps
  const editor = useEditor({
    extensions: [
      ...makeMomentEditorExtensions({ placeholder, mentionSuggestion }),
      ...(extensions ?? []),
    ],
    content,
    ...restProps,
  })

  return editor
}
