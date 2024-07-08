import { type EditorOptions, useEditor } from '@tiptap/react'

import {
  makeCampaignEditorExtensions,
  type MakeCampaignEditorExtensionsProps,
} from './extensions'

type UseCampaignEditorProps = {
  content: string
} & MakeCampaignEditorExtensionsProps &
  Partial<EditorOptions>

export const useCampaignEditor = ({
  content,
  placeholder,
  ...editorProps
}: UseCampaignEditorProps) => {
  const { extensions, ...restProps } = editorProps
  const editor = useEditor({
    extensions: [
      ...makeCampaignEditorExtensions({ placeholder }),
      ...(extensions ?? []),
    ],
    content,
    ...restProps,
  })

  return editor
}
