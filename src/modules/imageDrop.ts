import { Quill } from 'react-quill'

import {
  ACCEPTED_UPLOAD_IMAGE_TYPES,
  COLOR,
  UPLOAD_IMAGE_SIZE_LIMIT,
} from '../enums/common'
import { Texts } from '../enums/text'
import { insertImageBlock } from '../utils/editor'

/**
 * Image drop module.
 *
 */

interface ModuleOptions {
  eventDispatcher: (event: string, data: any) => void
  eventName: string
  handleImageDrop: (file: any) => Promise<ResultData>
  texts: Texts
  uploadImageSizeLimit?: number
}

class ImageDrop {
  quill: Quill
  eventDispatcher: (event: string, data: any) => void
  eventName: string
  handleImageDrop: (file: any) => Promise<ResultData>
  texts: Texts
  uploadImageSizeLimit: number

  constructor(quill: Quill, options: ModuleOptions) {
    this.quill = quill
    this.quill.root.addEventListener('drop', this.handleDrop, false)
    this.eventDispatcher = options.eventDispatcher
    this.eventName = options.eventName
    this.handleImageDrop = options.handleImageDrop
    this.texts = options.texts
    this.uploadImageSizeLimit = options.uploadImageSizeLimit
  }

  handleDrop = async (event: any) => {
    event.preventDefault()
    event.stopPropagation()

    if (
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files.length > 0
    ) {
      if (event.dataTransfer.files.length > 1) {
        this.eventDispatcher(this.eventName, {
          color: COLOR.RED,
          content: this.texts.UPLOAD_IMAGE_SINGLE_LIMIT,
        })
        return
      }
      const file = event.dataTransfer.files[0]
      if (file && file.size > UPLOAD_IMAGE_SIZE_LIMIT) {
        this.eventDispatcher(this.eventName, {
          color: COLOR.GREEN,
          content: this.texts.UPLOAD_IMAGE_REACH_SIZE_LIMIT,
        })
        return
      }
      const assets = await this.handleFiles(file)
      assets.forEach((params: Params) =>
        insertImageBlock(this.quill, params, this.texts.CAPTION_PLACEHOLDER)
      )
    }
  }

  handleFiles = async (file: any): Promise<any[]> => {
    if (file && file.type && ACCEPTED_UPLOAD_IMAGE_TYPES.includes(file.type)) {
      try {
        const asset = await this.handleImageDrop(file)
        this.eventDispatcher(this.eventName, {
          color: COLOR.GREEN,
          content: this.texts.UPLOAD_IMAGE_SUCCESSFUL,
        })
        return [asset]
      } catch (error) {
        this.eventDispatcher(this.eventName, {
          color: COLOR.RED,
          content: this.texts.UPLOAD_IMAGE_FAILED,
        })
        console.log(error)
      }
    }
    return []
  }
}

Quill.register('modules/imageDrop', ImageDrop)

export default ImageDrop
