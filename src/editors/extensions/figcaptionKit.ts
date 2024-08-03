import { type Editor } from '@tiptap/core'
import { Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * FigcaptionKit extension works with FigureAudio,
 * FigureEmbed and FigureImage extensions to:
 * - limit figcaption length
 * - handle enter key event to insert a new paragraph
 * - handle backspace key event to remove the figcaption if it's empty
 * - handle click event to select the figcaption
 *
 * @see {https://github.com/ueberdosis/tiptap/issues/629}
 */

type FigcaptionKitOptions = {
  maxCaptionLength?: number
}

const pluginName = 'figcaptionKit'

export const makeFigcaptionEventHandlerPlugin = ({
  editor,
}: {
  editor: Editor
}) => {
  return new Plugin({
    key: new PluginKey('figcaptionEventHandler'),
    props: {
      handleClickOn(view, pos, node, nodePos, event) {
        const isFigcaption =
          event.target instanceof HTMLElement
            ? event.target.tagName.toUpperCase() === 'FIGCAPTION'
            : false

        if (!isFigcaption) return

        // set the selection to the figcaption node
        editor.commands.setTextSelection(pos)

        // to prevent the default behavior which is to select the whole node
        // @see {@url https://discuss.prosemirror.net/t/prevent-nodeview-selection-on-click/3193}
        return true
      },
      handleKeyDown(view, event) {
        const isBackSpace = event.key.toLowerCase() === 'backspace'
        const isEnter = event.key.toLowerCase() === 'enter'

        if (!isBackSpace && !isEnter) {
          return
        }

        const anchorParent = view.state.selection.$anchor.parent
        const isCurrentPlugin = anchorParent.type.name === pluginName
        const isEmptyFigcaption = anchorParent.content.size <= 0

        if (!isCurrentPlugin) {
          return
        }

        // backSpace to remove if the figcaption is empty
        if (isBackSpace && isEmptyFigcaption) {
          // FIXME: setTimeOut to avoid repetitive deletion
          setTimeout(() => {
            editor.commands.deleteNode(pluginName)
          })
          return
        }

        // insert a new paragraph
        if (isEnter) {
          const { $from, $to } = editor.state.selection
          const isTextAfter = $to.nodeAfter?.type?.name === 'text'

          // skip if figcaption text is selected
          // or has text after current selection
          if ($from !== $to || isTextAfter) {
            return
          }

          // FIXME: setTimeOut to avoid repetitive paragraph insertion
          setTimeout(() => {
            editor.commands.insertContentAt($to.pos + 1, {
              type: 'paragraph',
            })
          })
        }
      },
    },
  })
}

export const FigcaptionKit = Node.create<FigcaptionKitOptions>({
  name: pluginName,

  addOptions() {
    return {
      maxCaptionLength: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('figcaptionLimit'),
        filterTransaction: (transaction) => {
          // Nothing has changed, ignore it.
          if (!transaction.docChanged || !this.options.maxCaptionLength) {
            return true
          }

          try {
            // skip if not in a figure
            const anchorParent = transaction.selection.$anchor.parent
            const isFigure = anchorParent.type.name.includes('figure')
            if (!isFigure) {
              return true
            }

            // limit figcaption length
            if (anchorParent.content.size <= 0) return true

            const figcaptionText = anchorParent.content.child(0).text || ''
            if (figcaptionText.length > this.options.maxCaptionLength) {
              return false
            }
          } catch (e) {
            console.error(e)
          }

          return true
        },
      }),

      makeFigcaptionEventHandlerPlugin({ editor: this.editor }),
    ]
  },
})
