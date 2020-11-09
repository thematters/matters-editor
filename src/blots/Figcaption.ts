import { Quill } from 'react-quill'

import BaseBlockEmbed from './BaseBlockEmbed'

import { TEXT } from '../enums/text'
import { getLangFromRoot } from '../utils/dom'
import { langConvert } from '../utils/language'

interface FigcaptionParams {
  caption: string
}

class Figcaption extends BaseBlockEmbed {
  static blotName = 'figcaption'
  static tagName = 'figcaption'

  static create(value: FigcaptionParams) {
    const node = super.create(value)

    const lang = (langConvert.html2sys(getLangFromRoot()) || '').toUpperCase()
    const placeholder = (TEXT[lang] || TEXT['ZH_HANT']).CAPTION_PLACEHOLDER

    const textarea = document.createElement('textarea')
    textarea.value = value.caption || ''
    textarea.setAttribute('placeholder', placeholder)

    const caption = document.createElement('span')
    caption.textContent = value.caption || ''

    node.appendChild(caption)
    node.appendChild(textarea)

    return node
  }

  static value(domNode: HTMLElement): any {
    return { caption: domNode.textContent }
  }

  $figcaption: HTMLElement

  constructor(domNode: HTMLElement) {
    super(domNode)

    this.$figcaption = domNode

    domNode.addEventListener('keydown', this.onPress)
    domNode.addEventListener('paste', this.onPaste)
    domNode.addEventListener('change', this.onPress)
  }

  onPaste = (event: ClipboardEvent) => {
    event.stopPropagation()
  }

  onPress = (event: Event) => {
    const caption = this.$figcaption.querySelector('span')
    const textarea = event.target as HTMLTextAreaElement

    if (caption && textarea) {
      caption.textContent = textarea.value
    }

    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

Quill.register('formats/figcaption', Figcaption)

export default Figcaption
