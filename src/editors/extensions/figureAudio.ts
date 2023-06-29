import { Editor, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * FigureAudio extension:
 *
 * @see {https://tiptap.dev/experiments/figure}
 *
 * ```html
 * <figure class="audio">
 *   <source src="URL" type="audio/mp3" />
 *
 *   <div class="player">
 *     <header>
 *       <div class="meta">
 *         <h4 class="title">TITLE</h4>
 *         <div class="time">
 *           <span class="current" data-time="00:00"></span>
 *           <span class="duration" data-time="39:05"></span>
 *         </div>
 *       </div>
 *       <span class="play"></span>
 *     </header>
 *     <footer>
 *       <div class="progress-bar"><span></span></div>
 *     </footer>
 *   </div>
 *
 *   <figcaption>CAPTION</figcaption>
 * </figure>
 * ```
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figureAudio: {
      setFigureAudio: (options: {
        src: string
        caption?: string
        title: string
        position?: number
      }) => ReturnType
    }
  }
}

type FigureAudioOptions = {
  maxCaptionLength?: number
}

const pluginName = 'figureAudio'

export const FigureAudio = Node.create<FigureAudioOptions>({
  name: pluginName,
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,

  // disallows all marks for figcaption
  marks: '',

  addOptions() {
    return {
      maxCaptionLength: undefined,
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          element.querySelector('source')?.getAttribute('src'),
      },
      title: {
        default: '',
        parseHTML: (element) => element.querySelector('.title')?.textContent,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[class="audio"]',
        contentElement: 'figcaption',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { class: 'audio' },
      [
        'audio',
        {
          controls: true,
          // for backward compatibility
          // can be removed when fully switch to new editor
          'data-file-name': HTMLAttributes.title,
        },
        [
          'source',
          {
            src: HTMLAttributes.src,
            type: 'audio/mp3',
            draggable: false,
            contenteditable: false,
          },
        ],
      ],
      [
        'div',
        { class: 'player' },
        [
          'header',
          [
            'div',
            { class: 'meta' },
            ['h4', { class: 'title' }, HTMLAttributes.title],
            [
              'div',
              { class: 'time' },
              ['span', { class: 'current', 'data-time': '00:00' }],
              ['span', { class: 'duration', 'data-time': '--:--' }],
            ],
          ],
          ['span', { class: 'play' }],
        ],
        ['footer', ['div', { class: 'progress-bar' }, ['span', {}]]],
      ],
      ['figcaption', 0],
    ]
  },

  addCommands() {
    return {
      setFigureAudio:
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
        key: new PluginKey('removePastedFigureAudio'),
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
              .replace(/<figure.*class=.audio.*[\n]*.*?<\/figure>/g, '')
            return html
          },
        },
        filterTransaction: (transaction, state) => {
          // Nothing has changed, ignore it.
          if (!transaction.docChanged || !this.options.maxCaptionLength) {
            return true
          }

          try {
            const anchorParent = transaction.selection.$anchor.parent
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
    ]
  },
})
