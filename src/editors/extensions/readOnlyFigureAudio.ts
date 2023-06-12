import { Node } from '@tiptap/core'

/**
 * ReadyOnlyFigureAudio extension is similar to FigureAudio extension,
 * but it is read-only for article revision.
 */

const pluginName = 'readOnlyFigureAudio'

export const ReadOnlyFigureAudio = Node.create({
  name: pluginName,
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,

  // read-only
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
})
