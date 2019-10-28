import classNames from 'classnames'
import * as React from 'react'
import { Quill } from 'react-quill'

import SVGToolbarAdd from '../../icons/ToolbarAdd'

import { insertImageBlock, insertEmbedBlock } from '../../utils/editor'

import ToolbarDividerButton from './ToolbarDividerButton'
import ToolbarEmbedCodeButton from './ToolbarEmbedCodeButton'
import ToolbarEmbedVideoButton from './ToolbarEmbedVideoButton'
import ToolbarUploadAudioButton from './ToolbarUploadAudioButton'
import ToolbarUploadImageButton from './ToolbarUploadImageButton'

/**
 * This is a custom toolbar floating on the left of the editor. Put any features
 * except formating features in the toolbar.
 *
 */

interface Props {
  eventDispatcher: (event: string, data: any) => void
  eventName: string
  instance: Quill | null
  position: { top: any }
  visible: boolean
  texts: Texts
  update: any
  upload: any
  uploadAudioSizeLimit: number
  uploadImageSizeLimit?: number
}

export default ({
  eventDispatcher,
  eventName,
  instance,
  position,
  visible,
  texts,
  update,
  upload,
  uploadAudioSizeLimit,
  uploadImageSizeLimit
}: Props) => {
  const [expanded, setExpanded] = React.useState<boolean>(false)

  const containerClasses = classNames(
    'toolbar-container',
    visible ? 'toolbar-visible' : null,
    expanded ? 'toolbar-expanded' : null
  )

  const handleToggle = () => setExpanded(!expanded)

  const handleUploadImageCallback = (params: Params) => {
    insertImageBlock(instance, params, texts.CAPTION_PLACEHOLDER)
    setExpanded(false)
  }

  const handleEmbedVideoCallback = () => {
    insertEmbedBlock(instance, 'video', texts.EMBED_VIDEO_PLACEHOLDER, texts.CAPTION_PLACEHOLDER)
    setExpanded(false)
  }

  const handleEmbedCodeCallback = () => {
    insertEmbedBlock(instance, 'code', texts.EMBED_CODE_PLACEHOLDER, texts.CAPTION_PLACEHOLDER)
    setExpanded(false)
  }

  const handleAddDividerCallback = () => {
    if (instance) {
      const range = instance.getSelection(true)
      instance.insertEmbed(range.index, 'divider', true, 'user')
      instance.setSelection(range.index + 1, 0, 'silent')
    }
    setExpanded(false)
  }

  const handleUploadAudioCallback = (params: Params) => {
    if (instance && params && params.id && params.path && params.fileName && params.mimeType) {
      const { id, path, fileName, mimeType } = params
      const range = instance.getSelection(true)
      instance.insertEmbed(
        range.index,
        'audioFigure',
        {
          sources: [{ src: path, type: mimeType, assetId: id }],
          fileName,
          captionPlaceholder: texts.CAPTION_PLACEHOLDER
        },
        'user'
      )
      instance.setSelection(range.index + 1, 0, 'silent')
    }
    setExpanded(false)
  }

  return (
    <aside className={containerClasses} style={position}>
      <button
        className="toolbar-toggle-button"
        type="button"
        onClick={handleToggle}
        aria-label={expanded ? texts.TOOLBAR_CLOSE : texts.TOOLBAR_OPEN}
      >
        <SVGToolbarAdd className="u-motion-icon-hover" />
      </button>
      <div className="toolbar-items">
        <ToolbarUploadImageButton
          callback={handleUploadImageCallback}
          eventDispatcher={eventDispatcher}
          eventName={eventName}
          texts={texts}
          upload={upload}
          uploadImageSizeLimit={uploadImageSizeLimit}
        />
        <ToolbarEmbedVideoButton callback={handleEmbedVideoCallback} texts={texts} />
        <ToolbarEmbedCodeButton callback={handleEmbedCodeCallback} texts={texts} />
        <ToolbarDividerButton callback={handleAddDividerCallback} texts={texts} />
        <ToolbarUploadAudioButton
          callback={handleUploadAudioCallback}
          eventDispatcher={eventDispatcher}
          eventName={eventName}
          texts={texts}
          upload={upload}
          uploadAudioSizeLimit={uploadAudioSizeLimit}
        />
      </div>
    </aside>
  )
}
