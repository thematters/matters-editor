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
        position?: number
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
  atom: true,

  // disallows all marks for figcaption
  marks: '',

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
          transformPastedHTML(html) {
            html = html
              .replace(/\n/g, '')
              .replace(/<figure.*class=.audio.*[\n]*.*?<\/figure>/g, '')
            return html
          },
        },
      }),
    ]
  },
})
