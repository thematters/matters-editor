import { Quill } from 'react-quill'

import { SANDBOX_DEFAULT_SETTINGS } from '../enums/common'

const BlockEmbed = Quill.import('blots/block/embed')
const Parchment = Quill.import('parchment')

interface EmbedVideoParams {
  caption?: string
  url: string
}

class EmbedVideo extends BlockEmbed {
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

EmbedVideo.blotName = 'embedVideo'
EmbedVideo.className = 'embed-video'
EmbedVideo.tagName = 'figure'

Quill.register('formats/embedVideo', EmbedVideo)

export default EmbedVideo
