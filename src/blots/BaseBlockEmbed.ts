import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')
const BlockEmbed = Quill.import('blots/block/embed')

class BaseBlockEmbed extends BlockEmbed {
  static reviseMode: boolean

  constructor(domNode: HTMLElement) {
    super(domNode)
    const util = Parchment.query('util')
    this.reviseMode = util && util.reviseMode === true
  }

  deleteAt(index: number, length: number) {
    if (this.reviseMode === true) {
      return
    }
    return super.deleteAt(index, length)
  }
}

export default BaseBlockEmbed
