import classNames from 'classnames'
import React from 'react'
import Quill from 'quill'

import { Texts } from '../../enums/text'
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
 * Usage:
 *   <MattersEditorToolbar
 *     enable={true}
 *     eventDispatcher={() => {}}
 *     eventName="event-name"
 *     postion={0}
 *     visible={false}
 *     texts={{}}
 *     update={() => {}}
 *     upload={() => {}}
 *     uploadAudioSizeLimit={1024}
 *     uploadImageSizeLimit={1024}
 *   />
 */

interface Props {
  enable?: boolean
  eventDispatcher: (event: string, data: any) => void
  eventName: string
  instance: Quill | null
  position: number
  visible: boolean
  texts: Texts
  update: any
  upload: any
  uploadAudioSizeLimit?: number
  uploadImageSizeLimit?: number
}

const MattersEditorToolbar: React.FC<Props> = ({
  enable = true,
  eventDispatcher,
  eventName,
  instance,
  position,
  visible,
  texts,
  update,
  upload,
  uploadAudioSizeLimit,
  uploadImageSizeLimit,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(false)

  const containerClasses = classNames(
    'toolbar-container',
    visible ? 'toolbar-visible' : null,
    expanded ? 'toolbar-expanded' : null
  )

  const style = { top: position }

  const ariaLabel = expanded ? texts.TOOLBAR_CLOSE : texts.TOOLBAR_OPEN

  const handleToggle = () => setExpanded(!expanded)

  const handleUploadImageCallback = (params: Params) => {
    insertImageBlock(instance, params, texts.CAPTION_PLACEHOLDER)
    setExpanded(false)
  }

  const handleEmbedVideoCallback = () => {
    insertEmbedBlock(
      instance,
      'video',
      texts.EMBED_VIDEO_PLACEHOLDER,
      texts.CAPTION_PLACEHOLDER
    )
    setExpanded(false)
  }

  const handleEmbedCodeCallback = () => {
    insertEmbedBlock(
      instance,
      'code',
      texts.EMBED_CODE_PLACEHOLDER,
      texts.CAPTION_PLACEHOLDER
    )
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
    if (
      instance &&
      params &&
      params.id &&
      params.path &&
      params.fileName &&
      params.mimeType
    ) {
      const { id, path, fileName, mimeType } = params
      const range = instance.getSelection(true)
      instance.insertEmbed(
        range.index,
        'audioFigure',
        {
          sources: [{ src: path, type: mimeType, assetId: id }],
          fileName,
          captionPlaceholder: texts.CAPTION_PLACEHOLDER,
        },
        'user'
      )
      instance.setSelection(range.index + 1, 0, 'silent')
    }
    setExpanded(false)
  }

  if (enable === false) {
    return null
  }

  return (
    <aside className={containerClasses} style={style}>
      <button
        className="toolbar-toggle-button"
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
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
        <ToolbarEmbedVideoButton
          callback={handleEmbedVideoCallback}
          texts={texts}
        />
        <ToolbarEmbedCodeButton
          callback={handleEmbedCodeCallback}
          texts={texts}
        />
        <ToolbarDividerButton
          callback={handleAddDividerCallback}
          texts={texts}
        />
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

export default MattersEditorToolbar
