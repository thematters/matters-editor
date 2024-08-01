export * from './extensions'
export * from '@tiptap/react'
export * from '@tiptap/suggestion'

import type { EditorOptions } from '@tiptap/react'
import { useEditor } from '@tiptap/react'

import {
  articleEditorExtensions,
  campaignEditorExtensions,
  commentEditorExtensions,
  momentEditorExtensions,
} from './extensions'

type UseEditorProps = EditorOptions

export const useArticleEditor = ({
  extensions,
  content,
  ...restProps
}: UseEditorProps) => {
  const editor = useEditor({
    extensions: [...articleEditorExtensions, ...(extensions ?? [])],
    content,
    ...restProps,
  })

  return editor
}

export const useCommentEditor = ({
  extensions,
  content,
  ...restProps
}: UseEditorProps) => {
  const editor = useEditor({
    extensions: [...commentEditorExtensions, ...(extensions ?? [])],
    content,
    ...restProps,
  })

  return editor
}

export const useMomentEditor = ({
  extensions,
  content,
  ...restProps
}: UseEditorProps) => {
  const editor = useEditor({
    extensions: [...momentEditorExtensions, ...(extensions ?? [])],
    content,
    ...restProps,
  })

  return editor
}

export const useCampaignEditor = ({
  extensions,
  content,
  ...restProps
}: UseEditorProps) => {
  const editor = useEditor({
    extensions: [...campaignEditorExtensions, ...(extensions ?? [])],
    content,
    ...restProps,
  })

  return editor
}
