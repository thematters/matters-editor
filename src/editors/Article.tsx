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
  maxCaptionLength,
  ...editorProps
}: UseArticleEditorProps) => {
  const { extensions, ...restProps } = editorProps
  const editor = useEditor({
    extensions: [
      ...makeArticleEditorExtensions({
        placeholder,
        mentionSuggestion,
        maxCaptionLength,
      }),
      ...(extensions || []),
    ],
    content,
    ...restProps,
  })

  return editor
}
