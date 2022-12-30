import Quill from 'quill'

import BaseBlockEmbed from './BaseBlockEmbed'

import { SANDBOX_DEFAULT_SETTINGS } from '../enums/common'

const Parchment = Quill.import('parchment')

interface EmbedVideoParams {
  caption?: string
  url: string
}

class EmbedVideo extends BaseBlockEmbed {
  static blotName = 'embedVideo'
  static className = 'embed-video'
  static tagName = 'figure'

  static create(value: EmbedVideoParams) {
    const node = super.create()

    // caption
    const figcaption = Parchment.create('figcaption', {
      caption: value.caption,
    }).domNode

    // iframe
    const iframe = document.createElement('iframe')
    iframe.setAttribute('src', value.url)
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('allowfullscreen', 'true')
    iframe.setAttribute('sandbox', SANDBOX_DEFAULT_SETTINGS.join(' '))

    const iframeContainer = document.createElement('div')
    iframeContainer.setAttribute('class', 'iframe-container')
    iframeContainer.appendChild(iframe)

    const util = Parchment.query('util')
    if (util && util.reviseMode === true) {
      node.setAttribute('contenteditable', false)
      node.classList.add('u-area-disable')
    }

    node.appendChild(iframeContainer)
    node.appendChild(figcaption)

    return node
  }

  static value(domNode: HTMLElement): any {
    const iframe = domNode.querySelector('iframe')
    const caption = domNode.querySelector('figcaption')

    return {
      caption: caption ? caption.innerText : '',
      url: iframe ? iframe.getAttribute('src') : '',
    }
  }
}

Quill.register('formats/embedVideo', EmbedVideo)

export default EmbedVideo
