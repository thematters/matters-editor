import type { EditorOptions } from '@tiptap/react'
import { useEditor } from '@tiptap/react'

import {
  makeArticleEditorExtensions,
  type MakeArticleEditorExtensionsProps,
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
  const { extensions, ...restProps } = editorProps
  const editor = useEditor({
    extensions: [
      ...makeArticleEditorExtensions({ placeholder, mentionSuggestion }),
      ...(extensions ?? []),
    ],
    content,
    ...restProps,
  })

  return editor
}
