import { Node, Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

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
      setFigureImage: (options: {
        src: string
        caption?: string
        position?: number
      }) => ReturnType
    }
  }
}

const pluginName = 'figureImage'

export const FigureImage = Node.create({
  name: pluginName,
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,

  // disallows all marks for figcaption
  marks: '',

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
        ({ caption, position, ...attrs }) =>
        ({ chain }) => {
          const insertContent = [
            {
              type: this.name,
              attrs,
              content: caption ? [{ type: 'text', text: caption }] : [],
            },
            {
              type: 'paragraph',
            },
          ]

          if (!position) {
            return chain().insertContent(insertContent).focus().run()
          }

          return chain().insertContentAt(position, insertContent).focus().run()
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

              return
            }
          },

          transformPastedHTML(html) {
            // remove
            html = html
              .replace(/\n/g, '')
              .replace(/<figure.*class=.image.*[\n]*.*?<\/figure>/g, '')
            return html
          },
        },
      }),
    ]
  },
})
