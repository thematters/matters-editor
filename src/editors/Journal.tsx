import { type EditorOptions, useEditor } from '@tiptap/react'

import {
  makeJournalEditorExtensions,
  type MakeJournalEditorExtensionsProps,
} from './extensions'

type UseJournalEditorProps = {
  content: string
} & MakeJournalEditorExtensionsProps &
  Partial<EditorOptions>

export const useJournalEditor = ({
  content,
  placeholder,
  mentionSuggestion,
  ...editorProps
}: UseJournalEditorProps) => {
  const { extensions, ...restProps } = editorProps
  const editor = useEditor({
    extensions: [
      ...makeJournalEditorExtensions({ placeholder, mentionSuggestion }),
      ...(extensions ?? []),
    ],
    content,
    ...restProps,
  })

  return editor
}
