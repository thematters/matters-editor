import { Quill } from 'react-quill'

import BaseBlockEmbed from './BaseBlockEmbed'

const Parchment = Quill.import('parchment')

class DividerBlot extends BaseBlockEmbed {
  static blotName = 'divider'
  static tagName = 'HR'
}

Quill.register('formats/divider', DividerBlot)

export default DividerBlot
