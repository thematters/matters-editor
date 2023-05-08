import { Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { GapCursor } from '@tiptap/pm/gapcursor'

/**
 * FigureImage extension:
 *
 * @see {https://tiptap.dev/experiments/figure}
 *
 * ```html
 * <figure class="image">
 *   <img src="URL" />
 *   <figcaption>CAPTION</figcaption>
 * </figure>
 * ```
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figureImage: {
      setFigureImage: (options: { src: string; caption?: string }) => ReturnType
    }
  }
}

const pluginName = 'figureImage'

export const FigureImage = Node.create({
  name: 'figureImage',
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
      },
      src: {
        default: null,
        parseHTML: (element) =>
          element.querySelector('img')?.getAttribute('src'),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[class="image"]',
        contentElement: 'figcaption',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { class: 'image' },
      [
        'img',
        {
          src: HTMLAttributes.src,
          draggable: false,
          contenteditable: false,
        },
      ],
      ['figcaption', 0],
    ]
  },

  addCommands() {
    return {
      setFigureImage:
        ({ caption, ...attrs }) =>
        ({ chain }) => {
          return chain()
            .insertContent([
              {
                type: this.name,
                attrs,
                content: caption ? [{ type: 'text', text: caption }] : [],
              },
              {
                type: 'paragraph',
              },
            ])
            .focus()
            .run()
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('removePastedFigureImage'),
        props: {
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

            // @ts-ignore
            const editor = view.dom.editor as Editor

            // backSpace to remove if the figcaption is empty
            if (isBackSpace && isEmptyFigcaption) {
              editor.commands.deleteNode(pluginName)
              return
            }

            // set gapcursor to insert a new paragraph
            if (isEnter) {
              const { from, to } = editor.state.selection
              const resolvedPos = editor.state.doc.resolve(from + 1)

              if (from !== to) {
                return
              }

              // @ts-ignore
              if (GapCursor.valid(resolvedPos)) {
                const selection = new GapCursor(resolvedPos)
                view.dispatch(view.state.tr.setSelection(selection))
              }

              return
            }
          },

          transformPastedHTML(html) {
            // remove
            html = html.replace(
              /<figure.*class=.image.*[\n]*.*?<\/figure>/g,
              ''
            )
            return html
          },
        },
      }),
    ]
  },
})
