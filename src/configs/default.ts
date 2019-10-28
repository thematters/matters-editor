import { KEYCODES } from '../enums/common'

import '../blots'
import '../modules/clipboard'
import '../modules/imageDrop'
import '../modules/mention'
import lineBreakMatcher from '../matchers/lineBreaker'
import urlMatcher from '../matchers/url'

export const FORMAT_CONFIG = [
  // inline
  'bold',
  'code',
  'italic',
  'link',
  'strike',
  'script',
  'underline',

  // block
  'header',
  'blockquote',
  'list',
  'code-block',

  // custom
  'divider',
  'embedClipboard',
  'embedCode',
  'embedVideo',
  'figcaption',
  'imageFigure',
  'audioFigure',
  'mention',
  'smartBreak',
  'source'
]

export const MODULE_CONFIG = {
  toolbar: [
    [{ header: '2' }, 'bold', 'italic', 'strike', 'underline', 'code-block'],
    ['blockquote', { list: 'ordered' }, { list: 'bullet' }, 'link']
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML
    matchVisual: false,
    matchers: [['BR', lineBreakMatcher], [Node.TEXT_NODE, urlMatcher]]
  },
  keyboard: {
    bindings: {
      tab: {
        key: KEYCODES.TAB,
        handler() {
          return false
        }
      },
      linebreak: {
        key: KEYCODES.ENTER,
        shiftKey: true,
        handler(range: any) {
          // @ts-ignore
          const quill = this.quill
          const currentLeaf = quill.getLeaf(range.index)[0]
          const nextLeaf = quill.getLeaf(range.index + 1)[0]

          quill.insertEmbed(range.index, 'smartBreak', true, 'user')

          // insert a second break when at the end of the
          // editor, or the next leaf has a different parent (<p>)
          if (nextLeaf === null || currentLeaf.parent !== nextLeaf.parent) {
            quill.insertEmbed(range.index, 'smartBreak', true, 'user')
          }
          // move the cursor after insert a line break
          quill.setSelection(range.index + 1, 'silent')
        }
      }
    }
  }
}
