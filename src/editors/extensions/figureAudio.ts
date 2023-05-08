import { Node } from '@tiptap/core'
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
      }) => ReturnType
    }
  }
}

const pluginName = 'figureAudio'

export const FigureAudio = Node.create({
  name: pluginName,
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,

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
        { controls: true },
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
        key: new PluginKey('removePastedFigureAudio'),
        props: {
          handleKeyDown(view, event) {
            const isBackSpace = event.key === 'BackSpace'
            const isEnter = event.key === 'Enter'

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

            // enter to insert a new paragraph
            if (isEnter) {
              editor
                .chain()
                .selectTextblockEnd()
                .insertContent({ type: 'paragraph' })
                .run()
              return
            }
          },

          transformPastedHTML(html) {
            // remove
            html = html.replace(
              /<figure.*class=.audio.*[\n]*.*?<\/figure>/g,
              ''
            )
            return html
          },
        },
      }),
    ]
  },
})
