import { Quill } from 'react-quill'

import { SANDBOX_DEFAULT_SETTINGS, SANDBOX_SPECIAL_SETTINGS } from '../enums/common'

const BlockEmbed = Quill.import('blots/block/embed')
const Parchment = Quill.import('parchment')

interface EmbedCodeParams {
  caption?: string
  url: string
}

class EmbedCode extends BlockEmbed {
  static create(value: EmbedCodeParams) {
    const node = super.create() as HTMLElement

    // caption
    const figcaption = Parchment.create('figcaption', {
      caption: value.caption
    }).domNode

    // iframe
    const codeType = this.getType(value.url)
    const iframe = document.createElement('iframe')
    iframe.setAttribute('src', value.url)
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('allowfullscreen', 'false')
    iframe.setAttribute(
      'sandbox',
      codeType === 'likebutton'
        ? SANDBOX_SPECIAL_SETTINGS.join(' ')
        : SANDBOX_DEFAULT_SETTINGS.join(' ')
    )

    const iframeContainer = document.createElement('div')
    iframeContainer.setAttribute('class', 'iframe-container')
    iframeContainer.appendChild(iframe)

    node.appendChild(iframeContainer)
    node.appendChild(figcaption)

    if (codeType) {
      node.classList.add(codeType)
    }

    return node
  }

  static value(domNode: HTMLElement): any {
    const iframe = domNode.querySelector('iframe')
    const caption = domNode.querySelector('figcaption')

    return {
      caption: caption ? caption.innerText : '',
      url: iframe ? iframe.getAttribute('src') : ''
    }
  }

  static getType(url: string) {
    if (url.match(/http(s)?:\/\/(button\.)?like\.co\//)) {
      return 'likebutton'
    } else {
      return ''
    }
  }
}

EmbedCode.blotName = 'embedCode'
EmbedCode.className = 'embed-code'
EmbedCode.tagName = 'figure'

Quill.register('formats/embedCode', EmbedCode)

export default EmbedCode
