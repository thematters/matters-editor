import * as React from 'react'

import SVGToolbarEmbedVideo from '../../icons/ToolbarEmbedVideo'

/**
 * This component is a button for embedding video into your writing.
 *
 * Usage:
 *   <ToolbarEmbedVideoButton
 *     callback={() => {}}
 *     texts={{}}
 *   />
 *
 * List of CSS classes used in this component:
 *   [
 *     'u-motion-icon-hover'
 *   ]
 */

interface Props {
  callback: () => void
  texts: Texts
}

export default ({ callback, texts }: Props) => (
  <button aria-label={texts.TOOLBAR_EMBED_VIDEO} type="button" onClick={callback}>
    <SVGToolbarEmbedVideo className="u-motion-icon-hover" />
  </button>
)
