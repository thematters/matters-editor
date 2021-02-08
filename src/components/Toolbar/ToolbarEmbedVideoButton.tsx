import React from 'react'

import { Texts } from '../../enums/text'
import SVGToolbarEmbedVideo from '../../icons/ToolbarEmbedVideo'

/**
 * This component is a button for embedding video into your writing.
 *
 * Usage:
 *   <ToolbarEmbedVideoButton
 *     callback={() => {}}
 *     texts={{}}
 *   />
 */

interface Props {
  callback: () => void
  texts: Texts
}

export default ({ callback, texts }: Props) => (
  <button
    aria-label={texts.TOOLBAR_EMBED_VIDEO}
    type="button"
    onClick={callback}
  >
    <SVGToolbarEmbedVideo className="u-motion-icon-hover" />
  </button>
)
