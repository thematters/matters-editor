import * as React from 'react'

import { ACCEPTED_UPLOAD_IMAGE_TYPES, COLOR, UPLOAD_IMAGE_SIZE_LIMIT } from '../../enums/common'
import SVGSpinner from '../../icons/Spinner'
import SVGToolbarUploadImage from '../../icons/ToolbarUploadImage'

/**
 * This component is a image upload button which should only resdies in toolbar. Now, it supports
 * single file upload at a time.
 *
 * Usage:
 *   <ToolbarUploadImageButton
 *     callbak={({}) => {}}
 *     eventDispatcher={() => {}}
 *     eventName="event-name"
 *     texts={{}}
 *     upload={() => {}}
 *     uploadImageSizeLimit={1024}
 *   />
 *
 * List of CSS classes used in this component:
 *   [
 *     'toolbar-upload-container',
 *     'u-motion-spin',
 *     'u-motion-icon-hove'
 *   ]
 */

const acceptTypes = ACCEPTED_UPLOAD_IMAGE_TYPES.join(',')

interface Props {
  callback: (params: Params) => void
  eventDispatcher: (event: string, data: any) => void
  eventName: string
  texts: Texts
  upload: (params: Params) => any
  uploadImageSizeLimit?: number
}

export default ({
  callback,
  eventDispatcher,
  eventName,
  texts,
  upload,
  uploadImageSizeLimit = UPLOAD_IMAGE_SIZE_LIMIT
}: Props) => {
  const [uploading, setUploading] = React.useState(false)

  const handleChange = async (event: React.FormEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (!upload || !event.currentTarget || !event.currentTarget.files) {
      return
    }

    const file = event.currentTarget.files[0]
    event.currentTarget.value = ''

    if (file && file.size > uploadImageSizeLimit) {
      eventDispatcher(eventName, { color: COLOR.RED, content: texts.UPLOAD_IMAGE_REACH_SIZE_LIMIT })
      return
    }

    try {
      setUploading(true)
      const result = await upload({ file })
      callback(result)
      setUploading(false)
      eventDispatcher(eventName, { color: COLOR.GREEN, content: texts.UPLOAD_IMAGE_SUCCESSFUL })
    } catch (error) {
      callback({})
      setUploading(false)
      eventDispatcher(eventName, { color: COLOR.RED, content: texts.UPLOAD_IMAGE_FAILED })
      console.error(error)
    }
  }

  return (
    <label className="toolbar-upload-container">
      <input
        className="input"
        type="file"
        accept={acceptTypes}
        multiple={false}
        aria-label={texts.TOOLBAR_ADD_IMAGE}
        onChange={handleChange}
      />
      {uploading && <SVGSpinner className="spinner u-motion-spin" />}
      {!uploading && <SVGToolbarUploadImage className="u-motion-icon-hover" />}
    </label>
  )
}
