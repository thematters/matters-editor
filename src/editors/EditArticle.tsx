import { useEditor } from '@tiptap/react'
import type { EditorOptions } from '@tiptap/react'
import {
  makeEditArticleEditorExtensions,
  MakeArticleEditorExtensionsProps,
} from './extensions'

type UseEditArticleEditorProps = {
  content: string
} & MakeArticleEditorExtensionsProps &
  Partial<EditorOptions>

export const useEditArticleEdtor = ({
  content,
  placeholder,
  mentionSuggestion,
  ...editorProps
}: UseEditArticleEditorProps) => {
  const { extensions, ...restProps } = editorProps
  const editor = useEditor({
    extensions: [
      ...makeEditArticleEditorExtensions({ placeholder, mentionSuggestion }),
      ...(extensions || []),
    ],
    content,
    ...restProps,
  })

  return editor
}
