import { Node } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * A extension to handle paste and drop image events.
 */

type PasteDropFileOptions = {
  // paste event handler
  onPaste: (editor: Editor, files: File[]) => void
  // drop event handler
  onDrop: (editor: Editor, files: File[], pos: number) => void
  // accepted mime types
  mimeTypes: string[]
}

const pluginName = 'pasteDropFile'

const makePlugin = ({
  editor,
  onDrop,
  onPaste,
  mimeTypes,
}: PasteDropFileOptions & { editor: Editor }) => {
  return new Plugin({
    key: new PluginKey(pluginName),
    props: {
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files || []).filter(
          (file) => mimeTypes.includes(file.type),
        )

        if (files.length <= 0) return

        const position = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })

        event.stopPropagation()
        onDrop(editor, files, position?.pos || 0)

        return true
      },
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files || []).filter(
          (file) => mimeTypes.includes(file.type),
        )

        if (files.length <= 0) return

        event.stopPropagation()
        onPaste(editor, files)

        return true
      },
    },
  })
}

export const PasteDropFile = Node.create<PasteDropFileOptions>({
  name: pluginName,

  addProseMirrorPlugins() {
    return [makePlugin({ ...this.options, editor: this.editor as Editor })]
  },
})
