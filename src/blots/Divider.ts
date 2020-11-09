import { Quill } from 'react-quill'

import BaseBlockEmbed from './BaseBlockEmbed'

class DividerBlot extends BaseBlockEmbed {
  static blotName = 'divider'
  static tagName = 'HR'
}

Quill.register('formats/divider', DividerBlot)

export default DividerBlot
