import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')
const BlockEmbed = Quill.import('blots/block/embed')

/**
 * @see ref: https://github.com/quilljs/quill/blob/develop/formats/image.js
 */

interface ImageFigureParams {
  assetId?: string
  caption?: string
  id?: string
  src?: string
}

class ImageFigure extends BlockEmbed {
  public static create(value: ImageFigureParams) {
    const node = super.create(value)

    // caption
    const figcaption = Parchment.create('figcaption', {
      caption: value.caption
    }).domNode

    // image
    const image = document.createElement('img')
    image.setAttribute('src', value.src || '')

    if (value.id) {
      image.setAttribute('id', value.id)
    }

    if (value.assetId) {
      image.dataset.assetId = value.assetId
    }

    node.appendChild(image)
    node.appendChild(figcaption)

    return node
  }

  static value(domNode: HTMLElement): any {
    const image = domNode.querySelector('img')
    const caption = domNode.querySelector('figcaption')

    return {
      assetId: image ? image.dataset.assetId : undefined,
      caption: caption ? caption.innerText : '',
      src: image ? image.getAttribute('src') : ''
    }
  }
}

ImageFigure.blotName = 'imageFigure'
ImageFigure.className = 'image'
ImageFigure.tagName = 'figure'

Quill.register('formats/imageFigure', ImageFigure)

export default ImageFigure
