import React from 'react'

import { Tooltip } from '../Tooltip'
import {
  ACCEPTED_UPLOAD_AUDIO_TYPES,
  COLOR,
  UPLOAD_AUDIO_SIZE_LIMIT,
} from '../../enums/common'
import SVGSpinner from '../../icons/Spinner'
import SVGToolbarUploadAudio from '../../icons/ToolbarUploadAudio'

/**
 * This component is an audio upload button which shoule only resides in toolbar. Now, it supports
 * single file upload at a time.
 *
 * Usage:
 *   <ToolbarUploadAudioButton
 *     callback={() => {}}
 *     eventDispatcher={() => {}}
 *     eventName="event-name"
 *     texts={{}}
 *     upload={() => {}}
 *     uplaodAudioSizeLimit={1024}
 *   />
 */

const acceptTypes = ACCEPTED_UPLOAD_AUDIO_TYPES.join(',')

interface Props {
  callback: (params: Params) => void
  eventDispatcher: (event: string, data: any) => void
  eventName: string
  texts: Texts
  upload: (params: Params) => any
  uploadAudioSizeLimit?: number
}

const ToolbarUploadAudioButton: React.FC<Props> = ({
  callback,
  eventDispatcher,
  eventName,
  texts,
  upload,
  uploadAudioSizeLimit = UPLOAD_AUDIO_SIZE_LIMIT,
}) => {
  const [uploading, setUploading] = React.useState(false)

  const handleChange = async (event: React.FormEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (!upload || !event.currentTarget || !event.currentTarget.files) {
      return
    }
    const file = event.currentTarget.files[0]
    const fileName = file.name.split('.')[0]
    const mimeType = file.type
    event.currentTarget.value = ''

    if (file && file.size > uploadAudioSizeLimit) {
      eventDispatcher(eventName, {
        color: COLOR.RED,
        content: texts.UPLOAD_AUDIO_REACH_SIZE_LIMIT,
      })
      return
    }

    try {
      setUploading(true)
      const result = await upload({ file, type: 'embedaudio' })
      callback({ ...result, mimeType, fileName })
      setUploading(false)
      eventDispatcher(eventName, {
        color: COLOR.GREEN,
        content: texts.UPLOAD_AUDIO_SUCCESSFUL,
      })
    } catch (e) {
      callback({})
      setUploading(false)
      eventDispatcher(eventName, {
        color: COLOR.RED,
        content: texts.UPLOAD_AUDIO_FAILED,
      })
      console.error(e)
    }
  }

  return (
    <Tooltip content={texts.UPLOAD_AUDIO_TOOLTIP} placement="top">
      <label className="toolbar-upload-container">
        <input
          className="input"
          type="file"
          accept={acceptTypes}
          multiple={false}
          aria-label={texts.TOOLBAR_EMBED_AUDIO}
          onChange={handleChange}
        />
        {uploading && <SVGSpinner className="spinner u-motion-spin" />}
        {!uploading && (
          <SVGToolbarUploadAudio className="u-motion-icon-hover" />
        )}
      </label>
    </Tooltip>
  )
}

export default ToolbarUploadAudioButton
